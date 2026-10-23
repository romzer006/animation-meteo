// Charte Monsieur.meteo — tempête Boelo
export const C = {
  bg: '#0d1526',
  orange: '#f08a24',
  red: '#e5484d',
  yellow: '#ffd23f',
  white: '#f4f7fb',
  grey: '#5b6a85',
  mute: '#8fa3c2',
  land: '#233a63',
  landStroke: '#5577b0',
  rain: '#5fb4ff',
  paper: '#f3efe6',
  ink: '#121a2b',
};

export const FONT = {
  title: 'Anton',
  mono: 'Space Mono',
  text: 'Manrope',
};

export const W = 1080;
export const H = 1920;

// Zones de sécurité TikTok : rien d'important sous y = 1670 ni à droite de x = 930.
export const SAFE = {left: 60, right: 930, bottom: 1670};
export const CX = (SAFE.left + SAFE.right) / 2;

// Zone des visuels, entre le bandeau du haut et la ligne de source.
export const STAGE = {x: 60, y: 310, w: 870, h: 1070};
export const SOURCE_Y = 1392;
