import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import {cp, mkdir} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import 'dotenv/config';

export async function renderVideo(props: {
  hook: string;
  revelation: string;
  cta: string;
  voiceOverPath?: string;
  outputPath: string;
}): Promise<void> {
  const projectRoot = process.cwd();
  const entryPoint = resolve(projectRoot, 'src/remotion/index.ts');
  const outputPath = resolve(projectRoot, props.outputPath);
  const publicAudioPath = resolve(projectRoot, 'public/voiceover.mp3');

  try {
    await mkdir(dirname(outputPath), {recursive: true});

    if (props.voiceOverPath) {
      await mkdir(resolve(projectRoot, 'public'), {recursive: true});
      await cp(resolve(projectRoot, props.voiceOverPath), publicAudioPath);
      console.log(`[renderVideo] Voice over copiée vers ${publicAudioPath}`);
    }

    const bundleLocation = await bundle({
      entryPoint
    });

    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: 'DMSWTikTok',
      inputProps: {
        hook: props.hook,
        revelation: props.revelation,
        cta: props.cta
      }
    });

    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: 'h264',
      crf: 16,
      outputLocation: outputPath,
      inputProps: {
        hook: props.hook,
        revelation: props.revelation,
        cta: props.cta
      },
      onProgress: ({progress}) => {
        console.log(`[renderVideo] Progression: ${Math.round(progress * 100)}%`);
      }
    });

    console.log(`[renderVideo] Rendu terminé: ${outputPath}`);
  } catch (error) {
    console.error('[renderVideo] Échec du rendu vidéo', error);
    throw error;
  }
}

async function main(): Promise<void> {
  try {
    await renderVideo({
      hook: 'Ce site a été livré en 7 jours.',
      revelation: 'Livraison 10 jours — Zéro effort',
      cta: 'Audit gratuit — dmsw.fr',
      outputPath: 'out/dmsw-test.mp4'
    });
  } catch (error) {
    console.error('[renderVideo] Arrêt du script suite à une erreur.');
    process.exitCode = 1;
  }
}

if (require.main === module) {
  void main();
}
