import React from 'react';
import {interpolate, spring, useVideoConfig} from 'remotion';

interface HookProps {
  text: string;
  frame: number;
}

export const Hook: React.FC<HookProps> = ({text, frame}) => {
  const {fps} = useVideoConfig();
  const crash = spring({
    fps,
    frame,
    config: {stiffness: 300, damping: 20}
  });

  const subtitleOpacity = interpolate(frame, [20, 40], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        textAlign: 'center',
        padding: '0 70px'
      }}
    >
      <h1
        style={{
          margin: 0,
          fontFamily: 'Syne, sans-serif',
          fontWeight: 800,
          fontSize: 72,
          color: '#ffffff',
          transform: `translateY(${interpolate(crash, [0, 1], [-200, 0])}px)`
        }}
      >
        {text}
      </h1>
      <p
        style={{
          marginTop: 24,
          fontFamily: 'Inter, sans-serif',
          fontSize: 28,
          color: '#1a82d4',
          opacity: subtitleOpacity
        }}
      >
        DMSW booste ton acquisition en automatique.
      </p>
    </div>
  );
};
