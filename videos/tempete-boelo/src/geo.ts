import {geoConicConformal, geoGraticule10, geoPath, type GeoProjection} from 'd3-geo';
import type {Feature, FeatureCollection, Geometry} from 'geojson';
import departementsData from './data/departements.json';
import europeData from './data/europe.json';

export type LonLat = [number, number];
export type Box = [[number, number], [number, number]];
export type Pt = (ll: LonLat) => [number, number];

export const departements = departementsData as unknown as FeatureCollection<Geometry, {code: string; nom: string}>;
export const europe = europeData as unknown as FeatureCollection<Geometry, {id?: string; nom: string}>;

// Codes ISO 3166 numériques (Natural Earth / world-atlas)
export const PAYS = {
  irlande: '372',
  royaumeUni: '826',
  norvege: '578',
  danemark: '208',
  paysBas: '528',
  belgique: '056',
  france: '250',
};

const viewPoints = ([[lon0, lat0], [lon1, lat1]]: [LonLat, LonLat]) => ({
  type: 'MultiPoint' as const,
  coordinates: [
    [lon0, lat0],
    [lon1, lat0],
    [lon0, lat1],
    [lon1, lat1],
    [(lon0 + lon1) / 2, lat0],
    [(lon0 + lon1) / 2, lat1],
  ],
});

type MapCache = {proj: GeoProjection; paths: {key: string; d: string}[]; graticule: string; outline?: string};
const cache = new Map<string, MapCache>();

// Europe : conique conforme, parallèles 45° et 62°, cadrée sur une fenêtre lon/lat.
export const europeMap = (view: [LonLat, LonLat], box: Box): MapCache => {
  const k = `eu:${JSON.stringify(view)}:${JSON.stringify(box)}`;
  const hit = cache.get(k);
  if (hit) return hit;
  const proj = geoConicConformal().parallels([45, 62]).rotate([-2, 0]).fitExtent(box, viewPoints(view));
  proj.clipExtent([
    [-400, -400],
    [1480, 2320],
  ]);
  const path = geoPath(proj);
  const out: MapCache = {
    proj,
    paths: europe.features.map((f) => ({key: String(f.properties.id ?? f.properties.nom), d: path(f) ?? ''})),
    graticule: path(geoGraticule10()) ?? '',
  };
  cache.set(k, out);
  return out;
};

// France : conique conforme centrée sur la France (parallèles 44° et 49°, méridien 3° E, comme le Lambert-93).
export const franceMap = (box: Box, fitCodes?: string[]): MapCache => {
  const k = `fr:${JSON.stringify(box)}:${fitCodes?.join(',') ?? 'all'}`;
  const hit = cache.get(k);
  if (hit) return hit;
  const fit: FeatureCollection = fitCodes
    ? {type: 'FeatureCollection', features: departements.features.filter((f) => fitCodes.includes(f.properties.code))}
    : departements;
  const proj = geoConicConformal().parallels([44, 49]).rotate([-3, 0]).fitExtent(box, fit);
  proj.clipExtent([
    [-400, -400],
    [1480, 2320],
  ]);
  const path = geoPath(proj);
  const out: MapCache = {
    proj,
    paths: departements.features.map((f: Feature<Geometry, {code: string}>) => ({key: f.properties.code, d: path(f) ?? ''})),
    graticule: path(geoGraticule10()) ?? '',
    outline: departements.features.map((f) => path(f) ?? '').join(' '),
  };
  cache.set(k, out);
  return out;
};

// Caméra : zoom d'un cadre (en coordonnées écran de la carte) vers un autre.
export type Camera = {s: number; tx: number; ty: number};
export const IDENTITY: Camera = {s: 1, tx: 0, ty: 0};

export const cameraOn = (bbox: [[number, number], [number, number]], box: Box): Camera => {
  const [[x0, y0], [x1, y1]] = bbox;
  const [[bx0, by0], [bx1, by1]] = box;
  const s = Math.min((bx1 - bx0) / (x1 - x0), (by1 - by0) / (y1 - y0));
  return {s, tx: (bx0 + bx1) / 2 - s * ((x0 + x1) / 2), ty: (by0 + by1) / 2 - s * ((y0 + y1) / 2)};
};

export const mixCamera = (a: Camera, b: Camera, t: number, box: Box): Camera => {
  // zoom géométrique autour du centre de l'écran pour éviter l'effet « glissade »
  const cx = (box[0][0] + box[1][0]) / 2;
  const cy = (box[0][1] + box[1][1]) / 2;
  const ca = [(cx - a.tx) / a.s, (cy - a.ty) / a.s];
  const cb = [(cx - b.tx) / b.s, (cy - b.ty) / b.s];
  const s = a.s * Math.pow(b.s / a.s, t);
  const mx = ca[0] + (cb[0] - ca[0]) * t;
  const my = ca[1] + (cb[1] - ca[1]) * t;
  return {s, tx: cx - s * mx, ty: cy - s * my};
};

export const projector = (proj: GeoProjection, cam: Camera = IDENTITY): Pt => (ll) => {
  const [x, y] = proj(ll) ?? [0, 0];
  return [cam.s * x + cam.tx, cam.s * y + cam.ty];
};
