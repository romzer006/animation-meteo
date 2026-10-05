#!/usr/bin/env node
// build_audio_meta.mjs — French narration → audio_meta.json (frame-keyed shape
// consumed by captions.mjs / assemble-index.mjs).
//
// Kokoro has no word timings, so each line was transcribed with Whisper
// (`--model small --language fr`, .hyperframes/tr/NN/transcript.json). Whisper
// mishears some words ("cumulon imbu"), so caption TEXT comes from SCRIPT.md and
// only the TIMING comes from Whisper: script tokens are aligned to Whisper tokens
// (LCS on normalized forms); unmatched script runs share the Whisper span between
// their neighbouring anchors, proportional to character length.
//
//   node scripts/build_audio_meta.mjs [--bgm assets/music/bed.wav --bgm-volume 0.22]

import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const argv = process.argv.slice(2);
const flag = (n, d) => {
  const i = argv.indexOf(`--${n}`);
  return i >= 0 ? argv[i + 1] : d;
};

// Caption display forms: numbers as digits read better on a phone.
const DISPLAY = [
  [/trente mille/gi, "30\u00a0000"],
  [/\bCinq fois\b/g, "5 fois"],
  [/dix kilomètres/gi, "10\u00a0km"],
  [/deux cents kilomètres-heure/gi, "200\u00a0km/h"],
];

const norm = (s) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");

function scriptLines() {
  const md = readFileSync("SCRIPT.md", "utf8");
  const out = new Map();
  let cur = null;
  for (const line of md.split(/\r?\n/)) {
    const h = line.match(/^#{2,3}\s+.*?\(frame\s+(\d+)\)/i);
    if (h) {
      cur = Number(h[1]);
      continue;
    }
    const m = line.match(/^(?: {4,}|\t)(.+)$/);
    if (cur != null && m) out.set(cur, ((out.get(cur) ?? "") + " " + m[1].trim()).trim());
  }
  return out;
}

function tokenize(text) {
  for (const [re, rep] of DISPLAY) text = text.replace(re, rep);
  const raw = text.split(/[ \t\n]+/).filter(Boolean); // keep NBSP-joined numbers whole
  const toks = [];
  for (const t of raw) {
    // standalone punctuation (":", "?", "!", "…") sticks to the previous word
    if (!norm(t) && toks.length) toks[toks.length - 1] += t;
    else toks.push(t);
  }
  return toks;
}

function lcsPairs(a, b) {
  const n = a.length;
  const m = b.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      dp[i][j] = a[i] && a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const pairs = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] && a[i] === b[j]) {
      pairs.push([i, j]);
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
    else j++;
  }
  return pairs;
}

function align(scriptToks, wh, voiceEnd) {
  const a = scriptToks.map(norm);
  const b = wh.map((w) => norm(w.text));
  const pairs = lcsPairs(a, b);
  const times = new Array(scriptToks.length).fill(null);
  for (const [i, j] of pairs) times[i] = { start: wh[j].start, end: wh[j].end };
  // anchors: [-1 → line start] ... [n → line end]
  const anchors = [{ i: -1, j: -1, end: wh[0]?.start ?? 0 }];
  for (const [i, j] of pairs) anchors.push({ i, j, start: wh[j].start, end: wh[j].end });
  anchors.push({ i: scriptToks.length, j: wh.length, start: wh[wh.length - 1]?.end ?? voiceEnd });
  for (let k = 0; k < anchors.length - 1; k++) {
    const L = anchors[k];
    const R = anchors[k + 1];
    const gap = scriptToks.slice(L.i + 1, R.i);
    if (!gap.length) continue;
    // span = whisper words strictly between the anchors (or the silence between them)
    const spanStart = R.j - L.j > 1 ? wh[L.j + 1].start : L.end;
    const spanEnd = R.j - L.j > 1 ? wh[R.j - 1].end : R.start;
    const lens = gap.map((t) => Math.max(1, norm(t).length));
    const total = lens.reduce((s, x) => s + x, 0);
    let t = spanStart;
    gap.forEach((_, g) => {
      const d = ((spanEnd - spanStart) * lens[g]) / total;
      times[L.i + 1 + g] = { start: t, end: t + d };
      t += d;
    });
  }
  const r3 = (x) => Math.round(x * 1000) / 1000;
  return scriptToks.map((text, i) => ({
    id: `w${i}`,
    text,
    start: r3(times[i].start),
    end: r3(Math.max(times[i].end, times[i].start + 0.05)),
  }));
}

const dur = (p) =>
  Number(
    execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p])
      .toString()
      .trim(),
  );

const lines = scriptLines();
const voices = [];
for (const [frame, text] of [...lines.entries()].sort((x, y) => x[0] - y[0])) {
  const id = String(frame).padStart(2, "0");
  const path = `assets/voice/${id}-final.wav`;
  const wh = JSON.parse(readFileSync(`.hyperframes/tr/${id}/transcript.json`, "utf8"));
  const d = dur(path);
  voices.push({ frame, path, duration_s: Math.round(d * 1000) / 1000, words: align(tokenize(text), wh, d) });
}

const bgmPath = flag("bgm", null);
const meta = {
  bgm: bgmPath
    ? {
        path: bgmPath,
        volume: Number(flag("bgm-volume", "0.22")),
        query: "generated storm bed",
        duration_s: dur(bgmPath),
      }
    : null,
  bgm_pending: false,
  voices,
  sfx: [],
};
writeFileSync("audio_meta.json", JSON.stringify(meta, null, 2));
const total = voices.reduce((s, v) => s + v.duration_s, 0);
console.log(`✓ audio_meta.json: ${voices.length} voices, ${total.toFixed(2)}s narration`);
for (const v of voices) console.log(`  ${v.frame}: ${v.words.map((w) => w.text).join(" ")}`);
