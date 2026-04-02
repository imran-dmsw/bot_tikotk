import React from 'react';
import {Composition} from 'remotion';
import {TextAnimation, TextAnimationProps} from './compositions/TextAnimation';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition<any, TextAnimationProps>
      id="DMSWTikTok"
      component={TextAnimation}
      // On force le contrat de props attendu par la composition.
      defaultProps={
        {
          hook: 'Ton site web est une honte.',
          bullets: ['Design pro sur mesure', 'Livre en 7 jours', 'Zero abonnement cache'],
          cta: 'Lien en bio'
        } satisfies TextAnimationProps
      }
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={900}
    />
  );
};
