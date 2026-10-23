import {Easing, interpolate, spring} from 'remotion';
import {FPS} from './timing';

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Entrée en ressort qui démarre à `start` (frames locales).
export const pop = (frame: number, start: number, damping = 12, mass = 0.7) =>
  spring({frame: frame - start, fps: FPS, config: {damping, mass, stiffness: 140}});

// Rampe 0 → 1 entre deux frames, avec sortie douce.
export const ramp = (frame: number, a: number, b: number) =>
  interpolate(frame, [a, b], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
