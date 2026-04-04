/**
 * Test standalone ElevenLabs — Bloc 3
 * Usage : node node_modules/.bin/tsx scripts/test-elevenlabs.ts
 *
 * Génère un fichier remotion/public/voiceover_test.mp3
 * et affiche les infos (taille, durée de génération).
 */

import 'dotenv/config';
import { writeFile, mkdir } from 'fs/promises';
import { join, resolve, dirname } from 'path';
import { fileURLToPath }          from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

// ─── Config ────────────────────────────────────────────────────────────────

const API_KEY  = process.env.ELEVENLABS_API_KEY  ?? '';
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID ?? 'XB0fDUnXU5powFXDhCwa';
const MODEL_ID = 'eleven_multilingual_v2';

const REMOTION_PUBLIC = resolve(__dirname, '../../remotion/public');

// ─── Texte de test ─────────────────────────────────────────────────────────

const TEST_SCRIPT = `
Vous perdez des clients chaque jour sans le savoir.
Votre site est trop lent, trop flou, pas optimisé.
Chez DMSW, on transforme votre présence digitale en machine à vendre.
Sites, réseaux, stratégie — on s'occupe de tout.
Contactez-nous sur dmsw.fr.
`.trim();

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🎙️  Test ElevenLabs — Bloc 3\n');

  if (!API_KEY) {
    console.error('❌  ELEVENLABS_API_KEY manquant dans .env');
    console.error('   → Récupère ta clé sur elevenlabs.io → Profile → API Keys\n');
    process.exit(1);
  }

  console.log(`✅  Clé trouvée : ${API_KEY.slice(0, 8)}...`);
  console.log(`🗣️  Voice ID    : ${VOICE_ID}  (Charlotte FR)`);
  console.log(`📝  Texte       : ${TEST_SCRIPT.length} caractères\n`);

  const started = Date.now();
  console.log('⏳  Appel ElevenLabs API...');

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key':   API_KEY,
        'Content-Type': 'application/json',
        'Accept':       'audio/mpeg',
      },
      body: JSON.stringify({
        text:     TEST_SCRIPT,
        model_id: MODEL_ID,
        voice_settings: {
          stability:         0.50,
          similarity_boost:  0.75,
          style:             0.30,
          use_speaker_boost: true,
        },
      }),
    },
  );

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    console.error(`\n❌  Erreur HTTP ${res.status}:`);
    console.error(errText.slice(0, 500));
    process.exit(1);
  }

  const buffer  = Buffer.from(await res.arrayBuffer());
  const elapsed = Date.now() - started;

  // Sauvegarder
  await mkdir(REMOTION_PUBLIC, { recursive: true });
  const outPath = join(REMOTION_PUBLIC, 'voiceover_test.mp3');
  await writeFile(outPath, buffer);

  console.log('\n✅  Voix générée avec succès !');
  console.log(`   📦  Taille    : ${(buffer.length / 1024).toFixed(1)} KB`);
  console.log(`   ⏱️  Durée API  : ${elapsed}ms`);
  console.log(`   💾  Fichier   : ${outPath}\n`);
  console.log('🎧  Écoute le fichier pour vérifier la qualité.');
  console.log('   open ' + outPath + '\n');
}

main().catch(err => {
  console.error('\n💥  Erreur inattendue :', err.message ?? err);
  process.exit(1);
});
