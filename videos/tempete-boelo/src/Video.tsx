import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {Background, Captions, Header} from './components/Layout';
import {
  SceneBombe,
  SceneChezNous,
  SceneDimanche,
  SceneEcosse,
  SceneFin,
  SceneFront,
  SceneIntro,
  SceneIrlande,
  SceneManche,
  SceneNorvege,
  SceneRafales,
  SceneReflexes,
  SceneSamediMidi,
  SceneVigilance,
  type SceneProps,
} from './scenes';
import {at, endOf, toFrames, TOTAL_FRAMES} from './timing';

// Chaque scène démarre sur le mot exact qui l'annonce (transcription faster-whisper corrigée).
const SCENES: [number, React.FC<SceneProps>][] = [
  [0, SceneIntro], // blanc d'ouverture + « 6 pays en alerte… »
  [at('Une', 6.5), SceneBombe],
  [at('Samedi', 11), SceneIrlande],
  [at('Samedi', 17), SceneEcosse],
  [at('Puis'), SceneNorvege],
  [at('Dimanche', 26), SceneRafales],
  [at('Et', 33), SceneChezNous], // blanc de 35 à 40 s : zoom sur la France
  [at('Samedi', 43), SceneSamediMidi],
  [at('Samedi', 45.4), SceneManche],
  [at('Dans'), SceneFront],
  [at('Météo-France'), SceneVigilance],
  [at('Dimanche', 57.5), SceneDimanche], // blanc de 60 à 63 s : carte de dimanche
  [at('3', 66), SceneReflexes], // blanc de 71 à 73,7 s : rappel Austen
  [endOf('demi-tour') + 0.25, SceneFin],
];

export const BoeloVideo: React.FC = () => (
  <AbsoluteFill>
    <Background />
    {SCENES.map(([start, Comp], i) => {
      const from = toFrames(start);
      const to = i + 1 < SCENES.length ? toFrames(SCENES[i + 1][0]) : TOTAL_FRAMES;
      const dur = to - from;
      return (
        <Sequence key={i} from={from} durationInFrames={dur + (i + 1 < SCENES.length ? 4 : 0)} name={Comp.name}>
          <Comp start={start} dur={dur + 4} />
        </Sequence>
      );
    })}
    <Header />
    <Captions />
    {/* Voix off masterisée (-15 LUFS, blancs rendus muets) — l'enregistrement d'origine est public/vo.m4a */}
    <Audio src={staticFile('vo-master.m4a')} />
  </AbsoluteFill>
);
