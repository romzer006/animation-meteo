import React from 'react';
import {Composition} from 'remotion';
import {loadFonts} from './fonts';
import {H, W} from './theme';
import {FPS, TOTAL_FRAMES} from './timing';
import {BoeloVideo} from './Video';

loadFonts();

export const RemotionRoot: React.FC = () => (
  <Composition id="Boelo" component={BoeloVideo} durationInFrames={TOTAL_FRAMES} fps={FPS} width={W} height={H} />
);
