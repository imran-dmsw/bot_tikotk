import React from 'react';
import {interpolate} from 'remotion';

interface GlitchTextProps {
  text: string;
  frame: number;
  startFrame: number;
}

export const GlitchText: React.FC<GlitchTextProps> = ({text, frame, startFrame}) => {
  const localFrame = Math.max(0, frame - startFrame);
  const isGlitchActive = localFrame <= 15;
  const shake = localFrame <= 20 ? Math.sin(localFrame * 5) * 8 : 0;
  const flashOpacity = interpolate(localFrame, [0, 3], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  });

  return (
    <div style={{position: 'relative', transform: `translateX(${shake}px)`}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#ffffff',
          opacity: flashOpacity,
          pointerEvents: 'none'
        }}
      />
      <div style={{position: 'relative', fontSize: 80, fontWeight: 800, fontFamily: 'Syne, sans-serif'}}>
        {isGlitchActive && (
          <>
            <span style={{position: 'absolute', left: 3, color: 'rgba(255, 0, 0, 0.7)'}}>{text}</span>
            <span style={{position: 'absolute', left: -3, color: 'rgba(0, 128, 255, 0.7)'}}>{text}</span>
          </>
        )}
        <span style={{position: 'relative', color: '#ffffff'}}>{text}</span>
      </div>
    </div>
  );
};
