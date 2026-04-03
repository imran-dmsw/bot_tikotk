import React from 'react';
import {spring, useVideoConfig} from 'remotion';

interface BulletPointProps {
  text: string;
  frame: number;
  delay: number;
}

export const BulletPoint: React.FC<BulletPointProps> = ({text, frame, delay}) => {
  const {fps} = useVideoConfig();
  const localFrame = Math.max(0, frame - delay);
  const appear = spring({
    fps,
    frame: localFrame,
    config: {stiffness: 120, damping: 14}
  });

  const rotate = (1 - appear) * 90;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        marginBottom: 36,
        transform: `perspective(600px) rotateX(${rotate}deg)`,
        transformOrigin: 'top center',
        opacity: appear
      }}
    >
      <span style={{fontSize: 42, transform: `scale(${appear})`, transformOrigin: 'center'}}>✅</span>
      <span style={{fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 36, color: '#ffffff'}}>{text}</span>
    </div>
  );
};
