import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {clamp, pop} from '../anim';
import {C, CX, FONT, SAFE, SOURCE_Y, STAGE} from '../theme';
import {FPS, WORDS, type Word} from '../timing';

// Fond bleu nuit + lignes de vent qui défilent d'ouest en est.
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const lines = Array.from({length: 36}, (_, i) => {
    const y = (i * 137 + 40) % 1920;
    const len = 140 + ((i * 53) % 280);
    const speed = 5 + ((i * 7) % 10);
    const opacity = 0.04 + ((i * 29) % 9) / 100;
    const span = 1080 + len + 240;
    const x = ((frame * speed + i * 397) % span) - len - 120;
    const bend = Math.sin((frame + i * 23) / 22) * 10;
    return (
      <path
        key={i}
        d={`M ${x} ${y} Q ${x + len / 2} ${y + bend} ${x + len} ${y}`}
        stroke="#cfe0ff"
        strokeOpacity={opacity}
        strokeWidth={2 + (i % 3)}
        strokeLinecap="round"
        fill="none"
      />
    );
  });
  return (
    <AbsoluteFill style={{background: `radial-gradient(120% 75% at 45% 40%, #16264a 0%, ${C.bg} 58%, #091020 100%)`}}>
      <svg width={1080} height={1920}>{lines}</svg>
    </AbsoluteFill>
  );
};

const Arrow: React.FC<{color: string; size: number}> = ({color, size}) => (
  <svg width={size * 1.4} height={size} viewBox="0 0 28 20" style={{display: 'block'}}>
    <path d="M2 10 H22 M15 3 L23 10 L15 17" stroke={color} strokeWidth={3.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Bandeau fixe : ALERTE MÉTÉO · date · compte, titre et puce samedi → dimanche.
export const Header: React.FC = () => {
  const frame = useCurrentFrame();
  const a = pop(frame, 0, 14);
  const blink = 0.35 + 0.65 * Math.abs(Math.sin(frame / 9));
  return (
    <div style={{position: 'absolute', left: SAFE.left, top: 104, width: SAFE.right - SAFE.left, opacity: a, transform: `translateY(${(1 - a) * -30}px)`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 12, fontFamily: FONT.mono, fontSize: 23, color: C.mute}}>
        <span style={{display: 'flex', alignItems: 'center', gap: 8, background: C.red, color: '#fff', fontWeight: 700, padding: '3px 12px', borderRadius: 6}}>
          <span style={{width: 10, height: 10, borderRadius: 5, background: '#fff', opacity: blink}} />
          ALERTE MÉTÉO
        </span>
        <span>·</span>
        <span>23.10.2026</span>
        <span>·</span>
        <span style={{color: C.white, fontWeight: 700}}>@monsieur.meteo</span>
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: 18, marginTop: 12}}>
        <span style={{fontFamily: FONT.title, fontSize: 66, lineHeight: 1, color: C.white, letterSpacing: 0.5}}>TEMPÊTE BOELO :</span>
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            border: `2px solid ${C.orange}`,
            color: C.orange,
            borderRadius: 30,
            padding: '5px 16px',
            fontFamily: FONT.text,
            fontWeight: 800,
            fontSize: 24,
          }}
        >
          samedi <Arrow color={C.orange} size={16} /> dimanche
        </span>
      </div>
      <div style={{fontFamily: FONT.title, fontSize: 42, lineHeight: 1.1, color: C.yellow, marginTop: 4, letterSpacing: 0.5}}>
        L'EUROPE DU NORD EN ALERTE
      </div>
    </div>
  );
};

// Sous-titres karaoké : 2 à 4 mots, mots à venir en gris, mots clés en jaune.
type Group = {words: Word[]; show: number; hide: number};

const buildGroups = (words: Word[]): Group[] => {
  const groups: Word[][] = [];
  let cur: Word[] = [];
  words.forEach((w, i) => {
    const next = words[i + 1];
    cur.push(w);
    const gap = next ? next.début - w.fin : 99;
    const chars = cur.map((x) => x.mot).join(' ').length;
    const sentenceEnd = /[.?…:]$/.test(w.mot);
    const comma = /,$/.test(w.mot);
    const nextLong = next ? chars + next.mot.length + 1 > 24 : true;
    if (cur.length >= 4 || sentenceEnd || gap > 0.45 || (comma && cur.length >= 2) || nextLong) {
      groups.push(cur);
      cur = [];
    }
  });
  if (cur.length) groups.push(cur);
  return groups.map((g, i) => {
    const next = groups[i + 1];
    const end = g[g.length - 1].fin + 0.45;
    return {words: g, show: g[0].début - 0.06, hide: next ? Math.min(next[0].début - 0.06, end) : end};
  });
};

const GROUPS = buildGroups(WORDS);

export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const g = GROUPS.find((x) => t >= x.show && t < x.hide);
  if (!g) return null;
  const a = pop(frame, Math.round(g.show * FPS), 15, 0.5);
  return (
    <div style={{position: 'absolute', left: SAFE.left, width: SAFE.right - SAFE.left, top: 1478, height: 182, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div
        style={{
          background: 'rgba(6, 11, 23, 0.8)',
          border: '2px solid rgba(255,255,255,0.07)',
          borderRadius: 22,
          padding: '14px 24px',
          maxWidth: 860,
          textAlign: 'center',
          fontFamily: FONT.text,
          fontWeight: 800,
          fontSize: 56,
          lineHeight: 1.12,
          textTransform: 'uppercase',
          opacity: a,
          transform: `scale(${0.9 + 0.1 * a})`,
        }}
      >
        {g.words.map((w, i) => {
          const spoken = t >= w.début - 0.03;
          const active = t >= w.début && t < w.fin + 0.05;
          const color = spoken ? (w.cle ? C.yellow : C.white) : C.grey;
          return (
            <span key={i} style={{display: 'inline-block', margin: '0 13px', color, transform: `scale(${active ? 1.05 : 1})`}}>
              {w.mot}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// Source discrète en Space Mono sous le visuel.
export const Source: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{position: 'absolute', left: SAFE.left, top: SOURCE_Y, width: SAFE.right - SAFE.left, fontFamily: FONT.mono, fontSize: 20, lineHeight: 1.35, color: C.mute}}>
    <span style={{color: C.orange, fontWeight: 700}}>SOURCE · </span>
    {children}
  </div>
);

// Enveloppe de scène : entrée en ressort, zoom lent continu, fondu de sortie.
export const Scene: React.FC<{dur: number; source?: React.ReactNode; children: React.ReactNode; zoom?: number}> = ({dur, source, children, zoom = 0.035}) => {
  const frame = useCurrentFrame();
  const enter = pop(frame, 0, 14, 0.6);
  const exit = interpolate(frame, [dur - 6, dur], [1, 0], clamp);
  const slow = interpolate(frame, [0, dur], [1, 1 + zoom], clamp);
  const opacity = Math.min(1, enter * 1.3) * exit;
  return (
    <AbsoluteFill style={{opacity}}>
      <AbsoluteFill style={{transform: `scale(${(0.95 + 0.05 * enter) * slow})`, transformOrigin: `${CX}px ${STAGE.y + STAGE.h / 2}px`}}>{children}</AbsoluteFill>
      {source ? <Source>{source}</Source> : null}
    </AbsoluteFill>
  );
};

// Pastille de titre de scène (petite étiquette Space Mono au-dessus du visuel).
export const Kicker: React.FC<{children: React.ReactNode; color?: string; y?: number; a?: number}> = ({children, color = C.orange, y = STAGE.y + 8, a = 1}) => (
  <div style={{position: 'absolute', left: SAFE.left, top: y, width: SAFE.right - SAFE.left, display: 'flex', justifyContent: 'center', opacity: a, transform: `translateY(${(1 - a) * 20}px)`}}>
    <span style={{fontFamily: FONT.mono, fontWeight: 700, fontSize: 26, letterSpacing: 2, color, border: `2px solid ${color}`, borderRadius: 8, padding: '6px 16px', background: 'rgba(13,21,38,0.75)'}}>{children}</span>
  </div>
);
