/**
 * Helper — Liste les profils connectés à ton compte Buffer
 * Usage : node node_modules/.bin/tsx scripts/get-buffer-profiles.ts
 *
 * → Copie les IDs TikTok et Instagram dans .env → BUFFER_PROFILE_IDS
 */

import 'dotenv/config';
import { getBufferProfiles } from '../src/tools/buffer.js';

const result = JSON.parse(await getBufferProfiles());

if (!result.success) {
  console.error('\n❌ Erreur :', result.error);
  console.error('\n   → Va sur buffer.com → Settings → Access Token');
  console.error('   → Copie le token dans .env → BUFFER_TOKEN\n');
  process.exit(1);
}

console.log('\n📋 Profils connectés à Buffer :\n');
for (const p of result.profiles) {
  console.log(`   ${p.platform.padEnd(12)} ${p.account.padEnd(25)} id: ${p.id}`);
}
console.log('\n💡 Copie les IDs voulus dans .env :');
console.log('   BUFFER_PROFILE_IDS=id_tiktok,id_instagram\n');
