import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();

  const waveProgress = interpolate(frame, [durationInFrames - 150, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  });

  const waveTranslateY = interpolate(waveProgress, [0, 1], [220, 0]);

  return (
    <div style={{position: 'absolute', inset: 0, backgroundColor: '#0d1b2a', overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(26,130,212,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(26,130,212,0.08) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
          transform: 'perspective(900px) rotateX(55deg) scale(1.2)',
          transformOrigin: 'center bottom'
        }}
      />

      <svg
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          bottom: -4,
          left: 0,
          width: '100%',
          height: '35%',
          transform: `translateY(${waveTranslateY}px)`
        }}
      >
        <path
          fill="rgba(26,130,212,0.45)"
          d="M0,256L60,261.3C120,267,240,277,360,250.7C480,224,600,160,720,149.3C840,139,960,181,1080,192C1200,203,1320,181,1380,170.7L1440,160L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
        />
      </svg>
    </div>
  );
};
