import { readFile, mkdir } from 'fs/promises';
import { basename }        from 'path';

// ─── Config ───────────────────────────────────────────────────────────────────

const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL ?? '';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MakePublishInput {
  video_path:     string;    // chemin absolu vers le MP4
  caption:        string;    // texte + hashtags du post TikTok/Instagram
  hook:           string;    // hook court (pour titre Make)
  hashtags:       string[];  // hashtags séparés
  linkedin_post?: string;    // post LinkedIn adapté (ton pro, storytelling, 3-5 hashtags)
  scheduled_at?:  string;    // ISO 8601 — absent = immédiat
}

// ─── Étape 1 — Upload vidéo sur gofile.io ────────────────────────────────────
// gofile.io : API gratuite, pas d'auth, liens permanents, max 10 Go

async function uploadToGofile(videoPath: string): Promise<string> {
  const filename = basename(videoPath);
  const fileData = await readFile(videoPath);

  // 1. Récupère le meilleur serveur
  const serverRes = await fetch('https://api.gofile.io/servers');
  if (!serverRes.ok) throw new Error(`gofile.io servers HTTP ${serverRes.status}`);
  const serverData = await serverRes.json() as { status: string; data: { servers: Array<{ name: string }> } };
  if (serverData.status !== 'ok') throw new Error(`gofile.io: ${JSON.stringify(serverData)}`);
  const server = serverData.data.servers[0].name; // ex: "store1"

  // 2. Upload sur ce serveur
  const formData = new FormData();
  formData.append('file', new Blob([fileData], { type: 'video/mp4' }), filename);

  const uploadRes = await fetch(`https://${server}.gofile.io/contents/uploadfile`, {
    method: 'POST',
    body:   formData,
  });

  if (!uploadRes.ok) throw new Error(`gofile.io upload HTTP ${uploadRes.status}: ${await uploadRes.text()}`);

  const uploadData = await uploadRes.json() as {
    status: string;
    data: { downloadPage: string; directLink?: string; fileId: string };
  };

  if (uploadData.status !== 'ok') throw new Error(`gofile.io upload échoué : ${JSON.stringify(uploadData)}`);

  // Préférer le lien direct si disponible, sinon la page de téléchargement
  return uploadData.data.directLink ?? uploadData.data.downloadPage;
}

// ─── Décode les séquences unicode littérales (\u00e9 → é) ─────────────────────
// Claude génère parfois des \uXXXX comme texte brut au lieu des vrais caractères

function decodeUnicode(str: string): string {
  return str.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16))
  );
}

// ─── Étape 2 — Envoie le webhook Make ────────────────────────────────────────

async function sendMakeWebhook(payload: object): Promise<void> {
  const res = await fetch(MAKE_WEBHOOK_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Make webhook HTTP ${res.status}: ${errText.slice(0, 300)}`);
  }
}

// ─── Fonction principale ──────────────────────────────────────────────────────

/**
 * Publication automatique via Make.com :
 *   1. Upload la vidéo locale sur file.io (URL publique temporaire 14j)
 *   2. POST le webhook Make avec les métadonnées
 *   3. Make télécharge la vidéo et la poste sur TikTok + Instagram
 */
export async function publishToMake(input: MakePublishInput): Promise<string> {

  if (!MAKE_WEBHOOK_URL) {
    return JSON.stringify({
      success: false,
      error:   'MAKE_WEBHOOK_URL manquant — configure le webhook Make dans .env',
    });
  }

  const started = Date.now();

  try {
    // Étape 1 — Upload vidéo
    console.log(`   📤 Upload vidéo : ${basename(input.video_path)}`);
    const videoUrl = await uploadToGofile(input.video_path);
    console.log(`   ✅ URL publique : ${videoUrl}`);

    // Étape 2 — Webhook Make
    const payload = {
      video_url:     videoUrl,
      caption:       decodeUnicode(input.caption),
      hook:          decodeUnicode(input.hook),
      hashtags:      input.hashtags.map(decodeUnicode),
      linkedin_post: input.linkedin_post ? decodeUnicode(input.linkedin_post) : null,
      scheduled_at:  input.scheduled_at ?? null,
      source:        'dmsw-tiktok-agent',
      filename:      basename(input.video_path),
      timestamp:     new Date().toISOString(),
    };

    console.log(`   📡 Envoi webhook Make...`);
    await sendMakeWebhook(payload);
    console.log(`   ✅ Webhook envoyé`);

    return JSON.stringify({
      success:      true,
      video_url:    videoUrl,
      scheduled_at: input.scheduled_at ?? 'immédiat',
      elapsed_ms:   Date.now() - started,
    });

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return JSON.stringify({ success: false, error: msg });
  }
}
