import axios from 'axios';
import {execFile} from 'node:child_process';
import {mkdir, stat, writeFile} from 'node:fs/promises';
import {dirname} from 'node:path';
import {promisify} from 'node:util';
import 'dotenv/config';

const execFileAsync = promisify(execFile);

function estimateDurationSeconds(fileSizeInBytes: number): number {
  const assumedBitrate = 128000;
  return Number(((fileSizeInBytes * 8) / assumedBitrate).toFixed(2));
}

async function readDurationViaFfprobe(filePath: string): Promise<number | null> {
  try {
    const {stdout} = await execFileAsync('ffprobe', [
      '-v',
      'error',
      '-show_entries',
      'format=duration',
      '-of',
      'default=noprint_wrappers=1:nokey=1',
      filePath
    ]);
    const parsed = Number(stdout.trim());
    return Number.isFinite(parsed) ? Number(parsed.toFixed(2)) : null;
  } catch {
    return null;
  }
}

export async function generateVoiceOver(script: string, outputPath: string): Promise<void> {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    const voiceId = process.env.ELEVENLABS_VOICE_ID;

    if (!apiKey || !voiceId) {
      throw new Error('ELEVENLABS_API_KEY ou ELEVENLABS_VOICE_ID manquante.');
    }

    await mkdir(dirname(outputPath), {recursive: true});

    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text: script,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8
        }
      },
      {
        headers: {
          'xi-api-key': apiKey,
          Accept: 'audio/mpeg',
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer',
        timeout: 45000
      }
    );

    await writeFile(outputPath, Buffer.from(response.data));
    const fileStats = await stat(outputPath);
    const durationFromMetadata = await readDurationViaFfprobe(outputPath);
    const estimatedDuration = estimateDurationSeconds(fileStats.size);
    console.log(`[generateVoiceOver] MP3 généré: ${outputPath}`);
    if (durationFromMetadata !== null) {
      console.log(`[generateVoiceOver] Durée (metadata): ${durationFromMetadata}s`);
    } else {
      console.log(`[generateVoiceOver] Durée estimée (fallback): ${estimatedDuration}s`);
    }
  } catch (error) {
    console.error('[generateVoiceOver] Échec de génération de la voix off', error);
    throw error;
  }
}

async function main(): Promise<void> {
  try {
    await generateVoiceOver(
      'Tu peux lancer ton site web premium en sept jours sans abonnement caché.',
      'public/voiceover.mp3'
    );
  } catch (error) {
    console.error('[generateVoiceOver] Arrêt du script suite à une erreur.', error);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  void main();
}
