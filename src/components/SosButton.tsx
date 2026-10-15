import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../i18n/I18nProvider';
import { getEmergencyNumber, getExtraNumbers, numberIsSet } from '../i18n/regions';

type SosButtonProps = {
  patientName?: string;
  location?: string;
  /** Optional override. Normally the number comes from the country chosen in Settings. */
  emergencyNumber?: string;
  /** Optional delay before the alert is "ready". Default 0: the call button works immediately. */
  countdownSeconds?: number;
  onTrigger?: () => void;
};

export default function SosButton({
  patientName = '',
  location = '',
  emergencyNumber,
  countdownSeconds = 0,
  onTrigger,
}: SosButtonProps) {
  const { t } = useI18n();
  const number = emergencyNumber || getEmergencyNumber();
  const extras = getExtraNumbers();
  const [open, setOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(countdownSeconds);
  const callRef = useRef<HTMLAnchorElement>(null);
  const onTriggerRef = useRef(onTrigger);
  onTriggerRef.current = onTrigger;

  const ready = open && secondsLeft <= 0;
  const details = [patientName, location].filter(Boolean).join(' · ');

  const openAlert = () => {
    setSecondsLeft(countdownSeconds);
    setOpen(true);
  };

  useEffect(() => {
    if (!open || secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [open, secondsLeft]);

  useEffect(() => {
    if (ready) onTriggerRef.current?.();
  }, [ready]);

  useEffect(() => {
    if (!open) return;
    navigator.vibrate?.([200, 100, 200]);
    callRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={openAlert}
        aria-label={t('sos.title')}
        className="flex min-h-[44px] items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white ring-2 ring-red-400/40 transition hover:bg-red-500 focus:outline-none focus:ring-4 focus:ring-red-300/60"
      >
        <span aria-hidden="true">⚠</span>
        SOS
      </button>

      {open && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="sos-title"
          aria-describedby="sos-message"
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-red-950/95 p-4"
        >
          <div className="w-full max-w-md rounded-3xl border border-red-500/60 bg-[#1a0a0d] p-8 text-center shadow-2xl">
            <h2 id="sos-title" className="text-2xl font-extrabold tracking-wide text-red-300">
              {t('sos.title')}
            </h2>

            <p id="sos-message" className="mt-2 text-sm text-slate-200">
              {t('sos.message', { number })}
            </p>

            {!numberIsSet() && (
              <p className="mt-3 rounded-lg border border-amber-400/50 bg-amber-400/10 p-2 text-xs text-amber-100">
                {t('sos.unset')}
              </p>
            )}

            {details && <p className="mt-1 text-xs text-slate-300">{details}</p>}

            {!ready && (
              <div
                aria-live="polite"
                className="mx-auto mt-6 flex h-24 w-24 items-center justify-center rounded-full border-4 border-red-500 text-4xl font-bold text-white"
              >
                {secondsLeft}
              </div>
            )}

            <a
              ref={callRef}
              href={`tel:${number}`}
              className={`mt-6 block rounded-xl bg-red-600 py-4 text-lg font-bold text-white transition hover:bg-red-500 ${
                ready ? 'animate-pulse' : ''
              }`}
            >
              {t('sos.call', { number })}
            </a>

            {extras.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {extras.map((x) => (
                  <a
                    key={x.number}
                    href={`tel:${x.number}`}
                    className="flex min-h-[48px] items-center justify-center rounded-xl border border-red-400/60 px-3 py-2 text-sm font-semibold text-red-100 transition hover:bg-red-900/40"
                  >
                    {t(x.labelKey)}: {x.number}
                  </a>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                window.dispatchEvent(new CustomEvent('healing:open-section', { detail: 'emergency' }));
              }}
              className="mt-3 min-h-[48px] w-full rounded-xl border border-red-400/60 px-3 py-2 text-sm font-semibold text-red-100 transition hover:bg-red-900/40"
            >
              {t('sos.plan')}
            </button>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-3 min-h-[44px] w-full rounded-xl border border-slate-500 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
            >
              {t('sos.close')}
            </button>
          </div>
        </div>
      )}
    </>
  );
}