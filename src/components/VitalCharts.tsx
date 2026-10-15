import { useState } from 'react';
import { clearVitals, loadVitals } from '../lib/vitals';
import type { VitalReading } from '../lib/vitals';
import { useI18n } from '../i18n/I18nProvider';

const card = 'rounded-2xl border border-slate-700 bg-[#0B132B] p-5';

type TFn = (key: string, vars?: Record<string, string | number>) => string;

const SOURCE_KEYS: Record<VitalReading['source'], string> = {
  fingertip: 'chart.src.fingertip',
  motion: 'chart.src.motion',
  manual: 'chart.src.manual',
};

type Point = { v: number; src: VitalReading['source']; date: string };

const WHEN_OPTIONS: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' };

// Dates and numbers follow the app language, for example 36,8 in French.
function formatWhen(value: string, lang: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  try {
    return d.toLocaleString(lang, WHEN_OPTIONS);
  } catch {
    return d.toLocaleString(undefined, WHEN_OPTIONS);
  }
}

function formatNum(v: number, lang: string) {
  try {
    return v.toLocaleString(lang);
  } catch {
    return String(v);
  }
}

function parts(r: VitalReading, t: TFn, lang: string): string[] {
  const p: string[] = [];
  if (r.pulse !== undefined) p.push(t('chart.part.pulse', { n: formatNum(r.pulse, lang) }));
  if (r.systolic !== undefined && r.diastolic !== undefined) p.push(t('chart.part.bp', { s: r.systolic, d: r.diastolic }));
  if (r.tempC !== undefined) p.push(t('chart.part.temp', { n: formatNum(r.tempC, lang) }));
  if (r.movement !== undefined) p.push(t('chart.part.move', { n: formatNum(r.movement, lang) }));
  return p;
}

function PulseChart({ points, ariaLabel }: { points: Point[]; ariaLabel: string }) {
  const W = 320;
  const H = 150;
  const L = 40;
  const R = 14;
  const T = 14;
  const B = 18;

  const values = points.map((p) => p.v);
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  // Never zoom in so far that a small change looks big: the scale covers at least 40 bpm.
  const mid = (lo + hi) / 2;
  const half = Math.max((hi - lo) / 2 + 5, 20);
  const yMin = mid - half;
  const yMax = mid + half;

  const x = (i: number) => (points.length === 1 ? (L + (W - R)) / 2 : L + (i * (W - L - R)) / (points.length - 1));
  const y = (v: number) => T + (1 - (v - yMin) / (yMax - yMin)) * (H - T - B);
  const line = points.map((p, i) => `${x(i)},${y(p.v)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={ariaLabel} className="w-full">
      <line x1={L} y1={T} x2={W - R} y2={T} stroke="#1e293b" strokeWidth="1" />
      <line x1={L} y1={(T + H - B) / 2} x2={W - R} y2={(T + H - B) / 2} stroke="#1e293b" strokeWidth="1" />
      <line x1={L} y1={H - B} x2={W - R} y2={H - B} stroke="#475569" strokeWidth="1" />
      <text x={L - 6} y={T + 4} textAnchor="end" fontSize="10" fill="#cbd5e1">
        {Math.round(yMax)}
      </text>
      <text x={L - 6} y={H - B + 4} textAnchor="end" fontSize="10" fill="#cbd5e1">
        {Math.round(yMin)}
      </text>
      {points.length > 1 && (
        <polyline points={line} fill="none" stroke="#34d399" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      )}
      {points.map((p, i) =>
        p.src === 'fingertip' ? (
          <circle key={i} cx={x(i)} cy={y(p.v)} r="4" fill="#0B132B" stroke="#34d399" strokeWidth="2" />
        ) : (
          <circle key={i} cx={x(i)} cy={y(p.v)} r="4" fill="#34d399" />
        ),
      )}
    </svg>
  );
}

export function VitalCharts({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const { t, lang } = useI18n();
  const [list, setList] = useState<VitalReading[]>(loadVitals);
  const [confirm, setConfirm] = useState(false);

  const points: Point[] = list
    .filter((r) => r.pulse !== undefined)
    .slice(0, 20)
    .reverse()
    .map((r) => ({ v: r.pulse as number, src: r.source, date: r.date }));

  const latestBp = list.find((r) => r.systolic !== undefined && r.diastolic !== undefined);
  const latestTemp = list.find((r) => r.tempC !== undefined);
  const latestMove = list.find((r) => r.movement !== undefined);
  const latestPulse = list.find((r) => r.pulse !== undefined);

  const tiles: { label: string; value: string }[] = [
    {
      label: t('chart.tile.pulse'),
      value: latestPulse ? t('chart.part.pulse', { n: formatNum(latestPulse.pulse as number, lang) }) : '—',
    },
    {
      label: t('chart.tile.bp'),
      value: latestBp ? `${latestBp.systolic}/${latestBp.diastolic}` : '—',
    },
    {
      label: t('chart.tile.temp'),
      value: latestTemp ? t('chart.part.temp', { n: formatNum(latestTemp.tempC as number, lang) }) : '—',
    },
    {
      label: t('chart.tile.move'),
      value: latestMove ? formatNum(latestMove.movement as number, lang) : '—',
    },
  ];

  const wipe = () => {
    clearVitals();
    setList([]);
    setConfirm(false);
  };

  if (list.length === 0) {
    return (
      <div className={`${card} space-y-3 text-center`}>
        <h2 className="text-lg font-bold text-white">{t('chart.empty.title')}</h2>
        <p className="text-sm text-slate-300">{t('chart.empty.text')}</p>
        {onNavigate && (
          <button
            type="button"
            onClick={() => onNavigate('sensorvitalsscreening')}
            className="min-h-[48px] rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-emerald-400"
          >
            {t('chart.empty.btn')}
          </button>
        )}
      </div>
    );
  }

  const lo = points.length ? Math.min(...points.map((p) => p.v)) : 0;
  const hi = points.length ? Math.max(...points.map((p) => p.v)) : 0;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="grid grid-cols-2 gap-3">
        {tiles.map((tile) => (
          <div key={tile.label} className={card}>
            <p className="text-xs uppercase tracking-wider text-slate-300">{t('chart.latest', { label: tile.label })}</p>
            <p className="mt-1 text-xl font-bold text-white">{tile.value}</p>
          </div>
        ))}
      </div>

      {points.length > 0 && (
        <div className={card}>
          <h3 className="text-sm font-bold text-white">{t('chart.pulse.title')}</h3>
          <PulseChart points={points} ariaLabel={t('chart.pulse.aria', { lo, hi })} />
          <p className="mt-1 text-xs text-slate-300">{t('chart.pulse.range', { lo, hi, count: points.length })}</p>
          <p className="text-xs text-slate-300">
            {t('chart.pulse.dates', {
              from: formatWhen(points[0].date, lang),
              to: formatWhen(points[points.length - 1].date, lang),
            })}
          </p>
          <p className="mt-2 text-xs text-slate-300">
            <span aria-hidden="true">●</span> {t('chart.legend.typed')} &nbsp; <span aria-hidden="true">○</span>{' '}
            {t('chart.legend.camera')}
          </p>
        </div>
      )}

      <div className={`${card} space-y-3`}>
        <h3 className="text-sm font-bold text-white">{t('chart.all.title', { count: list.length })}</h3>
        <ul className="space-y-2">
          {list.map((r) => (
            <li key={r.id} className="rounded-lg border border-slate-700 bg-slate-900 p-3 text-sm">
              <div className="flex items-start justify-between gap-3">
                <span className="font-semibold text-emerald-300">{parts(r, t, lang).join(' · ')}</span>
                <time className="shrink-0 text-xs text-slate-300">{formatWhen(r.date, lang)}</time>
              </div>
              <p className="mt-1 text-xs text-slate-300">{t(SOURCE_KEYS[r.source])}</p>
            </li>
          ))}
        </ul>
      </div>

      <p className="rounded-lg border border-slate-700 p-3 text-xs leading-relaxed text-slate-300">{t('vit.seeDoctor')}</p>

      <div>
        {confirm ? (
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-slate-200">{t('chart.del.q')}</span>
            <button
              type="button"
              onClick={wipe}
              className="min-h-[44px] rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-500"
            >
              {t('chart.del.yes')}
            </button>
            <button
              type="button"
              onClick={() => setConfirm(false)}
              className="min-h-[44px] rounded-xl border border-slate-500 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
            >
              {t('chart.del.keep')}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirm(true)}
            className="min-h-[44px] rounded-xl border border-slate-500 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
          >
            {t('chart.del.btn')}
          </button>
        )}
      </div>
    </div>
  );
}

export default VitalCharts;