// HomeLedger entry for best-household-budget-site-20261126-1457 (Node 22,
// standard library only). The site is plain static files in app/ and the
// screenshots in screenshots/; this program hands them in by copying both
// folders to /output and writing /output/dossier.json with the vendored
// make.fun dossier builder. vendor/makefun-frontend.ts is the kit's copy
// and must stay exactly as it is: the scorer rebuilds the dossier with its
// own copy and compares the two byte for byte.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function handIn() {
  mkdirSync(outputDir, { recursive: true });

  // The site itself, exactly as it sits in the repository.
  cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });

  // The screenshots, if the folder exists (it always does in this repo).
  const shotsDir = join(repoRoot, 'screenshots');
  mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
  if (existsSync(shotsDir)) {
    cpSync(shotsDir, join(outputDir, 'screenshots'), { recursive: true });
  }

  // The dossier the judge reads: screenshots, first-load totals and the
  // site's source. The caps mirror the scorer's own limits, so a build that
  // passes here is shaped the way the gate expects.
  writeFileSync(
    join(outputDir, 'dossier.json'),
    buildDossier(outputDir, {
      text_max_bytes: 163840,
      screenshots: { max: 4, max_bytes: 262144 },
      app_max_files: 993,
      app_max_bytes: 16777216,
    }),
  );
}

handIn();
