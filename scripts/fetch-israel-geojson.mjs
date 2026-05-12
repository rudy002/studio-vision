// Run once: node scripts/fetch-israel-geojson.mjs
// Downloads precise GeoJSON borders and saves them locally in public/

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '../public');

console.log('Downloading countries.geojson (~23MB)...');

const res = await fetch(
  'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson'
);
const data = await res.json();

const israel = data.features.find(f => f.properties.name === 'Israel');
if (!israel) throw new Error('Israel not found');

const westBank = data.features.find(f =>
  f.properties.name === 'Palestine' ||
  f.properties['ISO3166-1-Alpha-2'] === 'PS'
);

writeFileSync(join(publicDir, 'israel.geojson'), JSON.stringify(israel));
console.log('✓ public/israel.geojson saved');

if (westBank) {
  writeFileSync(join(publicDir, 'west-bank.geojson'), JSON.stringify(westBank));
  console.log('✓ public/west-bank.geojson saved');
} else {
  console.log('⚠ West Bank feature not found in dataset');
}
