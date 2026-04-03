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
import { COLORS, FONTS, SCENES, SPRING } from '../lib/constants';
import type { ScriptProps } from '../lib/types';

// ─── Faux écran d'ordinateur animé ───────────────────────────────────────────

const FakeScreen: React.FC<{ lines: string[]; frame: number }> = ({ lines, frame }) => {
  const CHAR_DELAY = 1.5; // frames par caractère (effet machine à écrire)

  return (
    <div style={{
      background:   COLORS.bgDeep,
      border:       `2px solid rgba(26,130,212,0.4)`,
      borderRadius: 16,
      padding:      '40px 48px',
      fontFamily:   '"Courier New", monospace',
      fontSize:     34,
      color:        COLORS.text,
      lineHeight:   1.7,
      minHeight:    500,
      width:        '100%',
      boxShadow:    `0 0 60px rgba(26,130,212,0.15), inset 0 0 40px rgba(0,0,0,0.3)`,
      overflow:     'hidden',
    }}>
      {/* Barre de titre du terminal */}
      <div style={{
        display:      'flex',
        gap:          10,
        marginBottom: 32,
        paddingBottom: 20,
        borderBottom: '1px solid rgba(26,130,212,0.2)',
      }}>
        {['#e55', '#ea5', '#5a5'].map((c, i) => (
          <div key={i} style={{ width: 16, height: 16, borderRadius: '50%', background: c }} />
        ))}
        <span style={{ color: COLORS.textMuted, fontSize: 26, marginLeft: 12 }}>
          dmsw.fr — analyse
        </span>
      </div>

      {/* Lignes avec effet machine à écrire */}
      {lines.map((line, li) => {
        const lineStartFrame = li * 45;
        const charsVisible   = Math.floor(Math.max(0, frame - lineStartFrame) / CHAR_DELAY);
        const visible        = charsVisible > 0;

        return visible ? (
          <div key={li} style={{ marginBottom: 10 }}>
            <span style={{ color: COLORS.primary }}>{'> '}</span>
            {line.slice(0, charsVisible)}
            {charsVisible < line.length && (
              <span style={{
                display:    'inline-block',
                width:      12,
                background: COLORS.primary,
                animation:  'none',
                opacity:    Math.floor(frame / 8) % 2 === 0 ? 1 : 0,
              }}>_</span>
            )}
          </div>
        ) : null;
      })}
    </div>
  );
};

// ─── Scène principale screen recording ───────────────────────────────────────

const ScreenScene: React.FC<{ hook: string; bullets: string[]; visuels: string }> = ({
  hook, bullets, visuels,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Slide depuis la droite
  const slideIn = spring({ frame, fps, config: SPRING.snappy });
  const tx      = interpolate(slideIn, [0, 1], [200, 0]);
  const opacity = interpolate(slideIn, [0, 0.2], [0, 1], { extrapolateRight: 'clamp' });

  // Lignes à afficher dans le terminal
  const screenLines = [
    `Analyse : ${hook}`,
    ...bullets,
    '',
    visuels.slice(0, 60),
  ].filter(Boolean);

  return (
    <AbsoluteFill style={{ padding: '80px 60px', justifyContent: 'center' }}>

      {/* Titre au-dessus */}
      <div style={{
        fontFamily:   FONTS.title,
        fontWeight:   800,
        fontSize:     62,
        color:        COLORS.white,
        marginBottom: 32,
        lineHeight:   1.1,
        opacity:      interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' }),
      }}>
        {hook}
      </div>

      {/* Écran animé */}
      <div style={{
        transform: `translateX(${tx}px)`,
        opacity,
      }}>
        <FakeScreen lines={screenLines} frame={frame} />
      </div>

      {/* Badge "EN DIRECT" */}
      <div style={{
        marginTop:    28,
        display:      'flex',
        alignItems:   'center',
        gap:          12,
        opacity:      interpolate(frame, [20, 35], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
      }}>
        <div style={{
          width:        14,
          height:       14,
          borderRadius: '50%',
          background:   '#e55',
          boxShadow:    '0 0 10px #e55',
        }} />
        <span style={{
          fontFamily: FONTS.body,
          fontWeight: 700,
          fontSize:   30,
          color:      COLORS.textMuted,
          letterSpacing: '3px',
          textTransform: 'uppercase',
        }}>
          Démonstration réelle
        </span>
      </div>

    </AbsoluteFill>
  );
};

// ─── Composition ─────────────────────────────────────────────────────────────

export const ScreenRecording: React.FC<ScriptProps> = ({
  hook, bullets, visuels, cta, hashtags, duree_secondes, voiceoverSrc,
}) => {
  const { fps } = useVideoConfig();
  const totalFrames = duree_secondes * fps;
  const ctaStart    = totalFrames - 270; // 9s pour CTA

  return (
    <AbsoluteFill>
      <Background />

      {voiceoverSrc && <Audio src={staticFile(voiceoverSrc)} />}

      <Sequence from={0} durationInFrames={ctaStart}>
        <ScreenScene hook={hook} bullets={bullets} visuels={visuels} />
      </Sequence>

      <Sequence from={ctaStart} durationInFrames={totalFrames - ctaStart}>
        <CTA text={cta} hashtags={hashtags} />
      </Sequence>
    </AbsoluteFill>
  );
};
