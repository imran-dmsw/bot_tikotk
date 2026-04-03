import React from 'react';
import {
  AbsoluteFill,
  Audio,
  interpolate,
  spring,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

import { Background }  from '../components/Background';
import { CTA }         from '../components/CTA';
import { COLORS, FONTS, SPRING } from '../lib/constants';
import type { ScriptProps } from '../lib/types';

// ─── Bloc de texte affiché pendant la voix off ────────────────────────────────

interface TextBlockProps {
  text:  string;
  delay: number;
}

const TextBlock: React.FC<TextBlockProps> = ({ text, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = Math.max(0, frame - delay);
  const progress   = spring({ frame: localFrame, fps, config: SPRING.snappy });

  const translateY = interpolate(progress, [0, 1], [60, 0]);
  const opacity    = interpolate(progress, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' });

  // Card flip (léger) pour varier l'animation
  const cardFlip  = spring({ frame: localFrame, fps, config: SPRING.card });
  const rotateY   = interpolate(cardFlip, [0, 1], [8, 0]);

  return (
    <div style={{
      transform: `translateY(${translateY}px) perspective(800px) rotateY(${rotateY}deg)`,
      opacity,
      background:   COLORS.bgCard,
      border:       `1px solid rgba(26,130,212,0.25)`,
      borderLeft:   `4px solid ${COLORS.primary}`,
      borderRadius: '0 12px 12px 0',
      padding:      '28px 36px',
      marginBottom: 28,
    }}>
      <div style={{
        fontFamily: FONTS.body,
        fontWeight: 600,
        fontSize:   50,
        color:      COLORS.text,
        lineHeight: 1.35,
      }}>
        {text}
      </div>
    </div>
  );
};

// ─── Scène voix off ──────────────────────────────────────────────────────────

const VoiceScene: React.FC<{ hook: string; bullets: string[] }> = ({ hook, bullets }) => {
  const frame = useCurrentFrame();

  const BLOCK_DELAY = 18; // 0.6s entre chaque bloc

  // Onde sonore décorative
  const wavePhase = frame * 0.15;
  const bars = Array.from({ length: 20 }, (_, i) => {
    const h = 20 + Math.abs(Math.sin(wavePhase + i * 0.5)) * 50;
    return h;
  });

  return (
    <AbsoluteFill style={{ padding: '70px 60px' }}>

      {/* Titre / hook */}
      <div style={{
        fontFamily:   FONTS.title,
        fontWeight:   800,
        fontSize:     72,
        color:        COLORS.white,
        marginBottom: 16,
        lineHeight:   1.1,
        opacity:      interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp' }),
      }}>
        {hook}
      </div>

      {/* Onde sonore */}
      <div style={{
        display:      'flex',
        alignItems:   'center',
        gap:          6,
        marginBottom: 48,
        height:       60,
        opacity:      0.6,
      }}>
        {bars.map((h, i) => (
          <div key={i} style={{
            width:        8,
            height:       h,
            background:   COLORS.primary,
            borderRadius: 4,
            transition:   'height 0.05s',
          }} />
        ))}
        <span style={{
          fontFamily: FONTS.body,
          fontSize:   28,
          color:      COLORS.textMuted,
          marginLeft: 16,
        }}>
          🎙️ En cours...
        </span>
      </div>

      {/* Blocs de texte en cascade */}
      {bullets.map((text, i) => (
        <TextBlock key={i} text={text} delay={i * BLOCK_DELAY} />
      ))}

    </AbsoluteFill>
  );
};

// ─── Composition ─────────────────────────────────────────────────────────────

export const VoiceOver: React.FC<ScriptProps> = ({
  hook, bullets, cta, hashtags, duree_secondes, voiceoverSrc,
}) => {
  const { fps } = useVideoConfig();
  const totalFrames = duree_secondes * fps;
  const ctaStart    = totalFrames - 270;

  return (
    <AbsoluteFill>
      <Background />

      {voiceoverSrc
        ? <Audio src={staticFile(voiceoverSrc)} />
        : (
          // Placeholder silencieux si pas encore de voix off
          <div style={{
            position:   'absolute',
            bottom:     24,
            left:       '50%',
            transform:  'translateX(-50%)',
            background: 'rgba(255,80,80,0.15)',
            border:     '1px solid rgba(255,80,80,0.4)',
            borderRadius: 8,
            padding:    '8px 20px',
            color:      '#ff8888',
            fontFamily: FONTS.body,
            fontSize:   24,
          }}>
            ⚠️ Voix off non générée — lancer ElevenLabs (Bloc 3)
          </div>
        )
      }

      <Sequence from={0} durationInFrames={ctaStart}>
        <VoiceScene hook={hook} bullets={bullets} />
      </Sequence>

      <Sequence from={ctaStart} durationInFrames={totalFrames - ctaStart}>
        <CTA text={cta} hashtags={hashtags} />
      </Sequence>
    </AbsoluteFill>
  );
};
