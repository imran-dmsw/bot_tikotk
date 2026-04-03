import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, CONTACT, FONTS, SPRING } from '../lib/constants';

interface CTAProps {
  text:     string;
  hashtags: string[];
}

/** Vague SVG montante depuis le bas */
const Wave: React.FC<{ progress: number }> = ({ progress }) => {
  const y = interpolate(progress, [0, 1], [1920, 1600]);

  return (
    <svg
      viewBox="0 0 1080 320"
      style={{ position: 'absolute', bottom: 0, left: 0, width: 1080, overflow: 'visible' }}
    >
      <path
        d={`M0,${320 - (1920 - y) * 0.15}
           C270,${280 - (1920 - y) * 0.08} 540,${340 - (1920 - y) * 0.12} 810,${300 - (1920 - y) * 0.06}
           L810,320 L0,320 Z`}
        fill="rgba(26,130,212,0.12)"
      />
      <path
        d={`M0,${310 - (1920 - y) * 0.10}
           C200,${290 - (1920 - y) * 0.05} 600,${330 - (1920 - y) * 0.09} 1080,${295 - (1920 - y) * 0.04}
           L1080,320 L0,320 Z`}
        fill="rgba(26,130,212,0.08)"
      />
    </svg>
  );
};

export const CTA: React.FC<CTAProps> = ({ text, hashtags }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Logo DMSW : scale 0 → 1.2 → 1 ──────────────────────────────────────
  const logoProgress = spring({ frame, fps, config: SPRING.logo });
  const rawScale     = interpolate(logoProgress, [0, 0.7, 1], [0, 1.2, 1]);
  const logoOpacity  = interpolate(logoProgress, [0, 0.2], [0, 1], { extrapolateRight: 'clamp' });

  // ── Halo pulsant ──────────────────────────────────────────────────────────
  const haloPulse   = (Math.sin(frame * 0.14) + 1) / 2;   // 0..1
  const haloOpacity = interpolate(haloPulse, [0, 1], [0.12, 0.35]);
  const haloScale   = interpolate(haloPulse, [0, 1], [0.9, 1.1]);

  // ── Texte CTA : bounce depuis le haut ────────────────────────────────────
  const ctaProgress  = spring({ frame: Math.max(0, frame - 12), fps, config: SPRING.bouncy });
  const ctaY         = interpolate(ctaProgress, [0, 1], [-120, 0]);
  const ctaOpacity   = interpolate(ctaProgress, [0, 0.2], [0, 1], { extrapolateRight: 'clamp' });

  // ── Hashtags : apparition en cascade ─────────────────────────────────────
  const tagsOpacity = interpolate(frame, [20, 35], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // ── Vague ─────────────────────────────────────────────────────────────────
  const waveProgress = spring({ frame: Math.max(0, frame - 5), fps, config: { stiffness: 60, damping: 18 } });

  return (
    <AbsoluteFill style={{
      justifyContent: 'center',
      alignItems:     'center',
      flexDirection:  'column',
      gap:            0,
    }}>

      {/* Halo radial derrière le logo */}
      <div style={{
        position:     'absolute',
        width:        600,
        height:       600,
        borderRadius: '50%',
        background:   `radial-gradient(circle, rgba(26,130,212,${haloOpacity}) 0%, transparent 65%)`,
        transform:    `scale(${haloScale})`,
        pointerEvents: 'none',
      }} />

      {/* Anneau lumineux */}
      <div style={{
        position:     'absolute',
        width:        420,
        height:       420,
        borderRadius: '50%',
        border:       `2px solid rgba(26,130,212,${haloOpacity * 0.6})`,
        transform:    `scale(${haloScale * 1.05})`,
        pointerEvents: 'none',
      }} />

      {/* Logo DMSW */}
      <div style={{
        transform:    `scale(${rawScale})`,
        opacity:      logoOpacity,
        marginBottom: 32,
        textAlign:    'center',
      }}>
        <div style={{
          fontFamily:    FONTS.title,
          fontWeight:    800,
          fontSize:      130,
          color:         COLORS.primary,
          letterSpacing: '-3px',
          textShadow:    `0 0 60px rgba(26,130,212,0.5)`,
          lineHeight:    1,
        }}>
          DMSW
        </div>
        <div style={{
          fontFamily: FONTS.body,
          fontWeight: 400,
          fontSize:   30,
          color:      COLORS.textMuted,
          letterSpacing: '6px',
          marginTop:  8,
          textTransform: 'uppercase',
        }}>
          Agence Web
        </div>
      </div>

      {/* Séparateur */}
      <div style={{
        width:        120,
        height:       2,
        background:   COLORS.primary,
        marginBottom: 36,
        opacity:      logoOpacity,
      }} />

      {/* Texte CTA */}
      <div style={{
        transform:  `translateY(${ctaY}px)`,
        opacity:    ctaOpacity,
        textAlign:  'center',
        padding:    '0 60px',
      }}>
        <div style={{
          fontFamily:  FONTS.body,
          fontWeight:  700,
          fontSize:    60,
          color:       COLORS.white,
          lineHeight:  1.3,
        }}>
          {text}
        </div>
        <div style={{
          fontFamily:  FONTS.body,
          fontWeight:  700,
          fontSize:    64,
          marginTop:   8,
        }}>
          👇
        </div>
      </div>

      {/* Hashtags */}
      <div style={{
        display:        'flex',
        flexWrap:       'wrap',
        gap:            12,
        justifyContent: 'center',
        padding:        '32px 60px 0',
        opacity:        tagsOpacity,
      }}>
        {hashtags.slice(0, 5).map(tag => (
          <span key={tag} style={{
            background:   'rgba(26,130,212,0.15)',
            border:       '1px solid rgba(26,130,212,0.3)',
            borderRadius: 6,
            padding:      '6px 16px',
            fontFamily:   FONTS.body,
            fontSize:     28,
            color:        COLORS.primary,
          }}>
            {tag.startsWith('#') ? tag : `#${tag}`}
          </span>
        ))}
      </div>

      {/* ── Coordonnées DMSW ──────────────────────────────────────────────── */}
      <div style={{
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        gap:            10,
        marginTop:      36,
        opacity:        interpolate(frame, [40, 55], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
      }}>
        {/* Ligne séparatrice */}
        <div style={{
          width:      200,
          height:     1,
          background: 'rgba(26,130,212,0.4)',
          marginBottom: 6,
        }} />

        {/* Site web */}
        <div style={{
          display:    'flex',
          alignItems: 'center',
          gap:        12,
        }}>
          <span style={{ fontSize: 32 }}>🌐</span>
          <span style={{
            fontFamily:    FONTS.body,
            fontWeight:    700,
            fontSize:      38,
            color:         COLORS.white,
            letterSpacing: '1px',
          }}>
            {CONTACT.website}
          </span>
        </div>

        {/* Email */}
        <div style={{
          display:    'flex',
          alignItems: 'center',
          gap:        12,
        }}>
          <span style={{ fontSize: 28 }}>✉️</span>
          <span style={{
            fontFamily: FONTS.body,
            fontWeight: 400,
            fontSize:   32,
            color:      COLORS.textMuted,
          }}>
            {CONTACT.email}
          </span>
        </div>

        {/* Instagram */}
        <div style={{
          display:    'flex',
          alignItems: 'center',
          gap:        12,
        }}>
          <span style={{ fontSize: 28 }}>📸</span>
          <span style={{
            fontFamily: FONTS.body,
            fontWeight: 600,
            fontSize:   32,
            color:      COLORS.primary,
          }}>
            {CONTACT.instagram}
          </span>
        </div>

        {/* WhatsApp */}
        <div style={{
          display:    'flex',
          alignItems: 'center',
          gap:        12,
        }}>
          <span style={{ fontSize: 28 }}>💬</span>
          <span style={{
            fontFamily: FONTS.body,
            fontWeight: 400,
            fontSize:   32,
            color:      COLORS.textMuted,
          }}>
            {CONTACT.whatsapp}
          </span>
        </div>
      </div>

      {/* Vague SVG */}
      <Wave progress={waveProgress} />

    </AbsoluteFill>
  );
};
