// Converts the fixed Tailwind colors used by the old screens into the app's theme tokens.
// Only class names change. Run with --check first to see what would change without writing anything.
//   node scripts/theme-convert.mjs --check src/components/MedicationTracker.tsx
//   node scripts/theme-convert.mjs src/components/MedicationTracker.tsx src/components/AppointmentTracker.tsx
// A folder can be given instead of a file, and every .tsx file inside it is used.
// A file that has the words "theme-skip" in a comment is left alone (for screens that keep their own colors).
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const B = '(?<![\\w-])'; // the class name must not continue to the left
const E = '(?![\\w-])'; // ...or to the right (a "/60" opacity suffix is fine)
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const plain = (from, to) => [new RegExp(B + esc(from) + E, 'g'), to];

// Order matters: the more specific rules come first.
const RULES = [
  // surfaces
  plain('bg-[#0B132B]', 'bg-surface'),
  plain('bg-[#070D1F]', 'bg-canvas'),
  plain('hover:bg-slate-900', 'hover:bg-canvas'),
  plain('bg-slate-950', 'bg-canvas'),
  plain('bg-slate-900', 'bg-surface'),
  plain('bg-slate-800', 'bg-line/40'),
  plain('bg-slate-700', 'bg-line/70'),
  // borders
  plain('border-slate-700', 'border-line'),
  plain('border-slate-800', 'border-line'),
  plain('border-slate-600', 'border-muted/40'),
  plain('border-slate-500', 'border-muted/50'),
  plain('border-slate-400', 'border-muted/60'),
  // text
  plain('placeholder-slate-400', 'placeholder-muted'),
  plain('text-slate-100', 'text-ink'),
  plain('text-slate-200', 'text-ink'),
  plain('text-slate-300', 'text-ink/80'),
  plain('text-slate-400', 'text-muted'),
  // coloured text
  plain('text-emerald-100', 'text-ink'),
  plain('text-emerald-200', 'text-tone-green'),
  plain('text-emerald-300', 'text-tone-green'),
  plain('text-teal-200', 'text-brand'),
  plain('text-teal-300', 'text-brand'),
  plain('text-cyan-100', 'text-ink'),
  plain('text-cyan-200', 'text-tone-cyan'),
  plain('text-cyan-300', 'text-tone-cyan'),
  plain('text-amber-100', 'text-ink'),
  plain('text-amber-200', 'text-tone-amber'),
  plain('text-amber-300', 'text-tone-amber'),
  plain('text-red-50', 'text-ink'),
  plain('text-red-100', 'text-ink'),
  plain('text-red-200', 'text-tone-red'),
  plain('text-red-300', 'text-tone-red'),
  // tinted boxes (solid buttons such as bg-emerald-500 or bg-red-600 are left alone)
  [new RegExp(B + 'bg-red-950(?:/\\d+)?' + E, 'g'), 'bg-danger/15'],
  [new RegExp(B + 'bg-amber-950(?:/\\d+)?' + E, 'g'), 'bg-warn/15'],
  [new RegExp(B + 'bg-cyan-950(?:/\\d+)?' + E, 'g'), 'bg-tone-cyan-line/10'],
  [new RegExp(B + 'bg-red-500(?=/)', 'g'), 'bg-danger'],
  [new RegExp(B + 'bg-amber-400(?=/)', 'g'), 'bg-warn'],
  [new RegExp(B + 'bg-emerald-(?:400|500)(?=/)', 'g'), 'bg-brand'],
  [new RegExp(B + 'bg-cyan-(?:400|500)(?=/)', 'g'), 'bg-tone-cyan-line'],
  [new RegExp(B + 'bg-teal-(?:400|500)(?=/)', 'g'), 'bg-brand'],
  plain('border-red-500', 'border-danger'),
  plain('border-red-400', 'border-tone-red-line'),
  plain('border-amber-400', 'border-warn'),
  plain('border-amber-300', 'border-warn'),
  plain('border-emerald-500', 'border-tone-green-line'),
  plain('border-emerald-400', 'border-brand'),
  plain('border-teal-400', 'border-brand'),
  plain('border-cyan-500', 'border-tone-cyan-line'),
  plain('border-cyan-400', 'border-tone-cyan-line'),
  plain('accent-emerald-400', 'accent-brand'),
  plain('accent-teal-400', 'accent-brand'),
  plain('accent-cyan-400', 'accent-tone-cyan-line'),
  [new RegExp(B + 'ring-emerald-400(?=/)', 'g'), 'ring-brand'],
];

// White text stays white on solid colored buttons, so lines that hold one are skipped.
const WHITE = new RegExp(B + 'text-white' + E, 'g');
const SOLID = new RegExp(B + 'bg-(?:red|emerald|cyan|teal|green|amber|blue)-[4-6]00(?![\\w/-])');

// Colors that are left after the conversion and need a manual look.
// Families the rules above do not cover (pink, rose, blue...) are listed in full, because they are not
// converted. Very light or very dark text shades (such as text-amber-50) are listed too: they only read well on one theme.
const OTHER_FAMILIES = 'pink|rose|fuchsia|purple|violet|indigo|blue|sky|orange|yellow|lime|green|zinc|gray|neutral|stone';
const LEFTOVER = [
  /(?<![\w-])(?:[a-z]+:)*(?:bg|text|border|ring|divide|placeholder|accent|from|to|via)-slate-\d+/g,
  new RegExp(
    '(?<![\\w-])(?:[a-z]+:)*(?:bg|text|border|ring|divide|placeholder|accent|from|to|via)-(?:' + OTHER_FAMILIES + ')-\\d+',
    'g',
  ),
  /(?<![\w-])(?:[a-z]+:)*text-(?:amber|red|emerald|cyan|teal)-(?:50|400|500|600|700|800|900|950)(?![\w-])/g,
  /(?<![\w-])(?:bg|text|border)-\[#[0-9a-fA-F]{3,8}\]/g,
  /\b(?:stroke|fill)="#[0-9a-fA-F]{3,8}"/g,
];

function convert(src) {
  let out = src;
  let changes = 0;
  for (const [re, to] of RULES) {
    out = out.replace(re, () => {
      changes += 1;
      return to;
    });
  }
  out = out
    .split('\n')
    .map((line) =>
      SOLID.test(line)
        ? line
        : line.replace(WHITE, () => {
            changes += 1;
            return 'text-ink';
          }),
    )
    .join('\n');
  return { out, changes };
}

function leftovers(src) {
  const found = [];
  src.split('\n').forEach((line, i) => {
    for (const re of LEFTOVER) {
      // text-slate-900 and text-slate-950 are the dark text on green buttons. They are meant to stay.
      const hits = (line.match(re) || []).filter((h) => !/text-slate-9[05]0$/.test(h));
      if (hits.length) found.push(`  line ${i + 1}: ${[...new Set(hits)].join(', ')}`);
    }
  });
  return found;
}

function collect(target) {
  if (!existsSync(target)) {
    console.log(`Not found: ${target}`);
    return [];
  }
  if (statSync(target).isDirectory()) {
    return readdirSync(target).flatMap((name) => collect(join(target, name)));
  }
  return target.endsWith('.tsx') ? [target] : [];
}

const args = process.argv.slice(2);
const check = args.includes('--check');
const files = args.filter((a) => a !== '--check').flatMap(collect);
if (files.length === 0) {
  console.log('Give at least one .tsx file or folder.');
  process.exit(1);
}

let total = 0;
for (const file of files) {
  const src = readFileSync(file, 'utf8');
  if (src.includes('theme-skip')) {
    console.log(`${file}: skipped (marked theme-skip)`);
    continue;
  }
  const { out, changes } = convert(src);
  total += changes;
  const left = leftovers(out);
  console.log(`${file}: ${changes} change${changes === 1 ? '' : 's'}${left.length ? `, ${left.length} line(s) left to do by hand` : ''}`);
  left.forEach((l) => console.log(l));
  if (!check && changes > 0) writeFileSync(file, out);
}
console.log(check ? `\nCheck only: nothing was written. ${total} change(s) would be made.` : `\nDone. ${total} change(s) written.`);