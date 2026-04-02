import React, {useEffect, useState} from 'react';
import {Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Background} from '../components/Background';
import {BulletPoint} from '../components/BulletPoint';
import {CTA} from '../components/CTA';
import {GlitchText} from '../components/GlitchText';
import {Hook} from '../components/Hook';

export interface TextAnimationProps extends Record<string, unknown> {
  hook: string;
  bullets: string[];
  cta: string;
}

const OptionalAudio: React.FC = () => {
  const [exists, setExists] = useState(false);

  useEffect(() => {
    let mounted = true;
    // On teste la présence du fichier statique pour éviter une erreur de rendu.
    fetch(staticFile('voiceover.mp3'), {method: 'HEAD'})
      .then((response) => {
        if (mounted) {
          setExists(response.ok);
        }
      })
      .catch(() => {
        if (mounted) {
          setExists(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (!exists) {
    return null;
  }

  return <Audio src={staticFile('voiceover.mp3')} />;
};

export const TextAnimation: React.FC<TextAnimationProps> = ({hook, bullets, cta}) => {
  const frame = useCurrentFrame();

  return (
    <div style={{flex: 1, position: 'relative'}}>
      <Background />
      <OptionalAudio />

      <Sequence from={0} durationInFrames={90}>
        <div style={{position: 'absolute', inset: 0}}>
          <Hook text={hook} frame={frame} />
          <div style={{position: 'absolute', bottom: 220, width: '100%', textAlign: 'center'}}>
            <GlitchText text={hook} frame={frame} startFrame={0} />
          </div>
        </div>
      </Sequence>

      <Sequence from={90} durationInFrames={510}>
        <div style={{padding: '260px 90px'}}>
          {bullets.slice(0, 3).map((bullet, index) => (
            <BulletPoint key={bullet} text={bullet} frame={frame - 90} delay={index * 40} />
          ))}
        </div>
      </Sequence>

      <Sequence from={600} durationInFrames={300}>
        <CTA text={cta} frame={frame} startFrame={600} />
      </Sequence>
    </div>
  );
};
