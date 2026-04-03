import type { Tool } from '@anthropic-ai/sdk/resources/messages.js';
import type { TikTokScript, RenderInput, VoiceOverInput } from '../types.js';
import { searchWeb }          from './search.js';
import { saveToNotion }       from './notion.js';
import { sendEmailSummary }   from './email.js';
import { triggerVideoRender } from './remotion.js';
import { generateVoiceOver }  from './elevenlabs.js';

// ─── Schémas des outils exposés à Claude ─────────────────────────────────────

export const TOOL_DEFINITIONS: Tool[] = [
  // ── 1. Recherche web ────────────────────────────────────────────────────────
  {
    name: 'search_web',
    description:
      'Recherche simultanée de plusieurs requêtes sur Google via SerpAPI. ' +
      'Retourne les snippets, questions associées et encarts vedettes.',
    input_schema: {
      type: 'object',
      properties: {
        queries: {
          type: 'array',
          items: { type: 'string' },
          description: 'Liste des requêtes à lancer en parallèle (max 5)',
          minItems: 1,
          maxItems: 5,
        },
      },
      required: ['queries'],
    },
  },

  // ── 2. Sauvegarde Notion ────────────────────────────────────────────────────
  {
    name: 'save_to_notion',
    description:
      'Sauvegarde les scripts TikTok générés dans la base de données Notion DMSW. ' +
      'Crée une page par script avec toutes les propriétés.',
    input_schema: {
      type: 'object',
      properties: {
        scripts: {
          type: 'array',
          description: 'Les 3 scripts TikTok à sauvegarder',
          items: {
            type: 'object',
            properties: {
              id:             { type: 'number' },
              hook:           { type: 'string', description: 'Accroche choc < 8 mots' },
              angle:          { type: 'string', enum: ['education', 'coulisses', 'opinion'] },
              format:         { type: 'string', enum: ['texte_anime', 'typo', 'screen_recording', 'voix_off'] },
              script:         { type: 'string', description: 'Texte complet parlé' },
              visuels:        { type: 'string', description: 'Ce que voit le spectateur' },
              cta:            { type: 'string', description: 'Appel à l action final' },
              hashtags:       { type: 'array', items: { type: 'string' } },
              duree_secondes: { type: 'number' },
            },
            required: ['id', 'hook', 'angle', 'format', 'script', 'visuels', 'cta', 'hashtags', 'duree_secondes'],
          },
        },
      },
      required: ['scripts'],
    },
  },

  // ── 3. Email récapitulatif ──────────────────────────────────────────────────
  {
    name: 'send_email_summary',
    description:
      'Envoie un email HTML récapitulatif des 3 scripts à l\'équipe DMSW. ' +
      'Inclut hooks, angles, formats, CTA et hashtags.',
    input_schema: {
      type: 'object',
      properties: {
        scripts: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id:             { type: 'number' },
              hook:           { type: 'string' },
              angle:          { type: 'string' },
              format:         { type: 'string' },
              cta:            { type: 'string' },
              hashtags:       { type: 'array', items: { type: 'string' } },
              duree_secondes: { type: 'number' },
              script:         { type: 'string' },
              visuels:        { type: 'string' },
            },
            required: ['id', 'hook', 'angle', 'format', 'cta', 'hashtags', 'duree_secondes'],
          },
        },
      },
      required: ['scripts'],
    },
  },

  // ── 4. Génération voix off ElevenLabs ───────────────────────────────────────
  {
    name: 'generate_voiceover',
    description:
      'Génère un fichier audio MP3 via ElevenLabs TTS à partir du texte d\'un script. ' +
      'Sauvegarde le MP3 dans le dossier public Remotion pour utilisation dans VoiceOver.tsx. ' +
      'Appeler UNIQUEMENT pour les scripts dont le format est "voix_off". ' +
      'Retourne voiceoverSrc (ex: "voiceover_1.mp3") à passer à trigger_video_render.',
    input_schema: {
      type: 'object',
      properties: {
        script_id: {
          type:        'number',
          description: '1, 2 ou 3 — correspond à l\'id du script',
        },
        script_text: {
          type:        'string',
          description: 'Texte complet parlé du script (champ "script" du TikTokScript)',
        },
      },
      required: ['script_id', 'script_text'],
    },
  },

  // ── 5. Rendu vidéo Remotion ─────────────────────────────────────────────────
  {
    name: 'trigger_video_render',
    description:
      'Déclenche la génération vidéo Remotion pour un script. ' +
      'Appelle le CLI Remotion localement ou un webhook distant si configuré. ' +
      'Pour format "voix_off", inclure voiceoverSrc retourné par generate_voiceover.',
    input_schema: {
      type: 'object',
      properties: {
        script_id: { type: 'number', description: '1, 2 ou 3' },
        format: {
          type: 'string',
          enum: ['texte_anime', 'typo', 'screen_recording', 'voix_off'],
        },
        hook:     { type: 'string', description: 'Scène 1 — accroche choc < 8 mots' },
        problem:  { type: 'string', description: 'Scène 2 — exposition du problème entrepreneur (1-2 phrases percutantes)' },
        solution: { type: 'string', description: 'Scène 3 — solution générale (1-2 phrases, sans citer DMSW)' },
        bullets: {
          type:        'array',
          items:       { type: 'string' },
          description: 'Scène 4 — 2-3 arguments DMSW courts (< 10 mots chacun, pourquoi choisir DMSW)',
          minItems:    2,
          maxItems:    3,
        },
        cta:            { type: 'string', description: 'Appel à l\'action final (Scène 5)' },
        hashtags:       { type: 'array', items: { type: 'string' }, description: '5 hashtags avec #' },
        duree_secondes: { type: 'number', description: 'Toujours 27' },
        voiceoverSrc: {
          type:        'string',
          description: 'Nom du fichier MP3 retourné par generate_voiceover (ex: "voiceover_1.mp3"). Obligatoire pour voix_off.',
        },
      },
      required: ['script_id', 'format', 'hook', 'problem', 'solution', 'bullets', 'cta', 'hashtags', 'duree_secondes'],
    },
  },
];

// ─── Dispatcher ───────────────────────────────────────────────────────────────

export async function dispatchTool(
  name:  string,
  input: Record<string, unknown>,
): Promise<string> {
  switch (name) {
    case 'search_web':
      return searchWeb(input['queries'] as string[]);

    case 'save_to_notion':
      return saveToNotion(input['scripts'] as TikTokScript[]);

    case 'send_email_summary':
      return sendEmailSummary(input['scripts'] as TikTokScript[]);

    case 'generate_voiceover': {
      const v = input as unknown as VoiceOverInput;
      return generateVoiceOver(v.script_text, v.script_id);
    }

    case 'trigger_video_render':
      return triggerVideoRender(input as unknown as RenderInput);

    default:
      return JSON.stringify({ error: `Outil inconnu : "${name}"` });
  }
}
