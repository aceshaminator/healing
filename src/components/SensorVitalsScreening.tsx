/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from 'react';
import { addVital, analyzeMotion, estimatePulse, noteItemsFor } from '../lib/vitals';
import type { VitalReading } from '../lib/vitals';
import { useI18n } from '../i18n/I18nProvider';
import { getEmergencyNumber } from '../i18n/regions';

const CONSENT_KEY = 'healing_sensor_consent';
const SCAN_SECONDS = 20;
const MOTION_SECONDS = 15;

// Set to true only while developing. Shows raw sensor numbers on screen.
const DEBUG = false;

type Mode = 'idle' | 'pulse' | 'motion';
type Sample = { t: number; v: number };

const card = 'rounded-2xl border border-slate-700 bg-[#0B132B] p-5';
const primary =
  'min-h-[48px] rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50';
const ghost =
  'min-h-[44px] rounded-xl border border-slate-600 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-800';
const field =
  'min-h-[48px] w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30';

function readConsent(): boolean {
  try {
    return localStorage.getItem(CONSENT_KEY) === 'yes';
  } catch {
    return false;
  }
}

export function SensorVitalsScreening({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const { t } = useI18n();
  const emergencyNumber = getEmergencyNumber();
  const [agreed, setAgreed] = useState<boolean>(readConsent);
  const [mode, setMode] = useState<Mode>('idle');
  const [progress, setProgress] = useState(0);
  // Messages are kept as translation keys, so they change language with the app.
  const [hint, setHint] = useState('');
  const [hintExtra, setHintExtra] = useState('');
  const [error, setError] = useState('');
  const [errorExtra, setErrorExtra] = useState('');
  const [quality, setQuality] = useState('');
  const [result, setResult] = useState<VitalReading | null>(null);
  const [manual, setManual] = useState({ pulse: '', sys: '', dia: '', temp: '' });
  const stopRef = useRef<() => void>(() => {});

  useEffect(() => () => stopRef.current(), []);

  const fail = (key: string, extra = '') => {
    setError(key);
    setErrorExtra(extra);
  };

  const toggleConsent = (v: boolean) => {
    setAgreed(v);
    try {
      localStorage.setItem(CONSENT_KEY, v ? 'yes' : 'no');
    } catch {
      /* ignore */
    }
  };

  const reset = () => {
    setError('');
    setErrorExtra('');
    setResult(null);
    setQuality('');
    setProgress(0);
    setHint('');
    setHintExtra('');
  };

  const cancel = () => {
    stopRef.current();
    stopRef.current = () => {};
    setMode('idle');
    setHint('');
    setHintExtra('');
    setProgress(0);
  };

  const startPulse = async () => {
    reset();
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      fail('vit.err.camera.secure');
      return;
    }
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 320 }, height: { ideal: 240 } },
        audio: false,
      });
    } catch {
      fail('vit.err.camera.denied');
      return;
    }
    try {
      await stream.getVideoTracks()[0].applyConstraints({ advanced: [{ torch: true } as any] });
    } catch {
      /* no flash on this device: the scan can still work in bright light, but less well */
    }

    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.setAttribute('playsinline', 'true');
    video.style.cssText = 'position:fixed;left:-10px;top:-10px;width:2px;height:2px;opacity:0;pointer-events:none';
    video.srcObject = stream;
    document.body.appendChild(video);

    let alive = true;
    const stop = () => {
      alive = false;
      stream.getTracks().forEach((track) => track.stop());
      video.remove();
    };
    stopRef.current = stop;

    try {
      await video.play();
    } catch {
      stop();
      fail('vit.err.camera.start');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 24;
    canvas.height = 24;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      stop();
      fail('vit.err.camera.frames');
      return;
    }

    let samples: Sample[] = [];
    let startT = 0;
    let lastPct = -1;
    setMode('pulse');
    setHint('vit.hint.cover');

    const finish = () => {
      stop();
      setMode('idle');
      setHint('');
      setHintExtra('');
      const est = estimatePulse(samples);
      if (!est) {
        let extra = '';
        if (DEBUG) {
          const n = samples.length;
          const secs = n > 1 ? (samples[n - 1].t - samples[0].t) / 1000 : 0;
          const vals = samples.map((s) => s.v);
          const lo = n ? Math.round(Math.min(...vals)) : 0;
          const hi = n ? Math.round(Math.max(...vals)) : 0;
          extra = ` (test info: ${n} frames in ${secs.toFixed(0)}s, red level ${lo} to ${hi})`;
        }
        fail('vit.err.noclear', extra);
        return;
      }
      setQuality(est.quality);
      setResult(addVital({ source: 'fingertip', pulse: est.bpm }));
    };

    const tick = () => {
      if (!alive) return;
      ctx.drawImage(video, 0, 0, 24, 24);
      const d = ctx.getImageData(0, 0, 24, 24).data;
      let r = 0;
      let g = 0;
      let b = 0;
      const n = d.length / 4;
      for (let i = 0; i < d.length; i += 4) {
        r += d[i];
        g += d[i + 1];
        b += d[i + 2];
      }
      r /= n;
      g /= n;
      b /= n;
      const now = performance.now();
      const covered = r > 90 && r > g * 1.6 && r > b * 1.6;
      if (!covered) {
        if (startT) {
          samples = [];
          startT = 0;
          lastPct = -1;
          setProgress(0);
        }
        setHint('vit.hint.cover');
        if (DEBUG) setHintExtra(` (R ${Math.round(r)}, G ${Math.round(g)}, B ${Math.round(b)})`);
      } else {
        if (!startT) startT = now;
        samples.push({ t: now, v: r });
        const p = Math.min(1, (now - startT) / (SCAN_SECONDS * 1000));
        const pct = Math.floor(p * 100);
        if (pct !== lastPct) {
          lastPct = pct;
          setProgress(p);
        }
        setHint('vit.hint.still');
        if (p >= 1) {
          finish();
          return;
        }
      }
      schedule();
    };
    const schedule = () => {
      if (typeof (video as any).requestVideoFrameCallback === 'function') {
        (video as any).requestVideoFrameCallback(tick);
      } else {
        requestAnimationFrame(tick);
      }
    };
    schedule();
  };

  const startMotion = async () => {
    reset();
    if (!window.isSecureContext) {
      fail('vit.err.motion.secure');
      return;
    }
    const DM = (window as any).DeviceMotionEvent;
    if (!DM) {
      fail('vit.err.motion.none');
      return;
    }
    if (typeof DM.requestPermission === 'function') {
      try {
        const res = await DM.requestPermission();
        if (res !== 'granted') {
          fail('vit.err.motion.denied');
          return;
        }
      } catch {
        fail('vit.err.motion.denied');
        return;
      }
    }

    const samples: Sample[] = [];
    let recording = false;
    let recStart = 0;
    let timer = 0;
    const prepEnd = performance.now() + 3000;

    const onMotion = (e: DeviceMotionEvent) => {
      const a = e.accelerationIncludingGravity;
      if (!recording || !a || a.x == null || a.y == null || a.z == null) return;
      samples.push({ t: performance.now(), v: Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z) });
    };
    const stop = () => {
      window.removeEventListener('devicemotion', onMotion);
      window.clearInterval(timer);
    };
    const finish = () => {
      stop();
      setMode('idle');
      setHint('');
      const est = analyzeMotion(samples);
      if (!est) {
        fail('vit.err.motion.notenough');
        return;
      }
      setResult(addVital({ source: 'motion', movement: est.movement, rhythmHz: est.rhythmHz }));
    };

    stopRef.current = stop;
    setMode('motion');
    setHint('vit.hint.motion.prep');
    window.addEventListener('devicemotion', onMotion);
    timer = window.setInterval(() => {
      const now = performance.now();
      if (now < prepEnd) return;
      if (!recording) {
        recording = true;
        recStart = now;
        setHint('vit.hint.motion.rec');
      }
      const p = Math.min(1, (now - recStart) / (MOTION_SECONDS * 1000));
      setProgress(p);
      if (p >= 1) finish();
    }, 200);
  };

  const saveManual = (e: React.FormEvent) => {
    e.preventDefault();
    reset();
    // A comma is accepted as a decimal point, for example 36,8.
    const num = (s: string) => (s.trim() === '' ? undefined : Number(s.trim().replace(',', '.')));
    const pulse = num(manual.pulse);
    const systolic = num(manual.sys);
    const diastolic = num(manual.dia);
    const tempC = num(manual.temp);
    const bad = (v: number | undefined, lo: number, hi: number) =>
      v !== undefined && !(Number.isFinite(v) && v >= lo && v <= hi);

    if (pulse === undefined && systolic === undefined && diastolic === undefined && tempC === undefined) {
      fail('vit.err.manual.empty');
      return;
    }
    if ((systolic === undefined) !== (diastolic === undefined)) {
      fail('vit.err.manual.bp');
      return;
    }
    if (bad(pulse, 20, 250) || bad(systolic, 50, 260) || bad(diastolic, 30, 160) || bad(tempC, 30, 45)) {
      fail('vit.err.manual.range');
      return;
    }
    if (systolic !== undefined && diastolic !== undefined && systolic <= diastolic) {
      fail('vit.err.manual.order');
      return;
    }
    setResult(addVital({ source: 'manual', pulse, systolic, diastolic, tempC }));
    setManual({ pulse: '', sys: '', dia: '', temp: '' });
  };

  const view = result ? noteItemsFor(result) : null;
  const busy = mode !== 'idle';

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className={card}>
        <h2 className="text-xl font-bold text-white">{t('vit.title')}</h2>
        <p className="mt-1 text-sm text-slate-300">{t('vit.intro')}</p>
        <label className="mt-4 flex items-start gap-3 text-sm text-slate-200">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => toggleConsent(e.target.checked)}
            className="mt-1 h-5 w-5 accent-emerald-400"
          />
          <span>{t('vit.consent')}</span>
        </label>
      </div>

      {busy && (
        <div className={`${card} space-y-3`} aria-live="polite">
          <p className="text-sm font-semibold text-emerald-300">
            {hint ? t(hint) : ''}
            {hintExtra}
          </p>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
          <button type="button" onClick={cancel} className={ghost}>
            {t('vit.cancel')}
          </button>
        </div>
      )}

      {error && (
        <p role="alert" className="rounded-xl border border-amber-400/40 bg-amber-400/10 p-3 text-sm text-amber-100">
          {t(error)}
          {errorExtra}
        </p>
      )}

      {result && view && (
        <div className={`${card} space-y-3`} role="status">
          {view.urgent && (
            <div role="alert" className="space-y-2 rounded-xl border border-red-500/50 bg-red-500/15 p-3 text-sm text-red-100">
              <p className="font-bold">{t('vit.urgent.title')}</p>
              <p>{t('vit.urgent.body')}</p>
              <a
                href={`tel:${emergencyNumber}`}
                className="flex min-h-[44px] items-center justify-center rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-500"
              >
                {t('sos.call', { number: emergencyNumber })}
              </a>
            </div>
          )}
          <h3 className="text-base font-bold text-white">{t('vit.result.title')}</h3>
          {quality === 'fair' && <p className="text-xs text-amber-200">{t('vit.quality.fair')}</p>}
          <ul className="space-y-2">
            {view.items.map((n, i) => (
              <li key={i} className="rounded-lg border border-slate-700 bg-slate-900 p-3 text-sm text-slate-200">
                {t(n.key, n.vars)}
              </li>
            ))}
          </ul>
          <p className="rounded-lg border border-slate-700 p-3 text-xs leading-relaxed text-slate-300">{t('vit.seeDoctor')}</p>
          {onNavigate && (
            <button type="button" onClick={() => onNavigate('vitalcharts')} className={ghost}>
              {t('vit.viewcharts')}
            </button>
          )}
        </div>
      )}

      <div className={`${card} space-y-3`}>
        <h3 className="text-base font-bold text-white">{t('vit.pulse.title')}</h3>
        <p className="text-sm text-slate-300">{t('vit.pulse.text', { seconds: SCAN_SECONDS })}</p>
        <button type="button" onClick={startPulse} disabled={!agreed || busy} className={primary}>
          {t('vit.pulse.start')}
        </button>
      </div>

      <div className={`${card} space-y-3`}>
        <h3 className="text-base font-bold text-white">{t('vit.motion.title')}</h3>
        <p className="text-sm text-slate-300">{t('vit.motion.text', { seconds: MOTION_SECONDS })}</p>
        <button type="button" onClick={startMotion} disabled={!agreed || busy} className={primary}>
          {t('vit.motion.start')}
        </button>
      </div>

      <form onSubmit={saveManual} className={`${card} space-y-3`}>
        <h3 className="text-base font-bold text-white">{t('vit.manual.title')}</h3>
        <p className="text-sm text-slate-300">{t('vit.manual.text')}</p>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm text-slate-200">
            {t('vit.f.pulse')}
            <input
              inputMode="numeric"
              className={`${field} mt-1`}
              value={manual.pulse}
              onChange={(e) => setManual({ ...manual, pulse: e.target.value })}
              placeholder={t('vit.f.pulse.ph')}
            />
          </label>
          <label className="text-sm text-slate-200">
            {t('vit.f.temp')}
            <input
              inputMode="decimal"
              className={`${field} mt-1`}
              value={manual.temp}
              onChange={(e) => setManual({ ...manual, temp: e.target.value })}
              placeholder={t('vit.f.temp.ph')}
            />
          </label>
          <label className="text-sm text-slate-200">
            {t('vit.f.sys')}
            <input
              inputMode="numeric"
              className={`${field} mt-1`}
              value={manual.sys}
              onChange={(e) => setManual({ ...manual, sys: e.target.value })}
              placeholder={t('vit.f.sys.ph')}
            />
          </label>
          <label className="text-sm text-slate-200">
            {t('vit.f.dia')}
            <input
              inputMode="numeric"
              className={`${field} mt-1`}
              value={manual.dia}
              onChange={(e) => setManual({ ...manual, dia: e.target.value })}
              placeholder={t('vit.f.dia.ph')}
            />
          </label>
        </div>
        <button type="submit" className={primary}>
          {t('vit.save')}
        </button>
      </form>
    </div>
  );
}

export default SensorVitalsScreening;