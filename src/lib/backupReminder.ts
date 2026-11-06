const LAST_KEY = 'healing_last_backup';
const SNOOZE_KEY = 'healing_backup_snooze';
const SNOOZE_DAYS = 7;
const DAY = 86400000;

// Where the app keeps records. Keep this in step with the list on the Backup screen.
const LIST_KEYS = [
  'Healing_symptom_logs',
  'healing_vitals',
  'healing_mood_journal',
  'healing_medications',
  'healing_appointments',
  'healing_family_members',
  'healing_sanctuary_check_ins_v1',
];
const PLAN_KEY = 'healing_emergency_plan';

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

// The reminder is a convenience, so a failed save stays silent.
function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

function listLength(key: string): number {
  try {
    const raw = read(key);
    if (!raw) return 0;
    let parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && 'payload' in (parsed as object)) {
      parsed = (parsed as { payload: unknown }).payload;
    }
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}

export function hasRecords(): boolean {
  if (LIST_KEYS.some((k) => listLength(k) > 0)) return true;
  try {
    const raw = read(PLAN_KEY);
    if (!raw) return false;
    const plan = JSON.parse(raw);
    return (
      (Array.isArray(plan?.entries) && plan.entries.length > 0) ||
      (typeof plan?.route === 'string' && plan.route.trim() !== '')
    );
  } catch {
    return false;
  }
}

export function markBackupDone() {
  write(LAST_KEY, new Date().toISOString());
  window.dispatchEvent(new Event('healing:backup-done'));
}

export function lastBackup(): Date | null {
  const raw = read(LAST_KEY);
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

// Whole days since the last backup copy, or null when none was ever made.
export function backupAgeDays(): number | null {
  const d = lastBackup();
  return d ? Math.max(0, Math.floor((Date.now() - d.getTime()) / DAY)) : null;
}

export function isSnoozed(): boolean {
  const raw = read(SNOOZE_KEY);
  const when = raw ? Date.parse(raw) : NaN;
  return Number.isFinite(when) && Date.now() - when < SNOOZE_DAYS * DAY;
}

export function snooze() {
  write(SNOOZE_KEY, new Date().toISOString());
}

export function formatDay(d: Date, lang: string): string {
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
  try {
    return d.toLocaleDateString(lang, options);
  } catch {
    return d.toLocaleDateString(undefined, options);
  }
}