import { spawn }     from 'child_process';
import { writeFile } from 'fs/promises';
import { join, resolve } from 'path';
import type { RenderInput } from '../types.js';

const REMOTION_DIR = resolve(process.env.REMOTION_DIR ?? '../remotion');
const REMOTION_OUT = resolve(process.env.REMOTION_OUT ?? '../output');
const WEBHOOK_URL  = process.env.RENDER_WEBHOOK ?? '';

// Node.js bin path — nécessaire car tsx/npx ne sont pas dans le PATH du processus agent
const NODE_BIN = resolve(process.execPath, '..'); // /path/to/node/.../bin

/**
 * Déclenche un rendu Remotion via scripts/render.ts ou webhook.
 *
 * Mode CLI  : npx tsx scripts/render.ts --file=props_N.json
 * Mode Hook : POST sur RENDER_WEBHOOK avec le payload JSON
 */
export async function triggerVideoRender(input: RenderInput): Promise<string> {
  const slug    = input.hook.slice(0, 40).replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  const outFile = `${slug}.mp4`;

  // ── Mode webhook (n8n / service distant) ────────────────────────────────
  if (WEBHOOK_URL) {
    try {
      const res = await fetch(WEBHOOK_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ ...input, outFile }),
      });
      const body = await res.text();
      return JSON.stringify({ success: true, mode: 'webhook', status: res.status, body });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return JSON.stringify({ success: false, mode: 'webhook', error: msg });
    }
  }

  // ── Mode CLI — appel via scripts/render.ts ───────────────────────────────
  // Écrire les props (format ScriptProps + format) dans un JSON temporaire
  const propsPath = join(REMOTION_DIR, `props_${input.script_id}.json`);
  await writeFile(propsPath, JSON.stringify(input, null, 2));

  return new Promise(resolve_ => {
    // tsx est dans le node_modules/.bin du projet Remotion
    const tsxBin  = join(REMOTION_DIR, 'node_modules', '.bin', 'tsx');
    const script  = join(REMOTION_DIR, 'scripts', 'render.ts');

    const child = spawn(tsxBin, [script, `--file=${propsPath}`], {
      cwd:   REMOTION_DIR,
      stdio: 'pipe',
      env:   {
        ...process.env,
        PATH: `${NODE_BIN}:${process.env.PATH ?? ''}`,
      },
    });

    let stdout = '';
    let stderr = '';
    child.stdout.on('data', d => { stdout += String(d); process.stdout.write(String(d)); });
    child.stderr.on('data', d => { stderr += String(d); });

    child.on('close', code => {
      const absOut = join(REMOTION_OUT, outFile);
      if (code === 0) {
        resolve_(JSON.stringify({ success: true, mode: 'cli', outFile: absOut }));
      } else {
        resolve_(JSON.stringify({
          success: false,
          mode:    'cli',
          code,
          outFile: absOut,
          note:    'Render échoué — voir stderr pour détails',
          stderr:  stderr.slice(-800),
        }));
      }
    });

    // Timeout 15 min (chrome download peut être lent la 1ère fois)
    setTimeout(() => {
      child.kill();
      resolve_(JSON.stringify({ success: false, mode: 'cli', error: 'Timeout 15min dépassé' }));
    }, 15 * 60_000);
  });
}
