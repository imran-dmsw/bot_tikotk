import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { COLORS, FONTS, SPRING } from '../lib/constants';

interface ProblemProps {
  text: string;
}

export const Problem: React.FC<ProblemProps> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Slide depuis la gauche ─────────────────────────────────────────────────
  const slideProgress = spring({ frame, fps, config: SPRING.snappy });
  const translateX    = interpolate(slideProgress, [0, 1], [-120, 0]);
  const opacity       = interpolate(slideProgress, [0, 0.2], [0, 1], { extrapolateRight: 'clamp' });

  // ── Barre d'alerte pulsante ────────────────────────────────────────────────
  const pulse      = (Math.sin(frame * 0.18) + 1) / 2;
  const barOpacity = interpolate(pulse, [0, 1], [0.7, 1]);

  // ── Icône tremblement (frames 0-15) ───────────────────────────────────────
  const shakeX = frame < 15
    ? interpolate(frame, [0, 3, 6, 10, 14, 15], [0, -8, 8, -5, 3, 0])
    : 0;

  return (
    <AbsoluteFill style={{
      justifyContent: 'center',
      alignItems:     'flex-start',
      padding:        '60px 70px',
    }}>

      {/* Fond teinté rouge très subtil */}
      <div style={{
        position:   'absolute',
        inset:      0,
        background: 'radial-gradient(ellipse at 20% 50%, rgba(220,50,50,0.06) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        transform: `translateX(${translateX}px)`,
        opacity,
        width:     '100%',
      }}>

        {/* Label "PROBLÈME" */}
        <div style={{
          display:       'inline-flex',
          alignItems:    'center',
          gap:           10,
          background:    'rgba(220,60,60,0.15)',
          border:        '1px solid rgba(220,60,60,0.4)',
          borderRadius:  6,
          padding:       '6px 18px',
          marginBottom:  32,
        }}>
          <span style={{
            transform:  `translateX(${shakeX}px)`,
            fontSize:   28,
          }}>⚠️</span>
          <span style={{
            fontFamily:    FONTS.body,
            fontWeight:    700,
            fontSize:      26,
            color:         '#ff7070',
            letterSpacing: '3px',
            textTransform: 'uppercase' as const,
          }}>
            Le problème
          </span>
        </div>

        {/* Barre accent rouge */}
        <div style={{
          width:        6,
          height:       '100%',
          position:     'absolute',
          left:         0,
          top:          0,
          background:   `rgba(220,60,60,${barOpacity})`,
          borderRadius: 3,
        }} />

        {/* Texte du problème */}
        <div style={{
          fontFamily:  FONTS.title,
          fontWeight:  800,
          fontSize:    68,
          color:       COLORS.white,
          lineHeight:  1.2,
          paddingLeft: 28,
          textShadow:  '0 2px 20px rgba(0,0,0,0.5)',
        }}>
          {text}
        </div>

        {/* Ligne décorative en bas */}
        <div style={{
          marginTop:    40,
          marginLeft:   28,
          width:        interpolate(frame, [8, 25], [0, 200], { extrapolateRight: 'clamp' }),
          height:       3,
          background:   'linear-gradient(90deg, rgba(220,60,60,0.8), transparent)',
          borderRadius: 2,
        }} />

      </div>
    </AbsoluteFill>
  );
};
