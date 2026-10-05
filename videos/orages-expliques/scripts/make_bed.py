#!/usr/bin/env python3
"""Generate the storm music bed: rain + sub drone + 120 BPM pulse + thunder hits.

Deterministic (fixed seed). Usage:
  python3 scripts/make_bed.py --duration 76 --thunder 0.05,31.2,58.4 --out assets/music/bed.wav
"""
import argparse
import wave

import numpy as np
from scipy.signal import lfilter

SR = 44100


def lowpass(x, cutoff):
    """One-pole low-pass filter."""
    a = np.exp(-2 * np.pi * cutoff / SR)
    return lfilter([1 - a], [1, -a], x)


def env_exp(n, decay):
    t = np.arange(n) / SR
    return np.exp(-t / decay)


def kick(n_len=0.35):
    n = int(SR * n_len)
    t = np.arange(n) / SR
    freq = 45 + 85 * np.exp(-t / 0.04)
    phase = 2 * np.pi * np.cumsum(freq) / SR
    return np.sin(phase) * env_exp(n, 0.11)


def tick(rng, n_len=0.06):
    n = int(SR * n_len)
    noise = rng.standard_normal(n)
    hp = noise - lowpass(noise, 6000)
    return hp * env_exp(n, 0.015)


def thunder(rng, n_len=4.5):
    n = int(SR * n_len)
    noise = rng.standard_normal(n)
    crack = noise * env_exp(n, 0.05) * 0.8
    rumble = lowpass(noise, 140) * 9.0
    # slow amplitude wobble for rolling rumble (deterministic)
    t = np.arange(n) / SR
    wobble = 0.6 + 0.4 * np.sin(2 * np.pi * 2.3 * t) * np.sin(2 * np.pi * 0.7 * t + 1.0)
    rumble_env = (1 - np.exp(-t / 0.08)) * np.exp(-t / 1.4)
    return crack + rumble * rumble_env * wobble


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--duration", type=float, required=True)
    ap.add_argument("--thunder", default="", help="comma-separated seconds")
    ap.add_argument("--beat-start", type=float, default=1.0)
    ap.add_argument("--beat-stop", type=float, default=None, help="seconds; pulse stops here")
    ap.add_argument("--bpm", type=float, default=120)
    ap.add_argument("--out", required=True)
    args = ap.parse_args()

    rng = np.random.default_rng(7)
    n = int(SR * args.duration)
    t = np.arange(n) / SR
    out = np.zeros(n)

    # Rain: low-passed noise, constant bed.
    rain = lowpass(rng.standard_normal(n), 2500) - lowpass(rng.standard_normal(n), 300) * 0.3
    out += rain * 0.10

    # Sub drone D2 + A2, slowly swelling.
    swell = 0.75 + 0.25 * np.sin(2 * np.pi * t / 16.0)
    drone = (np.sin(2 * np.pi * 73.42 * t) + 0.5 * np.sin(2 * np.pi * 110.0 * t)
             + 0.25 * np.sin(2 * np.pi * 146.83 * t))
    out += drone * swell * 0.10

    # Pulse: kick on every beat, tick on off-beats, an extra 16th push every 4th bar.
    beat = 60.0 / args.bpm
    stop = args.beat_stop if args.beat_stop is not None else args.duration - 2.0
    k = kick()
    i = 0
    tb = args.beat_start
    while tb < stop:
        s = int(tb * SR)
        e = min(n, s + len(k))
        out[s:e] += k[: e - s] * 0.55
        off = int((tb + beat / 2) * SR)
        tk = tick(rng)
        e2 = min(n, off + len(tk))
        if off < n:
            out[off:e2] += tk[: e2 - off] * 0.25
        if i % 16 == 15:  # fill at end of each 4-bar phrase
            for f in (0.25, 0.75):
                s3 = int((tb + beat * f) * SR)
                e3 = min(n, s3 + len(k))
                if s3 < n:
                    out[s3:e3] += k[: e3 - s3] * 0.3
        i += 1
        tb += beat

    # Thunder hits.
    for ts in [float(x) for x in args.thunder.split(",") if x.strip()]:
        th = thunder(rng)
        s = int(ts * SR)
        e = min(n, s + len(th))
        out[s:e] += th[: e - s] * 0.9

    # Fade in/out, normalize to -3 dBFS.
    fade = int(SR * 0.4)
    out[:fade] *= np.linspace(0, 1, fade)
    fo = int(SR * 1.5)
    out[-fo:] *= np.linspace(1, 0, fo)
    out = out / (np.max(np.abs(out)) + 1e-9) * 0.7
    pcm = (out * 32767).astype(np.int16)
    stereo = np.stack([pcm, pcm], axis=1)
    with wave.open(args.out, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(stereo.tobytes())
    print(f"wrote {args.out} ({args.duration:.1f}s)")


if __name__ == "__main__":
    main()
