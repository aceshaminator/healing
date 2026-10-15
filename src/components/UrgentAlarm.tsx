import { useEffect, useRef, useState } from 'react';

// Nigeria's national emergency number. Change it if the app is used in another country.
const EMERGENCY_NUMBER = (() => { try { return localStorage.getItem('healing_emergency_number') || '112'; } catch { return '112'; } })();
// The siren stops by itself after this long, so it does not drown out a phone call.
const SIREN_MAX_MS = 10000;

export interface Assessment {
  score?: number;
  level: 'normal' | 'moderate' | 'critical';
  recommendation: string;
  triggers: string[];
}

interface UrgentAlarmProps {
  /** Pass the reasons directly (the Results screen does this). The alarm always shows. */
  reasons?: string[];
  /** Older way: pass a whole assessment. The alarm only shows when its level is 'critical'. */
  assessment?: Assessment;
  onDismiss?: () => void;
  onSeekCare?: () => void;
}

export default function UrgentAlarm({ reasons, assessment, onDismiss, onSeekCare }: UrgentAlarmProps) {
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const callRef = useRef<HTMLAnchorElement>(null);

  const visible = reasons !== undefined ? true : assessment?.level === 'critical';
  const list = reasons ?? assessment?.triggers ?? [];
  const message =
    assessment?.recommendation ??
    'Your answers or readings may point to something serious. Please get medical help now.';

  // Siren (stops by itself after SIREN_MAX_MS)
  useEffect(() => {
    if (!visible || !audioEnabled) return;
    let ctx: AudioContext | null = null;
    let timer: ReturnType<typeof setInterval> | undefined;
    let stopTimer: ReturnType<typeof setTimeout> | undefined;
    try {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new Ctx();
      const beep = () => {
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      };
      beep();
      timer = setInterval(beep, 600);
      stopTimer = setTimeout(() => {
        if (timer) clearInterval(timer);
      }, SIREN_MAX_MS);
    } catch (e) {
      console.warn('Audio error:', e);
    }
    return () => {
      if (timer) clearInterval(timer);
      if (stopTimer) clearTimeout(stopTimer);
      ctx?.close().catch(() => {});
    };
  }, [visible, audioEnabled]);

  // Vibration
  useEffect(() => {
    if (!visible || !vibrationEnabled || typeof navigator.vibrate !== 'function') return;
    navigator.vibrate([500, 200, 500, 200, 500]);
    return () => {
      navigator.vibrate(0);
    };
  }, [visible, vibrationEnabled]);

  // Put focus on the call button so it is the first thing a screen reader announces.
  useEffect(() => {
    if (visible) callRef.current?.focus();
  }, [visible]);

  if (!visible) return null;

  const toggleOn = 'bg-red-900/60 border-red-400 text-red-100';
  const toggleOff = 'bg-slate-800 border-slate-500 text-slate-200';

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="alarm-title"
      aria-describedby="alarm-message"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-red-950/95 p-4"
    >
      <div className="w-full max-w-lg rounded-2xl border-2 border-red-500 bg-slate-900 p-6 text-center text-white shadow-2xl">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-600">
          <span className="text-3xl" aria-hidden="true">
            ⚠️
          </span>
        </div>

        <h2 id="alarm-title" className="mb-2 text-2xl font-black uppercase tracking-wide text-red-400">
          Urgent: get medical help
        </h2>

        <p id="alarm-message" className="mb-4 text-slate-200">
          {message}
        </p>

        {list.length > 0 && (
          <div className="mb-4 rounded-lg border border-slate-600 bg-slate-800 p-3 text-left">
            <p className="mb-1 text-xs font-semibold uppercase text-red-300">Why you are seeing this:</p>
            <ul className="list-inside list-disc space-y-1 text-sm text-slate-100">
              {list.map((reason, idx) => (
                <li key={idx}>{reason}</li>
              ))}
            </ul>
          </div>
        )}

        <p className="mb-5 text-xs text-slate-300">
          This is a screening estimate, not a diagnosis. Only a doctor can tell what is wrong.
        </p>

        <div className="mb-5 flex flex-wrap justify-center gap-3 text-sm">
          <button
            type="button"
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`min-h-[44px] rounded-lg border px-3 py-2 ${audioEnabled ? toggleOn : toggleOff}`}
          >
            {audioEnabled ? '🔊 Sound on' : '🔇 Sound off'}
          </button>
          <button
            type="button"
            onClick={() => setVibrationEnabled(!vibrationEnabled)}
            className={`min-h-[44px] rounded-lg border px-3 py-2 ${vibrationEnabled ? toggleOn : toggleOff}`}
          >
            {vibrationEnabled ? '📳 Vibration on' : '📳 Vibration off'}
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <a
            ref={callRef}
            href={`tel:${EMERGENCY_NUMBER}`}
            className="flex min-h-[52px] w-full items-center justify-center rounded-xl bg-red-600 py-3 text-lg font-bold text-white transition-colors hover:bg-red-500"
          >
            Call {EMERGENCY_NUMBER} now
          </a>
          {onSeekCare && (
            <button
              type="button"
              onClick={onSeekCare}
              className="min-h-[48px] w-full rounded-xl border border-slate-400 py-2.5 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
            >
              Find care near me
            </button>
          )}
          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className="min-h-[48px] w-full rounded-xl bg-slate-800 py-2.5 text-sm font-medium text-slate-100 transition hover:bg-slate-700"
            >
              I understand, close this
            </button>
          )}
        </div>
      </div>
    </div>
  );
}