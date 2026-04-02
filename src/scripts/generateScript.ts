import axios from 'axios';
import 'dotenv/config';
import {TikTokScript} from '../types';

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_MODEL = 'claude-sonnet-4-20250514';

const SYSTEM_PROMPT = `Tu es un expert en contenu TikTok viral pour le marché français.
Tu travailles pour DMSW, une agence web ciblant les entrepreneurs solo.
Les vidéos ne montrent jamais de visage : texte animé, screen recording ou voix off uniquement.

À partir des tendances fournies, génère exactement 3 scripts TikTok percutants.

Retourne UNIQUEMENT ce tableau JSON valide, sans markdown ni texte autour :
[
  {
    "id": 1,
    "hook": "accroche choc en moins de 8 mots",
    "angle": "education | coulisses | opinion",
    "format": "texte_anime | screen_recording | voix_off",
    "script": "script complet mot pour mot, 30 à 60 secondes parlé",
    "visuels": "description précise de ce qu'on voit à l'écran",
    "cta": "appel à l'action final",
    "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
    "duree_secondes": 45
  }
]`;

async function fetchDailyTrendsFr(): Promise<string[]> {
  const serpApiKey = process.env.SERPAPI_KEY;
  if (!serpApiKey) {
    throw new Error('SERPAPI_KEY manquante.');
  }

  const queries = [
    'tendances marketing digital france entrepreneurs',
    'tiktok france business en ligne',
    'outils IA productivite entrepreneurs solo france'
  ];

  const trendLines: string[] = [];

  for (const query of queries) {
    try {
      const {data} = await axios.get('https://serpapi.com/search.json', {
        params: {
          api_key: serpApiKey,
          q: query,
          gl: 'fr',
          hl: 'fr',
          num: 5
        },
        timeout: 15000
      });

      const organicResults = (data.organic_results ?? []) as Array<{title?: string; snippet?: string}>;
      for (const result of organicResults.slice(0, 5)) {
        trendLines.push(`${result.title ?? 'Sans titre'} — ${result.snippet ?? 'Sans résumé'}`);
      }
    } catch (error) {
      console.error(`[generateScript] Erreur SerpAPI pour la requête "${query}"`, error);
      throw error;
    }
  }

  if (trendLines.length === 0) {
    throw new Error('Aucune tendance récupérée via SerpAPI.');
  }

  return trendLines;
}

export async function generateScript(): Promise<TikTokScript[]> {
  try {
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicApiKey) {
      throw new Error('ANTHROPIC_API_KEY manquante.');
    }

    const trends = await fetchDailyTrendsFr();
    const trendsText = trends.map((trend, idx) => `${idx + 1}. ${trend}`).join('\n');

    const dmswMustMention = [
      'Livraison en 10 jours',
      'Site web sur-mesure (design + rédaction + SEO + mise en ligne)',
      'Zéro effort client (on gère tout)',
      'NFC + fiches Google (selon pack)',
      'Un pack DMSW (Connect / Restaurant Smart / Business Digital)',
      'Preuves / avis clients DMSW (ex : SmashCasa, Villa Pearl, Luxgreen)'
    ].join(', ');

    const response = await axios.post(
      ANTHROPIC_URL,
      {
        model: CLAUDE_MODEL,
        max_tokens: 2000,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `Tendances du jour (France):\n${trendsText}\n\nContraintes DMSW (obligatoire): pour CHACUN des 3 scripts, mentionne au moins un élément DMSW parmi: ${dmswMustMention}. La mention peut être dans le hook, le script ou le CTA. Les vidéos ne montrent jamais de visage: texte animé, screen recording ou voix off uniquement.`
          }
        ]
      },
      {
        headers: {
          'x-api-key': anthropicApiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        timeout: 40000
      }
    );

    const raw = response.data.content[0].text;
    const scripts: TikTokScript[] = JSON.parse(raw);

    if (!Array.isArray(scripts) || scripts.length !== 3) {
      throw new Error(`Réponse Claude invalide: ${scripts.length} scripts reçus au lieu de 3.`);
    }

    console.log('[generateScript] 3 scripts générés avec succès.');
    return scripts;
  } catch (error) {
    console.error('[generateScript] Échec de génération des scripts', error);
    throw error;
  }
}

async function main(): Promise<void> {
  try {
    const scripts = await generateScript();
    console.log(JSON.stringify(scripts, null, 2));
  } catch (error) {
    console.error('[generateScript] Arrêt du script suite à une erreur.', error);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  void main();
}
