// Exports every translatable line into translations.csv, one column per language.
// Run from the project folder:  node scripts/export-strings.mjs
import { build } from 'esbuild';
import { writeFileSync } from 'node:fs';

const result = await build({
  entryPoints: ['src/i18n/locales.ts'],
  bundle: true,
  format: 'esm',
  platform: 'node',
  write: false,
  logLevel: 'silent',
});
const code = result.outputFiles[0].text;
const mod = await import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'));
const dictionaries = mod.DICTIONARIES;

const languages = ['en', 'fr', 'ha', 'ig', 'yo'];
const names = { en: 'English', fr: 'French', ha: 'Hausa', ig: 'Igbo', yo: 'Yoruba' };

const cell = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
const keys = Object.keys(dictionaries.en);

const rows = [['Key', ...languages.map((l) => names[l])].map(cell).join(',')];
for (const key of keys) {
  rows.push([key, ...languages.map((l) => dictionaries[l]?.[key] ?? '')].map(cell).join(','));
}

// The BOM at the start lets Excel read accents and special letters correctly.
writeFileSync('translations.csv', '\uFEFF' + rows.join('\r\n'), 'utf8');

console.log(`Wrote translations.csv with ${keys.length} lines.`);
for (const l of languages.slice(1)) {
  const missing = keys.filter((k) => !dictionaries[l]?.[k]).length;
  console.log(`${names[l]}: ${keys.length - missing} translated, ${missing} still to do`);
}