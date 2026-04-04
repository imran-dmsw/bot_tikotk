/**
 * Test Make.com webhook — Bloc 4
 * Usage : node node_modules/.bin/tsx scripts/test-make.ts
 *
 * Envoie un payload de test au webhook Make sans upload vidéo réel.
 */

import 'dotenv/config';

const WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL ?? '';

if (!WEBHOOK_URL) {
  console.error('\n❌  MAKE_WEBHOOK_URL manquant dans .env\n');
  process.exit(1);
}

const payload = {
  video_url:    'https://file.io/test-dmsw-video.mp4',
  caption:      'Votre site est trop beau pour vendre 🎯\n\nOn transforme votre vitrine en machine à vendre.\n\n#MarketingDigital #DMSW #TikTokFrance #SEO #ConversionRate',
  hook:         'Votre site est trop beau pour vendre',
  hashtags:     ['#MarketingDigital', '#DMSW', '#TikTokFrance', '#SEO', '#ConversionRate'],
  scheduled_at: null,
  source:       'dmsw-tiktok-agent',
  filename:     'votre_site_est_trop_beau_pour_vendre.mp4',
  timestamp:    new Date().toISOString(),
};

console.log('\n📡  Test webhook Make.com...');
console.log(`   URL : ${WEBHOOK_URL.slice(0, 50)}...`);
console.log(`   Payload : ${JSON.stringify(payload, null, 2)}\n`);

const res = await fetch(WEBHOOK_URL, {
  method:  'POST',
  headers: { 'Content-Type': 'application/json' },
  body:    JSON.stringify(payload),
});

if (res.ok) {
  const body = await res.text();
  console.log(`✅  Webhook reçu par Make ! (HTTP ${res.status})`);
  console.log(`   Réponse : ${body}\n`);
  console.log('🎉  Vérifie dans Make → ton scénario doit afficher "1 operation"');
} else {
  console.error(`❌  Erreur HTTP ${res.status}: ${await res.text()}\n`);
  process.exit(1);
}
