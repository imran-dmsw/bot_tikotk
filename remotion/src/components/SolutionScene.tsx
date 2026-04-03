import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { COLORS, FONTS, SPRING } from '../lib/constants';

interface SolutionSceneProps {
  text: string;
}

export const SolutionScene: React.FC<SolutionSceneProps> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Montée depuis le bas ───────────────────────────────────────────────────
  const riseProgress = spring({ frame, fps, config: SPRING.bouncy });
  const translateY   = interpolate(riseProgress, [0, 1], [100, 0]);
  const opacity      = interpolate(riseProgress, [0, 0.25], [0, 1], { extrapolateRight: 'clamp' });

  // ── Cercle lumineux animé ──────────────────────────────────────────────────
  const pulse      = (Math.sin(frame * 0.12) + 1) / 2;
  const haloScale  = interpolate(pulse, [0, 1], [0.95, 1.05]);
  const haloOpacity = interpolate(pulse, [0, 1], [0.15, 0.3]);

  // ── Checkmark apparaît légèrement après ───────────────────────────────────
  const checkProgress = spring({ frame: Math.max(0, frame - 6), fps, config: SPRING.snappy });
  const checkScale    = interpolate(checkProgress, [0, 0.7, 1], [0, 1.3, 1]);

  return (
    <AbsoluteFill style={{
      justifyContent: 'center',
      alignItems:     'flex-start',
      padding:        '60px 70px',
    }}>

      {/* Fond teinté bleu/vert subtil */}
      <div style={{
        position:   'absolute',
        inset:      0,
        background: 'radial-gradient(ellipse at 80% 50%, rgba(26,200,120,0.07) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      {/* Halo circulaire derrière l'icône */}
      <div style={{
        position:     'absolute',
        top:          '50%',
        left:         70,
        width:        180,
        height:       180,
        marginTop:    -90,
        borderRadius: '50%',
        background:   `radial-gradient(circle, rgba(26,212,130,${haloOpacity}) 0%, transparent 70%)`,
        transform:    `scale(${haloScale})`,
        pointerEvents: 'none',
      }} />

      <div style={{
        transform: `translateY(${translateY}px)`,
        opacity,
        width:     '100%',
      }}>

        {/* Label "LA SOLUTION" */}
        <div style={{
          display:       'inline-flex',
          alignItems:    'center',
          gap:           10,
          background:    'rgba(26,200,120,0.12)',
          border:        '1px solid rgba(26,200,120,0.35)',
          borderRadius:  6,
          padding:       '6px 18px',
          marginBottom:  32,
        }}>
          <span style={{
            display:   'inline-block',
            transform: `scale(${checkScale})`,
            fontSize:  28,
          }}>✅</span>
          <span style={{
            fontFamily:    FONTS.body,
            fontWeight:    700,
            fontSize:      26,
            color:         '#50e0a0',
            letterSpacing: '3px',
            textTransform: 'uppercase' as const,
          }}>
            La solution
          </span>
        </div>

        {/* Barre accent verte */}
        <div style={{
          width:        6,
          height:       '100%',
          position:     'absolute',
          left:         0,
          top:          0,
          background:   COLORS.primary,
          borderRadius: 3,
        }} />

        {/* Texte de la solution */}
        <div style={{
          fontFamily:  FONTS.title,
          fontWeight:  800,
          fontSize:    68,
          color:       COLORS.white,
          lineHeight:  1.2,
          paddingLeft: 28,
          textShadow:  `0 2px 30px rgba(26,130,212,0.3)`,
        }}>
          {text}
        </div>

        {/* Ligne décorative bleue */}
        <div style={{
          marginTop:    40,
          marginLeft:   28,
          width:        interpolate(frame, [8, 25], [0, 240], { extrapolateRight: 'clamp' }),
          height:       3,
          background:   `linear-gradient(90deg, ${COLORS.primary}, transparent)`,
          borderRadius: 2,
        }} />

      </div>
    </AbsoluteFill>
  );
};
