import { loadFont as loadSyne }  from '@remotion/google-fonts/Syne';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';

const { waitUntilDone: waitSyne }  = loadSyne({ weights: ['800'] });
const { waitUntilDone: waitInter } = loadInter({ weights: ['400', '600', '700'] });

/**
 * À appeler dans delayRender() / continueRender() si nécessaire.
 * En pratique, Remotion gère le chargement automatiquement au render CLI.
 */
export async function waitForFonts(): Promise<void> {
  await Promise.all([waitSyne(), waitInter()]);
}
