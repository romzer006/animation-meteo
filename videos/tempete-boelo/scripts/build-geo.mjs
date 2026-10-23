// Prépare les fonds de carte : départements (gregoiredavid/france-geojson) + pays d'Europe (Natural Earth via world-atlas).
import {readFileSync, writeFileSync} from 'node:fs';
import {feature} from 'topojson-client';

const round = (c) => (typeof c[0] === 'number' ? [+c[0].toFixed(3), +c[1].toFixed(3)] : c.map(round));
const slim = (f, props) => ({type: 'Feature', properties: props, geometry: {type: f.geometry.type, coordinates: round(f.geometry.coordinates)}});

const deps = JSON.parse(readFileSync(new URL('./departements-version-simplifiee.geojson', import.meta.url)));
const departements = {
  type: 'FeatureCollection',
  features: deps.features.map((f) => slim(f, {code: f.properties.code, nom: f.properties.nom})),
};

const world = JSON.parse(readFileSync(new URL('../node_modules/world-atlas/countries-50m.json', import.meta.url)));
const countries = feature(world, world.objects.countries);
// Garde les pays dont une partie tombe dans la fenêtre Atlantique Nord-Est / Europe du Nord.
const inWindow = ([lon, lat]) => lon > -30 && lon < 35 && lat > 34 && lat < 72;
const anyPoint = (c) => (typeof c[0] === 'number' ? inWindow(c) : c.some(anyPoint));
const europe = {
  type: 'FeatureCollection',
  features: countries.features
    .filter((f) => f.geometry && anyPoint(f.geometry.coordinates))
    .map((f) => slim(f, {id: f.id, nom: f.properties.name})),
};

writeFileSync(new URL('../src/data/departements.json', import.meta.url), JSON.stringify(departements));
writeFileSync(new URL('../src/data/europe.json', import.meta.url), JSON.stringify(europe));
console.log('départements', departements.features.length, '· pays', europe.features.length);
console.log(europe.features.map((f) => `${f.properties.id}:${f.properties.nom}`).join(' | '));
