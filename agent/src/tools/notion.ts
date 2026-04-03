import { Client } from '@notionhq/client';
import type { TikTokScript } from '../types.js';

/**
 * Accepte l'UUID brut ou une URL complète Notion :
 * notion.so/3371fe46c249802a8b54f4510a9a348f?v=... -> 3371fe46-c249-802a-8b54-f4510a9a348f
 */
function parseNotionDbId(raw?: string): string {
  if (!raw) return '';
  const match = raw.replace(/-/g, '').match(/([a-f0-9]{32})/i);
  if (!match) return raw;
  const h = match[1]!;
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DB_ID  = parseNotionDbId(process.env.NOTION_DATABASE_ID);

function toRichText(text: string) {
  return [{ type: 'text' as const, text: { content: text.slice(0, 2000) } }];
}

async function createPage(script: TikTokScript): Promise<string> {
  const page = await notion.pages.create({
    parent: { type: 'database_id', database_id: DB_ID },
    properties: {
      'Titre':     { title:      toRichText(script.hook) },
      'Angle':     { select:     { name: script.angle } },
      'Format':    { select:     { name: script.format } },
      'Script':    { rich_text:  toRichText(script.script) },
      'Visuels':   { rich_text:  toRichText(script.visuels) },
      'CTA':       { rich_text:  toRichText(script.cta) },
      'Hashtags':  { multi_select: script.hashtags.slice(0, 10).map(h => ({ name: h.startsWith('#') ? h : `#${h}` })) },
      'Duree':     { number:     script.duree_secondes },
      'Statut':    { select:     { name: 'A generer' } },
    },
  });
  return (page as { url?: string }).url ?? page.id;
}

export async function saveToNotion(scripts: TikTokScript[]): Promise<string> {
  if (!process.env.NOTION_API_KEY || !DB_ID) {
    return JSON.stringify({ error: 'NOTION_API_KEY ou NOTION_DATABASE_ID manquant' });
  }
  console.log(`   [notion] DB ID : ${DB_ID}`);
  try {
    const urls = await Promise.all(scripts.map(createPage));
    return JSON.stringify({ success: true, pagesCreees: urls.length, urls });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return JSON.stringify({ success: false, error: msg });
  }
}
