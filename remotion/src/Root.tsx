import React from 'react';
import { Composition } from 'remotion';

import { TextAnimation }   from './compositions/TextAnimation';
import { ScreenRecording } from './compositions/ScreenRecording';
import { VoiceOver }       from './compositions/VoiceOver';
import { VIDEO }           from './lib/constants';
import type { ScriptProps } from './lib/types';

// ─── Props par défaut (pour le studio Remotion) ───────────────────────────────

const DEFAULT_PROPS: ScriptProps = {
  hook:   'Ton site web perd des clients chaque jour',
  bullets: [
    '80% des visiteurs partent en moins de 10s',
    'Un message flou = zéro confiance = zéro client',
    'DMSW transforme ça en 7 jours chrono',
  ],
  script: 'Ton site web perd des clients chaque jour. '
    + 'Pourquoi ? Parce que 80% des visiteurs partent en moins de 10 secondes. '
    + 'Un message flou, une navigation compliquée et ils sont partis chez la concurrence. '
    + 'Chez DMSW on règle ça en 7 jours. Lien en bio pour découvrir notre méthode.',
  visuels:        'Texte blanc sur fond sombre, stats en rouge, logo DMSW en bleu',
  cta:            'Découvrez notre méthode en bio',
  hashtags:       ['#entrepreneuriat', '#siteinternet', '#agenceweb', '#DMSW', '#entrepreneur'],
  duree_secondes: 30,
  voiceoverSrc:   undefined,
};

// ─── Enregistrement des compositions ─────────────────────────────────────────

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="TextAnimation"
      component={TextAnimation}
      durationInFrames={DEFAULT_PROPS.duree_secondes * VIDEO.fps}
      fps={VIDEO.fps}
      width={VIDEO.width}
      height={VIDEO.height}
      defaultProps={DEFAULT_PROPS}
      calculateMetadata={({ props }) => ({
        durationInFrames: props.duree_secondes * VIDEO.fps,
      })}
    />

    <Composition
      id="ScreenRecording"
      component={ScreenRecording}
      durationInFrames={DEFAULT_PROPS.duree_secondes * VIDEO.fps}
      fps={VIDEO.fps}
      width={VIDEO.width}
      height={VIDEO.height}
      defaultProps={DEFAULT_PROPS}
      calculateMetadata={({ props }) => ({
        durationInFrames: props.duree_secondes * VIDEO.fps,
      })}
    />

    <Composition
      id="VoiceOver"
      component={VoiceOver}
      durationInFrames={DEFAULT_PROPS.duree_secondes * VIDEO.fps}
      fps={VIDEO.fps}
      width={VIDEO.width}
      height={VIDEO.height}
      defaultProps={DEFAULT_PROPS}
      calculateMetadata={({ props }) => ({
        durationInFrames: props.duree_secondes * VIDEO.fps,
      })}
    />
  </>
);
