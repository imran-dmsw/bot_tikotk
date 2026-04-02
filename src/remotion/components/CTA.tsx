import React from 'react';
import {interpolate, spring, useVideoConfig} from 'remotion';

interface CTAProps {
  text: string;
  frame: number;
  startFrame: number;
}

export const CTA: React.FC<CTAProps> = ({text, frame, startFrame}) => {
  const {fps} = useVideoConfig();
  const localFrame = Math.max(0, frame - startFrame);

  const logoSpring = spring({
    fps,
    frame: localFrame,
    config: {stiffness: 180, damping: 10}
  });
  const logoScale = interpolate(logoSpring, [0, 0.6, 1], [0, 1.2, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  });

  const pulse = 0.3 + ((Math.sin(localFrame / 8) + 1) / 2) * 0.4;

  const bounce = spring({
    fps,
    frame: localFrame,
    config: {stiffness: 200, damping: 12}
  });
  const bounceY = interpolate(bounce, [0, 1], [-100, 0]);

  const counter = Math.floor(
    interpolate(localFrame, [0, 45], [0, 47], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp'
    })
  );

  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
      <div
        style={{
          width: 220,
          height: 220,
          borderRadius: '50%',
          backgroundColor: '#1a82d4',
          opacity: pulse,
          position: 'absolute'
        }}
      />
      <div
        style={{
          width: 170,
          height: 170,
          borderRadius: '50%',
          backgroundColor: '#0d1b2a',
          border: '4px solid #1a82d4',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${logoScale})`,
          zIndex: 2
        }}
      >
        <span style={{fontFamily: 'Syne, sans-serif', fontSize: 56, fontWeight: 800, color: '#ffffff'}}>DMSW</span>
      </div>
      <p style={{marginTop: 30, fontFamily: 'Inter, sans-serif', fontSize: 36, fontWeight: 700, color: '#ffffff', transform: `translateY(${bounceY}px)`}}>
        {text}
      </p>
      <p style={{marginTop: 12, fontFamily: 'Inter, sans-serif', fontSize: 28, color: '#1a82d4'}}>+{counter} leads cette semaine</p>
    </div>
  );
};
