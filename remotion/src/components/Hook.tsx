import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { GlitchText } from './GlitchText';
import { COLORS, FONTS, SPRING } from '../lib/constants';

interface HookProps {
  text: string;
}

export const Hook: React.FC<HookProps> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Crash depuis le haut ──────────────────────────────────────────────────
  const crashProgress = spring({ frame, fps, config: SPRING.snappy });
  const translateY    = interpolate(crashProgress, [0, 1], [-300, 0]);

  // ── Camera shake (frames 0-20) ────────────────────────────────────────────
  const shakeX = frame < 20
    ? interpolate(frame, [0, 3, 7, 12, 17, 20], [0, -12, 10, -6, 4, 0])
    : 0;
  const shakeY = frame < 20
    ? interpolate(frame, [0, 4, 8, 14, 20], [0, 8, -5, 3, 0])
    : 0;

  // ── Flash blanc frame 0 ───────────────────────────────────────────────────
  const flashOpacity = interpolate(
    frame,
    [0, 1, 10],
    [1, 0.6, 0],
    { extrapolateRight: 'clamp' },
  );

  // ── Highlight de couleur derrière le texte ────────────────────────────────
  const highlightW = interpolate(
    spring({ frame: frame - 5, fps, config: SPRING.snappy }),
    [0, 1],
    [0, 100],
  );

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: '0 60px' }}>

      {/* Flash blanc */}
      {frame < 10 && (
        <AbsoluteFill style={{
          background:    COLORS.white,
          opacity:       flashOpacity,
          pointerEvents: 'none',
        }} />
      )}

      {/* Conteneur avec camera shake */}
      <div style={{ transform: `translate(${shakeX}px, ${shakeY}px)`, width: '100%' }}>

        {/* Barre de couleur d'accroche */}
        <div style={{
          height:       6,
          width:        `${highlightW}%`,
          background:   COLORS.primary,
          marginBottom: 24,
          borderRadius: 3,
        }} />

        {/* Texte accroche avec effet glitch */}
        <div style={{ transform: `translateY(${translateY}px)` }}>
          <GlitchText frame={frame}>
            <div style={{
              fontFamily: FONTS.title,
              fontWeight: 800,
              fontSize:   108,
              lineHeight: 1.05,
              color:      COLORS.white,
              textShadow: `0 0 40px rgba(26,130,212,0.4)`,
              letterSpacing: '-2px',
            }}>
              {text}
            </div>
          </GlitchText>
        </div>

        {/* Label de catégorie */}
        <div style={{
          marginTop:    20,
          display:      'inline-block',
          background:   COLORS.primary,
          color:        COLORS.white,
          fontFamily:   FONTS.body,
          fontWeight:   700,
          fontSize:     32,
          padding:      '8px 20px',
          borderRadius: 4,
          opacity:      interpolate(frame, [10, 25], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
        }}>
          DMSW
        </div>

      </div>
    </AbsoluteFill>
  );
};
