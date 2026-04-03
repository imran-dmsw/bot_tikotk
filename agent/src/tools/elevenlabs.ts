import { writeFile, mkdir } from 'fs/promises';
import { join, resolve }    from 'path';

// ─── Config ───────────────────────────────────────────────────────────────────

const ELEVENLABS_API_KEY  = process.env.ELEVENLABS_API_KEY  ?? '';
// Charlotte (FR) par défaut — voix féminine naturelle, excellente en français
// Autres options : Adam (masc.) = pNInz6obpgDQGcFmaJgB, Bella = EXAVITQu4vr4xnSDxMaL
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID ?? 'XB0fDUnXU5powFXDhCwa';
const MODEL_ID            = 'eleven_multilingual_v2';  // Supporte le français nativement

// Dossier public de Remotion — staticFile() y accède directement
const REMOTION_DIR    = process.env.REMOTION_DIR ?? '../remotion';
const REMOTION_PUBLIC = resolve(REMOTION_DIR, 'public');

// ─── Générateur voix off ──────────────────────────────────────────────────────

export interface VoiceOverResult {
  success:       boolean;
  voiceoverSrc?: string;   // nom de fichier relatif pour staticFile() : "voiceover_1.mp3"
  voiceoverPath?: string;  // chemin absolu (debug)
  bytes?:        number;
  durationMs?:   number;
  error?:        string;
}

/**
 * Génère un MP3 via ElevenLabs TTS et le sauvegarde dans remotion/public/.
 *
 * @param scriptText  Texte complet du script à synthétiser
 * @param scriptId    1, 2 ou 3 — détermine le nom du fichier de sortie
 * @returns           JSON string avec { success, voiceoverSrc, bytes, ... }
 */
export async function generateVoiceOver(
  scriptText: string,
  scriptId:   number,
): Promise<string> {

  if (!ELEVENLABS_API_KEY) {
    return JSON.stringify({
      success: false,
      error:   'ELEVENLABS_API_KEY manquant — voix off ignorée pour ce script',
    });
  }

  const started  = Date.now();
  const filename = `voiceover_${scriptId}.mp3`;
  const outPath  = join(REMOTION_PUBLIC, filename);

  try {
    // Créer le dossier public/ s'il n'existe pas encore
    await mkdir(REMOTION_PUBLIC, { recursive: true });

    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key':   ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
          'Accept':       'audio/mpeg',
        },
        body: JSON.stringify({
          text:     scriptText,
          model_id: MODEL_ID,
          voice_settings: {
            stability:         0.50,  // 0=expressif, 1=stable
            similarity_boost:  0.75,  // fidélité à la voix d'origine
            style:             0.30,  // style/expressivité (0-1)
            use_speaker_boost: true,
          },
        }),
      },
    );

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      return JSON.stringify({
        success: false,
        error:   `ElevenLabs HTTP ${res.status}: ${errText.slice(0, 300)}`,
      });
    }

    // Sauvegarder le MP3 binaire dans remotion/public/
    const buffer = Buffer.from(await res.arrayBuffer());
    await writeFile(outPath, buffer);

    return JSON.stringify({
      success:       true,
      voiceoverSrc:  filename,   // utilisé par Remotion staticFile()
      voiceoverPath: outPath,    // chemin absolu (debug)
      bytes:         buffer.length,
      durationMs:    Date.now() - started,
    });

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return JSON.stringify({ success: false, error: msg });
  }
}
