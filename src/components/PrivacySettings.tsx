import React, { useState } from 'react';
import { useI18n } from '../i18n/I18nProvider';
import { canUsePin, eraseEverything, pinIsSet, removePin, setPin } from '../lib/pin';

const card = 'space-y-3 rounded-2xl border border-slate-700 bg-[#0B132B] p-5';
const field =
  'min-h-[48px] w-full rounded-xl border border-slate-600 bg-slate-950 px-3 py-2 text-base text-slate-100 placeholder-slate-400 focus:border-emerald-400 focus:outline-none';

export default function PrivacySettings() {
  const { t } = useI18n();
  const [hasPin, setHasPin] = useState<boolean>(pinIsSet);
  const [newPin, setNewPin] = useState('');
  const [repeat, setRepeat] = useState('');
  const [msg, setMsg] = useState('');
  const [eraseWord, setEraseWord] = useState('');
  const [showErase, setShowErase] = useState(false);

  const savePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canUsePin()) {
      setMsg(t('priv.pin.unsupported'));
      return;
    }
    if (!/^\d{4,6}$/.test(newPin)) {
      setMsg(t('priv.pin.bad'));
      return;
    }
    if (newPin !== repeat) {
      setMsg(t('priv.pin.mismatch'));
      return;
    }
    const ok = await setPin(newPin);
    setMsg(ok ? t('priv.pin.saved') : t('priv.pin.unsupported'));
    if (ok) {
      setHasPin(true);
      setNewPin('');
      setRepeat('');
    }
  };

  const turnOffPin = () => {
    removePin();
    setHasPin(false);
    setMsg(t('priv.pin.removed'));
  };

  const doErase = () => {
    if (eraseWord.trim().toUpperCase() !== t('priv.erase.word').toUpperCase()) {
      setMsg(t('priv.erase.wrong'));
      return;
    }
    eraseEverything();
    window.location.reload();
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5 text-slate-100">
      <section className={card}>
        <h2 className="text-lg font-bold">{t('priv.title')}</h2>
        <h3 className="text-sm font-semibold text-cyan-300">{t('priv.saved.title')}</h3>
        <p className="text-sm leading-relaxed text-slate-200">{t('priv.saved.body')}</p>
        <h3 className="text-sm font-semibold text-cyan-300">{t('priv.leaves.title')}</h3>
        <p className="text-sm leading-relaxed text-slate-200">{t('priv.leaves.body')}</p>
        <h3 className="text-sm font-semibold text-amber-200">{t('priv.limits.title')}</h3>
        <p className="text-sm leading-relaxed text-slate-200">{t('priv.limits.body')}</p>
      </section>

      <section className={card}>
        <h3 className="text-base font-bold">{t('priv.pin.title')}</h3>
        <p className="text-sm text-slate-300">{t('priv.pin.body')}</p>
        <form onSubmit={savePin} className="space-y-3">
          <div>
            <label htmlFor="pin-new" className="mb-1 block text-sm text-slate-200">
              {hasPin ? t('priv.pin.change') : t('priv.pin.set')}
            </label>
            <input
              id="pin-new"
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
              className={field}
            />
          </div>
          <div>
            <label htmlFor="pin-repeat" className="mb-1 block text-sm text-slate-200">
              {t('priv.pin.confirm')}
            </label>
            <input
              id="pin-repeat"
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={repeat}
              onChange={(e) => setRepeat(e.target.value.replace(/\D/g, ''))}
              className={field}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="min-h-[48px] rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-emerald-400"
            >
              {hasPin ? t('priv.pin.change') : t('priv.pin.set')}
            </button>
            {hasPin && (
              <button
                type="button"
                onClick={turnOffPin}
                className="min-h-[48px] rounded-xl border border-slate-500 px-4 py-2.5 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
              >
                {t('priv.pin.remove')}
              </button>
            )}
          </div>
        </form>
        {msg && (
          <p role="status" className="text-sm text-slate-200">
            {msg}
          </p>
        )}
      </section>

      <section className="space-y-3 rounded-2xl border border-red-500/40 bg-red-950/30 p-5">
        <h3 className="text-base font-bold text-red-200">{t('priv.erase.title')}</h3>
        <p className="text-sm leading-relaxed text-slate-200">{t('priv.erase.body')}</p>
        {!showErase ? (
          <button
            type="button"
            onClick={() => setShowErase(true)}
            className="min-h-[48px] rounded-xl border border-red-400/60 px-4 py-2.5 text-sm font-semibold text-red-100 transition hover:bg-red-900/40"
          >
            {t('priv.erase.btn')}
          </button>
        ) : (
          <div className="space-y-3">
            <label htmlFor="erase-word" className="block text-sm text-slate-200">
              {t('priv.erase.type', { word: t('priv.erase.word') })}
            </label>
            <input
              id="erase-word"
              type="text"
              autoComplete="off"
              value={eraseWord}
              onChange={(e) => setEraseWord(e.target.value)}
              className={field}
            />
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={doErase}
                className="min-h-[48px] rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-500"
              >
                {t('priv.erase.confirm')}
              </button>
              <button
                type="button"
                onClick={() => setShowErase(false)}
                className="min-h-[48px] rounded-xl border border-slate-500 px-4 py-2.5 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
              >
                {t('priv.erase.cancel')}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}