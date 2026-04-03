export interface ScriptProps {
  hook:            string;       // Scène 1 — accroche choc (< 8 mots)
  problem:         string;       // Scène 2 — exposition du problème (1-2 phrases)
  solution:        string;       // Scène 3 — solution générale (1-2 phrases)
  bullets:         string[];     // Scène 4 — 2-3 arguments DMSW (< 10 mots chacun)
  script:          string;       // texte complet parlé
  visuels:         string;       // description des visuels
  cta:             string;
  hashtags:        string[];
  duree_secondes:  number;       // toujours 27
  voiceoverSrc?:   string;       // chemin relatif vers le MP3
}

export type ScriptFormat = 'texte_anime' | 'screen_recording' | 'voix_off';
