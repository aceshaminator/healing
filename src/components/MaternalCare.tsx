import { useState } from 'react';
import { useI18n } from '../i18n/I18nProvider';
import { getEmergencyNumber } from '../i18n/regions';

interface MaternalCareProps {
  onBack?: () => void;
}

type SymptomKey =
  | 'seizure'
  | 'breathing'
  | 'heavyBleeding'
  | 'headache'
  | 'vision'
  | 'upperPain'
  | 'swelling'
  | 'bleeding'
  | 'bellyPain'
  | 'lessMovement';

const SYMPTOMS: SymptomKey[] = [
  'seizure',
  'breathing',
  'heavyBleeding',
  'headache',
  'vision',
  'upperPain',
  'swelling',
  'bleeding',
  'bellyPain',
  'lessMovement',
];

const PREECLAMPSIA_SIGNS: SymptomKey[] = ['headache', 'vision', 'upperPain', 'swelling'];

const emptyChecked = (): Record<SymptomKey, boolean> => ({
  seizure: false,
  breathing: false,
  heavyBleeding: false,
  headache: false,
  vision: false,
  upperPain: false,
  swelling: false,
  bleeding: false,
  bellyPain: false,
  lessMovement: false,
});

function parse(value: string): number | null {
  if (value.trim() === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function trimesterKey(weeks: number) {
  if (weeks <= 13) return 'mat.tri.1';
  if (weeks <= 27) return 'mat.tri.2';
  return 'mat.tri.3';
}

const fieldClass =
  'min-h-[48px] w-full rounded-xl border border-muted/40 bg-canvas px-3 py-2 text-base text-ink placeholder-muted focus:border-brand focus:outline-none';

export function MaternalCare({ onBack }: MaternalCareProps) {
  const { t } = useI18n();
  const emergencyNumber = getEmergencyNumber();
  const [weeks, setWeeks] = useState('');
  const [sys, setSys] = useState('');
  const [dia, setDia] = useState('');
  const [checked, setChecked] = useState<Record<SymptomKey, boolean>>(emptyChecked);

  const toggle = (key: SymptomKey) => setChecked((prev) => ({ ...prev, [key]: !prev[key] }));

  const clearAll = () => {
    setWeeks('');
    setSys('');
    setDia('');
    setChecked(emptyChecked());
  };

  const weeksNum = parse(weeks);
  const weeksValid = weeksNum !== null && weeksNum >= 1 && weeksNum <= 42;
  const sysNum = parse(sys);
  const diaNum = parse(dia);
  const bpEntered = sys.trim() !== '' || dia.trim() !== '';
  const bpValid =
    sysNum !== null && diaNum !== null && sysNum >= 60 && sysNum <= 260 && diaNum >= 30 && diaNum <= 160 && sysNum > diaNum;

  // The rules below are the same as before. Only the words are translated.
  const anySymptom = SYMPTOMS.some((s) => checked[s]);
  const signs = PREECLAMPSIA_SIGNS.filter((k) => checked[k]).length;
  const emergencySymptom = checked.seizure || checked.breathing || checked.heavyBleeding;
  const severeBP = bpValid && (sysNum! >= 160 || diaNum! >= 110);
  const highBP = bpValid && (sysNum! >= 140 || diaNum! >= 90);
  const lowBP = bpValid && sysNum! < 90;
  const sameDay = signs >= 1 || checked.bleeding || checked.bellyPain || checked.lessMovement || highBP;

  type Level = 'none' | 'ok' | 'sameDay' | 'emergency';
  let level: Level;
  if (!bpValid && !anySymptom) level = 'none';
  else if (emergencySymptom || severeBP || signs >= 2 || (highBP && signs >= 1)) level = 'emergency';
  else if (sameDay) level = 'sameDay';
  else level = 'ok';

  const noteKeys: string[] = [];
  if (highBP && weeksValid && weeksNum! >= 20) noteKeys.push('mat.note.high20');
  else if (highBP && weeksValid) noteKeys.push('mat.note.highBefore20');
  else if (highBP) noteKeys.push('mat.note.highAny');
  if (lowBP) noteKeys.push('mat.note.low');
  if (bpValid && !highBP && !lowBP) noteKeys.push('mat.note.normal');
  if (signs >= 1 && !highBP) noteKeys.push('mat.note.signs');

  return (
    <div className="mx-auto max-w-4xl space-y-6 rounded-2xl border border-line bg-surface p-6 text-ink shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-line pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-bold text-tone-red">{t('mat.title')}</h2>
            {weeksValid && (
              <span className="rounded-full border border-tone-red-line/50 bg-danger/10 px-2.5 py-0.5 text-xs font-semibold text-tone-red">
                {t(trimesterKey(weeksNum!))}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-ink/80">{t('mat.sub')}</p>
        </div>

        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="min-h-[44px] rounded-lg border border-muted/40 bg-line/40 px-3 py-1.5 text-sm font-semibold text-ink transition-colors hover:bg-line/70"
          >
            &larr; {t('common.back')}
          </button>
        )}
      </div>

      {/* Inputs */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="weeks" className="mb-1 block text-sm font-semibold text-ink">
              {t('mat.weeks')}
            </label>
            <input
              id="weeks"
              inputMode="numeric"
              value={weeks}
              onChange={(e) => setWeeks(e.target.value)}
              placeholder={t('mat.weeks.ph')}
              className={fieldClass}
            />
            {weeks.trim() !== '' && !weeksValid && <p className="mt-1 text-xs text-tone-amber">{t('mat.weeks.err')}</p>}
          </div>
          <div>
            <label htmlFor="sys" className="mb-1 block text-sm font-semibold text-ink">
              {t('mat.sys')}
            </label>
            <input
              id="sys"
              inputMode="numeric"
              value={sys}
              onChange={(e) => setSys(e.target.value)}
              placeholder={t('mat.sys.ph')}
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="dia" className="mb-1 block text-sm font-semibold text-ink">
              {t('mat.dia')}
            </label>
            <input
              id="dia"
              inputMode="numeric"
              value={dia}
              onChange={(e) => setDia(e.target.value)}
              placeholder={t('mat.dia.ph')}
              className={fieldClass}
            />
          </div>
        </div>
        <p className="text-xs text-ink/80">{t('mat.rest')}</p>
        {bpEntered && !bpValid && (
          <p role="alert" className="text-sm text-tone-amber">
            {t('mat.bp.err')}
          </p>
        )}

        <fieldset>
          <legend className="mb-3 text-sm font-bold uppercase tracking-wider text-ink">{t('mat.legend')}</legend>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {SYMPTOMS.map((key) => (
              <button
                key={key}
                type="button"
                aria-pressed={checked[key]}
                onClick={() => toggle(key)}
                className={`min-h-[56px] rounded-xl border p-3 text-left text-sm font-medium transition-all ${
                  checked[key]
                    ? 'border-tone-red-line bg-danger/15 text-ink'
                    : 'border-muted/40 bg-canvas text-ink hover:border-muted/60'
                }`}
              >
                {checked[key] ? '✓ ' : '+ '}
                {t(`mat.sym.${key}`)}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      {/* Result */}
      {level === 'none' && (
        <p className="rounded-xl border border-muted/40 bg-canvas p-4 text-sm text-ink">{t('mat.none')}</p>
      )}

      {level === 'emergency' && (
        <div role="alert" className="space-y-3 rounded-xl border border-danger/60 bg-danger/15 p-4">
          <p className="text-base font-bold text-ink">{t('mat.emergency.title')}</p>
          <p className="text-sm leading-relaxed text-ink">{t('mat.emergency.body', { number: emergencyNumber })}</p>
          <a
            href={`tel:${emergencyNumber}`}
            className="flex min-h-[48px] items-center justify-center rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-500"
          >
            {t('sos.call', { number: emergencyNumber })}
          </a>
        </div>
      )}

      {level === 'sameDay' && (
        <div role="status" className="space-y-2 rounded-xl border border-warn/60 bg-warn/15 p-4">
          <p className="text-base font-bold text-ink">{t('mat.sameday.title')}</p>
          <p className="text-sm leading-relaxed text-ink">{t('mat.sameday.body', { number: emergencyNumber })}</p>
        </div>
      )}

      {level === 'ok' && (
        <div role="status" className="space-y-2 rounded-xl border border-muted/50 bg-canvas p-4">
          <p className="text-base font-bold text-ink">{t('mat.ok.title')}</p>
          <p className="text-sm leading-relaxed text-ink">{t('mat.ok.body')}</p>
        </div>
      )}

      {noteKeys.length > 0 && level !== 'none' && (
        <ul className="space-y-2">
          {noteKeys.map((key) => (
            <li key={key} className="rounded-lg border border-line bg-canvas p-3 text-sm text-ink">
              {t(key)}
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <p className="max-w-xl text-xs leading-relaxed text-ink/80">{t('mat.footer')}</p>
        <button
          type="button"
          onClick={clearAll}
          className="min-h-[44px] rounded-xl border border-muted/50 px-4 py-2 text-sm font-semibold text-ink transition hover:bg-line/40"
        >
          {t('mat.clear')}
        </button>
      </div>
    </div>
  );
}

export default MaternalCare;