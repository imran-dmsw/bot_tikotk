import React, {useEffect, useState} from 'react';
import {Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {interpolate, spring, useVideoConfig} from 'remotion';

export interface TextAnimationProps extends Record<string, unknown> {
  hook: string;
  revelation: string;
  cta: string;
  showLogo?: boolean;
}

const OptionalAudio: React.FC = () => {
  const [exists, setExists] = useState(false);
  useEffect(() => {
    let mounted = true;
    fetch(staticFile('voiceover.mp3'), {method: 'HEAD'})
      .then((response) => mounted && setExists(response.ok))
      .catch(() => mounted && setExists(false));
    return () => {
      mounted = false;
    };
  }, []);
  if (!exists) return null;
  return <Audio src={staticFile('voiceover.mp3')} />;
};

// BEAT 1 — HOOK (0–90 frames ~ 3s)
const BeatHook: React.FC<{text: string}> = ({text}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = spring({fps, frame, config: {stiffness: 180, damping: 16}});
  const scale = interpolate(pop, [0, 1], [0.88, 1.06]);
  const flash = interpolate(frame, [0, 4], [1, 0], {extrapolateRight: 'clamp'});
  const shake = frame < 30 ? Math.sin(frame * 10) * 8 : 0;
  const rotate = frame < 30 ? Math.sin(frame * 0.5) * 1.2 : 0;
  return (
    <div style={{position: 'absolute', inset: 0, backgroundColor: '#0d1b2a', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{position: 'absolute', inset: 0, background: '#ffffff', opacity: flash, pointerEvents: 'none'}} />
      <div style={{maxWidth: '96%', textAlign: 'center', transform: `scale(${scale}) translateX(${shake}px) rotate(${rotate}deg)`}}>
        <span style={{fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 140, color: '#ffffff', lineHeight: 1.02, textShadow: '0 14px 34px rgba(0,0,0,0.7), 0 0 22px rgba(26,130,212,0.35)'}}>
          {text}
        </span>
      </div>
    </div>
  );
};

// BEAT 2 — SÉQUENCE VISUELLE (60–600 frames ~ 18s, cuts plus rapides)
const BeatSequence: React.FC<{frame: number; showLogo?: boolean}> = ({frame, showLogo}) => {
  // Cuts rapides toutes les 2–3s => blocs visuels successifs
  const segment = Math.floor((frame - 60) / 45); // 45 frames = 1.5s à 30fps
  const overlays = [
    'Brief + Maquette',
    'Design sur-mesure',
    'Rédaction SEO',
    'Mise en ligne',
    'Google + NFC',
    'Tests finaux'
  ];
  const overlayText = overlays[Math.min(overlays.length - 1, Math.max(0, segment))];
  const overlayOpacity = interpolate(frame, [60, 75], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const pulse = 0.75 + 0.25 * Math.sin((frame - 90) / 8);

  return (
    <div style={{position: 'absolute', inset: 0, backgroundColor: '#0d1b2a', overflow: 'hidden'}}>
      {/* Arrière-plan dynamique: grille bleue qui défile légèrement */}
      <div
        style={{
          position: 'absolute',
          inset: -40,
          backgroundImage:
            'linear-gradient(rgba(26,130,212,0.12) 2px, transparent 2px), linear-gradient(90deg, rgba(26,130,212,0.12) 2px, transparent 2px)',
          backgroundSize: '120px 120px',
          transform: `translate(${(frame - 60) * -0.7}px, ${(frame - 60) * -0.4}px) rotate(2deg)`
        }}
      />

      {/* Blocs animés (kinetic) */}
      {[...Array(14)].map((_, i) => {
        const delay = (i % 7) * 6;
        const local = Math.max(0, (frame - 60) - delay);
        const {fps} = useVideoConfig();
        const s = spring({fps, frame: local, config: {stiffness: 120, damping: 18}});
        const y = interpolate(s, [0, 1], [80, 0]);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: `${(i * 7) % 90 + 5}%`,
              left: `${(i * 13) % 90 + 5}%`,
              width: 220,
              height: 12,
              transform: `translateY(${y}px)`,
              backgroundColor: 'rgba(26,130,212,0.25)'
            }}
          />
        );
      })}

      {/* Overlay central (centré) */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          backgroundColor: 'rgba(0,0,0,0.60)',
          padding: '20px 28px',
          borderRadius: 8,
          opacity: overlayOpacity,
          boxShadow: `0 10px 30px rgba(0,0,0,0.35), 0 0 28px rgba(26,130,212,0.22)`,
          transform: `translate(-50%, -50%) scale(${interpolate(frame % 45, [0, 8], [0.95, 1.02], {extrapolateRight: 'clamp'})})`
        }}
      >
        <span style={{fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: 60, color: '#ffffff', letterSpacing: 0.8, textShadow: '0 8px 24px rgba(0,0,0,0.45)'}}>{overlayText}</span>
      </div>

      {/* Logo/texte DMSW discret */}
      {showLogo && (
        <div style={{position: 'absolute', top: 40, right: 40, border: '3px solid #1a82d4', padding: '8px 14px', borderRadius: 8, backgroundColor: 'rgba(13,27,42,0.6)'}}>
          <span style={{fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 28, color: '#1a82d4'}}>DMSW</span>
        </div>
      )}
    </div>
  );
};

// BEAT 3 — RÉVÉLATION (660–810 frames ~ 5s)
const BeatRevelation: React.FC<{text: string}> = ({text}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = spring({fps, frame, config: {stiffness: 240, damping: 16}});
  const scale = interpolate(pop, [0, 1], [0.82, 1.05]);
  return (
    <div style={{position: 'absolute', inset: 0, backgroundColor: '#0d1b2a', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{maxWidth: '94%', textAlign: 'center', border: '10px solid #1a82d4', padding: '34px 54px', transform: `scale(${scale})`, boxShadow: '0 18px 56px rgba(26,130,212,0.35)'}}>
        <span style={{fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 120, color: '#1a82d4', lineHeight: 1.05, letterSpacing: 1.0, textShadow: '0 12px 34px rgba(26,130,212,0.25)'}}>
          {text}
        </span>
      </div>
    </div>
  );
};

// BEAT 4 — CTA (810–900 frames ~ 3s)
const BeatCTA: React.FC<{text: string}> = ({text}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = spring({fps, frame, config: {stiffness: 220, damping: 12}});
  const scale = interpolate(pop, [0, 1], [0.88, 1.05]);
  const wobble = Math.sin(frame * 0.6) * 0.8;
  return (
    <div style={{position: 'absolute', inset: 0, backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{textAlign: 'center', transform: `scale(${scale}) rotate(${wobble}deg)`}}>
        <div style={{fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 96, color: '#1a82d4', lineHeight: 1.06}}>
          Audit gratuit — dmsw.fr
        </div>
        <div style={{marginTop: 12, fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 46, color: '#1a82d4'}}>
          developpermonsiteweb.com
        </div>
        <div style={{marginTop: 16, fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 40, color: '#1a82d4'}}>
          TikTok / Instagram / Snapchat : @dmsw_fr
        </div>
        <div style={{marginTop: 10, fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 38, color: '#1a82d4'}}>
          WhatsApp pro : +33 6 95 98 85 62
        </div>
      </div>
    </div>
  );
};

export const TextAnimation: React.FC<TextAnimationProps> = ({hook, revelation, cta, showLogo}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{flex: 1, position: 'relative'}}>
      <OptionalAudio />
      {/* BEAT 1: 0–60 (2s) */}
      <Sequence from={0} durationInFrames={60}>
        <BeatHook text={hook} />
      </Sequence>
      {/* BEAT 2: 60–600 (18s) */}
      <Sequence from={60} durationInFrames={540}>
        <BeatSequence frame={frame} showLogo={showLogo} />
      </Sequence>
      {/* BEAT 3: 600–780 (6s) */}
      <Sequence from={600} durationInFrames={180}>
        <BeatRevelation text={revelation} />
      </Sequence>
      {/* BEAT 4: 780–900 (4s) */}
      <Sequence from={780} durationInFrames={120}>
        <BeatCTA text={cta} />
      </Sequence>
    </div>
  );
};
