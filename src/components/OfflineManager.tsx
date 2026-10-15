import React, { useEffect, useState } from 'react';
import { StorageService } from '../services/storageService';
import type { HealthCheckIn } from '../services/storageService';
import { useI18n } from '../i18n/I18nProvider';

type Row = Record<string, unknown>;
type ListKey =
  | 'checkIns'
  | 'symptomLogs'
  | 'vitals'
  | 'moodJournal'
  | 'medications'
  | 'appointments'
  | 'familyHistory';

interface Plan {
  route: string;
  entries: Row[];
}

type Records = Record<ListKey, Row[]> & { emergencyPlan: Plan };

interface ImportPlan {
  lists: Record<ListKey, Row[]>;
  planEntries: Row[];
  newRoute: string | null;
  added: number;
  skipped: number;
}

type Msg = { key: string; vars?: Record<string, string | number> };

const LIST_KEYS: ListKey[] = [
  'checkIns',
  'symptomLogs',
  'vitals',
  'moodJournal',
  'medications',
  'appointments',
  'familyHistory',
];

// Check-ins are saved through StorageService. Every other list is saved under these names.
const RAW_KEYS: Record<Exclude<ListKey, 'checkIns'>, string> = {
  symptomLogs: 'Healing_symptom_logs',
  vitals: 'healing_vitals',
  moodJournal: 'healing_mood_journal',
  medications: 'healing_medications',
  appointments: 'healing_appointments',
  familyHistory: 'healing_family_members',
};
const PLAN_KEY = 'healing_emergency_plan';

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_ITEMS = 1000;

const isObj = (v: unknown): v is Row => !!v && typeof v === 'object' && !Array.isArray(v);
const str = (v: unknown): v is string => typeof v === 'string';
const numOk = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const strList = (v: unknown) => Array.isArray(v) && (v as unknown[]).every(str);

// Each item in a backup file is checked before it is added, so a damaged file cannot break a screen.
const validators: Record<ListKey, (r: Row) => boolean> = {
  checkIns: (r) =>
    str(r.id) &&
    str(r.timestamp) &&
    strList(r.symptoms) &&
    (r.severity === undefined || str(r.severity)) &&
    (r.reflections === undefined || str(r.reflections)),
  symptomLogs: (r) =>
    str(r.id) &&
    str(r.symptom) &&
    ['Mild', 'Moderate', 'Severe'].includes(String(r.severity)) &&
    str(r.duration) &&
    str(r.dateLogged) &&
    str(r.notes),
  vitals: (r) =>
    (numOk(r.id) || str(r.id)) &&
    str(r.date) &&
    ['fingertip', 'motion', 'manual'].includes(String(r.source)) &&
    ['pulse', 'systolic', 'diastolic', 'tempC', 'movement', 'rhythmHz'].every((k) => r[k] === undefined || numOk(r[k])),
  moodJournal: (r) => str(r.id) && str(r.mood) && numOk(r.score) && str(r.text) && str(r.date),
  medications: (r) =>
    str(r.id) &&
    str(r.name) &&
    str(r.dosage) &&
    str(r.frequency) &&
    str(r.notes) &&
    (r.taken === undefined || strList(r.taken)),
  appointments: (r) =>
    str(r.id) &&
    str(r.doctorName) &&
    str(r.specialty) &&
    str(r.date) &&
    str(r.time) &&
    str(r.location) &&
    str(r.notes),
  familyHistory: (r) =>
    str(r.id) && str(r.name) && str(r.relation) && (numOk(r.age) || str(r.age)) && str(r.conditions),
};

const validPlanEntry = (r: Row) => str(r.id) && str(r.type) && str(r.name) && str(r.phone) && str(r.note);

function idOf(r: Row): string {
  return r.id !== undefined ? String(r.id) : JSON.stringify(r);
}

function readJson(key: string): unknown[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    let parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && 'payload' in (parsed as object)) {
      parsed = (parsed as { payload: unknown }).payload;
    }
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readPlan(): Plan {
  try {
    const raw = localStorage.getItem(PLAN_KEY);
    if (!raw) return { route: '', entries: [] };
    const p = JSON.parse(raw);
    return {
      route: typeof p?.route === 'string' ? p.route : '',
      entries: Array.isArray(p?.entries) ? (p.entries as Row[]) : [],
    };
  } catch {
    return { route: '', entries: [] };
  }
}

// The filters drop the made-up sample entries that older versions of the screens added for everyone.
function collect(): Records {
  return {
    checkIns: StorageService.getCheckIns() as unknown as Row[],
    symptomLogs: (readJson(RAW_KEYS.symptomLogs) as Row[]).filter(
      (l) => !(l.id === '1' && l.symptom === 'Migraine / Headache'),
    ),
    vitals: readJson(RAW_KEYS.vitals) as Row[],
    moodJournal: readJson(RAW_KEYS.moodJournal) as Row[],
    medications: (readJson(RAW_KEYS.medications) as Row[]).filter(
      (m) => !(m.id === '1' && m.name === 'Omega-3 Fish Oil'),
    ),
    appointments: (readJson(RAW_KEYS.appointments) as Row[]).filter(
      (a) => !(a.id === '1' && a.doctorName === 'Dr. Sarah Chen'),
    ),
    familyHistory: (readJson(RAW_KEYS.familyHistory) as Row[]).filter(
      (r) => !((r.id === '1' || r.id === '2') && (r.name === 'John Doe' || r.name === 'Jane Doe')),
    ),
    emergencyPlan: readPlan(),
  };
}

function countAll(r: Records): number {
  return LIST_KEYS.reduce((sum, k) => sum + r[k].length, 0) + r.emergencyPlan.entries.length;
}

function sortValue(key: ListKey, r: Row): number {
  if (key === 'vitals') return Date.parse(String(r.date)) || 0;
  if (key === 'checkIns') return Date.parse(String(r.timestamp)) || 0;
  if (key === 'symptomLogs' || key === 'moodJournal') return Number(r.id) || 0;
  return 0;
}

const SORTED: ListKey[] = ['vitals', 'checkIns', 'symptomLogs', 'moodJournal'];

// Newest first, the way the screens expect it.
function mergeInto(key: ListKey, existing: Row[], add: Row[]): Row[] {
  const merged = [...existing, ...add];
  if (SORTED.includes(key)) merged.sort((a, b) => sortValue(key, b) - sortValue(key, a));
  return merged.slice(0, MAX_ITEMS);
}

function buildImport(data: Row, current: Records): ImportPlan {
  const lists = {} as Record<ListKey, Row[]>;
  let added = 0;
  let skipped = 0;

  for (const key of LIST_KEYS) {
    const incoming = Array.isArray(data[key]) ? (data[key] as unknown[]).slice(0, MAX_ITEMS) : [];
    const have = new Set(current[key].map(idOf));
    const toAdd: Row[] = [];
    for (const item of incoming) {
      if (!isObj(item) || !validators[key](item) || have.has(idOf(item))) {
        skipped++;
        continue;
      }
      have.add(idOf(item));
      toAdd.push(item);
    }
    lists[key] = toAdd;
    added += toAdd.length;
  }

  const planData = isObj(data.emergencyPlan) ? data.emergencyPlan : null;
  const planEntries: Row[] = [];
  if (planData && Array.isArray(planData.entries)) {
    const haveIds = new Set(current.emergencyPlan.entries.map(idOf));
    for (const item of (planData.entries as unknown[]).slice(0, MAX_ITEMS)) {
      if (!isObj(item) || !validPlanEntry(item) || haveIds.has(idOf(item))) {
        skipped++;
        continue;
      }
      haveIds.add(idOf(item));
      planEntries.push(item);
    }
  }
  added += planEntries.length;

  const routeValue = planData ? planData.route : undefined;
  const newRoute =
    typeof routeValue === 'string' && routeValue.trim() !== '' && current.emergencyPlan.route.trim() === ''
      ? routeValue
      : null;
  if (newRoute !== null) added += 1;

  return { lists, planEntries, newRoute, added, skipped };
}

function writeRaw(key: string, list: Row[]): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
}

function applyImport(plan: ImportPlan): boolean {
  let ok = true;

  for (const key of LIST_KEYS) {
    const add = plan.lists[key];
    if (add.length === 0) continue;
    if (key === 'checkIns') {
      const existing = StorageService.getCheckIns() as unknown as Row[];
      const merged = mergeInto(key, existing, add) as unknown as HealthCheckIn[];
      if (!StorageService.saveCheckIns(merged)) ok = false;
    } else {
      const existing = readJson(RAW_KEYS[key]) as Row[];
      if (!writeRaw(RAW_KEYS[key], mergeInto(key, existing, add))) ok = false;
    }
  }

  if (plan.planEntries.length > 0 || plan.newRoute !== null) {
    const current = readPlan();
    const next: Plan = {
      route: plan.newRoute ?? current.route,
      entries: [...current.entries, ...plan.planEntries],
    };
    try {
      localStorage.setItem(PLAN_KEY, JSON.stringify(next));
    } catch {
      ok = false;
    }
  }

  if (!ok) window.dispatchEvent(new CustomEvent('healing:storage-error', { detail: { key: 'restore' } }));
  return ok;
}

export function OfflineManager() {
  const { t } = useI18n();
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [records, setRecords] = useState<Records>(collect);
  const [exportMsg, setExportMsg] = useState<Msg | null>(null);
  const [pending, setPending] = useState<{ name: string; plan: ImportPlan } | null>(null);
  const [restoreMsg, setRestoreMsg] = useState<Msg | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleExportData = () => {
    const fresh = collect();
    setRecords(fresh);

    if (countAll(fresh) === 0) {
      setExportMsg({ key: 'bak.msg.nothing' });
      return;
    }

    try {
      // The warning inside the file stays in English, because the file is data, not a screen.
      const payload = {
        app: 'Healing by VisionAce',
        exportedAt: new Date().toISOString(),
        warning: 'This file is not encrypted and contains private health information. Keep it somewhere safe.',
        ...fresh,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Healing_Health_Export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setExportMsg({ key: 'bak.msg.exported' });
    } catch {
      setExportMsg({ key: 'bak.msg.exportfail' });
    }
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // lets the same file be chosen again
    setRestoreMsg(null);
    setPending(null);
    if (!file) return;

    if (file.size > MAX_FILE_BYTES) {
      setRestoreMsg({ key: 'bak.err.large' });
      return;
    }
    try {
      const data: unknown = JSON.parse(await file.text());
      if (!isObj(data) || data.app !== 'Healing by VisionAce') {
        setRestoreMsg({ key: 'bak.err.notbackup' });
        return;
      }
      setPending({ name: file.name, plan: buildImport(data, collect()) });
    } catch {
      setRestoreMsg({ key: 'bak.err.read' });
    }
  };

  const confirmRestore = () => {
    if (!pending) return;
    const added = pending.plan.added;
    const ok = applyImport(pending.plan);
    setRecords(collect());
    setPending(null);
    setRestoreMsg(
      ok ? { key: added === 1 ? 'bak.done.one' : 'bak.done.many', vars: { n: added } } : { key: 'bak.done.fail' },
    );
  };

  const rows: { label: string; count: number }[] = [
    ...LIST_KEYS.map((k) => ({ label: t(`bak.lbl.${k}`), count: records[k].length })),
    { label: t('bak.lbl.plan'), count: records.emergencyPlan.entries.length },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-700 bg-slate-900 p-6">
        <div>
          <h2 className="text-xl font-bold text-white">{t('bak.title')}</h2>
          <p className="mt-1 text-sm text-slate-300">{t('bak.sub')}</p>
        </div>
        <div
          className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold ${
            isOnline
              ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-200'
              : 'border-amber-500/40 bg-amber-500/20 text-amber-200'
          }`}
        >
          {isOnline ? t('bak.online') : t('bak.offline')}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Where your records are */}
        <div className="space-y-4 rounded-2xl border border-slate-700 bg-slate-900 p-6">
          <h3 className="text-sm font-semibold text-cyan-300">{t('bak.saved.title')}</h3>
          <ul className="space-y-1 text-sm text-slate-100">
            {rows.map((r) => (
              <li key={r.label} className="flex justify-between gap-3">
                <span>{r.label}</span>
                <span className="font-semibold">{r.count}</span>
              </li>
            ))}
          </ul>
          <p className="rounded-lg border border-amber-400/40 bg-amber-400/10 p-3 text-sm leading-relaxed text-amber-100">
            {t('bak.warn')}
          </p>
        </div>

        {/* Local Export Card */}
        <div className="space-y-4 rounded-2xl border border-slate-700 bg-slate-900 p-6">
          <h3 className="text-sm font-semibold text-cyan-300">{t('bak.copy.title')}</h3>
          <p className="text-sm leading-relaxed text-slate-300">{t('bak.copy.text')}</p>
          <button
            type="button"
            onClick={handleExportData}
            disabled={countAll(records) === 0}
            className="min-h-[48px] w-full rounded-xl border border-slate-500 bg-slate-800 py-2.5 text-sm font-bold text-slate-100 transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t('bak.export')}
          </button>
          {exportMsg && (
            <p role="status" className="text-sm text-slate-200">
              {t(exportMsg.key, exportMsg.vars)}
            </p>
          )}
        </div>
      </div>

      {/* Restore Card */}
      <div className="space-y-4 rounded-2xl border border-slate-700 bg-slate-900 p-6">
        <h3 className="text-sm font-semibold text-cyan-300">{t('bak.restore.title')}</h3>
        <p className="text-sm leading-relaxed text-slate-300">{t('bak.restore.text')}</p>
        <label className="flex min-h-[48px] cursor-pointer items-center justify-center rounded-xl border border-slate-500 bg-slate-800 px-4 py-2.5 text-sm font-bold text-slate-100 transition-colors hover:bg-slate-700">
          {t('bak.choose')}
          <input type="file" accept="application/json,.json" onChange={handleFile} className="sr-only" />
        </label>

        {pending && (
          <div className="space-y-3 rounded-lg border border-slate-600 bg-slate-950 p-4 text-sm text-slate-100">
            <p className="font-semibold">{pending.name}</p>
            {pending.plan.added === 0 ? (
              <p>{t('bak.pending.none')}</p>
            ) : (
              <ul className="list-inside list-disc space-y-1">
                {LIST_KEYS.filter((k) => pending.plan.lists[k].length > 0).map((k) => (
                  <li key={k}>{t('bak.pending.toadd', { label: t(`bak.lbl.${k}`), n: pending.plan.lists[k].length })}</li>
                ))}
                {pending.plan.planEntries.length > 0 && (
                  <li>{t('bak.pending.toadd', { label: t('bak.lbl.plan'), n: pending.plan.planEntries.length })}</li>
                )}
                {pending.plan.newRoute !== null && <li>{t('bak.pending.route')}</li>}
              </ul>
            )}
            <p className="text-xs text-slate-300">
              {t(pending.plan.skipped === 1 ? 'bak.pending.skipped.one' : 'bak.pending.skipped.many', {
                n: pending.plan.skipped,
              })}
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={confirmRestore}
                disabled={pending.plan.added === 0}
                className="min-h-[48px] rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t('bak.apply')}
              </button>
              <button
                type="button"
                onClick={() => setPending(null)}
                className="min-h-[48px] rounded-xl border border-slate-500 px-5 py-2.5 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
              >
                {t('bak.cancel')}
              </button>
            </div>
          </div>
        )}

        {restoreMsg && (
          <p role="status" className="text-sm text-slate-200">
            {t(restoreMsg.key, restoreMsg.vars)}
          </p>
        )}
      </div>
    </div>
  );
}

export default OfflineManager;