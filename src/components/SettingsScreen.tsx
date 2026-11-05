import React, { useState } from 'react';
import { useI18n } from '../i18n/I18nProvider';
import { PICKABLE, PLANNED_LANGUAGES } from '../i18n/languages';
import { COUNTRIES, OTHER, getCountryCode, getEmergencyNumber, saveRegion, validNumber } from '../i18n/regions';
import { LIGHT_READY, getMotionPref, getThemePref, setMotionPref, setThemePref } from '../theme';
import type { MotionPref, ThemePref } from '../theme';

const REGION_KEYS: Record<string, string> = {
  Africa: 'set.region.africa',
  Asia: 'set.region.asia',
  'South America': 'set.region.samerica',
  'Eastern Europe': 'set.region.eeurope',
};

const fieldClass =
  'min-h-[48px] w-full rounded-xl border border-muted/40 bg-canvas px-3 py-2 text-base text-ink placeholder-muted focus:border-brand focus:outline-none';

const THEME_OPTIONS: { value: ThemePref; key: string }[] = [
  { value: 'dark', key: 'disp.theme.dark' },
  { value: 'light', key: 'disp.theme.light' },
  { value: 'system', key: 'disp.theme.system' },
];

const MOTION_OPTIONS: { value: MotionPref; key: string }[] = [
  { value: 'system', key: 'disp.motion.system' },
  { value: 'reduce', key: 'disp.motion.reduce' },
  { value: 'full', key: 'disp.motion.full' },
];

export default function SettingsScreen() {
  const { lang, setLang, t } = useI18n();
  const [country, setCountry] = useState(getCountryCode());
  const [own, setOwn] = useState(getCountryCode() === OTHER ? getEmergencyNumber() : '');
  // Messages are kept as translation keys, so they change language with the app.
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [theme, setTheme] = useState<ThemePref>(LIGHT_READY ? getThemePref() : 'dark');
  const [motion, setMotion] = useState<MotionPref>(getMotionPref());

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
    <div className="mx-auto max-w-2xl space-y-6 text-ink">
      <section className="space-y-3 rounded-2xl border border-line bg-surface p-5">
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
                  ? 'border-brand bg-brand/10'
                  : 'border-muted/40 bg-surface hover:border-muted/60'
              }`}
            >
              <span className="block text-lg font-semibold">{l.native}</span>
              {!l.reviewed && <span className="block text-xs text-tone-amber">{t('set.draft')}</span>}
            </button>
          ))}
        </div>
        <p className="text-xs leading-relaxed text-ink/80">{t('set.draft.note')}</p>

        <details className="rounded-xl border border-line bg-canvas p-3">
          <summary className="min-h-[44px] cursor-pointer py-2 text-sm font-semibold text-ink">
            {t('set.planned')}
          </summary>
          <p className="mb-3 text-xs text-ink/80">{t('set.planned.help')}</p>
          {PLANNED_LANGUAGES.map((g) => (
            <p key={g.region} className="mb-2 text-sm text-ink">
              <span className="font-semibold text-ink">
                {REGION_KEYS[g.region] ? t(REGION_KEYS[g.region]) : g.region}:{' '}
              </span>
              {g.names.join(', ')}
            </p>
          ))}
        </details>
      </section>

      <section className="space-y-4 rounded-2xl border border-line bg-surface p-5">
        <div>
          <h2 className="text-lg font-bold">{t('country.title')}</h2>
          <p className="mt-1 text-sm text-ink/80">{t('country.help')}</p>
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

        {selected && <p className="font-semibold text-tone-green">{t('country.number', { number: selected.number })}</p>}

        {country === OTHER && (
          <div>
            <label htmlFor="settings-own" className="mb-1 block text-sm font-semibold text-ink">
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
          <p role="alert" className="text-sm text-tone-amber">
            {t(error)}
          </p>
        )}
        {message && (
          <p role="status" className="text-sm text-ink">
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

        <p className="text-xs leading-relaxed text-ink/80">
          {t('set.current', { number: getEmergencyNumber() })}
        </p>
      </section>

      <section className="space-y-5 rounded-2xl border border-line bg-surface p-5 text-ink">
        <h2 className="text-lg font-bold">{t('disp.title')}</h2>

        {LIGHT_READY && (
          <div>
            <p className="mb-2 text-sm font-semibold">{t('disp.theme')}</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {THEME_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  aria-pressed={theme === o.value}
                  onClick={() => {
                    setTheme(o.value);
                    setThemePref(o.value);
                  }}
                  className={`min-h-[48px] rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                    theme === o.value ? 'border-brand bg-brand/10' : 'border-line hover:border-muted'
                  }`}
                >
                  {t(o.key)}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted">{t('disp.theme.note')}</p>
          </div>
        )}

        <div>
          <p className="mb-2 text-sm font-semibold">{t('disp.motion')}</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {MOTION_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                aria-pressed={motion === o.value}
                onClick={() => {
                  setMotion(o.value);
                  setMotionPref(o.value);
                }}
                className={`min-h-[48px] rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                  motion === o.value ? 'border-brand bg-brand/10' : 'border-line hover:border-muted'
                }`}
              >
                {t(o.key)}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted">{t('disp.motion.note')}</p>
        </div>
      </section>
    </div>
  );
}