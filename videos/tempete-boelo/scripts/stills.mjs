// Rend quelques images fixes pour contrôle : node scripts/stills.mjs <dossier> <frame> [<frame>...]
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';

const [outDir, ...frames] = process.argv.slice(2);
const browserExecutable = process.env.REMOTION_BROWSER || null;
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const composition = await selectComposition({serveUrl, id: 'Boelo', browserExecutable});
for (const f of frames.map(Number)) {
  const output = path.join(outDir, `frame-${String(f).padStart(4, '0')}.png`);
  await renderStill({serveUrl, composition, frame: f, output, browserExecutable, scale: 0.5});
  console.log('ok', output);
}
