import { useEffect, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { useI18n } from '../i18n/I18nProvider';
import { getEmergencyNumber } from '../i18n/regions';
import { checkPin, pinIsSet } from '../lib/pin';

// Locks the app if it has been in the background for longer than this.
const LOCK_AFTER_MS = 60_000;
const WAIT_AFTER_WRONG_MS = 30_000;

export default function PinGate({ children }: { children: ReactNode }) {
  const [locked, setLocked] = useState<boolean>(pinIsSet);
  const hiddenAt = useRef<number | null>(null);

  useEffect(() => {
    const onChange = () => {
      if (document.hidden) {
        hiddenAt.current = Date.now();
        return;
      }
      if (hiddenAt.current && Date.now() - hiddenAt.current > LOCK_AFTER_MS && pinIsSet()) setLocked(true);
      hiddenAt.current = null;
    };
    document.addEventListener('visibilitychange', onChange);
    return () => document.removeEventListener('visibilitychange', onChange);
  }, []);

  if (locked) return <PinScreen onUnlock={() => setLocked(false)} />;
  return <>{children}</>;
}

function PinScreen({ onUnlock }: { onUnlock: () => void }) {
  const { t } = useI18n();
  const number = getEmergencyNumber();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [wrong, setWrong] = useState(0);
  const [waitUntil, setWaitUntil] = useState(0);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (waitUntil <= Date.now()) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [waitUntil]);

  const secondsLeft = Math.max(0, Math.ceil((waitUntil - now) / 1000));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (secondsLeft > 0) return;
    if (await checkPin(pin)) {
      onUnlock();
      return;
    }
    const count = wrong + 1;
    setWrong(count);
    setPin('');
    setError(t('pin.wrong'));
    if (count % 5 === 0) {
      const until = Date.now() + WAIT_AFTER_WRONG_MS;
      setWaitUntil(until);
      setNow(Date.now());
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas p-4 pb-24 text-ink">
      <div className="w-full max-w-sm space-y-5 rounded-3xl border border-brand/20 bg-surface p-8 text-center shadow-xl">
        <h1 className="text-2xl font-semibold">{t('pin.title')}</h1>
        <p className="text-sm text-ink/80">{t('pin.sub')}</p>

        <form onSubmit={submit} className="space-y-4">
          <label htmlFor="pin-input" className="sr-only">
            {t('pin.label')}
          </label>
          <input
            id="pin-input"
            type="password"
            inputMode="numeric"
            autoComplete="off"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            placeholder="••••"
            className="min-h-[56px] w-full rounded-xl border border-muted/40 bg-canvas px-4 text-center text-2xl tracking-[0.5em] text-ink focus:border-brand focus:outline-none"
          />
          {error && (
            <p role="alert" className="text-sm text-tone-amber">
              {error}
            </p>
          )}
          {secondsLeft > 0 && (
            <p role="status" className="text-sm text-tone-amber">
              {t('pin.wait', { s: secondsLeft })}
            </p>
          )}
          <button
            type="submit"
            disabled={pin.length < 4 || secondsLeft > 0}
            className="min-h-[52px] w-full rounded-2xl bg-emerald-500 py-3 text-base font-bold text-slate-900 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t('pin.unlock')}
          </button>
        </form>

        {/* Emergency call always works, even when locked. */}
        <a
          href={`tel:${number}`}
          className="flex min-h-[52px] items-center justify-center rounded-2xl bg-red-600 px-4 py-3 text-base font-bold text-white transition hover:bg-red-500"
        >
          {t('pin.emergency', { number })}
        </a>

        <p className="text-xs leading-relaxed text-ink/80">{t('pin.forgot')}</p>
      </div>
    </div>
  );
}