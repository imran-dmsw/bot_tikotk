// ─── Identité visuelle DMSW ───────────────────────────────────────────────────

export const COLORS = {
  primary:   '#1a82d4',
  bg:        '#0d1b2a',
  bgDeep:    '#061020',
  bgCard:    '#0a1520',
  text:      '#e8edf2',
  textMuted: '#8899aa',
  white:     '#ffffff',
  grid:      'rgba(26, 130, 212, 0.08)',
} as const;

export const FONTS = {
  title: 'Syne, sans-serif',
  body:  'Inter, sans-serif',
} as const;

// ─── Format TikTok ────────────────────────────────────────────────────────────

export const VIDEO = {
  width:  1080,
  height: 1920,
  fps:    30,
} as const;

// ─── Timings des scènes (en frames à 30fps) ──────────────────────────────────
// Structure : Hook → Problème → Solution → DMSW → Contact/CTA
// Durée totale : 27s = 810 frames à 30fps

export const SCENES = {
  // Scène 1 — Hook (accroche choc)
  hookStart:      0,
  hookEnd:        75,    // 2.5s

  // Scène 2 — Problème (exposition de la douleur)
  problemStart:   75,
  problemEnd:     225,   // 5s

  // Scène 3 — Solution (réponse générale)
  solutionStart:  225,
  solutionEnd:    375,   // 5s

  // Scène 4 — DMSW (nous sommes la solution)
  dmswStart:      375,
  dmswEnd:        525,   // 5s

  // Scène 5 — Contact / CTA
  ctaStart:       525,
  ctaEnd:         810,   // 9.5s — durée totale : 27s
} as const;

// ─── Identité de contact DMSW ─────────────────────────────────────────────────
// Modifie ces valeurs pour mettre tes vraies coordonnées

export const CONTACT = {
  website:   'dmsw.fr',
  email:     'contact@dmsw.fr',
  instagram: '@dmsw_fr',
  whatsapp:  '+33 6 95 98 85 62',
} as const;

// ─── Spring configs ───────────────────────────────────────────────────────────

export const SPRING = {
  snappy:   { stiffness: 300, damping: 20 },
  bouncy:   { stiffness: 200, damping: 10 },
  bullet3d: { stiffness: 120, damping: 14 },
  card:     { stiffness: 80,  damping: 15 },
  logo:     { stiffness: 200, damping: 12 },
} as const;
