import React, { useEffect, useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useI18n } from '../i18n/I18nProvider';
import { getEmergencyNumber } from '../i18n/regions';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  notes: string;
  /** Time of each dose you logged, oldest first. */
  taken?: string[];
  /** Old field from an earlier version. It never reset each day, so it is ignored now. */
  takenToday?: boolean;
}

interface MedicationTrackerProps {
  onBack?: () => void;
}

// Saved values stay in English underneath, so older entries and backups keep working.
const FREQUENCIES: { value: string; key: string }[] = [
  { value: 'Once daily', key: 'med.freq.once' },
  { value: 'Twice daily', key: 'med.freq.twice' },
  { value: 'Three times daily', key: 'med.freq.three' },
  { value: 'Weekly', key: 'med.freq.weekly' },
  { value: 'As needed', key: 'med.freq.asneeded' },
];
const STORED_NO_NOTES = 'No special instructions.';

function dayKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function isToday(iso: string) {
  const d = new Date(iso);
  return !Number.isNaN(d.getTime()) && dayKey(d) === dayKey(new Date());
}

function targetFor(freq: string): number | null {
  if (freq.startsWith('Once daily')) return 1;
  if (freq.startsWith('Twice daily')) return 2;
  if (freq.startsWith('Three times daily')) return 3;
  if (freq.startsWith('Weekly')) return 1;
  return null; // As needed, or an older value we do not recognise
}

function showTime(iso: string, lang: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const o: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  };
  try {
    return d.toLocaleString(lang, o);
  } catch {
    return d.toLocaleString(undefined, o);
  }
}

const fieldClass =
  'min-h-[44px] w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-400 focus:border-emerald-400 focus:outline-none';

export function MedicationTracker({ onBack }: MedicationTrackerProps) {
  const { t, lang } = useI18n();
  const emergencyNumber = getEmergencyNumber();
  const [medications, setMedications] = useLocalStorage<Medication[]>('healing_medications', []);

  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('Once daily');
  const [notes, setNotes] = useState('');

  // Re-check once a minute so the daily counts go back to zero after midnight.
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((n) => n + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  const freqLabel = (value: string) => {
    const match = FREQUENCIES.find((f) => value.startsWith(f.value));
    return match ? t(match.key) : value;
  };

  const handleAddMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !dosage.trim()) return;

    const newMed: Medication = {
      id: Date.now().toString(),
      name: name.trim(),
      dosage: dosage.trim(),
      frequency,
      notes: notes.trim() || STORED_NO_NOTES,
      taken: [],
    };

    setMedications([...medications, newMed]);
    setName('');
    setDosage('');
    setNotes('');
  };

  const logDose = (id: string) => {
    setMedications(
      medications.map((med) =>
        med.id === id ? { ...med, taken: [...(med.taken ?? []), new Date().toISOString()].slice(-60) } : med,
      ),
    );
  };

  const undoDose = (id: string) => {
    setMedications(medications.map((med) => (med.id === id ? { ...med, taken: (med.taken ?? []).slice(0, -1) } : med)));
  };

  const handleDelete = (med: Medication) => {
    if (window.confirm(t('med.confirm.remove', { name: med.name }))) {
      setMedications(medications.filter((m) => m.id !== med.id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between rounded-2xl border border-slate-700 bg-slate-900 p-6">
        <div>
          <h2 className="text-xl font-bold text-white">{t('med.title')}</h2>
          <p className="mt-1 text-sm text-slate-300">{t('med.sub')}</p>
        </div>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="min-h-[44px] rounded-lg bg-slate-800 px-3 py-1.5 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-700"
          >
            &larr; {t('common.back')}
          </button>
        )}
      </div>

      {/* Safety notes */}
      <div className="space-y-2 rounded-2xl border border-amber-400/40 bg-amber-400/10 p-4 text-sm leading-relaxed text-amber-100">
        <p>{t('med.safety.1')}</p>
        <p>{t('med.safety.2')}</p>
        <p>{t('med.safety.3', { number: emergencyNumber })}</p>
        <a href={`tel:${emergencyNumber}`} className="inline-flex min-h-[44px] items-center font-bold underline">
          {t('sos.call', { number: emergencyNumber })}
        </a>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Form Column */}
        <div className="h-fit rounded-2xl border border-slate-700 bg-slate-900 p-5">
          <h3 className="mb-4 text-sm font-semibold text-emerald-300">{t('med.form.title')}</h3>
          <form onSubmit={handleAddMedication} className="space-y-4">
            <div>
              <label htmlFor="med-name" className="mb-1 block text-sm text-slate-200">
                {t('med.name')}
              </label>
              <input
                id="med-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('med.name.ph')}
                className={fieldClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="med-dosage" className="mb-1 block text-sm text-slate-200">
                  {t('med.dosage')}
                </label>
                <input
                  id="med-dosage"
                  type="text"
                  required
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  placeholder={t('med.dosage.ph')}
                  className={fieldClass}
                />
              </div>
              <div>
                <label htmlFor="med-frequency" className="mb-1 block text-sm text-slate-200">
                  {t('med.freq')}
                </label>
                <select
                  id="med-frequency"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className={fieldClass}
                >
                  {FREQUENCIES.map((f) => (
                    <option key={f.value} value={f.value}>
                      {t(f.key)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="med-notes" className="mb-1 block text-sm text-slate-200">
                {t('med.notes')}
              </label>
              <textarea
                id="med-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('med.notes.ph')}
                rows={3}
                className={`${fieldClass} resize-none`}
              />
            </div>

            <button
              type="submit"
              className="min-h-[48px] w-full rounded-lg bg-emerald-500 py-2 text-sm font-bold text-slate-950 transition-colors hover:bg-emerald-400"
            >
              {t('med.add')}
            </button>
          </form>
        </div>

        {/* List Column */}
        <div className="space-y-3 lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-200">{t('med.list.title', { count: medications.length })}</h3>

          {medications.length === 0 ? (
            <div className="rounded-2xl border border-slate-700 bg-slate-900 p-8 text-center text-sm text-slate-300">
              {t('med.list.empty')}
            </div>
          ) : (
            <div className="space-y-3">
              {medications.map((med) => {
                const log = med.taken ?? [];
                const todays = log.filter(isToday);
                const target = targetFor(med.frequency);
                const done = target !== null && todays.length >= target;
                const last = log.length > 0 ? log[log.length - 1] : null;
                const isWeekly = med.frequency.startsWith('Weekly');

                let status: string;
                if (isWeekly) {
                  status = last ? t('med.status.weekly', { when: showTime(last, lang) }) : t('med.status.none');
                } else if (target !== null) {
                  status = t('med.status.taken', { done: todays.length, target });
                } else {
                  status = t('med.status.asneeded', { n: todays.length });
                }

                return (
                  <div
                    key={med.id}
                    className="flex flex-col gap-4 rounded-xl border border-slate-700 bg-slate-900 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-base font-bold text-slate-100">{med.name}</h4>
                        <span className="rounded-full border border-slate-600 bg-slate-800 px-2 py-0.5 text-xs text-emerald-300">
                          {med.dosage}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300">
                        {freqLabel(med.frequency)} •{' '}
                        <span className="italic">{med.notes === STORED_NO_NOTES ? t('med.nonotes') : med.notes}</span>
                      </p>
                      <p className="text-sm font-semibold text-slate-100" aria-live="polite">
                        {status}
                      </p>
                      {last && !isWeekly && (
                        <p className="text-xs text-slate-300">{t('med.lastlogged', { when: showTime(last, lang) })}</p>
                      )}
                      {target === null && <p className="text-xs text-amber-200">{t('med.checklabel')}</p>}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => logDose(med.id)}
                        disabled={done}
                        className={`min-h-[44px] rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors ${
                          done
                            ? 'cursor-not-allowed border-emerald-500/30 bg-emerald-500/20 text-emerald-200'
                            : 'border-slate-500 bg-slate-800 text-slate-100 hover:bg-slate-700'
                        }`}
                      >
                        {done ? t('med.alldone') : t('med.log')}
                      </button>
                      {todays.length > 0 && (
                        <button
                          type="button"
                          onClick={() => undoDose(med.id)}
                          className="min-h-[44px] rounded-lg px-3 text-sm font-medium text-slate-200 underline hover:text-white"
                        >
                          {t('med.undo')}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(med)}
                        aria-label={t('med.remove.aria', { name: med.name })}
                        className="min-h-[44px] min-w-[44px] rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-red-300"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MedicationTracker;