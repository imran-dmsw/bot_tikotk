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

import { Background }      from '../components/Background';
import { Hook }            from '../components/Hook';
import { Problem }         from '../components/Problem';
import { SolutionScene }   from '../components/SolutionScene';
import { BulletPoint }     from '../components/BulletPoint';
import { CTA }             from '../components/CTA';
import { COLORS, FONTS, SCENES } from '../lib/constants';
import type { ScriptProps }       from '../lib/types';

// ─── Scène 4 — DMSW (bullets "pourquoi nous") ────────────────────────────────

const DmswScene: React.FC<{ bullets: string[] }> = ({ bullets }) => {
  const frame = useCurrentFrame();

  // 2.5s entre chaque bullet (75 frames) → 3 bullets sur ~7.5s
  const BULLET_DELAY = 75;

  // Grille de fond
  const gridOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{
      justifyContent: 'center',
      padding:        '60px 70px',
    }}>

      {/* Grille perspective */}
      <div style={{
        position:   'absolute',
        inset:      0,
        background: `repeating-linear-gradient(
          0deg, transparent, transparent 119px, rgba(26,130,212,0.07) 120px
        ), repeating-linear-gradient(
          90deg, transparent, transparent 134px, rgba(26,130,212,0.07) 135px
        )`,
        opacity: gridOpacity,
      }} />

      <div style={{ position: 'relative', width: '100%' }}>

        {/* Label DMSW */}
        <div style={{
          display:      'inline-flex',
          alignItems:   'center',
          gap:          10,
          background:   'rgba(26,130,212,0.15)',
          border:       `1px solid rgba(26,130,212,0.4)`,
          borderRadius: 6,
          padding:      '6px 18px',
          marginBottom: 36,
          opacity:      interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp' }),
        }}>
          <span style={{ fontSize: 28 }}>🚀</span>
          <span style={{
            fontFamily:    FONTS.body,
            fontWeight:    700,
            fontSize:      26,
            color:         COLORS.primary,
            letterSpacing: '3px',
            textTransform: 'uppercase' as const,
          }}>
            DMSW — Agence Web
          </span>
        </div>

        {/* Bullets arguments DMSW */}
        {bullets.map((text, i) => (
          <BulletPoint
            key={i}
            text={text}
            delay={i * BULLET_DELAY}
            index={i}
          />
        ))}

      </div>
    </AbsoluteFill>
  );
};

// ─── Composition principale — 5 scènes ───────────────────────────────────────

export const TextAnimation: React.FC<ScriptProps> = ({
  hook,
  problem,
  solution,
  bullets,
  cta,
  hashtags,
  duree_secondes,
  voiceoverSrc,
}) => {
  const { fps } = useVideoConfig();
  const totalFrames = duree_secondes * fps;

  return (
    <AbsoluteFill>

      {/* Fond animé — persiste toute la vidéo */}
      <Background />

      {/* Voix off optionnelle */}
      {voiceoverSrc && (
        <Audio src={staticFile(voiceoverSrc)} />
      )}

      {/* ── Scène 1 — Hook (0 → 2.5s) ──────────────────────────────────── */}
      <Sequence
        from={SCENES.hookStart}
        durationInFrames={SCENES.hookEnd - SCENES.hookStart}
      >
        <Hook text={hook} />
      </Sequence>

      {/* ── Scène 2 — Problème (2.5s → 7.5s) ──────────────────────────── */}
      <Sequence
        from={SCENES.problemStart}
        durationInFrames={SCENES.problemEnd - SCENES.problemStart}
      >
        <Problem text={problem ?? 'Votre site web ne convertit pas.'} />
      </Sequence>

      {/* ── Scène 3 — Solution (7.5s → 12.5s) ─────────────────────────── */}
      <Sequence
        from={SCENES.solutionStart}
        durationInFrames={SCENES.solutionEnd - SCENES.solutionStart}
      >
        <SolutionScene text={solution ?? 'Un site pensé pour vendre, pas décorer.'} />
      </Sequence>

      {/* ── Scène 4 — DMSW (12.5s → 17.5s) ────────────────────────────── */}
      <Sequence
        from={SCENES.dmswStart}
        durationInFrames={SCENES.dmswEnd - SCENES.dmswStart}
      >
        <DmswScene bullets={bullets} />
      </Sequence>

      {/* ── Scène 5 — Contact / CTA (17.5s → 27s) ──────────────────────── */}
      <Sequence
        from={SCENES.ctaStart}
        durationInFrames={totalFrames - SCENES.ctaStart}
      >
        <CTA text={cta} hashtags={hashtags} />
      </Sequence>

    </AbsoluteFill>
  );
};
