/**
 * Script de render CLI — appelé par l'agent (tools/remotion.ts)
 * ou directement : tsx scripts/render.ts --id=1 --format=texte_anime
 *
 * Usage :
 *   tsx scripts/render.ts --props='{"hook":"...","bullets":[...],...}'
 *   tsx scripts/render.ts --file=props_1.json
 */
import 'dotenv/config';
import { bundle }  from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { readFileSync } from 'fs';
import { join, resolve } from 'path';
import type { ScriptProps, ScriptFormat } from '../src/lib/types.js';

const FORMAT_TO_COMPOSITION: Record<ScriptFormat, string> = {
  texte_anime:      'TextAnimation',
  screen_recording: 'ScreenRecording',
  voix_off:         'VoiceOver',
};

async function main() {
  const args = Object.fromEntries(
    process.argv.slice(2)
      .filter(a => a.startsWith('--'))
      .map(a => {
        const [k, ...v] = a.slice(2).split('=');
        return [k, v.join('=')];
      })
  );

  // Charger les props
  let props: ScriptProps & { format?: ScriptFormat };

  if (args['file']) {
    const content = readFileSync(resolve(args['file']), 'utf-8');
    props = JSON.parse(content) as ScriptProps & { format?: ScriptFormat };
  } else if (args['props']) {
    props = JSON.parse(args['props']) as ScriptProps & { format?: ScriptFormat };
  } else {
    console.error('Usage: tsx scripts/render.ts --file=props_1.json');
    console.error('       tsx scripts/render.ts --props=\'{"hook":"...", ...}\'');
    process.exit(1);
  }

  const format      = (props.format ?? 'texte_anime') as ScriptFormat;
  const composition = FORMAT_TO_COMPOSITION[format] ?? 'TextAnimation';
  const slug        = props.hook.slice(0, 40).replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  const outFile     = resolve(join('..', 'output', `${slug}.mp4`));

  console.log(`\n🎬 Render : ${composition}`);
  console.log(`   Hook    : ${props.hook}`);
  console.log(`   Durée   : ${props.duree_secondes}s`);
  console.log(`   Output  : ${outFile}\n`);

  // Bundle le projet Remotion
  const bundled = await bundle({
    entryPoint: resolve('./src/index.ts'),
    onProgress: p => process.stdout.write(`\r   Bundle : ${p}%`),
  });
  console.log('');

  // Sélectionner la composition avec les props
  const comp = await selectComposition({
    serveUrl: bundled,
    id:       composition,
    inputProps: props,
  });

  // Lancer le rendu
  await renderMedia({
    composition:  comp,
    serveUrl:     bundled,
    codec:        'h264',
    outputLocation: outFile,
    inputProps:   props,
    onProgress:   ({ progress }) => {
      process.stdout.write(`\r   Render  : ${(progress * 100).toFixed(1)}%`);
    },
  });

  console.log(`\n\n✅ Vidéo générée : ${outFile}\n`);
}

main().catch(err => {
  console.error('\n❌ Erreur render :', err);
  process.exit(1);
});
