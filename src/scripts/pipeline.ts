import {mkdir} from 'node:fs/promises';
import {basename, relative, resolve} from 'node:path';
import 'dotenv/config';
import {GenerationResult, TikTokScript} from '../types';
import {generateScript} from './generateScript';
import {generateVoiceOver} from './generateVoiceOver';
import {publishVideo} from './publish';
import {renderVideo} from './renderVideo';

interface PipelineItemResult {
  script: TikTokScript;
  voicePath?: string;
  videoPath?: string;
  publicationStatus: 'scheduled' | 'published' | 'failed' | 'skipped';
  error?: string;
}

function buildCaption(script: TikTokScript): string {
  const hashtags = script.hashtags.join(' ');
  return `${script.hook} ${script.cta} ${hashtags}`.trim();
}

function extractDmswSentence(text: string): string | null {
  const keywords = ['10 jours', 'NFC', 'SEO', 'mise en ligne', 'site web', 'sur-mesure', 'Google', 'DMSW', 'pack'];
  const sentences = text
    .split(/[.!?]\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  for (const sentence of sentences) {
    const lower = sentence.toLowerCase();
    if (keywords.some((k) => lower.includes(k.toLowerCase()))) {
      return sentence.length > 90 ? `${sentence.slice(0, 90)}…` : sentence;
    }
  }
  return null;
}

function buildRemotionBullets(script: TikTokScript): string[] {
  const fallbackBullets = ['Livraison en 10 jours', 'Design + SEO + mise en ligne', 'NFC + fiches Google (selon pack)'];

  const fromScript = extractDmswSentence(script.script) ?? extractDmswSentence(script.visuels) ?? extractDmswSentence(script.cta);

  const bullets: string[] = [];
  if (fromScript) {
    bullets.push(fromScript);
  }

  // On complète pour atteindre 3 bullet points Remotion, en gardant un minimum DMSW visible.
  for (const fb of fallbackBullets) {
    if (bullets.length >= 3) break;
    if (!bullets.includes(fb)) bullets.push(fb);
  }

  return bullets.slice(0, 3);
}

export async function runPipeline(): Promise<GenerationResult> {
  const projectRoot = process.cwd();
  const outVoiceDir = resolve(projectRoot, 'out/voice');
  const outVideoDir = resolve(projectRoot, 'out/videos');
  const enableBufferPublish = process.env.DMSW_ENABLE_BUFFER_PUBLISH === 'true';
  await mkdir(outVoiceDir, {recursive: true});
  await mkdir(outVideoDir, {recursive: true});

  console.log('[pipeline] Étape 1/5: génération des scripts...');
  const scripts = await generateScript();
  const videosPaths: string[] = [];
  const notionPageIds: string[] = [];
  const details: PipelineItemResult[] = [];

  for (const script of scripts) {
    const slug = `${script.id}-${basename(script.hook).replace(/\s+/g, '-').toLowerCase()}`;
    const absVoicePath = resolve(outVoiceDir, `${slug}.mp3`);
    const absVideoPath = resolve(outVideoDir, `${slug}.mp4`);
    const relVoicePath = relative(projectRoot, absVoicePath);
    const relVideoPath = relative(projectRoot, absVideoPath);
    let voiceOverRelPathForRender: string | undefined;

    const item: PipelineItemResult = {
      script,
      publicationStatus: 'skipped'
    };

    try {
      console.log(`[pipeline] Étape 2/5: voix off script #${script.id}...`);
      try {
        await generateVoiceOver(script.script, absVoicePath);
        item.voicePath = relVoicePath;
        voiceOverRelPathForRender = relVoicePath;
      } catch (voiceError: unknown) {
        const axiosErr = voiceError as {response?: {status?: number}};
        const status = axiosErr?.response?.status;

        // ElevenLabs retourne 402 Payment Required en cas de compte/clé non autorisé pour le TTS.
        // Dans ce cas, on rend quand même la vidéo (sans audio) pour garder un visuel exploitable.
        if (status === 402) {
          console.warn(`[pipeline] ElevenLabs 402 sur script #${script.id} : voix off ignorée (rendu sans audio).`);
        } else {
          throw voiceError;
        }
      }

      console.log(`[pipeline] Étape 3/5: rendu vidéo script #${script.id}...`);
      const renderInput = {
        hook: script.hook,
        bullets: buildRemotionBullets(script),
        cta: script.cta,
        outputPath: relVideoPath
      } as Parameters<typeof renderVideo>[0];

      if (voiceOverRelPathForRender) {
        renderInput.voiceOverPath = voiceOverRelPathForRender;
      }

      await renderVideo(renderInput);
      item.videoPath = relVideoPath;
      videosPaths.push(relVideoPath);

      console.log(`[pipeline] Étape 4/5: publication script #${script.id}...`);
      if (!enableBufferPublish) {
        item.publicationStatus = 'skipped';
        console.log('[pipeline] Publication Buffer désactivée localement (DMSW_ENABLE_BUFFER_PUBLISH != true).');
      } else {
        const publication = await publishVideo({
          videoPath: relVideoPath,
          caption: buildCaption(script),
          scheduleHours: 24,
          preferPlatform: 'buffer'
        });
        item.publicationStatus = publication.status;
      }
    } catch (error) {
      item.error = String(error);
      item.publicationStatus = 'failed';
      console.error(`[pipeline] Échec partiel script #${script.id}`, error);
    }

    details.push(item);
  }

  console.log('[pipeline] Étape 5/5: consolidation des résultats.');
  const result: GenerationResult = {
    scripts,
    generatedAt: new Date().toISOString(),
    notionPageIds,
    videosPaths
  };

  console.log('[pipeline] Détails:', JSON.stringify(details, null, 2));
  return result;
}

async function main(): Promise<void> {
  try {
    const result = await runPipeline();
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('[pipeline] Arrêt du pipeline suite à une erreur critique.', error);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  void main();
}
