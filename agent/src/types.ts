// ─── Domaine métier ──────────────────────────────────────────────────────────

export type ScriptAngle  = 'education' | 'coulisses' | 'opinion';
export type ScriptFormat = 'texte_anime' | 'typo' | 'screen_recording' | 'voix_off';

export interface TikTokScript {
  id:              number;
  hook:            string;
  problem:         string;       // exposition du problème
  solution:        string;       // solution générale
  angle:           ScriptAngle;
  format:          ScriptFormat;
  script:          string;
  visuels:         string;
  cta:             string;
  hashtags:        string[];
  duree_secondes:  number;
}

export interface SearchResult {
  source:    string;
  resultats: Array<{ titre: string; extrait: string }>;
}

// ─── Résultat de l'agent ──────────────────────────────────────────────────────

export interface AgentResult {
  success:      boolean;
  scripts:      TikTokScript[];
  notionPages:  string[];   // URLs des pages créées
  emailSent:    boolean;
  renderJobs:   string[];   // IDs de render Remotion déclenchés
  voiceovers:   string[];   // Chemins MP3 générés par ElevenLabs
  errors:       string[];
  durationMs:   number;
}

// ─── Outils — inputs ─────────────────────────────────────────────────────────

export interface SearchInput {
  queries: string[];
}

export interface NotionInput {
  scripts: TikTokScript[];
}

export interface EmailInput {
  scripts: TikTokScript[];
}

export interface VoiceOverInput {
  script_id:   number;
  script_text: string;         // texte complet parlé
}

export interface RenderInput {
  script_id:       number;
  format:          ScriptFormat;
  hook:            string;
  problem?:        string;     // Scène 2 — texte du problème
  solution?:       string;     // Scène 3 — texte de la solution
  script?:         string;
  bullets?:        string[];   // Scène 4 — arguments DMSW (2-3 bullets)
  visuels?:        string;
  cta?:            string;
  hashtags?:       string[];
  duree_secondes?: number;
  voiceoverSrc?:   string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

export interface AgentConfig {
  model:      string;
  maxTokens:  number;
  maxIter:    number;
}
