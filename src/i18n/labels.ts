// Saved values stay in English underneath, so older entries and backups keep working.
// These helpers turn a saved value into the translation line for it.

export const RELATION_OPTIONS: { value: string; key: string }[] = [
  { value: 'Mother', key: 'rel.mother' },
  { value: 'Father', key: 'rel.father' },
  { value: 'Sibling', key: 'rel.sibling' },
  { value: 'Child', key: 'rel.child' },
  { value: 'Grandparent', key: 'rel.grandparent' },
  { value: 'Aunt/Uncle', key: 'rel.auntuncle' },
  { value: 'Cousin', key: 'rel.cousin' },
  { value: 'Other relative', key: 'rel.other' },
];

// Older versions saved these two values.
const OLD_RELATIONS: Record<string, string> = { Parent: 'rel.parent', 'Uncle/Aunt': 'rel.auntuncle' };

export function relationKey(value: string): string | null {
  const match = RELATION_OPTIONS.find((r) => r.value === value);
  if (match) return match.key;
  return OLD_RELATIONS[value] ?? null;
}

export const FREQUENCY_OPTIONS: { value: string; key: string }[] = [
  { value: 'Once daily', key: 'med.freq.once' },
  { value: 'Twice daily', key: 'med.freq.twice' },
  { value: 'Three times daily', key: 'med.freq.three' },
  { value: 'Weekly', key: 'med.freq.weekly' },
  { value: 'As needed', key: 'med.freq.asneeded' },
];

export function frequencyKey(value: string): string | null {
  const match = FREQUENCY_OPTIONS.find((f) => value.startsWith(f.value));
  return match ? match.key : null;
}

const SEVERITY_KEYS: Record<string, string> = {
  Mild: 'sev.mild',
  Moderate: 'sev.moderate',
  Severe: 'sev.severe',
};

export function severityKey(value: string): string | null {
  return SEVERITY_KEYS[value] ?? null;
}