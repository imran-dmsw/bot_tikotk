import { readFile }       from 'fs/promises';
import { basename }       from 'path';
import { createReadStream } from 'fs';

// ─── Config ───────────────────────────────────────────────────────────────────

const BUFFER_TOKEN       = process.env.BUFFER_TOKEN       ?? '';
const BUFFER_PROFILE_IDS = process.env.BUFFER_PROFILE_IDS ?? ''; // IDs séparés par virgule

const BUFFER_API = 'https://api.bufferapp.com/1';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BufferPublishInput {
  video_path:    string;   // chemin absolu vers le MP4 dans output/
  caption:       string;   // texte du post (hook + hashtags)
  scheduled_at?: string;   // ISO datetime — si absent = file d'attente Buffer
}

export interface BufferPublishResult {
  success:      boolean;
  post_id?:     string;
  share_url?:   string;
  scheduled_at?: string;
  error?:        string;
}

// ─── Étape 1 — Upload vidéo temporaire via file.io ───────────────────────────
// file.io : upload anonyme gratuit, URL valable 14 jours, max 2 Go

async function uploadToFileIo(videoPath: string): Promise<string> {
  const filename = basename(videoPath);
  const fileData = await readFile(videoPath);

  const formData = new FormData();
  formData.append(
    'file',
    new Blob([fileData], { type: 'video/mp4' }),
    filename,
  );
  formData.append('expires', '14d');  // lien valable 14 jours
  formData.append('maxDownloads', '10');
  formData.append('autoDelete', 'false');

  const res = await fetch('https://file.io/', {
    method:  'POST',
    body:    formData,
  });

  if (!res.ok) {
    throw new Error(`file.io HTTP ${res.status}: ${await res.text()}`);
  }

  const data = await res.json() as { success: boolean; link: string; key: string };
  if (!data.success || !data.link) {
    throw new Error(`file.io upload échoué : ${JSON.stringify(data)}`);
  }

  return data.link; // ex: "https://file.io/Abc123"
}

// ─── Étape 2 — Créer le post Buffer ──────────────────────────────────────────

async function createBufferPost(
  videoUrl:    string,
  caption:     string,
  profileIds:  string[],
  scheduledAt?: string,
): Promise<{ id: string; share_url?: string; scheduled_at?: string }> {

  const body = new URLSearchParams();
  body.append('text', caption);
  profileIds.forEach(id => body.append('profile_ids[]', id));
  body.append('media[video]', videoUrl);
  if (scheduledAt) {
    body.append('scheduled_at', scheduledAt);
  }

  const res = await fetch(`${BUFFER_API}/updates/create.json`, {
    method:  'POST',
    headers: {
      'Authorization': `Bearer ${BUFFER_TOKEN}`,
      'Content-Type':  'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Buffer API HTTP ${res.status}: ${errText.slice(0, 400)}`);
  }

  const data = await res.json() as {
    updates?: Array<{ id: string; status: string; scheduled_at?: string }>;
    message?: string;
  };

  if (!data.updates || data.updates.length === 0) {
    throw new Error(`Buffer : aucun post créé — ${JSON.stringify(data)}`);
  }

  const update = data.updates[0];
  return {
    id:           update.id,
    scheduled_at: update.scheduled_at,
  };
}

// ─── Récupère les profils connectés (helper debug) ───────────────────────────

export async function getBufferProfiles(): Promise<string> {
  if (!BUFFER_TOKEN) {
    return JSON.stringify({ success: false, error: 'BUFFER_TOKEN manquant dans .env' });
  }

  const res = await fetch(`${BUFFER_API}/profiles.json`, {
    headers: { 'Authorization': `Bearer ${BUFFER_TOKEN}` },
  });

  if (!res.ok) {
    return JSON.stringify({ success: false, error: `HTTP ${res.status}: ${await res.text()}` });
  }

  const profiles = await res.json() as Array<{
    id: string;
    service: string;
    service_username: string;
  }>;

  const list = profiles.map(p => ({
    id:       p.id,
    platform: p.service,
    account:  p.service_username,
  }));

  return JSON.stringify({ success: true, profiles: list });
}

// ─── Fonction principale ──────────────────────────────────────────────────────

/**
 * Publie (ou planifie) une vidéo sur TikTok/Instagram via Buffer.
 *
 * Flow :
 *   1. Upload la vidéo locale sur file.io → URL temporaire publique
 *   2. Crée un post Buffer avec l'URL + caption + profils
 *   3. Retourne le résultat (id, scheduled_at, etc.)
 */
export async function publishToBuffer(
  input: BufferPublishInput,
): Promise<string> {

  if (!BUFFER_TOKEN) {
    return JSON.stringify({
      success: false,
      error:   'BUFFER_TOKEN manquant — configurer dans .env (buffer.com → Settings → Access Token)',
    });
  }

  const profileIds = BUFFER_PROFILE_IDS
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  if (profileIds.length === 0) {
    return JSON.stringify({
      success: false,
      error:   'BUFFER_PROFILE_IDS manquant — ajouter les IDs de profil dans .env',
    });
  }

  const started = Date.now();

  try {
    // Étape 1 — Upload vidéo
    console.log(`   📤 Upload vidéo : ${basename(input.video_path)}`);
    const videoUrl = await uploadToFileIo(input.video_path);
    console.log(`   ✅ URL temporaire : ${videoUrl}`);

    // Étape 2 — Créer post Buffer
    console.log(`   📅 Création post Buffer (${profileIds.length} profil(s))...`);
    const post = await createBufferPost(
      videoUrl,
      input.caption,
      profileIds,
      input.scheduled_at,
    );
    console.log(`   ✅ Post créé : ${post.id}`);

    return JSON.stringify({
      success:      true,
      post_id:      post.id,
      video_url:    videoUrl,
      scheduled_at: post.scheduled_at ?? input.scheduled_at ?? 'file d\'attente',
      profiles:     profileIds.length,
      elapsed_ms:   Date.now() - started,
    } satisfies Omit<BufferPublishResult, 'error'> & { profiles: number; elapsed_ms: number; video_url: string });

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return JSON.stringify({ success: false, error: msg });
  }
}
