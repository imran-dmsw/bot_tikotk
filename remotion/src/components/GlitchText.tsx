import React from 'react';
import { COLORS } from '../lib/constants';

interface GlitchTextProps {
  children: React.ReactNode;
  frame:    number;
  style?:   React.CSSProperties;
}

/**
 * Effet glitch RGB :
 * - Frames 0-15 : décalage rouge (gauche) + bleu (droite) avec tremblements
 * - Frames 15+  : texte normal
 */
export const GlitchText: React.FC<GlitchTextProps> = ({ children, frame, style }) => {
  const isGlitching = frame < 15;
  const shift       = Math.sin(frame * 5.3) * 5;
  const shiftV      = Math.cos(frame * 3.7) * 2;

  return (
    <div style={{ position: 'relative', display: 'inline-block', ...style }}>

      {/* Canal rouge — décalage positif */}
      {isGlitching && (
        <div style={{
          position:       'absolute',
          inset:          0,
          color:          'rgba(255, 60, 60, 0.55)',
          transform:      `translate(${shift}px, ${shiftV}px)`,
          mixBlendMode:   'screen',
          userSelect:     'none',
          pointerEvents:  'none',
        }}>
          {children}
        </div>
      )}

      {/* Canal bleu — décalage négatif */}
      {isGlitching && (
        <div style={{
          position:      'absolute',
          inset:         0,
          color:         `rgba(26, 130, 212, 0.55)`,
          transform:     `translate(${-shift}px, ${-shiftV}px)`,
          mixBlendMode:  'screen',
          userSelect:    'none',
          pointerEvents: 'none',
        }}>
          {children}
        </div>
      )}

      {/* Texte principal */}
      <div style={{ position: 'relative', color: COLORS.white }}>
        {children}
      </div>

    </div>
  );
};
