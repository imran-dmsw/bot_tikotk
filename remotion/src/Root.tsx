import React from 'react';
import { Composition } from 'remotion';

import { TextAnimation }    from './compositions/TextAnimation';
import { TypographySlide }  from './compositions/TypographySlide';
import { ScreenRecording }  from './compositions/ScreenRecording';
import { VoiceOver }        from './compositions/VoiceOver';
import { VIDEO }            from './lib/constants';
import type { ScriptProps } from './lib/types';

// ─── Props par défaut (pour le studio Remotion) ───────────────────────────────

const DEFAULT_PROPS: ScriptProps = {
  hook:            'Votre site fait fuir vos clients',
  problem:         'Votre site attire des visiteurs mais ils repartent sans acheter. Trop lent, trop flou.',
  solution:        'Un site pensé pour convertir résout le problème de votre client en 10 secondes.',
  bullets: [
    'Audit gratuit de votre site',
    'Design 100% orienté conversion',
    'Résultats dès le 1er mois',
  ],
  script:          'Votre site fait fuir vos clients, et vous ne le savez même pas. '
    + 'Un site trop lent, un message flou, et vos visiteurs partent. '
    + 'La solution : un site qui résout le problème de votre client en 10 secondes. '
    + 'Chez DMSW, on fait exactement ça. Audit gratuit, lien en bio.',
  visuels:         'Texte blanc sur fond sombre, stats, logo DMSW en bleu',
  cta:             'Lien en bio — audit gratuit offert',
  hashtags:        ['#entrepreneursolo', '#siteweb', '#conversionweb', '#marketingdigital', '#agenceweb'],
  duree_secondes:  27,
  voiceoverSrc:    undefined,
};

// ─── Enregistrement des compositions ─────────────────────────────────────────

export const RemotionRoot: React.FC = () => (
  <>
    {/* Template 1 — TextAnimation (fond navy, layout gauche, animations spring) */}
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

    {/* Template 2 — TypographySlide (fond noir, centré, typewriter, accents colorés) */}
    <Composition
      id="TypographySlide"
      component={TypographySlide}
      durationInFrames={DEFAULT_PROPS.duree_secondes * VIDEO.fps}
      fps={VIDEO.fps}
      width={VIDEO.width}
      height={VIDEO.height}
      defaultProps={DEFAULT_PROPS}
      calculateMetadata={({ props }) => ({
        durationInFrames: props.duree_secondes * VIDEO.fps,
      })}
    />

    {/* Template 3 — ScreenRecording */}
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

    {/* Template 4 — VoiceOver */}
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
