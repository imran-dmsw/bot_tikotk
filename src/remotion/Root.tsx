import React from 'react';
import {Composition} from 'remotion';
import {TextAnimation, TextAnimationProps} from './compositions/TextAnimation';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition<any, TextAnimationProps>
      id="DMSWTikTok"
      component={TextAnimation}
      defaultProps={
        {
          hook: 'Ce site a été livré en 7 jours.',
          revelation: 'Livraison 10 jours — Zéro effort',
          cta: 'Audit gratuit — dmsw.fr',
          showLogo: true
        } satisfies TextAnimationProps
      }
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={900}
    />
  );
};
