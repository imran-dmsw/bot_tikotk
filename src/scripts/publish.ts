import axios from 'axios';
import 'dotenv/config';

export interface PublishResult {
  platform: 'buffer' | 'tiktok';
  status: 'scheduled' | 'published' | 'failed' | 'skipped';
  id?: string;
  scheduledAt?: string;
  raw?: unknown;
}

export interface PublishInput {
  videoPath: string;
  caption: string;
  scheduleHours?: number;
  preferPlatform?: 'buffer' | 'tiktok';
}

async function publishToBuffer(input: PublishInput): Promise<PublishResult> {
  const token = process.env.BUFFER_ACCESS_TOKEN;
  const profileId = process.env.BUFFER_PROFILE_ID;
  if (!token || !profileId) {
    throw new Error('BUFFER_ACCESS_TOKEN ou BUFFER_PROFILE_ID manquante.');
  }

  const scheduleHours = input.scheduleHours ?? 24;
  const scheduledAt = new Date(Date.now() + scheduleHours * 60 * 60 * 1000).toISOString();

  const response = await axios.post(
    'https://api.bufferapp.com/1/updates/create.json',
    {
      profile_ids: [profileId],
      text: input.caption,
      scheduled_at: scheduledAt,
      media: {
        video: input.videoPath
      }
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    }
  );

  return {
    platform: 'buffer',
    status: 'scheduled',
    id: response.data?.updates?.[0]?.id ?? response.data?.id,
    scheduledAt,
    raw: response.data
  };
}

async function publishToTikTok(): Promise<PublishResult> {
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
  const refreshToken = process.env.TIKTOK_REFRESH_TOKEN;
  const openId = process.env.TIKTOK_OPEN_ID;

  if (!clientKey || !clientSecret || !refreshToken || !openId) {
    return {
      platform: 'tiktok',
      status: 'skipped',
      raw: 'Variables TikTok manquantes, structure prête mais publication ignorée.'
    };
  }

  const tokenResponse = await axios.post(
    'https://open.tiktokapis.com/v2/oauth/token/',
    new URLSearchParams({
      client_key: clientKey,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    }),
    {
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      timeout: 30000
    }
  );

  const accessToken = tokenResponse.data?.access_token;
  if (!accessToken) {
    throw new Error('Impossible de récupérer un access token TikTok.');
  }

  return {
    platform: 'tiktok',
    status: 'skipped',
    raw: {
      message: 'OAuth OK. Init upload/chunks/publication à brancher selon ton app TikTok.',
      openId
    }
  };
}

export async function publishVideo(input: PublishInput): Promise<PublishResult> {
  const prefer = input.preferPlatform ?? 'buffer';
  try {
    if (prefer === 'buffer') {
      const result = await publishToBuffer(input);
      console.log(`[publish] Vidéo planifiée via Buffer (${result.id ?? 'sans id'})`);
      return result;
    }

    const result = await publishToTikTok();
    console.log(`[publish] Résultat TikTok: ${result.status}`);
    return result;
  } catch (error) {
    console.error('[publish] Échec de publication', error);
    return {
      platform: prefer,
      status: 'failed',
      raw: String(error)
    };
  }
}

async function main(): Promise<void> {
  const result = await publishVideo({
    videoPath: 'out/dmsw-test.mp4',
    caption: 'Ton site web est une honte. #dmsw #marketing #tiktok',
    scheduleHours: 24,
    preferPlatform: 'buffer'
  });
  console.log('[publish] Résultat:', JSON.stringify(result, null, 2));
}

if (require.main === module) {
  void main();
}
