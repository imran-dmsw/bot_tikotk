import type { SearchResult } from '../types.js';

const SERPAPI_KEY = process.env.SERPAPI_KEY!;

async function searchSingle(query: string, index: number): Promise<SearchResult> {
  const params = new URLSearchParams({
    q:       query,
    api_key: SERPAPI_KEY,
    hl:      'fr',
    gl:      'fr',
    num:     '6',
    engine:  'google',
  });

  const url = `https://serpapi.com/search.json?${params}`;
  const res  = await fetch(url);

  if (!res.ok) {
    throw new Error(`SerpAPI erreur ${res.status} pour "${query}"`);
  }

  const data = await res.json() as Record<string, unknown>;
  const sources = [
    'TikTok Tendances 2026',
    'Problèmes Entrepreneurs Solo',
    'Agence Web TikTok Idées',
  ];

  const resultats: SearchResult['resultats'] = [];

  // Answer box en tête si dispo
  if (data.answer_box && typeof data.answer_box === 'object') {
    const box = data.answer_box as Record<string, string>;
    resultats.push({
      titre:   box.title   || 'Encart vedette',
      extrait: box.snippet || box.answer || '',
    });
  }

  // Résultats organiques
  if (Array.isArray(data.organic_results)) {
    (data.organic_results as Array<Record<string, string>>)
      .slice(0, 4)
      .forEach(r => resultats.push({ titre: r.title || '', extrait: r.snippet || '' }));
  }

  // Questions associées
  if (Array.isArray(data.related_questions)) {
    (data.related_questions as Array<Record<string, string>>)
      .slice(0, 2)
      .forEach(q => resultats.push({ titre: q.question || '', extrait: q.snippet || '' }));
  }

  return { source: sources[index] ?? `Recherche ${index + 1}`, resultats };
}

/**
 * Effectue plusieurs recherches SerpAPI en parallèle.
 * Retourne un JSON résumant les résultats de toutes les requêtes.
 */
export async function searchWeb(queries: string[]): Promise<string> {
  if (!SERPAPI_KEY) {
    return JSON.stringify({ error: 'SERPAPI_KEY manquante' });
  }

  try {
    const results = await Promise.all(
      queries.map((q, i) => searchSingle(q, i)),
    );

    return JSON.stringify({
      success:    true,
      recherches: results,
      total:      results.reduce((acc, r) => acc + r.resultats.length, 0),
    }, null, 2);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return JSON.stringify({ success: false, error: msg });
  }
}
