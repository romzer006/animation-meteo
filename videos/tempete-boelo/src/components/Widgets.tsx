import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {clamp, pop, ramp} from '../anim';
import {C, CX, FONT} from '../theme';

// Tampon (texte encadré qui « claque » à l'écran).
export const Stamp: React.FC<{text: string; at: number; color?: string; x: number; y: number; rotate?: number; size?: number; sub?: string}> = ({
  text,
  at,
  color = C.orange,
  x,
  y,
  rotate = -10,
  size = 62,
  sub,
}) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const p = pop(frame, at, 9, 0.6);
  const scale = interpolate(p, [0, 1], [2.3, 1]);
  const shake = frame - at < 8 ? Math.sin((frame - at) * 2.4) * (8 - (frame - at)) * 0.8 : 0;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%, -50%) rotate(${rotate + shake * 0.3}deg) scale(${scale})`,
        opacity: Math.min(1, p * 1.6),
        border: `6px solid ${color}`,
        borderRadius: 12,
        padding: '6px 20px 10px',
        color,
        textAlign: 'center',
        background: 'rgba(13,21,38,0.55)',
        whiteSpace: 'nowrap',
      }}
    >
      <div style={{fontFamily: FONT.title, fontSize: size, lineHeight: 1.05, letterSpacing: 1.5}}>{text}</div>
      {sub ? <div style={{fontFamily: FONT.mono, fontWeight: 700, fontSize: size * 0.36, letterSpacing: 2}}>{sub}</div> : null}
    </div>
  );
};

// Compteur géant (Anton) qui défile d'une valeur à l'autre.
export const GiantCounter: React.FC<{from: number; to: number; start: number; end: number; x: number; y: number; size?: number; color?: string; unit?: string; unitColor?: string}> = ({
  from,
  to,
  start,
  end,
  x,
  y,
  size = 220,
  color = C.white,
  unit,
  unitColor = C.mute,
}) => {
  const frame = useCurrentFrame();
  const v = Math.round(interpolate(ramp(frame, start, end), [0, 1], [from, to]));
  const settle = frame > end ? 1 + 0.015 * Math.sin((frame - end) / 5) : 1 + 0.06 * Math.max(0, 1 - Math.abs(frame - end) / 6);
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, 0) scale(${settle})`, display: 'flex', alignItems: 'baseline', gap: 16}}>
      <span style={{fontFamily: FONT.title, fontSize: size, lineHeight: 1, color, letterSpacing: 2}}>{v.toLocaleString('fr-FR')}</span>
      {unit ? <span style={{fontFamily: FONT.title, fontSize: size * 0.32, color: unitColor}}>{unit}</span> : null}
    </div>
  );
};

// Jauge de rafales : aiguille animée 0 → valeur + chiffre géant.
export const GustGauge: React.FC<{value: number; start: number; dur: number; big: string; bigSize?: number; unit?: string; range?: [number, number]; cx?: number; cy?: number; r?: number; max?: number}> = ({
  value,
  start,
  dur,
  big,
  bigSize = 190,
  unit = 'KM/H',
  range,
  cx = CX,
  cy = 830,
  r = 300,
  max = 160,
}) => {
  const frame = useCurrentFrame();
  const ang = (v: number) => ((220 - (260 * v) / max) * Math.PI) / 180;
  const P = (v: number, rr: number) => [cx + rr * Math.cos(ang(v)), cy - rr * Math.sin(ang(v))];
  const arc = (v0: number, v1: number, rr: number) => {
    const [x0, y0] = P(v0, rr);
    const [x1, y1] = P(v1, rr);
    const large = (260 * (v1 - v0)) / max > 180 ? 1 : 0;
    return `M ${x0} ${y0} A ${rr} ${rr} 0 ${large} 1 ${x1} ${y1}`;
  };
  const p = pop(frame, start, 9, 0.9);
  const wobble = frame > start + dur ? Math.sin(frame / 4.3) * 2.2 + Math.sin(frame / 2.1) * 1.2 : 0;
  const needle = Math.max(0, Math.min(max, value * Math.min(p, 1.08) + wobble));
  const shown = Math.round(Math.min(value, value * p));
  const [nx, ny] = P(needle, r * 0.84);
  const bands: [number, number, string][] = [
    [0, 60, '#3a4d72'],
    [60, 90, C.yellow],
    [90, 120, C.orange],
    [120, max, C.red],
  ];
  const ticks = Array.from({length: max / 20 + 1}, (_, i) => i * 20);
  const appear = ramp(frame, 0, 10);
  return (
    <>
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}} opacity={appear}>
        <path d={arc(0, max, r)} stroke="#22314f" strokeWidth={46} fill="none" />
        {bands.map(([a, b, col]) => (
          <path key={a} d={arc(a, b, r)} stroke={col} strokeOpacity={0.85} strokeWidth={30} fill="none" />
        ))}
        {range ? <path d={arc(range[0], range[1], r + 40)} stroke={C.orange} strokeWidth={14} strokeLinecap="round" fill="none" opacity={ramp(frame, start + dur * 0.6, start + dur)} /> : null}
        {ticks.map((v) => {
          const [x0, y0] = P(v, r - 34);
          const [x1, y1] = P(v, r - 54);
          const [lx, ly] = P(v, r - 86);
          return (
            <g key={v}>
              <line x1={x0} y1={y0} x2={x1} y2={y1} stroke={C.white} strokeWidth={4} strokeOpacity={0.8} />
              <text x={lx} y={ly + 8} textAnchor="middle" fontFamily={FONT.mono} fontWeight={700} fontSize={22} fill={C.mute}>
                {v}
              </text>
            </g>
          );
        })}
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={C.white} strokeWidth={12} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={26} fill={C.white} />
        <circle cx={cx} cy={cy} r={11} fill={C.red} />
      </svg>
      <div style={{position: 'absolute', left: cx, top: cy + r * 0.5 + 4, transform: 'translateX(-50%)', textAlign: 'center', opacity: appear}}>
        <div style={{fontFamily: FONT.title, fontSize: bigSize, lineHeight: 1, color: value >= 120 ? C.red : C.orange}}>{big === 'count' ? shown : big}</div>
        <div style={{fontFamily: FONT.mono, fontWeight: 700, fontSize: 34, color: C.white, letterSpacing: 3, marginTop: 4}}>{unit}</div>
      </div>
    </>
  );
};

// Double calendrier (samedi / dimanche).
export const DoubleCalendar: React.FC<{active: 'sam' | 'dim'; switchAt?: number; y: number; marker?: string; markerAt?: number; scale?: number}> = ({
  active,
  switchAt,
  y,
  marker,
  markerAt = 0,
  scale = 1,
}) => {
  const frame = useCurrentFrame();
  const sw = switchAt !== undefined ? pop(frame, switchAt, 12) : 0;
  const dimOn = active === 'dim' ? (switchAt !== undefined ? sw : 1) : 0;
  const pages = [
    {day: '24', name: 'SAMEDI', on: 1 - dimOn},
    {day: '25', name: 'DIMANCHE', on: dimOn},
  ];
  const m = marker ? pop(frame, markerAt, 13) : 0;
  return (
    <div style={{position: 'absolute', left: CX, top: y, transform: `translateX(-50%) scale(${scale})`, transformOrigin: 'top center'}}>
      <div style={{display: 'flex', gap: 36}}>
        {pages.map((pg) => (
          <div
            key={pg.day}
            style={{
              width: 290,
              height: 280,
              borderRadius: 20,
              background: '#f4f1ea',
              overflow: 'hidden',
              opacity: 0.45 + 0.55 * pg.on,
              transform: `scale(${0.92 + 0.1 * pg.on}) rotate(${(1 - pg.on) * -2}deg)`,
              boxShadow: pg.on > 0.5 ? `0 0 0 5px ${C.orange}, 0 18px 50px rgba(0,0,0,0.5)` : '0 10px 30px rgba(0,0,0,0.4)',
              textAlign: 'center',
            }}
          >
            <div style={{height: 64, background: pg.on > 0.5 ? C.red : '#4a5a7a', color: '#fff', fontFamily: FONT.mono, fontWeight: 700, fontSize: 24, lineHeight: '64px', letterSpacing: 3}}>
              OCT. 2026
            </div>
            <div style={{fontFamily: FONT.title, fontSize: 140, lineHeight: 1.05, color: C.ink}}>{pg.day}</div>
            <div style={{fontFamily: FONT.text, fontWeight: 800, fontSize: 30, color: C.ink, letterSpacing: 2}}>{pg.name}</div>
          </div>
        ))}
      </div>
      {marker ? (
        <div style={{display: 'flex', justifyContent: 'center', marginTop: 22, opacity: m, transform: `translateY(${(1 - m) * 16}px)`}}>
          <span style={{fontFamily: FONT.text, fontWeight: 800, fontSize: 32, color: C.ink, background: C.yellow, borderRadius: 40, padding: '8px 24px'}}>{marker}</span>
        </div>
      ) : null}
    </div>
  );
};

// Carte « article de presse » (média + date + titre) avec tampon.
export const PressCard: React.FC<{media: string; date: string; headline: string; translation?: string; x: number; y: number; w: number; a: number; rotate?: number}> = ({
  media,
  date,
  headline,
  translation,
  x,
  y,
  w,
  a,
  rotate = -2,
}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      transform: `translateY(${(1 - a) * 80}px) rotate(${rotate}deg)`,
      opacity: Math.min(1, a * 1.4),
      background: C.paper,
      borderRadius: 14,
      padding: '24px 30px 26px',
      boxShadow: '0 24px 60px rgba(0,0,0,0.55)',
    }}
  >
    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `3px solid ${C.ink}`, paddingBottom: 10}}>
      <span style={{fontFamily: FONT.mono, fontWeight: 700, fontSize: 26, color: C.red, letterSpacing: 1}}>{media}</span>
      <span style={{fontFamily: FONT.mono, fontSize: 22, color: '#4b5568'}}>{date}</span>
    </div>
    <div style={{fontFamily: FONT.text, fontWeight: 800, fontSize: 40, lineHeight: 1.16, color: C.ink, marginTop: 14}}>{headline}</div>
    {translation ? <div style={{fontFamily: FONT.text, fontWeight: 500, fontSize: 24, lineHeight: 1.3, color: '#4b5568', marginTop: 10, fontStyle: 'italic'}}>{translation}</div> : null}
    <div style={{marginTop: 16, display: 'flex', flexDirection: 'column', gap: 9}}>
      {[0.95, 0.88, 0.6].map((k, i) => (
        <div key={i} style={{height: 10, width: `${k * 100}%`, borderRadius: 5, background: '#d6d0c2'}} />
      ))}
    </div>
  </div>
);

// Icônes animées de la checklist.
const Icon: React.FC<{kind: 'wind' | 'tree' | 'flood'; frame: number}> = ({kind, frame}) => {
  const sway = Math.sin(frame / 6) * 8;
  if (kind === 'wind') {
    return (
      <g>
        {[0, 1, 2].map((i) => {
          const x = ((frame * 4 + i * 30) % 70) - 30;
          return <path key={i} d={`M ${x - 10} ${-30 + i * 26} q 22 -10 44 0`} stroke={C.white} strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.85} />;
        })}
        <g transform={`translate(18 18) rotate(${sway})`}>
          <path d="M -22 -6 L 22 -6 L 16 30 L -16 30 Z" fill={C.orange} />
          <rect x={-26} y={-14} width={52} height={10} rx={4} fill={C.orange} />
        </g>
      </g>
    );
  }
  if (kind === 'tree') {
    return (
      <g>
        <g transform={`rotate(${sway * 0.8} 0 34)`}>
          <rect x={-6} y={8} width={12} height={28} fill="#9a6b3f" />
          <path d="M 0 -46 L 30 10 L -30 10 Z" fill="#3fbf7f" />
          <path d="M 0 -26 L 26 22 L -26 22 Z" fill="#35a86e" />
        </g>
        <path d={`M -48 44 q 12 ${-10 + sway * 0.4} 24 0 t 24 0 t 24 0 t 24 0`} stroke={C.rain} strokeWidth={6} fill="none" strokeLinecap="round" />
      </g>
    );
  }
  return (
    <g>
      <g transform={`translate(0 ${-8 + Math.sin(frame / 8) * 2})`}>
        <rect x={-34} y={-14} width={68} height={24} rx={8} fill={C.white} />
        <path d="M -20 -14 L -12 -30 L 14 -30 L 22 -14 Z" fill={C.white} />
        <circle cx={-18} cy={12} r={8} fill={C.ink} />
        <circle cx={18} cy={12} r={8} fill={C.ink} />
      </g>
      <path d={`M -50 26 q 12 ${-8 + sway * 0.5} 25 0 t 25 0 t 25 0 t 25 0`} stroke={C.rain} strokeWidth={7} fill="none" strokeLinecap="round" />
      <path d="M 40 -44 a 16 16 0 1 0 -26 0" stroke={C.red} strokeWidth={6} fill="none" strokeLinecap="round" />
      <path d="M 8 -50 L 14 -40 L 22 -50" stroke={C.red} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
};

export const ChecklistItem: React.FC<{kind: 'wind' | 'tree' | 'flood'; title: string; start: number; y: number; index: number}> = ({kind, title, start, y, index}) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const a = pop(frame, start, 12);
  const check = ramp(frame, start + 10, start + 22);
  return (
    <div style={{position: 'absolute', left: 70, top: y, width: 850, display: 'flex', alignItems: 'center', gap: 30, opacity: Math.min(1, a * 1.4), transform: `translateX(${(1 - a) * -120}px)`}}>
      <svg width={170} height={170} viewBox="-85 -85 170 170" style={{flexShrink: 0}}>
        <circle r={80} fill="#1c2c4d" stroke={C.yellow} strokeWidth={5} />
        <Icon kind={kind} frame={frame - start} />
      </svg>
      <div style={{flex: 1}}>
        <div style={{fontFamily: FONT.mono, fontWeight: 700, fontSize: 24, color: C.yellow, letterSpacing: 3}}>RÉFLEXE {index}</div>
        <div style={{fontFamily: FONT.text, fontWeight: 800, fontSize: 46, lineHeight: 1.12, color: C.white, whiteSpace: 'pre-line'}}>{title}</div>
      </div>
      <svg width={70} height={70} viewBox="0 0 70 70" style={{flexShrink: 0}}>
        <circle cx={35} cy={35} r={30} fill="none" stroke="#3fbf7f" strokeWidth={5} opacity={check} />
        <path d="M 20 36 L 31 47 L 51 24" stroke="#3fbf7f" strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={50} strokeDashoffset={50 * (1 - check)} />
      </svg>
    </div>
  );
};

export const fadeBetween = (frame: number, a: number, b: number, c: number, d: number) =>
  Math.min(interpolate(frame, [a, b], [0, 1], clamp), interpolate(frame, [c, d], [1, 0], clamp));
