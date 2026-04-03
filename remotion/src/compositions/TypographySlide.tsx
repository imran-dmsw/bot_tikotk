/**
 * TypographySlide — Template 2 DMSW
 *
 * Style : fond noir pur, texte typewriter, accents colorés par scène,
 *         icônes XXL centrées, progress dots en bas.
 *
 * Différences vs TextAnimation :
 *  - Fond #000 (vs navy #0d1b2a)
 *  - Layout centré (vs aligné à gauche)
 *  - Effet typewriter caractère par caractère
 *  - Couleur d'accent différente par scène
 *  - Icône emoji XXL en tête de scène
 *  - Barre de progression des scènes en bas
 */

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

import { CONTACT, COLORS, FONTS, SCENES } from '../lib/constants';
import type { ScriptProps } from '../lib/types';

// ─── Constantes visuelles du template ────────────────────────────────────────

const BG      = '#000000';
const ACCENT  = {
  hook:     '#1a82d4',   // bleu DMSW
  problem:  '#ef4444',   // rouge
  solution: '#10b981',   // vert émeraude
  dmsw:     '#1a82d4',   // bleu DMSW
  cta:      '#ffffff',   // blanc
} as const;

// ─── Utilitaire typewriter ────────────────────────────────────────────────────

function useTypewriter(text: string, startFrame: number, fps: number): string {
  const frame = useCurrentFrame();
  const elapsed = Math.max(0, frame - startFrame);
  // 1 caractère toutes les 1.5 frames → texte ~50 chars en ~2.5s
  const chars = Math.floor(interpolate(elapsed, [0, text.length * 1.5], [0, text.length], {
    extrapolateRight: 'clamp',
  }));
  return text.slice(0, chars);
}

// ─── Barre de progression (5 points) ─────────────────────────────────────────

const ProgressDots: React.FC<{ current: number }> = ({ current }) => {
  const frame  = useCurrentFrame();
  const scenes = [0, 1, 2, 3, 4];
  const accentList = [ACCENT.hook, ACCENT.problem, ACCENT.solution, ACCENT.dmsw, ACCENT.cta];

  return (
    <div style={{
      position:       'absolute',
      bottom:         70,
      left:           0,
      right:          0,
      display:        'flex',
      justifyContent: 'center',
      gap:            20,
    }}>
      {scenes.map(i => {
        const active  = i === current;
        const done    = i < current;
        const opacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: 'clamp' });
        return (
          <div key={i} style={{
            width:        active ? 48 : 14,
            height:       14,
            borderRadius: 7,
            background:   active ? accentList[i] : done ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)',
            transition:   'all 0.3s',
            opacity,
          }} />
        );
      })}
    </div>
  );
};

// ─── Scène 1 — Hook ───────────────────────────────────────────────────────────

const SceneHook: React.FC<{ hook: string }> = ({ hook }) => {
  const frame     = useCurrentFrame();
  const { fps }   = useVideoConfig();
  const displayed = useTypewriter(hook, 8, fps);

  // Flash blanc frame 0
  const flashOpacity = interpolate(frame, [0, 1, 8], [0.8, 0.4, 0], { extrapolateRight: 'clamp' });

  // Texte slide depuis le bas
  const slideUp = spring({ frame: Math.max(0, frame - 5), fps, config: { stiffness: 200, damping: 18 } });
  const translateY = interpolate(slideUp, [0, 1], [60, 0]);
  const opacity    = interpolate(slideUp, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' });

  // Barre accent animée
  const barW = interpolate(frame, [5, 22], [0, 100], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: BG, justifyContent: 'center', alignItems: 'center' }}>

      {/* Flash blanc */}
      {frame < 8 && (
        <AbsoluteFill style={{ background: '#ffffff', opacity: flashOpacity, pointerEvents: 'none' }} />
      )}

      <div style={{ textAlign: 'center', padding: '0 80px' }}>

        {/* Label scène */}
        <div style={{
          fontFamily:    FONTS.body,
          fontWeight:    700,
          fontSize:      28,
          color:         ACCENT.hook,
          letterSpacing: '5px',
          textTransform: 'uppercase' as const,
          marginBottom:  36,
          opacity:       interpolate(frame, [3, 15], [0, 1], { extrapolateRight: 'clamp' }),
        }}>
          ● ACCROCHE
        </div>

        {/* Texte principal */}
        <div style={{
          transform:  `translateY(${translateY}px)`,
          opacity,
        }}>
          <div style={{
            fontFamily:    FONTS.title,
            fontWeight:    800,
            fontSize:      108,
            color:         '#ffffff',
            lineHeight:    1.05,
            letterSpacing: '-3px',
            textShadow:    `0 0 60px rgba(26,130,212,0.4)`,
          }}>
            {displayed}
            {/* Curseur clignotant */}
            <span style={{
              display:    'inline-block',
              width:      6,
              height:     90,
              background: ACCENT.hook,
              marginLeft: 8,
              verticalAlign: 'middle',
              opacity:    Math.floor(frame / 8) % 2 === 0 ? 1 : 0,
            }} />
          </div>
        </div>

        {/* Barre accent */}
        <div style={{
          marginTop:    48,
          height:       4,
          width:        `${barW}%`,
          background:   ACCENT.hook,
          borderRadius: 2,
          margin:       '48px auto 0',
        }} />

      </div>

      <ProgressDots current={0} />
    </AbsoluteFill>
  );
};

// ─── Scène 2 — Problème ───────────────────────────────────────────────────────

const SceneProblem: React.FC<{ problem: string }> = ({ problem }) => {
  const frame     = useCurrentFrame();
  const { fps }   = useVideoConfig();
  const displayed = useTypewriter(problem, 12, fps);

  const fadeIn = spring({ frame, fps, config: { stiffness: 150, damping: 20 } });
  const opacity = interpolate(fadeIn, [0, 1], [0, 1], { extrapolateRight: 'clamp' });

  // Shake icône
  const shakeX = frame < 12 ? interpolate(frame, [0, 3, 6, 9, 12], [0, -10, 10, -6, 0]) : 0;

  return (
    <AbsoluteFill style={{ background: BG, justifyContent: 'center', alignItems: 'center' }}>

      {/* Halo rouge derrière */}
      <div style={{
        position:     'absolute',
        width:        700,
        height:       700,
        borderRadius: '50%',
        background:   `radial-gradient(circle, rgba(239,68,68,0.12) 0%, transparent 65%)`,
        top:          '50%',
        left:         '50%',
        transform:    'translate(-50%, -50%)',
        pointerEvents: 'none',
      }} />

      <div style={{ textAlign: 'center', padding: '0 80px', opacity }}>

        {/* Icône */}
        <div style={{
          fontSize:    120,
          marginBottom: 24,
          transform:   `translateX(${shakeX}px)`,
          filter:      'drop-shadow(0 0 20px rgba(239,68,68,0.5))',
        }}>
          ⚠️
        </div>

        {/* Label */}
        <div style={{
          fontFamily:    FONTS.body,
          fontWeight:    700,
          fontSize:      28,
          color:         ACCENT.problem,
          letterSpacing: '5px',
          textTransform: 'uppercase' as const,
          marginBottom:  36,
        }}>
          LE PROBLÈME
        </div>

        {/* Texte typewriter */}
        <div style={{
          fontFamily:  FONTS.title,
          fontWeight:  700,
          fontSize:    72,
          color:       '#ffffff',
          lineHeight:  1.25,
          letterSpacing: '-1px',
        }}>
          {displayed}
          <span style={{
            display:    'inline-block',
            width:      5,
            height:     58,
            background: ACCENT.problem,
            marginLeft: 6,
            verticalAlign: 'middle',
            opacity:    Math.floor(frame / 8) % 2 === 0 ? 1 : 0,
          }} />
        </div>

        {/* Underline animé */}
        <div style={{
          marginTop:    40,
          height:       3,
          width:        interpolate(frame, [10, 30], [0, 200], { extrapolateRight: 'clamp' }),
          background:   ACCENT.problem,
          borderRadius: 2,
          margin:       '40px auto 0',
        }} />

      </div>

      <ProgressDots current={1} />
    </AbsoluteFill>
  );
};

// ─── Scène 3 — Solution ───────────────────────────────────────────────────────

const SceneSolution: React.FC<{ solution: string }> = ({ solution }) => {
  const frame     = useCurrentFrame();
  const { fps }   = useVideoConfig();
  const displayed = useTypewriter(solution, 12, fps);

  const riseProgress = spring({ frame, fps, config: { stiffness: 120, damping: 16 } });
  const translateY   = interpolate(riseProgress, [0, 1], [80, 0]);
  const opacity      = interpolate(riseProgress, [0, 0.25], [0, 1], { extrapolateRight: 'clamp' });

  const checkScale = spring({ frame: Math.max(0, frame - 4), fps, config: { stiffness: 300, damping: 14 } });
  const cScale     = interpolate(checkScale, [0, 0.7, 1], [0, 1.4, 1]);

  return (
    <AbsoluteFill style={{ background: BG, justifyContent: 'center', alignItems: 'center' }}>

      {/* Halo vert */}
      <div style={{
        position:     'absolute',
        width:        700,
        height:       700,
        borderRadius: '50%',
        background:   `radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 65%)`,
        top:          '50%',
        left:         '50%',
        transform:    'translate(-50%, -50%)',
        pointerEvents: 'none',
      }} />

      <div style={{ textAlign: 'center', padding: '0 80px', transform: `translateY(${translateY}px)`, opacity }}>

        {/* Icône */}
        <div style={{
          fontSize:     120,
          marginBottom: 24,
          display:      'inline-block',
          transform:    `scale(${cScale})`,
          filter:       'drop-shadow(0 0 20px rgba(16,185,129,0.5))',
        }}>
          ✅
        </div>

        {/* Label */}
        <div style={{
          fontFamily:    FONTS.body,
          fontWeight:    700,
          fontSize:      28,
          color:         ACCENT.solution,
          letterSpacing: '5px',
          textTransform: 'uppercase' as const,
          marginBottom:  36,
        }}>
          LA SOLUTION
        </div>

        {/* Texte typewriter */}
        <div style={{
          fontFamily:    FONTS.title,
          fontWeight:    700,
          fontSize:      72,
          color:         '#ffffff',
          lineHeight:    1.25,
          letterSpacing: '-1px',
        }}>
          {displayed}
          <span style={{
            display:    'inline-block',
            width:      5,
            height:     58,
            background: ACCENT.solution,
            marginLeft: 6,
            verticalAlign: 'middle',
            opacity:    Math.floor(frame / 8) % 2 === 0 ? 1 : 0,
          }} />
        </div>

        {/* Underline */}
        <div style={{
          height:       3,
          width:        interpolate(frame, [10, 30], [0, 220], { extrapolateRight: 'clamp' }),
          background:   ACCENT.solution,
          borderRadius: 2,
          margin:       '40px auto 0',
        }} />

      </div>

      <ProgressDots current={2} />
    </AbsoluteFill>
  );
};

// ─── Scène 4 — DMSW (bullets) ────────────────────────────────────────────────

const SceneDmsw: React.FC<{ bullets: string[] }> = ({ bullets }) => {
  const frame   = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn  = spring({ frame, fps, config: { stiffness: 150, damping: 18 } });
  const opacity = interpolate(fadeIn, [0, 1], [0, 1], { extrapolateRight: 'clamp' });

  // Chaque bullet apparaît avec 45f de délai (1.5s)
  const BULLET_DELAY = 45;

  return (
    <AbsoluteFill style={{ background: BG, justifyContent: 'center', alignItems: 'center' }}>

      {/* Halo bleu central */}
      <div style={{
        position:     'absolute',
        width:        800,
        height:       800,
        borderRadius: '50%',
        background:   `radial-gradient(circle, rgba(26,130,212,0.1) 0%, transparent 65%)`,
        top:          '50%',
        left:         '50%',
        transform:    'translate(-50%, -50%)',
        pointerEvents: 'none',
      }} />

      <div style={{ textAlign: 'center', padding: '0 80px', opacity, width: '100%' }}>

        {/* Logo DMSW */}
        <div style={{
          fontFamily:    FONTS.title,
          fontWeight:    800,
          fontSize:      100,
          color:         ACCENT.dmsw,
          letterSpacing: '-2px',
          textShadow:    `0 0 50px rgba(26,130,212,0.5)`,
          marginBottom:  8,
        }}>
          DMSW
        </div>

        <div style={{
          fontFamily:    FONTS.body,
          fontSize:      28,
          color:         'rgba(255,255,255,0.5)',
          letterSpacing: '5px',
          textTransform: 'uppercase' as const,
          marginBottom:  56,
        }}>
          Agence Web
        </div>

        {/* Bullets */}
        {bullets.map((text, i) => {
          const bulletProgress = spring({
            frame: Math.max(0, frame - i * BULLET_DELAY),
            fps,
            config: { stiffness: 180, damping: 18 },
          });
          const bY = interpolate(bulletProgress, [0, 1], [40, 0]);
          const bO = interpolate(bulletProgress, [0, 0.2], [0, 1], { extrapolateRight: 'clamp' });

          return (
            <div key={i} style={{
              display:      'flex',
              alignItems:   'center',
              gap:          20,
              marginBottom: 28,
              transform:    `translateY(${bY}px)`,
              opacity:      bO,
            }}>
              {/* Checkmark */}
              <div style={{
                flexShrink:   0,
                width:        48,
                height:       48,
                borderRadius: '50%',
                background:   ACCENT.dmsw,
                display:      'flex',
                alignItems:   'center',
                justifyContent: 'center',
                fontSize:     26,
              }}>
                ✓
              </div>
              <div style={{
                fontFamily:  FONTS.body,
                fontWeight:  600,
                fontSize:    52,
                color:       '#ffffff',
                textAlign:   'left',
                lineHeight:  1.2,
              }}>
                {text}
              </div>
            </div>
          );
        })}

      </div>

      <ProgressDots current={3} />
    </AbsoluteFill>
  );
};

// ─── Scène 5 — Contact / CTA ──────────────────────────────────────────────────

const SceneCTA: React.FC<{ cta: string; hashtags: string[] }> = ({ cta, hashtags }) => {
  const frame   = useCurrentFrame();
  const { fps } = useVideoConfig();

  const popIn     = spring({ frame, fps, config: { stiffness: 200, damping: 15 } });
  const logoScale = interpolate(popIn, [0, 0.7, 1], [0, 1.15, 1]);
  const logoOp    = interpolate(popIn, [0, 0.2], [0, 1], { extrapolateRight: 'clamp' });

  const detailsOp = interpolate(frame, [18, 30], [0, 1], { extrapolateRight: 'clamp' });
  const hashOp    = interpolate(frame, [28, 42], [0, 1], { extrapolateRight: 'clamp' });

  // Pulsation de l'anneau
  const pulse      = (Math.sin(frame * 0.12) + 1) / 2;
  const ringScale  = interpolate(pulse, [0, 1], [0.95, 1.05]);
  const ringOpacity = interpolate(pulse, [0, 1], [0.2, 0.5]);

  return (
    <AbsoluteFill style={{
      background:     BG,
      justifyContent: 'center',
      alignItems:     'center',
      flexDirection:  'column',
      gap:            0,
    }}>

      {/* Anneau lumineux pulsant */}
      <div style={{
        position:     'absolute',
        width:        520,
        height:       520,
        borderRadius: '50%',
        border:       `2px solid rgba(26,130,212,${ringOpacity})`,
        transform:    `scale(${ringScale})`,
        pointerEvents: 'none',
      }} />

      {/* CTA texte */}
      <div style={{
        fontFamily:    FONTS.body,
        fontWeight:    700,
        fontSize:      52,
        color:         '#ffffff',
        textAlign:     'center',
        padding:       '0 80px',
        marginBottom:  40,
        opacity:       interpolate(frame, [6, 18], [0, 1], { extrapolateRight: 'clamp' }),
        lineHeight:    1.3,
      }}>
        {cta}
      </div>

      {/* Logo DMSW */}
      <div style={{
        transform:    `scale(${logoScale})`,
        opacity:      logoOp,
        textAlign:    'center',
        marginBottom: 36,
      }}>
        <div style={{
          fontFamily:    FONTS.title,
          fontWeight:    800,
          fontSize:      140,
          color:         ACCENT.dmsw,
          letterSpacing: '-4px',
          lineHeight:    1,
          textShadow:    `0 0 80px rgba(26,130,212,0.6)`,
        }}>
          DMSW
        </div>
      </div>

      {/* Coordonnées */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, opacity: detailsOp }}>

        {/* Séparateur */}
        <div style={{
          width:        interpolate(frame, [18, 35], [0, 160], { extrapolateRight: 'clamp' }),
          height:       2,
          background:   'rgba(255,255,255,0.25)',
          marginBottom: 8,
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 34 }}>🌐</span>
          <span style={{ fontFamily: FONTS.body, fontWeight: 700, fontSize: 40, color: '#ffffff' }}>
            {CONTACT.website}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 30 }}>📸</span>
          <span style={{ fontFamily: FONTS.body, fontWeight: 600, fontSize: 36, color: ACCENT.dmsw }}>
            {CONTACT.instagram}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 30 }}>💬</span>
          <span style={{ fontFamily: FONTS.body, fontWeight: 400, fontSize: 34, color: 'rgba(255,255,255,0.6)' }}>
            {CONTACT.whatsapp}
          </span>
        </div>

      </div>

      {/* Hashtags */}
      <div style={{
        display:        'flex',
        flexWrap:       'wrap',
        gap:            10,
        justifyContent: 'center',
        padding:        '28px 60px 0',
        opacity:        hashOp,
      }}>
        {hashtags.slice(0, 5).map(tag => (
          <span key={tag} style={{
            background:   'rgba(26,130,212,0.15)',
            border:       '1px solid rgba(26,130,212,0.35)',
            borderRadius: 6,
            padding:      '5px 14px',
            fontFamily:   FONTS.body,
            fontSize:     26,
            color:        ACCENT.dmsw,
          }}>
            {tag.startsWith('#') ? tag : `#${tag}`}
          </span>
        ))}
      </div>

      <ProgressDots current={4} />
    </AbsoluteFill>
  );
};

// ─── Composition principale ───────────────────────────────────────────────────

export const TypographySlide: React.FC<ScriptProps> = ({
  hook,
  problem,
  solution,
  bullets,
  cta,
  hashtags,
  duree_secondes,
  voiceoverSrc,
}) => {
  const { fps }   = useVideoConfig();
  const totalFrames = duree_secondes * fps;

  return (
    <AbsoluteFill style={{ background: BG }}>

      {/* Voix off optionnelle */}
      {voiceoverSrc && <Audio src={staticFile(voiceoverSrc)} />}

      {/* ── Scène 1 — Hook ──────────────────────────────────────────────── */}
      <Sequence
        from={SCENES.hookStart}
        durationInFrames={SCENES.hookEnd - SCENES.hookStart}
      >
        <SceneHook hook={hook} />
      </Sequence>

      {/* ── Scène 2 — Problème ──────────────────────────────────────────── */}
      <Sequence
        from={SCENES.problemStart}
        durationInFrames={SCENES.problemEnd - SCENES.problemStart}
      >
        <SceneProblem problem={problem ?? 'Votre site web ne convertit pas.'} />
      </Sequence>

      {/* ── Scène 3 — Solution ──────────────────────────────────────────── */}
      <Sequence
        from={SCENES.solutionStart}
        durationInFrames={SCENES.solutionEnd - SCENES.solutionStart}
      >
        <SceneSolution solution={solution ?? 'Un site orienté conversion change tout.'} />
      </Sequence>

      {/* ── Scène 4 — DMSW ──────────────────────────────────────────────── */}
      <Sequence
        from={SCENES.dmswStart}
        durationInFrames={SCENES.dmswEnd - SCENES.dmswStart}
      >
        <SceneDmsw bullets={bullets} />
      </Sequence>

      {/* ── Scène 5 — Contact / CTA ─────────────────────────────────────── */}
      <Sequence
        from={SCENES.ctaStart}
        durationInFrames={totalFrames - SCENES.ctaStart}
      >
        <SceneCTA cta={cta} hashtags={hashtags} />
      </Sequence>

    </AbsoluteFill>
  );
};
