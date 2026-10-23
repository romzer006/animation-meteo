import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

const fonts: [string, string, string][] = [
  ['Anton', 'anton-latin-400-normal.woff2', '400'],
  ['Space Mono', 'space-mono-latin-400-normal.woff2', '400'],
  ['Space Mono', 'space-mono-latin-700-normal.woff2', '700'],
  ['Manrope', 'manrope-latin-500-normal.woff2', '500'],
  ['Manrope', 'manrope-latin-700-normal.woff2', '700'],
  ['Manrope', 'manrope-latin-800-normal.woff2', '800'],
];

export const loadFonts = () =>
  Promise.all(fonts.map(([family, file, weight]) => loadFont({family, url: staticFile(`fonts/${file}`), weight})));
