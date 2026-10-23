import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, FONT} from '../theme';
import {europeMap, franceMap, IDENTITY, projector, type Box, type Camera, type LonLat, type Pt} from '../geo';

export type Fill = {color: string; p: number};

// Carte d'Europe : pays de fond + pays colorés + calques en coordonnées écran.
export const EuropeMap: React.FC<{
  view: [LonLat, LonLat];
  box: Box;
  fills?: Record<string, Fill>;
  cam?: Camera;
  under?: (pt: Pt, s: number) => React.ReactNode;
  over?: (pt: Pt, s: number) => React.ReactNode;
  clip?: Box;
  id?: string;
}> = ({view, box, fills = {}, cam = IDENTITY, under, over, clip, id = 'eu'}) => {
  const {proj, paths, graticule} = europeMap(view, box);
  const pt = projector(proj, cam);
  const g = `translate(${cam.tx} ${cam.ty}) scale(${cam.s})`;
  const clipId = `clip-${id}`;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      {clip ? (
        <defs>
          <clipPath id={clipId}>
            <rect x={clip[0][0]} y={clip[0][1]} width={clip[1][0] - clip[0][0]} height={clip[1][1] - clip[0][1]} rx={26} />
          </clipPath>
        </defs>
      ) : null}
      <g clipPath={clip ? `url(#${clipId})` : undefined}>
      <g transform={g}>
        <path d={graticule} fill="none" stroke="#ffffff" strokeOpacity={0.06} strokeWidth={1} vectorEffect="non-scaling-stroke" />
        {paths.map((p) => (
          <path key={p.key} d={p.d} fill={C.land} stroke={C.landStroke} strokeWidth={1.3} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
        ))}
        {paths
          .filter((p) => fills[p.key] && fills[p.key].p > 0)
          .map((p) => (
            <path
              key={`f${p.key}`}
              d={p.d}
              fill={fills[p.key].color}
              fillOpacity={0.82 * fills[p.key].p}
              stroke={fills[p.key].color}
              strokeOpacity={fills[p.key].p}
              strokeWidth={2.4}
              vectorEffect="non-scaling-stroke"
              strokeLinejoin="round"
            />
          ))}
      </g>
      </g>
      <g clipPath={clip ? `url(#${clipId})` : undefined}>
        {under?.(pt, cam.s)}
        {over?.(pt, cam.s)}
      </g>
    </svg>
  );
};

// Carte de France des départements (GeoJSON gregoiredavid/france-geojson, conique conforme centrée sur la France).
export const FranceMap: React.FC<{
  box: Box;
  fitCodes?: string[];
  fills?: Record<string, Fill>;
  outlineGlow?: number;
  over?: (pt: Pt, clipId: string) => React.ReactNode;
  id: string;
  clipBox?: Box;
}> = ({box, fitCodes, fills = {}, outlineGlow = 0, over, id, clipBox}) => {
  const {proj, paths, outline} = franceMap(box, fitCodes);
  const pt = projector(proj);
  const clipId = `clip-${id}`;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      <defs>
        <clipPath id={clipId}>
          <path d={outline} />
        </clipPath>
        <clipPath id={`${clipId}-box`}>
          {clipBox ? (
            <rect x={clipBox[0][0]} y={clipBox[0][1]} width={clipBox[1][0] - clipBox[0][0]} height={clipBox[1][1] - clipBox[0][1]} rx={22} />
          ) : (
            <rect x={box[0][0] - 30} y={box[0][1] - 30} width={box[1][0] - box[0][0] + 60} height={box[1][1] - box[0][1] + 60} rx={24} />
          )}
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId}-box)`}>
        {outlineGlow > 0 ? <path d={outline} fill="none" stroke={C.yellow} strokeOpacity={0.25 * outlineGlow} strokeWidth={14} strokeLinejoin="round" /> : null}
        {paths.map((p) => (
          <path key={p.key} d={p.d} fill={C.land} stroke={C.landStroke} strokeWidth={1.2} strokeLinejoin="round" />
        ))}
        {paths
          .filter((p) => fills[p.key] && fills[p.key].p > 0)
          .map((p) => (
            <path
              key={`f${p.key}`}
              d={p.d}
              fill={fills[p.key].color}
              fillOpacity={0.9 * fills[p.key].p}
              stroke="#0d1526"
              strokeWidth={1.4}
              strokeLinejoin="round"
            />
          ))}
        {over?.(pt, clipId)}
      </g>
    </svg>
  );
};

// Étiquette posée sur une carte (Space Mono ou Anton), centrée sur un point.
export const MapLabel: React.FC<{x: number; y: number; text: string; a?: number; color?: string; size?: number; title?: boolean; anchor?: 'middle' | 'start' | 'end'}> = ({
  x,
  y,
  text,
  a = 1,
  color = C.white,
  size = 24,
  title = false,
  anchor = 'middle',
}) => (
  <text
    x={x}
    y={y + (1 - a) * 14}
    textAnchor={anchor}
    fontFamily={title ? FONT.title : FONT.mono}
    fontWeight={title ? 400 : 700}
    fontSize={size}
    fill={color}
    opacity={a}
    stroke="#0d1526"
    strokeWidth={title ? 6 : 5}
    paintOrder="stroke"
    letterSpacing={title ? 1 : 1.5}
  >
    {text}
  </text>
);

// Symbole de cyclone (hémisphère nord : rotation antihoraire).
export const Cyclone: React.FC<{x: number; y: number; r: number; speed?: number; color?: string; a?: number; glow?: boolean}> = ({
  x,
  y,
  r,
  speed = 7,
  color = C.red,
  a = 1,
  glow = true,
}) => {
  const frame = useCurrentFrame();
  const rot = -frame * speed;
  const arm = `M ${r * 0.5} 0 C ${r * 0.98} ${-r * 0.05} ${r * 1.28} ${-r * 0.58} ${r * 1.02} ${-r * 1.08} C ${r * 0.9} ${-r * 0.62} ${r * 0.55} ${-r * 0.42} 0 ${-r * 0.5} Z`;
  const gid = `cg${Math.round(r)}`;
  return (
    <g transform={`translate(${x} ${y}) scale(${a})`} opacity={Math.min(1, a)}>
      <defs>
        <radialGradient id={gid}>
          <stop offset="0%" stopColor={color} stopOpacity={0.45} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </radialGradient>
      </defs>
      {glow ? <circle r={r * 2.1} fill={`url(#${gid})`} /> : null}
      <g transform={`rotate(${rot})`}>
        <circle r={r * 0.62} fill={color} />
        <path d={arm} fill={color} />
        <path d={arm} fill={color} transform="rotate(180)" />
        <circle r={r * 0.24} fill="#0d1526" />
      </g>
    </g>
  );
};

// Barre verticale de rafale posée sur la carte (lieu + valeur).
export const GustBar: React.FC<{x: number; y: number; value: number; label: string; p: number; k?: number; width?: number; labelDy?: number; labelDx?: number; labelAnchor?: 'middle' | 'start' | 'end'}> = ({
  x,
  y,
  value,
  label,
  p,
  k = 1.9,
  width = 44,
  labelDy = 30,
  labelDx = 0,
  labelAnchor = 'middle',
}) => {
  const h = value * k * p;
  const color = value >= 120 ? C.red : value >= 90 ? C.orange : C.yellow;
  const shown = Math.round(value * Math.min(1, p));
  return (
    <g opacity={Math.min(1, p * 3)}>
      <circle cx={x} cy={y} r={7} fill={color} stroke="#0d1526" strokeWidth={3} />
      <rect x={x - width / 2} y={y - h} width={width} height={h} rx={6} fill={color} fillOpacity={0.92} stroke="#0d1526" strokeWidth={3} />
      <text x={x} y={y - h - 12} textAnchor="middle" fontFamily={FONT.title} fontSize={40} fill={C.white} stroke="#0d1526" strokeWidth={6} paintOrder="stroke">
        {shown}
      </text>
      <MapLabel x={x + labelDx} y={y + labelDy} text={label} size={19} color={C.white} anchor={labelAnchor} />
    </g>
  );
};
