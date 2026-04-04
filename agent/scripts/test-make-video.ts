/**
 * Test complet Make.com — upload vidéo réelle + webhook
 * Usage : node node_modules/.bin/tsx scripts/test-make-video.ts
 */
import 'dotenv/config';
import { publishToMake } from '../src/tools/make.js';

console.log('\n🚀 Test publication complète Make.com\n');

const result = JSON.parse(await publishToMake({
  video_path:  '/Users/imran/dmsw-tiktok/output/votre_site_est_trop_beau_pour_vendre.mp4',
  caption:
`Votre site est trop beau pour vendre 🎯

Un beau design ne suffit pas. Si vos visiteurs partent sans acheter, c'est le parcours client qui est cassé.

Chez DMSW, on transforme votre site en machine à vendre.
✅ Pages de vente optimisées
✅ Tunnel client fluide
✅ Résultats mesurables en 30 jours

👉 dmsw.fr

#MarketingDigital #DMSW #SiteWeb #ConversionRate #TikTokFrance`,
  hook:     'Votre site est trop beau pour vendre',
  hashtags: ['#MarketingDigital', '#DMSW', '#SiteWeb', '#ConversionRate', '#TikTokFrance'],
}));

if (result.success) {
  console.log('✅  Pipeline complet réussi !');
  console.log(`   📦  Vidéo uploadée  : ${result.video_url}`);
  console.log(`   📡  Webhook envoyé  : Make a reçu les données`);
  console.log(`   ⏱️   Durée totale    : ${result.elapsed_ms}ms\n`);
  console.log('🎬  Vérifie dans Make → tu devrais voir 1 nouvelle opération avec la vraie URL vidéo');
} else {
  console.error('❌  Erreur :', result.error);
  process.exit(1);
}
