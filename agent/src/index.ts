import 'dotenv/config';
import express, { Request, Response } from 'express';
import { runAgent } from './agent.js';

const PORT = Number(process.env.AGENT_PORT ?? 3100);

// process.argv peut inclure des fragments si collé depuis zsh — on nettoie
const args = process.argv.slice(2).filter(a => !a.startsWith('#'));

// ─── Validation des variables d'environnement ────────────────────────────────

const REQUIRED_VARS: Record<string, string> = {
  ANTHROPIC_API_KEY: 'Clé API Anthropic (console.anthropic.com)',
  SERPAPI_KEY:       'Clé SerpAPI (serpapi.com)',
  NOTION_API_KEY:    'Clé API Notion (notion.so/my-integrations)',
  NOTION_DATABASE_ID:'ID de la base Notion',
  SMTP_USER:         'Email SMTP (ex: contact@dmsw.fr)',
  SMTP_PASS:         'Mot de passe application Google SMTP',
};

function checkEnv(): boolean {
  const missing = Object.entries(REQUIRED_VARS)
    .filter(([k]) => !process.env[k] || process.env[k]!.includes('...'));

  if (missing.length === 0) return true;

  console.log('\n⚠️  Variables manquantes dans .env :\n');
  missing.forEach(([k, desc]) => {
    console.log(`   ${k.padEnd(22)} ← ${desc}`);
  });
  console.log('\n   → Édite /Users/imran/dmsw-tiktok/agent/.env\n');
  return false;
}

// ─── Mode CLI standalone ──────────────────────────────────────────────────────
// Usage : npm run generate  (ou  tsx src/index.ts --standalone)

if (args.includes('--standalone') || process.env.AGENT_MODE === 'standalone') {
  console.log('');
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║   DMSW — Agent TikTok IA  (mode standalone)  ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log('');

  if (!checkEnv()) process.exit(1);

  runAgent()
    .then(result => {
      console.log('');
      console.log('─── Résultat ────────────────────────────────');
      console.log(JSON.stringify(result, null, 2));
      process.exit(result.success ? 0 : 1);
    })
    .catch(err => {
      console.error('Erreur fatale :', err);
      process.exit(1);
    });

// ─── Mode serveur HTTP (défaut) ───────────────────────────────────────────────
// Utilisé par n8n via un node "HTTP Request" ou "Execute Command"

} else {
  checkEnv(); // Affiche les warnings mais ne bloque pas le serveur
  const app = express();
  app.use(express.json());

  // ── Health check ──────────────────────────────────────────────────────────
  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'dmsw-tiktok-agent', ts: new Date().toISOString() });
  });

  // ── Trigger manuel (depuis n8n ou Postman) ────────────────────────────────
  // POST /generate  { "trigger": "..." }   (trigger est optionnel)
  app.post('/generate', async (req: Request, res: Response) => {
    const trigger = (req.body as { trigger?: string }).trigger;

    console.log(`[${new Date().toISOString()}] POST /generate — démarrage agent`);

    // Réponse immédiate si async demandé
    const async_ = (req.query['async'] === 'true');
    if (async_) {
      res.json({ status: 'accepted', message: 'Agent démarré en arrière-plan' });
      runAgent(trigger).then(r => {
        console.log(`[agent] terminé — succès: ${r.success}, durée: ${r.durationMs}ms`);
      }).catch(console.error);
      return;
    }

    // Réponse synchrone (attend la fin)
    try {
      const result = await runAgent(trigger);
      res.status(result.success ? 200 : 500).json(result);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ success: false, error: msg });
    }
  });

  // ── Webhook n8n (déclenchement cron depuis Bloc 1) ────────────────────────
  // Compatible avec le node "HTTP Request" de n8n
  app.post('/webhook/n8n', async (req: Request, res: Response) => {
    // Accusé de réception immédiat pour n8n
    res.json({ received: true, ts: new Date().toISOString() });

    // Exécution en arrière-plan
    runAgent()
      .then(r => console.log(`[webhook] terminé — succès: ${r.success}`))
      .catch(console.error);
  });

  app.listen(PORT, () => {
    console.log('');
    console.log('╔══════════════════════════════════════════════╗');
    console.log(`║   DMSW — Agent TikTok IA   :${PORT}           ║`);
    console.log('╠══════════════════════════════════════════════╣');
    console.log('║  GET  /health            → Statut            ║');
    console.log('║  POST /generate          → Lancer l\'agent    ║');
    console.log('║  POST /generate?async=true → Sans attendre   ║');
    console.log('║  POST /webhook/n8n       → Trigger n8n       ║');
    console.log('╚══════════════════════════════════════════════╝');
    console.log('');
  });
}
