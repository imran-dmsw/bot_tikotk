import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, FONTS, SPRING } from '../lib/constants';

interface BulletPointProps {
  text:    string;
  delay:   number;   // frames avant l'animation
  index:   number;
}

/**
 * Bullet point avec rotation 3D rotateX(90° → 0°) et délai configurable.
 */
export const BulletPoint: React.FC<BulletPointProps> = ({ text, delay, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = Math.max(0, frame - delay);

  const flip = spring({ frame: localFrame, fps, config: SPRING.bullet3d });

  // rotateX 90° → 0° (arrive depuis l'arrière)
  const rotateX = interpolate(flip, [0, 1], [90, 0]);
  const opacity = interpolate(flip, [0, 0.15], [0, 1], { extrapolateRight: 'clamp' });

  // Slide depuis la droite légèrement
  const translateX = interpolate(flip, [0, 1], [40, 0]);

  // Couleur de la puce — alterne primary / blanc
  const dotColor = index % 2 === 0 ? COLORS.primary : COLORS.white;

  return (
    <div style={{
      transform:   `perspective(600px) rotateX(${rotateX}deg) translateX(${translateX}px)`,
      opacity,
      display:     'flex',
      alignItems:  'flex-start',
      gap:         28,
      marginBottom: 44,
    }}>

      {/* Puce */}
      <div style={{
        marginTop:   14,
        width:       14,
        height:      14,
        borderRadius: '50%',
        background:  dotColor,
        flexShrink:  0,
        boxShadow:   `0 0 12px ${dotColor}`,
      }} />

      {/* Texte */}
      <div style={{
        fontFamily:  FONTS.body,
        fontWeight:  600,
        fontSize:    52,
        lineHeight:  1.25,
        color:       COLORS.text,
      }}>
        {text}
      </div>

    </div>
  );
};
