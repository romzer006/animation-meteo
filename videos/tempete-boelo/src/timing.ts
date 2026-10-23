import transcription from './data/transcription.json';

export type Word = {mot: string; début: number; fin: number; cle: boolean};

export const WORDS = transcription as Word[];
export const FPS = 30;
export const AUDIO_SECONDS = 78.68;
// L'appel à l'action n'est pas dans la voix : on garde l'écran final 3,6 s après la fin de l'audio.
export const TAIL_SECONDS = 3.6;
export const TOTAL_FRAMES = Math.ceil((AUDIO_SECONDS + TAIL_SECONDS) * FPS);

export const toFrames = (s: number) => Math.round(s * FPS);

const bare = (mot: string) => mot.replace(/[ ,.:?…]/g, '');

// Début (en s) du premier mot `mot` prononcé après `after` secondes.
export const at = (mot: string, after = 0): number => {
  const w = WORDS.find((x) => x.début >= after - 1e-6 && bare(x.mot) === mot);
  if (!w) {
    throw new Error(`Mot introuvable dans la transcription : « ${mot} » après ${after} s`);
  }
  return w.début;
};

export const endOf = (mot: string, after = 0): number => {
  const start = at(mot, after);
  return WORDS.find((x) => x.début === start)!.fin;
};
