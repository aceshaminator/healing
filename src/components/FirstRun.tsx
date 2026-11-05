import React, { useState } from 'react';
import { useI18n } from '../i18n/I18nProvider';
import { PICKABLE } from '../i18n/languages';
import { DICTIONARIES } from '../i18n/locales';
import { COUNTRIES, OTHER, saveRegion, validNumber } from '../i18n/regions';

const fieldClass =
  'min-h-[48px] w-full rounded-xl border border-muted/40 bg-canvas px-3 py-2 text-base text-ink placeholder-muted focus:border-brand focus:outline-none';

export default function FirstRun({ onDone }: { onDone: (reload: boolean) => void }) {
  const { t, setLang } = useI18n();
  const [step, setStep] = useState<1 | 2>(1);
  const [country, setCountry] = useState('');
  const [own, setOwn] = useState('');
  const [error, setError] = useState('');

  const selected = COUNTRIES.find((c) => c.code === country);
  const isOther = country === OTHER;

  const proceed = () => {
    const number = selected ? selected.number : own.trim();
    if (!validNumber(number)) {
      setError(t('country.invalid'));
      return;
    }
    setError('');
    // Reload when saved, so every screen picks up the new emergency number.
    onDone(saveRegion(country, number));
  };

  if (step === 1) {
    return (
      <div className="space-y-6 text-center">
        <p className="text-sm leading-relaxed text-ink/80">
        {PICKABLE.map((l) => DICTIONARIES[l.code]?.['lang.title'] ?? DICTIONARIES.en['lang.title']).join(' · ')}
        </p>
        <div className="grid grid-cols-2 gap-3">
          {PICKABLE.map((l) => (
            <button
              key={l.code}
              type="button"
              lang={l.code}
              dir={l.dir}
              onClick={() => {
                setLang(l.code);
                setStep(2);
              }}
              className="min-h-[56px] rounded-2xl border border-muted/40 bg-surface px-3 py-3 text-lg font-semibold text-ink transition hover:border-brand/60 hover:bg-line/40"
            >
              {l.native}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 text-left">
      <div>
        <h2 className="text-xl font-semibold text-ink">{t('country.title')}</h2>
        <p className="mt-1 text-sm text-ink/80">{t('country.help')}</p>
      </div>

      <select
        aria-label={t('country.title')}
        value={country}
        onChange={(e) => {
          setCountry(e.target.value);
          setError('');
        }}
        className={fieldClass}
      >
        <option value="">—</option>
        {COUNTRIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.name}
          </option>
        ))}
        <option value={OTHER}>{t('country.other')}</option>
      </select>

      {selected && <p className="text-base font-semibold text-tone-green">{t('country.number', { number: selected.number })}</p>}

      {isOther && (
        <div>
          <label htmlFor="own-number" className="mb-1 block text-sm font-semibold text-ink">
            {t('country.own')}
          </label>
          <input
            id="own-number"
            type="text"
            inputMode="numeric"
            value={own}
            onChange={(e) => setOwn(e.target.value)}
            className={fieldClass}
          />
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm text-tone-amber">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={proceed}
          disabled={!country}
          className="min-h-[52px] rounded-2xl bg-emerald-500 px-6 py-3 text-base font-bold text-slate-900 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t('common.continue')}
        </button>
        <button
          type="button"
          onClick={() => onDone(false)}
          className="min-h-[48px] rounded-2xl border border-muted/40 px-6 py-3 text-sm font-semibold text-ink transition hover:bg-line/40"
        >
          {t('common.skip')}
        </button>
      </div>
    </div>
  );
}