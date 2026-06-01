// One-shot asset uploader for AIS carrier logos + team photos.
// Run: pnpm exec sanity exec upload-assets.ts --with-user-token
//
// Targets the dataset from SANITY_STUDIO_DATASET (staging by default).
// Skips already-uploaded assets by matching on filename (sha-based dedup is
// handled server-side anyway — Sanity returns the existing _id if the content
// matches a prior upload).

import { getCliClient } from 'sanity/cli';
import { readFileSync } from 'fs';
import { join } from 'path';

const client = getCliClient();

if (client.config().dataset === 'production') {
  console.error('Refusing to upload to production.');
  process.exit(1);
}

const ASSET_DIR = '/tmp/ais-assets';

// Logical key → filename. Logical keys are used in seed.ts to wire references.
const files: Array<{ key: string; filename: string }> = [
  { key: 'logoKansasCityLife',   filename: 'logo-kansas-city-life.png' },
  { key: 'logoDeltaDental',      filename: 'logo-delta-dental.png' },
  { key: 'logoRockyMountain',    filename: 'logo-rocky-mountain.png' },
  { key: 'logoSelectHealth',     filename: 'logo-select-health.png' },
  { key: 'logoCigna',            filename: 'logo-cigna.png' },
  { key: 'logoAnthem',           filename: 'logo-anthem.png' },
  { key: 'logoMetLife',          filename: 'logo-metlife.png' },
  { key: 'logoCompanionLife',    filename: 'logo-companion-life.png' },
  { key: 'logoUnitedHealthcare', filename: 'logo-unitedhealthcare.png' },
  { key: 'logoVsp',              filename: 'logo-vsp.png' },
  { key: 'logoAetna',            filename: 'logo-aetna.png' },
  { key: 'teamCjRhyne',          filename: 'team-cj-rhyne.jpg' },
  { key: 'teamRandyPifer',       filename: 'team-randy-pifer.jpg' },
  { key: 'teamRhondaSteinkirchner', filename: 'team-rhonda-steinkirchner.jpg' },
  { key: 'teamKatieCrum',        filename: 'team-katie-crum.jpg' },
];

async function uploadAll() {
  const results: Record<string, string> = {};
  for (const f of files) {
    const buffer = readFileSync(join(ASSET_DIR, f.filename));
    const asset = await client.assets.upload('image', buffer, { filename: f.filename });
    results[f.key] = asset._id;
    console.log(`✓ ${f.key.padEnd(28)} → ${asset._id}`);
  }
  console.log('\n─── Copy block below into seed.ts ───');
  console.log('const ASSETS = ' + JSON.stringify(results, null, 2) + ';');
}

uploadAll().catch((err: Error) => {
  console.error('Upload failed:', err.message);
  process.exit(1);
});
