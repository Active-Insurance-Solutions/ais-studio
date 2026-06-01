// One-shot uploader for tight-cropped carrier logos (transparent margins removed).
// Run: pnpm exec sanity exec upload-trimmed-logos.ts --with-user-token
//
// Reads from /tmp/ais-assets-trimmed (produced by a Python PIL trim pass).
// Skips Companion Life — already replaced by the client with their own tight crop.

import { getCliClient } from 'sanity/cli';
import { readFileSync } from 'fs';
import { join } from 'path';

const client = getCliClient();

if (client.config().dataset === 'production') {
  console.error('Refusing to upload to production.');
  process.exit(1);
}

const ASSET_DIR = '/tmp/ais-assets-trimmed';

const files: Array<{ key: string; filename: string }> = [
  { key: 'logoKansasCityLife',   filename: 'logo-kansas-city-life.png' },
  { key: 'logoDeltaDental',      filename: 'logo-delta-dental.png' },
  { key: 'logoRockyMountain',    filename: 'logo-rocky-mountain.png' },
  { key: 'logoSelectHealth',     filename: 'logo-select-health.png' },
  { key: 'logoCigna',            filename: 'logo-cigna.png' },
  { key: 'logoAnthem',           filename: 'logo-anthem.png' },
  { key: 'logoMetLife',          filename: 'logo-metlife.png' },
  { key: 'logoUnitedHealthcare', filename: 'logo-unitedhealthcare.png' },
  { key: 'logoVsp',              filename: 'logo-vsp.png' },
  { key: 'logoAetna',            filename: 'logo-aetna.png' },
];

async function uploadAll() {
  const results: Record<string, string> = {};
  for (const f of files) {
    const buffer = readFileSync(join(ASSET_DIR, f.filename));
    const asset = await client.assets.upload('image', buffer, { filename: f.filename });
    results[f.key] = asset._id;
    console.log(`✓ ${f.key.padEnd(28)} → ${asset._id}`);
  }
  console.log('\n─── Paste into seed.ts ASSETS block ───');
  for (const [k, v] of Object.entries(results)) {
    console.log(`  ${k}: '${v}',`);
  }
}

uploadAll().catch((err: Error) => {
  console.error('Upload failed:', err.message);
  process.exit(1);
});
