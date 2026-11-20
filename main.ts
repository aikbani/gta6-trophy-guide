// Leonida Platinum Atlas — make.fun entrypoint (Node 22, erasable TypeScript).
// Hands the guide in: copies app/ and screenshots/ from this repository into
// the output directory, then writes /output/dossier.json with buildDossier
// from the kit's vendor/makefun-frontend.ts (the scorer's own copy).
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output.
import { cpSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const REPO_DIR = resolve(fileURLToPath(new URL('.', import.meta.url)));
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR
  ? resolve(process.env.MAKEFUN_OUTPUT_DIR)
  : '/output';

const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 48 * 1024 * 1024,
  app_path_max_bytes: 1000,
};

function countFiles(dir: string): number {
  let n = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    n += entry.isDirectory() ? countFiles(full) : 1;
  }
  return n;
}

function main(): void {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  const appSource = join(REPO_DIR, 'app');
  const appDest = join(OUTPUT_DIR, 'app');
  cpSync(appSource, appDest, { recursive: true });
  console.log(`copied app/: ${countFiles(appDest)} files`);

  const shotsSource = join(REPO_DIR, 'screenshots');
  const shotsDest = join(OUTPUT_DIR, 'screenshots');
  cpSync(shotsSource, shotsDest, { recursive: true });
  const shots = readdirSync(shotsDest).filter((name) => {
    const st = statSync(join(shotsDest, name));
    return st.isFile() && !name.startsWith('.');
  });
  console.log(`copied screenshots/: ${shots.join(', ')}`);

  const dossier = buildDossier(OUTPUT_DIR, DOSSIER_CAPS);
  writeFileSync(join(OUTPUT_DIR, 'dossier.json'), dossier);
  console.log(`wrote dossier.json: ${Buffer.byteLength(dossier, 'utf8')} bytes`);
}

main();
