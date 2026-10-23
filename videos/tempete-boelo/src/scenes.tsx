import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {clamp, lerp, pop, ramp} from './anim';
import {Kicker, Scene} from './components/Layout';
import {Cyclone, EuropeMap, FranceMap, GustBar, MapLabel, type Fill} from './components/Maps';
import {ChecklistItem, DoubleCalendar, GiantCounter, GustGauge, PressCard, Stamp, fadeBetween} from './components/Widgets';
import {cameraOn, europeMap, IDENTITY, mixCamera, PAYS, type Box, type LonLat, type Pt} from './geo';
import {C, CX, FONT} from './theme';
import {at, toFrames} from './timing';

export type SceneProps = {start: number; dur: number};

// Frame locale (dans la scène) du mot `mot` prononcé après le début de la scène.
const word = (start: number) => (mot: string, after = start) => toFrames(at(mot, after) - start);

const WIDE: [LonLat, LonLat] = [
  [-13, 43],
  [17, 63],
];
const NW: [LonLat, LonLat] = [
  [-12, 48.5],
  [15, 64],
];
const NORTH_SEA: [LonLat, LonLat] = [
  [-8, 49.6],
  [12, 61.2],
];
const MAPBOX: Box = [
  [60, 390],
  [930, 1370],
];

// Trajectoire schématique de Boelo (Atlantique → Hébrides → nord de l'Écosse → Norvège).
const TRACK: LonLat[] = [
  [-24, 54.6],
  [-16, 56.3],
  [-7.6, 58.5],
  [-2.5, 59.8],
  [2.5, 60.8],
  [6.5, 61.7],
  [11, 62.9],
];

const smooth = (pts: LonLat[], n = 14): LonLat[] => {
  const out: LonLat[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let j = 0; j < n; j++) {
      const t = j / n;
      const t2 = t * t;
      const t3 = t2 * t;
      const c = (a: number, b: number, d: number, e: number) => 0.5 * (2 * b + (-a + d) * t + (2 * a - 5 * b + 4 * d - e) * t2 + (-a + 3 * b - 3 * d + e) * t3);
      out.push([c(p0[0], p1[0], p2[0], p3[0]), c(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
};
const TRACK_SMOOTH = smooth(TRACK);

// Position et tracé partiel le long de la trajectoire (u ∈ [0, 1], longueur d'arc écran).
const along = (pt: Pt, u: number) => {
  const xy = TRACK_SMOOTH.map(pt);
  const seg = xy.slice(1).map((p, i) => Math.hypot(p[0] - xy[i][0], p[1] - xy[i][1]));
  const total = seg.reduce((a, b) => a + b, 0);
  let left = Math.max(0, Math.min(1, u)) * total;
  const done: [number, number][] = [xy[0]];
  for (let i = 0; i < seg.length; i++) {
    if (left <= seg[i]) {
      const k = seg[i] === 0 ? 0 : left / seg[i];
      const p: [number, number] = [lerp(xy[i][0], xy[i + 1][0], k), lerp(xy[i][1], xy[i + 1][1], k)];
      done.push(p);
      return {pos: p, done, all: xy};
    }
    left -= seg[i];
    done.push(xy[i + 1]);
  }
  return {pos: xy[xy.length - 1], done, all: xy};
};
const poly = (pts: [number, number][]) => pts.map((p, i) => `${i ? 'L' : 'M'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');

const Legend: React.FC<{y: number; a: number}> = ({y, a}) => (
  <div style={{position: 'absolute', left: 60, top: y, width: 870, display: 'flex', justifyContent: 'center', gap: 34, opacity: a, fontFamily: FONT.mono, fontWeight: 700, fontSize: 22, color: C.white}}>
    {[
      [C.orange, 'ORANGE / AMBRE'],
      [C.yellow, 'JAUNE'],
    ].map(([col, txt]) => (
      <span key={txt} style={{display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(13,21,38,0.75)', padding: '6px 14px', borderRadius: 8}}>
        <span style={{width: 22, height: 22, borderRadius: 5, background: col}} />
        {txt}
      </span>
    ))}
  </div>
);

// ─── 0 · Intro (blanc de départ) + « 6 pays en alerte, une seule tempête, Boelo » ───
const COUNTRIES: {id: string; color: string; name: string; ll: LonLat}[] = [
  {id: PAYS.irlande, color: C.orange, name: 'IRLANDE', ll: [-8.1, 53.1]},
  {id: PAYS.royaumeUni, color: C.orange, name: 'ROYAUME-UNI', ll: [-1.6, 52.7]},
  {id: PAYS.norvege, color: C.yellow, name: 'NORVÈGE', ll: [9.2, 61.2]},
  {id: PAYS.paysBas, color: C.yellow, name: 'PAYS-BAS', ll: [5.7, 52.45]},
  {id: PAYS.belgique, color: C.yellow, name: 'BELGIQUE', ll: [4.5, 50.55]},
  {id: PAYS.france, color: C.yellow, name: 'FRANCE', ll: [2.4, 46.9]},
];

export const SceneIntro: React.FC<SceneProps> = ({start, dur}) => {
  const frame = useCurrentFrame();
  const L = word(start);
  const t6 = L('6');
  const lit = COUNTRIES.map((_, i) => pop(frame, t6 + 3 + i * 8, 13));
  const n = lit.filter((p) => p > 0.5).length;
  const fills: Record<string, Fill> = Object.fromEntries(COUNTRIES.map((c, i) => [c.id, {color: c.color, p: Math.min(1, lit[i])}]));
  const s = interpolate(frame, [0, t6], [0.86, 1], {...clamp});
  const box = MAPBOX;
  const cx = (box[0][0] + box[1][0]) / 2;
  const cy = (box[0][1] + box[1][1]) / 2;
  const cam = {s, tx: cx * (1 - s), ty: cy * (1 - s)};
  const u = interpolate(frame, [0, t6, dur], [0.13, 0.23, 0.27], clamp);
  const cycA = pop(frame, 4, 11);
  const boelo = L('Boelo');
  return (
    <Scene dur={dur} source="Met Éireann · Met Office · MET Norway (NRK) · KNMI (OOG TV) · IRM (RTBF) · Météo-France — 23/10/2026">
      <EuropeMap
        id="intro"
        view={WIDE}
        box={box}
        cam={cam}
        fills={fills}
        clip={[
          [60, 380],
          [930, 1375],
        ]}
        over={(pt, sc) => {
          const {pos, all} = along(pt, u);
          return (
            <>
              <path d={poly(all)} stroke={C.white} strokeOpacity={0.25 * cycA} strokeWidth={3} strokeDasharray="4 12" fill="none" strokeLinecap="round" />
              {[0, 1, 2].map((k) => (
                <circle key={k} cx={pos[0]} cy={pos[1]} r={(70 + k * 55 + ((frame * 0.8) % 55)) * sc} fill="none" stroke={C.white} strokeOpacity={0.12 * cycA} strokeWidth={2} />
              ))}
              <Cyclone x={pos[0]} y={pos[1]} r={44} a={cycA} speed={6} />
              <MapLabel x={pos[0]} y={pos[1] + 100} text="BOELO" title size={52} a={pop(frame, boelo - 4, 12)} color={C.white} />
              {COUNTRIES.map((c, i) => {
                const [x, y] = pt(c.ll);
                return <MapLabel key={c.id} x={x} y={y} text={c.name} size={21} a={Math.min(1, lit[i])} />;
              })}
            </>
          );
        }}
      />
      {frame < t6 ? (
        <Kicker a={pop(frame, 6)} color={C.white}>
          CE WEEK-END · 24 ET 25 OCTOBRE
        </Kicker>
      ) : (
        <div style={{position: 'absolute', left: 60, top: 318, width: 870, display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 16, opacity: pop(frame, t6)}}>
          <span style={{fontFamily: FONT.title, fontSize: 92, lineHeight: 1, color: C.yellow}}>{n}</span>
          <span style={{fontFamily: FONT.title, fontSize: 52, color: C.white}}>PAYS EN ALERTE</span>
        </div>
      )}
      <Legend y={1300} a={ramp(frame, t6 + 40, t6 + 55)} />
    </Scene>
  );
};

// ─── 1 · Bombe météo ───
export const SceneBombe: React.FC<SceneProps> = ({start, dur}) => {
  const frame = useCurrentFrame();
  const L = word(start);
  const drop0 = L('plonge');
  const drop1 = L('946') + 10;
  const k = ramp(frame, drop0, drop1);
  const cx = CX;
  const cy = 700;
  return (
    <Scene dur={dur} source="Y. Amice (actu.fr) via CNEWS · Météo Consult — 23/10/2026">
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
        {[0, 1, 2, 3, 4].map((i) => {
          const r = (150 + i * 62) * (1 - 0.22 * k) + Math.sin(frame / 10 + i) * 4;
          return <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={C.white} strokeOpacity={0.2 - i * 0.03} strokeWidth={3} strokeDasharray={`${18 + i * 4} 10`} strokeDashoffset={-frame * (2 + i)} />;
        })}
        <Cyclone x={cx} y={cy} r={120} speed={5 + 9 * k} a={pop(frame, 0, 10)} />
      </svg>
      <Stamp text="BOMBE MÉTÉO" at={L('bombe')} x={CX} y={455} rotate={-8} size={70} color={C.red} />
      <div style={{position: 'absolute', left: CX, top: 990, transform: 'translateX(-50%)', textAlign: 'center', opacity: ramp(frame, drop0 - 6, drop0)}}>
        <div style={{fontFamily: FONT.mono, fontWeight: 700, fontSize: 26, color: C.mute, letterSpacing: 3}}>PRESSION AU CENTRE</div>
      </div>
      {frame >= drop0 - 6 ? <GiantCounter from={980} to={946} start={drop0} end={drop1} x={CX} y={1030} size={200} unit="hPa" color={C.white} unitColor={C.orange} /> : null}
      <div style={{position: 'absolute', left: CX, top: 1250, transform: 'translateX(-50%)', opacity: ramp(frame, drop1, drop1 + 10), fontFamily: FONT.mono, fontWeight: 700, fontSize: 30, color: C.yellow, whiteSpace: 'nowrap'}}>
        −34 hPa EN 24 H
      </div>
    </Scene>
  );
};

// ─── 2 · Irlande : article + vigilance orange + 6 comtés ───
const COMTES: {nom: string; ll: LonLat; dx?: number; dy?: number}[] = [
  {nom: 'DONEGAL', ll: [-7.95, 54.95], dy: -14},
  {nom: 'SLIGO', ll: [-8.55, 54.17], dy: -18},
  {nom: 'LEITRIM', ll: [-8.0, 54.05], dx: 76, dy: 14},
  {nom: 'MAYO', ll: [-9.35, 53.9], dx: -64, dy: 14},
  {nom: 'GALWAY', ll: [-8.85, 53.3], dx: 70},
  {nom: 'KERRY', ll: [-9.6, 52.1], dx: 62},
];

export const SceneIrlande: React.FC<SceneProps> = ({start, dur}) => {
  const frame = useCurrentFrame();
  const L = word(start);
  const card = pop(frame, 2, 13);
  const tComtes = L('comtés');
  const tGalway = L('Galway');
  const irl = pop(frame, L('6'), 12);
  const box: Box = [
    [170, 830],
    [820, 1360],
  ];
  return (
    <Scene dur={dur} source="Met Éireann · The Irish Times — 23/10/2026">
      <EuropeMap
        id="irl"
        view={[
          [-10.6, 51.4],
          [-5.6, 55.4],
        ]}
        box={box}
        clip={[
          [60, 810],
          [930, 1375],
        ]}
        fills={{[PAYS.irlande]: {color: C.orange, p: Math.min(1, irl) * 0.75}}}
        over={(pt) => (
          <>
            {COMTES.map((c, i) => {
              const a = pop(frame, tComtes + i * 4, 12);
              const [x, y] = pt(c.ll);
              const galway = c.nom === 'GALWAY';
              const g = galway ? pop(frame, tGalway, 10) : 0;
              return (
                <g key={c.nom} opacity={Math.min(1, a)}>
                  <circle cx={x} cy={y} r={11 + 6 * Math.min(1, a) + (galway ? 8 * g : 0)} fill={galway && g > 0.1 ? C.yellow : C.red} stroke="#0d1526" strokeWidth={4} />
                  <MapLabel x={x + (c.dx ?? 0)} y={y + (c.dy ?? 8)} text={c.nom} size={20} />
                </g>
              );
            })}
          </>
        )}
      />
      <PressCard
        media="THE IRISH TIMES"
        date="23/10/2026"
        headline="Storm Boelo latest: Ireland braces for ‘damaging’ second storm as Met Éireann issues new orange warnings"
        translation="« L'Irlande se prépare à une deuxième tempête “dévastatrice” »"
        x={95}
        y={345}
        w={800}
        a={card}
      />
      <Stamp text="VIGILANCE ORANGE" at={L('orange')} x={640} y={760} rotate={-9} size={56} color={C.orange} sub="6 COMTÉS · MET ÉIREANN" />
      {frame >= tGalway ? (
        <div style={{position: 'absolute', left: 470, top: 1265, opacity: pop(frame, tGalway, 12), transform: `translateX(${(1 - pop(frame, tGalway, 12)) * 60}px)`}}>
          <span style={{fontFamily: FONT.text, fontWeight: 800, fontSize: 28, color: C.ink, background: C.yellow, padding: '8px 18px', borderRadius: 30, whiteSpace: 'nowrap'}}>
            Galway Races : reportées
          </span>
        </div>
      ) : null}
    </Scene>
  );
};

// ─── 3 · Écosse : alerte ambre, jauge 130 km/h ───
export const SceneEcosse: React.FC<SceneProps> = ({start, dur}) => {
  const frame = useCurrentFrame();
  const L = word(start);
  const t0 = L('rafales') - 4;
  return (
    <Scene dur={dur} source="Met Office (alerte ambre, sam. 21 h – dim. 21 h) · STV News — 23/10/2026">
      <Kicker a={pop(frame, 0)} color={C.orange}>
        ÉCOSSE · ALERTE AMBRE
      </Kicker>
      <div style={{position: 'absolute', left: 60, top: 392, width: 870, textAlign: 'center', fontFamily: FONT.mono, fontWeight: 700, fontSize: 26, color: C.white, opacity: pop(frame, 6)}}>
        SAMEDI 21 H – DIMANCHE 21 H
      </div>
      <GustGauge value={130} start={t0} dur={L('130') - t0 + 4} big="count" cy={800} r={290} />
      <div style={{position: 'absolute', left: 60, top: 1235, width: 870, textAlign: 'center', fontFamily: FONT.mono, fontWeight: 700, fontSize: 26, color: C.mute, opacity: ramp(frame, L('130'), L('130') + 10)}}>
        80 MPH · CÔTES EXPOSÉES
      </div>
    </Scene>
  );
};

// ─── 4 · Norvège : le cyclone suit sa trajectoire ───
export const SceneNorvege: React.FC<SceneProps> = ({start, dur}) => {
  const frame = useCurrentFrame();
  const L = word(start);
  const tNo = L('Norvège');
  const t133 = L('133');
  const u = interpolate(frame, [0, tNo + 8, dur], [0.3, 0.8, 0.86], {...clamp, easing: (x) => 1 - Math.pow(1 - x, 2)});
  const no = pop(frame, tNo, 12);
  const call = pop(frame, t133, 11);
  return (
    <Scene dur={dur} source="MET Norway via NRK & NTB — 23/10/2026 · trajectoire schématique (Météo Consult, RTBF)">
      <EuropeMap
        id="nw1"
        view={NW}
        box={MAPBOX}
        clip={[
          [60, 380],
          [930, 1375],
        ]}
        fills={{
          [PAYS.irlande]: {color: C.orange, p: 1},
          [PAYS.royaumeUni]: {color: C.orange, p: 1},
          [PAYS.norvege]: {color: C.yellow, p: Math.min(1, no)},
        }}
        over={(pt) => {
          const {pos, done, all} = along(pt, u);
          const heb = pt([-7.6, 58.5]);
          const rog = pt([5.73, 58.97]);
          return (
            <>
              <path d={poly(all)} stroke={C.white} strokeOpacity={0.3} strokeWidth={3} strokeDasharray="4 12" fill="none" strokeLinecap="round" />
              <path d={poly(done)} stroke={C.red} strokeWidth={6} fill="none" strokeLinecap="round" />
              <MapLabel x={heb[0] - 10} y={heb[1] + 64} text="SAM. SOIR · 946 hPa" size={20} color={C.white} a={pop(frame, 4)} />
              <Cyclone x={pos[0]} y={pos[1]} r={40} speed={8} />
              <MapLabel x={pt([9.4, 61.3])[0]} y={pt([9.4, 61.3])[1]} text="NORVÈGE" size={24} a={Math.min(1, no)} />
              <g opacity={Math.min(1, call)} transform={`translate(${rog[0]} ${rog[1]})`}>
                <circle r={12 + 4 * Math.sin(frame / 4)} fill={C.red} stroke="#0d1526" strokeWidth={4} />
                <line x1={0} y1={0} x2={60} y2={110} stroke={C.white} strokeWidth={3} />
              </g>
            </>
          );
        }}
      />
      {frame >= t133 ? (
        <div style={{position: 'absolute', left: 520, top: 870, opacity: Math.min(1, call), transform: `scale(${0.8 + 0.2 * call})`, transformOrigin: 'left top'}}>
          <div style={{background: C.red, borderRadius: 16, padding: '10px 20px', boxShadow: '0 12px 30px rgba(0,0,0,0.5)'}}>
            <div style={{fontFamily: FONT.mono, fontWeight: 700, fontSize: 20, color: '#fff', letterSpacing: 2}}>ROGALAND · 37 m/s</div>
            <div style={{fontFamily: FONT.title, fontSize: 76, lineHeight: 1, color: '#fff'}}>133 KM/H</div>
          </div>
        </div>
      ) : null}
      <Kicker a={pop(frame, 0)} color={C.white}>
        TRAJECTOIRE DE BOELO
      </Kicker>
    </Scene>
  );
};

// ─── 5 · Barres de rafales prévues sur la carte ───
export const SceneRafales: React.FC<SceneProps> = ({start, dur}) => {
  const frame = useCurrentFrame();
  const L = word(start);
  const tDk = L('Danemark');
  const tNl = L('Pays-Bas');
  const tBe = L('Belgique');
  const nl = pop(frame, tNl, 12);
  const be = pop(frame, tBe, 12);
  const bars: {ll: LonLat; v: number; label: string; t: number; side?: boolean}[] = [
    {ll: [-5.4, 57.4], v: 130, label: 'ÉCOSSE', t: 2},
    {ll: [5.73, 58.97], v: 133, label: 'ROGALAND', t: 8},
    {ll: [8.3, 56.1], v: 103, label: 'JUTLAND', t: tDk, side: true},
    {ll: [6.57, 53.22], v: 90, label: 'GRONINGUE', t: tNl, side: true},
    {ll: [4.4, 50.85], v: 70, label: 'BELGIQUE', t: tBe},
  ];
  return (
    <Scene dur={dur} source="Met Office · MET Norway (NRK) · DMI (DR) · KNMI (OOG TV) · IRM (RTBF) — 23/10/2026">
      <EuropeMap
        id="nw2"
        view={NORTH_SEA}
        box={MAPBOX}
        clip={[
          [60, 380],
          [930, 1375],
        ]}
        fills={{
          [PAYS.irlande]: {color: C.orange, p: 1},
          [PAYS.royaumeUni]: {color: C.orange, p: 1},
          [PAYS.norvege]: {color: C.yellow, p: 1},
          [PAYS.paysBas]: {color: C.yellow, p: Math.min(1, nl)},
          [PAYS.belgique]: {color: C.yellow, p: Math.min(1, be)},
        }}
        over={(pt) => {
          const {pos} = along(pt, 0.9);
          return (
            <>
              <Cyclone x={pos[0]} y={pos[1]} r={30} speed={8} />
              {bars.map((b) => {
                const [x, y] = pt(b.ll);
                return (
                  <GustBar
                    key={b.label}
                    x={x}
                    y={y}
                    value={b.v}
                    label={b.label}
                    p={frame >= b.t ? pop(frame, b.t, 11) : 0}
                    k={1.3}
                    width={40}
                    labelDx={b.side ? 28 : 0}
                    labelDy={b.side ? 8 : 30}
                    labelAnchor={b.side ? 'start' : 'middle'}
                  />
                );
              })}
            </>
          );
        }}
      />
      <Kicker a={pop(frame, 0)} color={C.yellow}>
        RAFALES PRÉVUES · KM/H
      </Kicker>
    </Scene>
  );
};

// ─── 6 · « Et chez nous ? » : zoom sur la France (blanc de 35 à 40 s) ───
export const SceneChezNous: React.FC<SceneProps> = ({start, dur}) => {
  const frame = useCurrentFrame();
  const L = word(start);
  const zoomA = L('France', start) + 4;
  const zoomB = zoomA + 75;
  const tBord = L('bordure');
  const tEp = L('épargnée');
  const {proj} = europeMap(WIDE, MAPBOX);
  const p0 = proj([-7, 55]) as [number, number];
  const p1 = proj([10, 41.6]) as [number, number];
  const target = cameraOn(
    [
      [Math.min(p0[0], p1[0]), Math.min(p0[1], p1[1])],
      [Math.max(p0[0], p1[0]), Math.max(p0[1], p1[1])],
    ],
    MAPBOX,
  );
  const k = interpolate(frame, [zoomA, zoomB], [0, 1], {...clamp, easing: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)});
  const cam = mixCamera(IDENTITY, target, k, MAPBOX);
  const fr = 0.35 + 0.35 * Math.abs(Math.sin(frame / 7));
  const low = proj([-7.6, 58.5]) as [number, number];
  return (
    <Scene dur={dur} zoom={0.02} source="Météo-Contact 22/10/2026 · Météo Consult · RTBF 23/10/2026 — schéma, isobares indicatives">
      <EuropeMap
        id="chez"
        view={WIDE}
        box={MAPBOX}
        cam={cam}
        clip={[
          [60, 380],
          [930, 1375],
        ]}
        fills={{
          [PAYS.irlande]: {color: C.orange, p: 1 - k * 0.5},
          [PAYS.royaumeUni]: {color: C.orange, p: 1 - k * 0.5},
          [PAYS.norvege]: {color: C.yellow, p: 1 - k},
          [PAYS.paysBas]: {color: C.yellow, p: 1 - k * 0.5},
          [PAYS.belgique]: {color: C.yellow, p: 1 - k * 0.5},
          [PAYS.france]: {color: C.yellow, p: frame < tBord ? fr : 0.7},
        }}
        under={(pt, s) => {
          const c = [cam.s * low[0] + cam.tx, cam.s * low[1] + cam.ty];
          return (
            <g>
              {Array.from({length: 9}, (_, i) => (
                <circle
                  key={i}
                  cx={c[0]}
                  cy={c[1]}
                  r={(60 + i * 62) * s}
                  fill="none"
                  stroke={C.white}
                  strokeOpacity={0.24 - i * 0.018}
                  strokeWidth={2.5}
                  strokeDasharray="14 10"
                  strokeDashoffset={frame * 1.5}
                />
              ))}
              <Cyclone x={c[0]} y={c[1]} r={34 * Math.min(s, 2.2)} speed={7} />
            </g>
          );
        }}
        over={(pt) => {
          const arrows = Array.from({length: 7}, (_, i) => {
            const lon = -7 + (((frame - zoomA) * 0.07 + i * 2.4) % 16);
            const lat = 48.6 + (i % 3) * 0.95;
            const [x, y] = pt([lon, lat]);
            const a = ramp(frame, zoomB - 20, zoomB) * Math.min(1, (16 - ((lon + 7) % 16)) / 3);
            return (
              <g key={i} transform={`translate(${x} ${y}) rotate(-12)`} opacity={a}>
                <path d="M -46 0 H 22 M 8 -14 L 26 0 L 8 14" stroke={C.yellow} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </g>
            );
          });
          const [fx, fy] = pt([2.4, 46.6]);
          const lowXY = pt([-7.6, 58.5]);
          return (
            <>
              {arrows}
              <MapLabel x={fx} y={fy} text="FRANCE" title size={56} a={ramp(frame, 0, 10)} />
              <MapLabel x={Math.max(250, Math.min(700, lowXY[0] + 260))} y={Math.max(440, lowXY[1] + 110)} text="CENTRE DE BOELO : AU NORD DE L'ÉCOSSE" size={21} a={ramp(frame, zoomB - 10, zoomB + 5)} color={C.white} />
            </>
          );
        }}
      />
      <Kicker a={pop(frame, 0)} color={C.yellow}>
        ET CHEZ NOUS ?
      </Kicker>
      <Stamp text="EN BORDURE" at={tBord} x={CX - 150} y={1150} rotate={-8} size={60} color={C.yellow} />
      <Stamp text="MAIS PAS ÉPARGNÉE" at={tEp} x={CX + 70} y={1275} rotate={-4} size={54} color={C.orange} />
    </Scene>
  );
};

// ─── 7 · Samedi midi : la pluie arrive en Bretagne ───
const BRETAGNE = ['29', '22', '56', '35'];

const Rain: React.FC<{pt: Pt; lon: [number, number]; lat: [number, number]; n: number; frame: number; a: number}> = ({pt, lon, lat, n, frame, a}) => (
  <g opacity={a}>
    {Array.from({length: n}, (_, i) => {
      const lo = lon[0] + (((i * 37) % 100) / 100) * (lon[1] - lon[0]);
      const la = lat[1] - (((i * 61 + frame * 2.2) % 100) / 100) * (lat[1] - lat[0]);
      const [x, y] = pt([lo, la]);
      return <line key={i} x1={x} y1={y} x2={x - 6} y2={y + 22} stroke={C.rain} strokeWidth={4} strokeLinecap="round" opacity={0.85} />;
    })}
  </g>
);

export const SceneSamediMidi: React.FC<SceneProps> = ({start, dur}) => {
  const frame = useCurrentFrame();
  const L = word(start);
  const tPluie = L('pluie');
  const r = pop(frame, tPluie - 4, 13);
  return (
    <Scene dur={dur} source="Meteored / tameteo.com — 23/10/2026 14h19 (front chaud sur la Bretagne dès samedi midi)">
      <DoubleCalendar active="sam" y={325} scale={0.86} marker="12 H · LA PLUIE ARRIVE" markerAt={tPluie} />
      <FranceMap
        id="midi"
        box={[
          [150, 720],
          [840, 1360],
        ]}
        fills={Object.fromEntries(BRETAGNE.map((c) => [c, {color: C.rain, p: Math.min(1, r) * 0.7}]))}
        over={(pt) => (
          <>
            <Rain pt={pt} lon={[-5, -1.2]} lat={[47.2, 49]} n={46} frame={frame} a={Math.min(1, r)} />
            <MapLabel x={pt([-3.0, 48.15])[0]} y={pt([-3.0, 48.15])[1]} text="BRETAGNE" size={26} a={Math.min(1, r)} />
          </>
        )}
      />
    </Scene>
  );
};

// ─── 8 · Samedi soir : rafales 80–100 km/h sur la Manche ───
const MANCHE = ['29', '22', '35', '50', '14', '27', '76', '80', '62', '59'];

export const SceneManche: React.FC<SceneProps> = ({start, dur}) => {
  const frame = useCurrentFrame();
  const L = word(start);
  const t0 = L('80') - 8;
  const coast = pop(frame, L('Manche') - 6, 12);
  return (
    <Scene dur={dur} source="Météo-Contact — 22/10/2026 20h39">
      <Kicker a={pop(frame, 0)} color={C.orange}>
        CÔTES DE LA MANCHE · SAMEDI SOIR
      </Kicker>
      <GustGauge value={100} range={[80, 100]} start={t0} dur={L('100') - t0 + 4} big="80–100" bigSize={150} cy={850} r={280} />
      <FranceMap
        id="manche"
        box={[
          [700, 400],
          [915, 590],
        ]}
        fills={Object.fromEntries(MANCHE.map((c) => [c, {color: C.orange, p: 0.6 + 0.4 * Math.min(1, coast)}]))}
      />
    </Scene>
  );
};

// ─── 9 · Dans la nuit : le front froid balaie le Nord, 20 à 40 mm ───
export const SceneFront: React.FC<SceneProps> = ({start, dur}) => {
  const frame = useCurrentFrame();
  const L = word(start);
  const t20 = L('20');
  const t40 = L('40');
  const dx = interpolate(frame, [0, dur], [-2.6, 6.2], clamp);
  const base: LonLat[] = [
    [-5.8, 43.2],
    [-4.0, 45.6],
    [-2.4, 48.0],
    [-0.9, 50.2],
    [0.4, 52.0],
  ];
  return (
    <Scene dur={dur} source="Meteored / tameteo 23/10/2026 14h19 · Météo-Contact 22/10/2026 — front schématique">
      <FranceMap
        id="front"
        box={[
          [120, 610],
          [870, 1365],
        ]}
        over={(pt, clipId) => {
          const line = base.map(([lo, la]) => pt([lo + dx, la]));
          const back = base.map(([lo, la]) => pt([lo + dx - 2.2, la])).reverse();
          const band = poly([...line, ...back]) + ' Z';
          const tri: React.ReactNode[] = [];
          for (let i = 0; i < line.length - 1; i++) {
            const [x0, y0] = line[i];
            const [x1, y1] = line[i + 1];
            const len = Math.hypot(x1 - x0, y1 - y0);
            const ux = (x1 - x0) / len;
            const uy = (y1 - y0) / len;
            // normale orientée vers l'est : les triangles pointent dans le sens de déplacement du front
            const [nx, ny] = -uy > 0 ? [-uy, ux] : [uy, -ux];
            for (let d = 22; d < len - 16; d += 62) {
              const bx = x0 + ux * d;
              const by = y0 + uy * d;
              tri.push(
                <path key={`${i}-${d}`} d={`M ${bx - ux * 16} ${by - uy * 16} L ${bx + nx * 24} ${by + ny * 24} L ${bx + ux * 16} ${by + uy * 16} Z`} fill={C.rain} />,
              );
            }
          }
          return (
            <>
              <defs>
                <clipPath id="band-front">
                  <path d={band} />
                </clipPath>
              </defs>
              <g clipPath={`url(#${clipId})`}>
                <path d={band} fill={C.rain} fillOpacity={0.32} />
                <g clipPath="url(#band-front)">
                  <Rain pt={(ll) => pt([ll[0] + dx, ll[1]])} lon={[-9, 1.5]} lat={[42.5, 52]} n={150} frame={frame} a={0.9} />
                </g>
              </g>
              <path d={poly(line)} stroke={C.rain} strokeWidth={7} fill="none" strokeLinecap="round" />
              {tri}
              <MapLabel x={line[3][0] + 40} y={line[3][1] - 30} text="FRONT FROID" size={22} anchor="start" a={ramp(frame, 6, 16)} />
            </>
          );
        }}
      />
      <div style={{position: 'absolute', left: 60, top: 330, width: 870, textAlign: 'center', opacity: ramp(frame, 0, 10)}}>
        <span style={{fontFamily: FONT.mono, fontWeight: 700, fontSize: 26, color: C.white, letterSpacing: 2, border: `2px solid ${C.rain}`, borderRadius: 8, padding: '6px 16px'}}>
          NUIT DE SAMEDI À DIMANCHE · MANCHE 0 H – 2 H
        </span>
      </div>
      {frame >= t20 - 4 ? (
        <div style={{position: 'absolute', left: CX, top: 405, transform: `translateX(-50%) scale(${0.85 + 0.15 * pop(frame, t20 - 4)})`, display: 'flex', alignItems: 'baseline', gap: 14, whiteSpace: 'nowrap'}}>
          <span style={{fontFamily: FONT.title, fontSize: 170, lineHeight: 1, color: C.white}}>20–</span>
          <span style={{fontFamily: FONT.title, fontSize: 170, lineHeight: 1, color: C.rain}}>{Math.round(interpolate(ramp(frame, t20, t40 + 6), [0, 1], [20, 40]))}</span>
          <span style={{fontFamily: FONT.title, fontSize: 60, color: C.mute}}>MM</span>
        </div>
      ) : null}
    </Scene>
  );
};

// ─── 10 · Vigilance jaune : 8 départements (14h01) puis 20 (mise à jour 18h01) ───
const VIGI_14H = ['29', '22', '50', '76', '80', '62', '59', '2B'];
const VIGI_18H = ['14', '27', '60', '02', '95', '78', '92', '75', '93', '94', '91', '77'];
const REGIONS: {nom: string; ll: LonLat; after: 'a' | 'b'}[] = [
  {nom: 'BRETAGNE', ll: [-3.2, 48.0], after: 'a'},
  {nom: 'NORMANDIE', ll: [0.15, 49.05], after: 'a'},
  {nom: 'HAUTS-DE-FRANCE', ll: [2.8, 50.15], after: 'a'},
  {nom: 'CORSE', ll: [8.15, 42.05], after: 'a'},
  {nom: 'ÎLE-DE-FRANCE', ll: [2.5, 48.45], after: 'b'},
];

export const SceneVigilance: React.FC<SceneProps> = ({start, dur}) => {
  const frame = useCurrentFrame();
  const L = word(start);
  const t8 = L('8');
  const tUp = L('jaune') + 2;
  const fills: Record<string, Fill> = {};
  VIGI_14H.forEach((c, i) => {
    fills[c] = {color: C.yellow, p: Math.min(1, pop(frame, t8 + 2 + i * 3, 12))};
  });
  VIGI_18H.forEach((c, i) => {
    fills[c] = {color: C.yellow, p: Math.min(1, pop(frame, tUp + 6 + i * 2, 12))};
  });
  const count = frame < tUp + 4 ? VIGI_14H.filter((_, i) => frame >= t8 + 2 + i * 3).length : Math.min(20, 8 + Math.max(0, Math.floor((frame - tUp - 6) / 2) + 1));
  return (
    <Scene dur={dur} source="Météo-France · vigilance pour samedi 24/10, cartes du 23/10/2026 14h01 et 18h01">
      <Kicker a={pop(frame, 0)} color={C.yellow}>
        VIGILANCE JAUNE · SAMEDI 24/10
      </Kicker>
      <div style={{position: 'absolute', left: 90, top: 395, display: 'flex', alignItems: 'baseline', gap: 14, opacity: ramp(frame, t8 - 4, t8 + 2)}}>
        <span style={{fontFamily: FONT.title, fontSize: 150, lineHeight: 1, color: C.yellow, transform: `scale(${1 + 0.12 * Math.max(0, 1 - Math.abs(frame - tUp - 30) / 8)})`, display: 'inline-block'}}>{count}</span>
        <span style={{fontFamily: FONT.title, fontSize: 46, color: C.white}}>DÉPARTEMENTS</span>
      </div>
      <FranceMap
        id="vigi"
        box={[
          [110, 600],
          [900, 1365],
        ]}
        fills={fills}
        over={(pt) =>
          REGIONS.map((r) => {
            const a = r.after === 'a' ? ramp(frame, t8 + 6, t8 + 18) : ramp(frame, tUp + 14, tUp + 24);
            const [x, y] = pt(r.ll);
            return <MapLabel key={r.nom} x={x} y={y} text={r.nom} size={21} a={a} />;
          })
        }
      />
      <Stamp text="MISE À JOUR 18H01" at={tUp} x={735} y={505} rotate={-7} size={40} color={C.red} sub="20 DÉPARTEMENTS" />
    </Scene>
  );
};

// ─── 11 · Dimanche : éclaircies à l'ouest, la pluie file vers l'est (blanc de 60 à 63 s) ───
export const SceneDimanche: React.FC<SceneProps> = ({start, dur}) => {
  const frame = useCurrentFrame();
  const L = word(start);
  const tBlank = toFrames(59.9 - start);
  const tOuest = L("l'ouest");
  const tEst = L("l'est");
  const sun = pop(frame, tBlank, 12);
  const dx = interpolate(frame, [tBlank, dur], [0, 5.2], {...clamp, easing: (x) => 1 - Math.pow(1 - x, 1.6)});
  const pulse = frame >= tOuest ? 1 + 0.15 * Math.max(0, 1 - (frame - tOuest) / 10) : 1;
  return (
    <Scene dur={dur} zoom={0.02} source="Meteored / tameteo.com — 23/10/2026 14h19 (dimanche : éclaircies au nord-ouest, pluie vers le sud et l'est)">
      <DoubleCalendar active="dim" switchAt={3} y={325} scale={0.86} marker="LE CIEL SE DÉGAGE À L'OUEST" markerAt={L('dégager')} />
      <FranceMap
        id="dim"
        box={[
          [150, 735],
          [840, 1365],
        ]}
        over={(pt, clipId) => {
          const band: LonLat[] = [
            [1.2, 51.5],
            [2.6, 51.5],
            [2.0, 42.5],
            [0.6, 42.5],
          ];
          const shifted = band.map(([lo, la]) => pt([lo + dx, la]));
          const [sx, sy] = pt([-3.3, 48.2]);
          const [ex, ey] = pt([6.0, 48.6]);
          const rays = Array.from({length: 10}, (_, i) => {
            const a = (i / 10) * Math.PI * 2 + frame / 30;
            return <line key={i} x1={sx + Math.cos(a) * 52} y1={sy + Math.sin(a) * 52} x2={sx + Math.cos(a) * 76} y2={sy + Math.sin(a) * 76} stroke={C.yellow} strokeWidth={7} strokeLinecap="round" />;
          });
          return (
            <>
              <g clipPath={`url(#${clipId})`} opacity={ramp(frame, 0, 10)}>
                <path d={poly(shifted) + ' Z'} fill={C.rain} fillOpacity={0.42} />
                <Rain pt={(ll) => pt([ll[0] + dx, ll[1]])} lon={[0.6, 2.6]} lat={[42.5, 51.5]} n={60} frame={frame} a={0.9} />
              </g>
              <g opacity={Math.min(1, sun)} transform={`translate(${sx} ${sy}) scale(${Math.min(1, sun) * pulse}) translate(${-sx} ${-sy})`}>
                {rays}
                <circle cx={sx} cy={sy} r={40} fill={C.yellow} />
              </g>
              <MapLabel x={sx} y={sy + 112} text="ÉCLAIRCIES" size={24} a={Math.min(1, sun)} color={C.yellow} />
              <MapLabel x={ex} y={ey} text="PLUIE VERS L'EST" size={22} a={ramp(frame, tEst - 4, tEst + 6)} color={C.white} />
            </>
          );
        }}
      />
    </Scene>
  );
};

// ─── 12 · Trois réflexes (+ rappel Austen dans le blanc de 71 à 73,7 s) ───
export const SceneReflexes: React.FC<SceneProps> = ({start, dur}) => {
  const frame = useCurrentFrame();
  const L = word(start);
  const tAusten = L('tempête');
  const tOut = L('Évite') - 8;
  const card = fadeBetween(frame, tAusten, tAusten + 10, tOut - 2, tOut + 6);
  const bar = pop(frame, tAusten + 12, 11);
  return (
    <Scene dur={dur} zoom={0.02} source="Météo-France (conseils de vigilance) · Met Éireann · Austen : relevé Météo-France via franceinfo, 23/10/2026">
      <Kicker a={pop(frame, 0)} color={C.yellow}>
        3 RÉFLEXES
      </Kicker>
      <ChecklistItem kind="wind" title={'Range ce qui peut\ns\'envoler'} start={L('Range')} y={420} index={1} />
      <ChecklistItem kind="tree" title={'Évite les forêts\net les bords de mer'} start={L('Évite')} y={680} index={2} />
      <ChecklistItem kind="flood" title={'Route inondée ?\nDemi-tour'} start={L('route')} y={940} index={3} />
      {card > 0 ? (
        <div style={{position: 'absolute', left: 100, top: 640, width: 790, height: 690, opacity: card, transform: `translateY(${(1 - card) * 40}px)`, background: 'rgba(20,32,58,0.96)', border: `3px solid ${C.orange}`, borderRadius: 24}}>
          <div style={{position: 'absolute', left: 0, top: 22, width: '100%', textAlign: 'center', fontFamily: FONT.mono, fontWeight: 700, fontSize: 24, color: C.orange, letterSpacing: 2}}>
            RAPPEL · TEMPÊTE AUSTEN · VEN. 23/10
          </div>
        </div>
      ) : null}
      {card > 0 ? (
        <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, opacity: card}}>
          <FranceMap
            id="austen"
            box={[
              [300, 800],
              [840, 1250],
            ]}
            clipBox={[
              [104, 712],
              [886, 1326],
            ]}
            fitCodes={BRETAGNE}
            over={(pt) => {
              const [x, y] = pt([-4.73, 48.04]);
              return <GustBar x={x} y={y} value={161} label="POINTE DU RAZ" p={bar} k={1.45} width={54} />;
            }}
          />
        </div>
      ) : null}
    </Scene>
  );
};

// ─── 13 · Écran final ───
const SOURCES = [
  'Météo-France · vigilance 23/10/2026 (14h01, 18h01)',
  'Met Office · STV News · 23/10/2026',
  'Met Éireann · The Irish Times · TheJournal.ie · 23/10',
  'MET Norway via NRK / NTB / TV 2 · 23/10/2026',
  'DMI via DR · KNMI via OOG TV · 23/10/2026',
  'IRM via RTBF · 23/10/2026',
  'Météo Consult · Y. Amice (actu.fr) via CNEWS · 23/10',
  'Meteored (tameteo.com) · 23/10/2026',
  'Météo-Contact · 22/10/2026',
  'franceinfo (relevé Météo-France, Austen) · 23/10',
  'Cartes : france-geojson (G. David) · Natural Earth',
];

export const SceneFin: React.FC<SceneProps> = ({dur}) => {
  const frame = useCurrentFrame();
  const a = pop(frame, 0, 10);
  const b = pop(frame, 8, 12);
  const pin = Math.sin(frame / 6) * 8;
  return (
    <Scene dur={dur + 10} zoom={0.02}>
      <div style={{position: 'absolute', left: 60, top: 360, width: 870, textAlign: 'center', transform: `scale(${0.7 + 0.3 * a})`, opacity: Math.min(1, a * 1.3)}}>
        <div style={{fontFamily: FONT.title, fontSize: 132, lineHeight: 0.98, color: C.yellow}}>T'ES DANS</div>
        <div style={{fontFamily: FONT.title, fontSize: 132, lineHeight: 0.98, color: C.yellow}}>LA ZONE ?</div>
      </div>
      <div style={{position: 'absolute', left: 60, top: 655, width: 870, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, opacity: b, transform: `translateY(${(1 - b) * 30}px)`}}>
        <svg width={44} height={56} viewBox="0 0 44 56" style={{transform: `translateY(${pin}px)`}}>
          <path d="M22 2 C10 2 2 11 2 22 C2 37 22 54 22 54 C22 54 42 37 42 22 C42 11 34 2 22 2 Z" fill={C.red} />
          <circle cx={22} cy={22} r={8} fill="#fff" />
        </svg>
        <span style={{fontFamily: FONT.text, fontWeight: 800, fontSize: 40, color: C.white}}>Dis-moi d'où tu nous regardes</span>
      </div>
      <div style={{position: 'absolute', left: 90, top: 790, width: 810, opacity: ramp(frame, 14, 26)}}>
        <div style={{fontFamily: FONT.mono, fontWeight: 700, fontSize: 24, color: C.orange, letterSpacing: 3, marginBottom: 12}}>SOURCES</div>
        {SOURCES.map((s, i) => (
          <div key={s} style={{fontFamily: FONT.mono, fontSize: 21, lineHeight: 1.55, color: C.mute, opacity: ramp(frame, 16 + i * 2, 24 + i * 2)}}>
            · {s}
          </div>
        ))}
      </div>
    </Scene>
  );
};
