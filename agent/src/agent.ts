import Anthropic from '@anthropic-ai/sdk';
import type {
  MessageParam,
  ToolUseBlock,
  ToolResultBlockParam,
} from '@anthropic-ai/sdk/resources/messages.js';

import { SYSTEM_PROMPT }          from './prompts/system.js';
import { TOOL_DEFINITIONS, dispatchTool } from './tools/index.js';
import type { AgentResult, AgentConfig }  from './types.js';

// ─── Config ───────────────────────────────────────────────────────────────────

const DEFAULT_CONFIG: AgentConfig = {
  model:     'claude-sonnet-4-20250514',
  maxTokens: 4096,
  maxIter:   15,           // Bloc 3 ajoute des étapes : on monte à 15
};

// ─── Logger ───────────────────────────────────────────────────────────────────

function log(level: 'info' | 'tool' | 'warn' | 'error', msg: string): void {
  const prefix = {
    info:  '  [agent]',
    tool:  '  [tool] ',
    warn:  '  [warn] ',
    error: '  [ERROR]',
  }[level];
  const ts = new Date().toISOString().slice(11, 23);
  console.log(`${ts} ${prefix} ${msg}`);
}

// ─── Boucle agentique principale ─────────────────────────────────────────────

export async function runAgent(
  trigger?:    string,
  cfg:         Partial<AgentConfig> = {},
): Promise<AgentResult> {
  const config  = { ...DEFAULT_CONFIG, ...cfg };
  const client  = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const started = Date.now();

  const result: AgentResult = {
    success:     false,
    scripts:     [],
    notionPages: [],
    emailSent:   false,
    renderJobs:  [],
    voiceovers:  [],
    errors:      [],
    durationMs:  0,
  };

  const messages: MessageParam[] = [
    {
      role:    'user',
      content: trigger ?? 'Lance la génération des 3 scripts TikTok DMSW pour aujourd\'hui. Suis le processus complet : recherche tendances, génère les scripts, sauvegarde dans Notion, envoie l\'email récapitulatif, génère les voix off pour les scripts voix_off, puis déclenche les 3 rendus vidéo.',
    },
  ];

  log('info', `Démarrage — modèle : ${config.model}`);

  for (let iter = 1; iter <= config.maxIter; iter++) {
    log('info', `Itération ${iter}/${config.maxIter}`);

    // ── Appel Claude ─────────────────────────────────────────────────────────
    let response: Awaited<ReturnType<typeof client.messages.create>>;
    try {
      response = await client.messages.create({
        model:      config.model,
        max_tokens: config.maxTokens,
        system:     SYSTEM_PROMPT,
        tools:      TOOL_DEFINITIONS,
        messages,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      log('error', `Erreur API Anthropic : ${msg}`);
      result.errors.push(`API error iter ${iter}: ${msg}`);
      break;
    }

    // Ajouter la réponse de l'assistant à l'historique
    messages.push({ role: 'assistant', content: response.content });

    // ── Fin naturelle ─────────────────────────────────────────────────────────
    if (response.stop_reason === 'end_turn') {
      log('info', 'Agent terminé (end_turn)');
      result.success = true;
      break;
    }

    // ── Appels d'outils ───────────────────────────────────────────────────────
    if (response.stop_reason === 'tool_use') {
      const toolCalls = response.content.filter(
        (b): b is ToolUseBlock => b.type === 'tool_use',
      );

      log('tool', `${toolCalls.length} outil(s) demandé(s) : ${toolCalls.map(t => t.name).join(', ')}`);

      // Exécution parallèle de tous les outils demandés dans ce tour
      const toolResults = await Promise.all(
        toolCalls.map(async (call): Promise<ToolResultBlockParam> => {
          const startMs = Date.now();
          const input   = call.input as Record<string, unknown>;
          let output: string;

          // ── Capturer les scripts depuis l'INPUT (avant appel) ─────────────
          // Les scripts sont passés en paramètre aux outils, pas retournés
          if (
            (call.name === 'save_to_notion' || call.name === 'send_email_summary') &&
            Array.isArray(input['scripts']) &&
            (input['scripts'] as unknown[]).length > result.scripts.length
          ) {
            result.scripts = input['scripts'] as typeof result.scripts;
            log('info', `Scripts capturés : ${result.scripts.length} scripts`);
          }

          try {
            output = await dispatchTool(call.name, input);
            log('tool', `✓ ${call.name} (${Date.now() - startMs}ms)`);
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            log('warn', `✗ ${call.name} erreur : ${msg}`);
            output = JSON.stringify({ success: false, error: msg });
            result.errors.push(`${call.name}: ${msg}`);
          }

          // ── Collecter les méta-résultats depuis l'OUTPUT ──────────────────
          try {
            const parsed = JSON.parse(output) as Record<string, unknown>;
            collectMetaResults(call.name, parsed, result);
          } catch {
            // output non-JSON, on ignore
          }

          return {
            type:        'tool_result',
            tool_use_id: call.id,
            content:     output,
          };
        }),
      );

      // Renvoyer tous les résultats à Claude
      messages.push({ role: 'user', content: toolResults });
      continue;
    }

    // max_tokens ou stop inattendu
    log('warn', `Stop inattendu : ${response.stop_reason}`);
    break;
  }

  result.durationMs = Date.now() - started;
  log('info', `Terminé en ${(result.durationMs / 1000).toFixed(1)}s — succès: ${result.success}`);

  return result;
}

// ─── Extraction des résultats intermédiaires ──────────────────────────────────

function collectMetaResults(
  toolName: string,
  parsed:   Record<string, unknown>,
  result:   AgentResult,
): void {
  // ── Résultats qui nécessitent success: true ──────────────────────────────
  if (parsed['success'] === true) {

    if (toolName === 'save_to_notion' && Array.isArray(parsed['urls'])) {
      result.notionPages.push(...(parsed['urls'] as string[]));
    }

    if (toolName === 'send_email_summary') {
      result.emailSent = true;
    }

    if (toolName === 'generate_voiceover' && parsed['voiceoverSrc']) {
      result.voiceovers.push(String(parsed['voiceoverSrc']));
      log('info', `Voix off générée : ${parsed['voiceoverSrc']} (${parsed['bytes']} bytes)`);
    }
  }

  // ── Render : capturer outFile même si Remotion n'est pas encore installé ─
  // success: false avec outFile = render planifié (CLI absent) → on le note quand même
  if (toolName === 'trigger_video_render' && parsed['outFile']) {
    result.renderJobs.push(String(parsed['outFile']));
  }
}

// Exporter log pour réutilisation
export { log };
