export interface TikTokScript {
  id: number;
  hook: string;
  angle: 'education' | 'coulisses' | 'opinion';
  format: 'texte_anime' | 'screen_recording' | 'voix_off';
  script: string;
  visuels: string;
  cta: string;
  hashtags: string[];
  duree_secondes: number;
}

export interface GenerationResult {
  scripts: TikTokScript[];
  generatedAt: string;
  notionPageIds: string[];
  videosPaths: string[];
}
