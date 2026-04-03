import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { COLORS, VIDEO } from '../lib/constants';

const COLS = 8;
const ROWS = 14;
const CW   = VIDEO.width  / COLS;
const CH   = VIDEO.height / ROWS;

export const Background: React.FC = () => {
  const frame = useCurrentFrame();

  // Grille qui respire lentement
  const gridOpacity = interpolate(
    Math.sin(frame * 0.025),
    [-1, 1],
    [0.04, 0.13],
  );

  // Lueur centrale qui pulse
  const glowOpacity = interpolate(
    Math.sin(frame * 0.04),
    [-1, 1],
    [0.06, 0.18],
  );

  return (
    <AbsoluteFill style={{ background: COLORS.bg, overflow: 'hidden' }}>

      {/* Gradient radial central */}
      <div style={{
        position:        'absolute',
        inset:           0,
        background:      `radial-gradient(ellipse 70% 50% at 50% 60%,
                          rgba(26,130,212,${glowOpacity}) 0%,
                          transparent 70%)`,
      }} />

      {/* Grille en perspective */}
      <svg
        width={VIDEO.width}
        height={VIDEO.height}
        viewBox={`0 0 ${VIDEO.width} ${VIDEO.height}`}
        style={{ position: 'absolute', inset: 0, opacity: gridOpacity }}
      >
        {/* Lignes verticales */}
        {Array.from({ length: COLS + 1 }, (_, i) => (
          <line
            key={`v${i}`}
            x1={i * CW} y1={0}
            x2={i * CW} y2={VIDEO.height}
            stroke={COLORS.primary}
            strokeWidth={0.5}
          />
        ))}
        {/* Lignes horizontales */}
        {Array.from({ length: ROWS + 1 }, (_, i) => (
          <line
            key={`h${i}`}
            x1={0}          y1={i * CH}
            x2={VIDEO.width} y2={i * CH}
            stroke={COLORS.primary}
            strokeWidth={0.5}
          />
        ))}
      </svg>

      {/* Bande de couleur en bas */}
      <div style={{
        position:   'absolute',
        bottom:     0,
        left:       0,
        right:      0,
        height:     4,
        background: COLORS.primary,
      }} />

    </AbsoluteFill>
  );
};
