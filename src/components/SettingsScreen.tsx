import React, { useState } from 'react';
import { useI18n } from '../i18n/I18nProvider';
import { PICKABLE, PLANNED_LANGUAGES } from '../i18n/languages';
import { COUNTRIES, OTHER, getCountryCode, getEmergencyNumber, saveRegion, validNumber } from '../i18n/regions';

const REGION_KEYS: Record<string, string> = {
  Africa: 'set.region.africa',
  Asia: 'set.region.asia',
  'South America': 'set.region.samerica',
  'Eastern Europe': 'set.region.eeurope',
};

const fieldClass =
  'min-h-[48px] w-full rounded-xl border border-slate-600 bg-slate-950 px-3 py-2 text-base text-slate-100 placeholder-slate-400 focus:border-emerald-400 focus:outline-none';

export default function SettingsScreen() {
  const { lang, setLang, t } = useI18n();
  const [country, setCountry] = useState(getCountryCode());
  const [own, setOwn] = useState(getCountryCode() === OTHER ? getEmergencyNumber() : '');
  // Messages are kept as translation keys, so they change language with the app.
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const selected = COUNTRIES.find((c) => c.code === country);

  const save = () => {
    const number = selected ? selected.number : own.trim();
    if (!country) return;
    if (!validNumber(number)) {
      setError('country.invalid');
      return;
    }
    setError('');
    if (!saveRegion(country, number)) {
      setMessage('set.err.save');
      return;
    }
    setMessage('set.saved');
    window.setTimeout(() => window.location.reload(), 600);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 text-slate-100">
      <section className="space-y-3 rounded-2xl border border-slate-700 bg-[#0B132B] p-5">
        <h2 className="text-lg font-bold">{t('lang.title')}</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {PICKABLE.map((l) => (
            <button
              key={l.code}
              type="button"
              lang={l.code}
              dir={l.dir}
              aria-pressed={lang === l.code}
              onClick={() => setLang(l.code)}
              className={`min-h-[56px] rounded-xl border px-4 py-3 text-left transition ${
                lang === l.code
                  ? 'border-emerald-400 bg-emerald-400/10'
                  : 'border-slate-600 bg-slate-900 hover:border-slate-400'
              }`}
            >
              <span className="block text-lg font-semibold">{l.native}</span>
              {!l.reviewed && <span className="block text-xs text-amber-200">{t('set.draft')}</span>}
            </button>
          ))}
        </div>
        <p className="text-xs leading-relaxed text-slate-300">{t('set.draft.note')}</p>

        <details className="rounded-xl border border-slate-700 bg-slate-950 p-3">
          <summary className="min-h-[44px] cursor-pointer py-2 text-sm font-semibold text-slate-100">
            {t('set.planned')}
          </summary>
          <p className="mb-3 text-xs text-slate-300">{t('set.planned.help')}</p>
          {PLANNED_LANGUAGES.map((g) => (
            <p key={g.region} className="mb-2 text-sm text-slate-200">
              <span className="font-semibold text-slate-100">
                {REGION_KEYS[g.region] ? t(REGION_KEYS[g.region]) : g.region}:{' '}
              </span>
              {g.names.join(', ')}
            </p>
          ))}
        </details>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-700 bg-[#0B132B] p-5">
        <div>
          <h2 className="text-lg font-bold">{t('country.title')}</h2>
          <p className="mt-1 text-sm text-slate-300">{t('country.help')}</p>
        </div>

        <select
          aria-label={t('country.title')}
          value={country}
          onChange={(e) => {
            setCountry(e.target.value);
            setError('');
            setMessage('');
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

        {selected && <p className="font-semibold text-emerald-300">{t('country.number', { number: selected.number })}</p>}

        {country === OTHER && (
          <div>
            <label htmlFor="settings-own" className="mb-1 block text-sm font-semibold text-slate-200">
              {t('country.own')}
            </label>
            <input
              id="settings-own"
              type="text"
              inputMode="numeric"
              value={own}
              onChange={(e) => setOwn(e.target.value)}
              className={fieldClass}
            />
          </div>
        )}

        {error && (
          <p role="alert" className="text-sm text-amber-200">
            {t(error)}
          </p>
        )}
        {message && (
          <p role="status" className="text-sm text-slate-200">
            {t(message)}
          </p>
        )}

        <button
          type="button"
          onClick={save}
          disabled={!country}
          className="min-h-[48px] w-full rounded-xl bg-emerald-500 px-6 py-3 text-base font-bold text-slate-900 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t('set.save')}
        </button>

        <p className="text-xs leading-relaxed text-slate-300">
          {t('set.current', { number: getEmergencyNumber() })}
        </p>
      </section>
    </div>
  );
}