// src/components/ExportReport.tsx
import React, { useState } from 'react';
import { loadVitals } from '../lib/vitals';
import type { VitalReading } from '../lib/vitals';
import { useI18n } from '../i18n/I18nProvider';
import { LANGUAGES } from '../i18n/languages';
import { frequencyKey, relationKey, severityKey } from '../i18n/labels';

interface ExportReportProps {
  onBack?: () => void;
}

interface SymptomLog {
  id: string;
  symptom: string;
  severity: string;
  duration: string;
  dateLogged: string;
  notes: string;
}
interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  notes: string;
}
interface Relative {
  id: string;
  name: string;
  relation: string;
  age: number | string;
  conditions: string;
}

type Section = { title: string; lines: string[] };
type Include = { vitals: boolean; symptoms: boolean; meds: boolean; family: boolean };
type TFn = (key: string, vars?: Record<string, string | number>) => string;
type Msg = { key: string };

const SOURCE_KEYS: Record<VitalReading['source'], string> = {
  fingertip: 'sum.src.fingertip',
  motion: 'sum.src.motion',
  manual: 'sum.src.manual',
};

function readList<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    let parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && 'payload' in (parsed as object)) {
      parsed = (parsed as { payload: unknown }).payload;
    }
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function collect() {
  const vitals = loadVitals();
  // The filters drop the made-up sample entries that older versions of the screens added for everyone.
  const symptoms = readList<SymptomLog>('Healing_symptom_logs').filter(
    (l) => !(l.id === '1' && l.symptom === 'Migraine / Headache'),
  );
  const meds = readList<Medication>('healing_medications').filter(
    (m) => !(m.id === '1' && m.name === 'Omega-3 Fish Oil'),
  );
  const family = readList<Relative>('healing_family_members').filter(
    (r) => !((r.id === '1' || r.id === '2') && (r.name === 'John Doe' || r.name === 'Jane Doe')),
  );
  return { vitals, symptoms, meds, family };
}

type Data = ReturnType<typeof collect>;

function num(n: number, lang: string) {
  try {
    return n.toLocaleString(lang);
  } catch {
    return String(n);
  }
}

function stamp(iso: string, lang: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const o: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' };
  try {
    return d.toLocaleString(lang, o);
  } catch {
    return d.toLocaleString(undefined, o);
  }
}

function today(lang: string) {
  const o: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
  try {
    return new Date().toLocaleDateString(lang, o);
  } catch {
    return new Date().toLocaleDateString(undefined, o);
  }
}

function vitalParts(r: VitalReading, t: TFn, lang: string): string {
  const p: string[] = [];
  if (r.pulse !== undefined) p.push(t('sum.v.pulse', { n: num(r.pulse, lang) }));
  if (r.systolic !== undefined && r.diastolic !== undefined) p.push(t('sum.v.bp', { s: r.systolic, d: r.diastolic }));
  if (r.tempC !== undefined) p.push(t('sum.v.temp', { n: num(r.tempC, lang) }));
  if (r.movement !== undefined) p.push(t('sum.v.move', { n: num(r.movement, lang) }));
  return p.join(', ');
}

function buildSections(d: Data, inc: Include, t: TFn, lang: string): Section[] {
  const out: Section[] = [];

  if (inc.vitals) {
    const lines: string[] = [];
    if (d.vitals.length === 0) {
      lines.push(t('sum.nothing'));
    } else {
      lines.push(t('sum.recent'));
      d.vitals.slice(0, 10).forEach((r) => {
        const text = vitalParts(r, t, lang);
        if (text) lines.push(`${stamp(r.date, lang)}: ${text} (${t(SOURCE_KEYS[r.source])})`);
      });
    }
    out.push({ title: t('sum.sec.vitals'), lines });
  }

  if (inc.symptoms) {
    const lines =
      d.symptoms.length === 0
        ? [t('sum.nothing')]
        : d.symptoms.slice(0, 15).map((s) => {
            const sk = severityKey(s.severity);
            return t('sum.line.symptom', {
              date: s.dateLogged,
              symptom: s.symptom,
              severity: sk ? t(sk) : s.severity,
              duration: s.duration === 'Unspecified' ? t('trk.unspecified') : s.duration,
              notes: s.notes && s.notes !== 'No additional details.' ? t('sum.line.notes', { notes: s.notes }) : '',
            });
          });
    out.push({ title: t('sum.sec.symptoms'), lines });
  }

  if (inc.meds) {
    const lines =
      d.meds.length === 0
        ? [t('sum.nothing')]
        : d.meds.map((m) => {
            const fk = frequencyKey(m.frequency);
            return t('sum.line.med', {
              name: m.name,
              dosage: m.dosage,
              freq: fk ? t(fk) : m.frequency,
              notes: m.notes && m.notes !== 'No special instructions.' ? t('sum.line.notes', { notes: m.notes }) : '',
            });
          });
    out.push({ title: t('sum.sec.meds'), lines });
  }

  if (inc.family) {
    const lines =
      d.family.length === 0
        ? [t('sum.nothing')]
        : d.family.map((r) => {
            const rk = relationKey(r.relation);
            return t('sum.line.family', {
              relation: rk ? t(rk) : r.relation,
              age: typeof r.age === 'number' ? t('sum.line.age', { age: r.age }) : '',
              conditions: r.conditions === 'None reported' ? t('fam.none') : r.conditions,
            });
          });
    out.push({ title: t('sum.sec.family'), lines });
  }

  return out;
}

function esc(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function toText(sections: Section[], name: string, t: TFn, lang: string): string {
  const head = [t('sum.head'), t('sum.prepared', { date: today(lang) })];
  if (name.trim()) head.push(t('sum.namefield', { name: name.trim() }));
  head.push(t('sum.note'), '');
  const body = sections.flatMap((s) => [s.title.toUpperCase(), ...s.lines.map((l) => `- ${l}`), '']);
  return [...head, ...body].join('\n');
}

function toHtml(sections: Section[], name: string, t: TFn, lang: string, dir: string): string {
  const body = sections
    .map((s) => `<h2>${esc(s.title)}</h2><ul>${s.lines.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>`)
    .join('');
  return `<!doctype html><html lang="${esc(lang)}" dir="${esc(dir)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(t('sum.html.title'))}</title><style>
body{font-family:Arial,Helvetica,sans-serif;max-width:720px;margin:24px auto;padding:0 16px;color:#111;line-height:1.45}
h1{font-size:22px;margin:0 0 4px}h2{font-size:16px;margin:22px 0 6px;border-bottom:1px solid #ccc;padding-bottom:4px}
ul{margin:6px 0 0;padding-inline-start:20px}li{margin:4px 0}.meta{color:#444;font-size:13px;margin:2px 0}
</style></head><body><h1>${esc(t('sum.html.title'))}</h1>
<p class="meta">${esc(t('sum.prepared', { date: today(lang) }))}</p>
${name.trim() ? `<p class="meta">${esc(t('sum.namefield', { name: name.trim() }))}</p>` : ''}
<p class="meta">${esc(t('sum.note'))}</p>${body}</body></html>`;
}

const fieldClass =
  'min-h-[44px] w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-400 focus:border-teal-400 focus:outline-none';
const actionBtn =
  'min-h-[48px] w-full rounded-lg px-4 py-3 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50';

export function ExportReport({ onBack }: ExportReportProps) {
  const { t, lang } = useI18n();
  const dir = LANGUAGES.find((l) => l.code === lang)?.dir ?? 'ltr';
  const [data] = useState<Data>(collect);
  const [inc, setInc] = useState<Include>({ vitals: true, symptoms: true, meds: true, family: true });
  const [name, setName] = useState('');
  const [message, setMessage] = useState<Msg | null>(null);

  const sections = buildSections(data, inc, t, lang);
  const hasContent =
    (inc.vitals && data.vitals.length > 0) ||
    (inc.symptoms && data.symptoms.length > 0) ||
    (inc.meds && data.meds.length > 0) ||
    (inc.family && data.family.length > 0);

  const toggle = (k: keyof Include) => setInc((p) => ({ ...p, [k]: !p[k] }));

  const handlePrint = () => {
    const w = window.open('', '_blank');
    if (!w) {
      setMessage({ key: 'sum.msg.popup' });
      return;
    }
    w.document.write(toHtml(sections, name, t, lang, dir));
    w.document.close();
    w.focus();
    setTimeout(() => {
      try {
        w.print();
      } catch {
        /* the person can still print from the new window */
      }
    }, 400);
    setMessage({ key: 'sum.msg.opened' });
  };

  const handleDownload = () => {
    try {
      const blob = new Blob([toText(sections, name, t, lang)], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Health_summary_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMessage({ key: 'sum.msg.downloaded' });
    } catch {
      setMessage({ key: 'sum.msg.fail' });
    }
  };

  const options: { key: keyof Include; label: string; count: number }[] = [
    { key: 'vitals', label: t('sum.opt.vitals'), count: data.vitals.length },
    { key: 'symptoms', label: t('sum.opt.symptoms'), count: data.symptoms.length },
    { key: 'meds', label: t('sum.opt.meds'), count: data.meds.length },
    { key: 'family', label: t('sum.opt.family'), count: data.family.length },
  ];

  return (
    <div className="mx-auto max-w-md space-y-5 rounded-xl border border-slate-700 bg-slate-900 p-6 text-white">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold">{t('sum.title')}</h2>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="min-h-[44px] rounded-lg border border-slate-600 bg-slate-800 px-3 py-1 text-sm transition-colors hover:bg-slate-700"
          >
            ← {t('common.back')}
          </button>
        )}
      </div>

      <p className="text-sm leading-relaxed text-slate-300">{t('sum.intro')}</p>

      <fieldset className="space-y-2">
        <legend className="mb-1 text-sm font-semibold text-slate-100">{t('sum.choose')}</legend>
        {options.map((o) => (
          <label key={o.key} className="flex min-h-[44px] items-center gap-3 text-sm text-slate-100">
            <input
              type="checkbox"
              checked={inc[o.key]}
              onChange={() => toggle(o.key)}
              className="h-5 w-5 accent-teal-400"
            />
            <span>
              {o.label} <span className="text-slate-300">({o.count})</span>
            </span>
          </label>
        ))}
      </fieldset>

      <div>
        <label htmlFor="report-name" className="mb-1 block text-sm font-semibold text-slate-100">
          {t('sum.name.label')}
        </label>
        <input
          id="report-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('sum.name.ph')}
          className={fieldClass}
        />
      </div>

      <div className="space-y-3 rounded-lg border border-slate-700 bg-slate-950 p-4">
        <h3 className="text-sm font-bold text-slate-100">{t('sum.preview')}</h3>
        {sections.length === 0 ? (
          <p className="text-sm text-slate-300">{t('sum.preview.none')}</p>
        ) : (
          sections.map((s) => (
            <div key={s.title}>
              <p className="text-xs font-bold uppercase tracking-wider text-teal-300">{s.title}</p>
              <ul className="mt-1 list-inside list-disc space-y-1 text-sm text-slate-100">
                {s.lines.map((l, i) => (
                  <li key={i}>{l}</li>
                ))}
              </ul>
            </div>
          ))
        )}
        <p className="text-xs text-slate-300">{t('sum.note')}</p>
      </div>

      {!hasContent && (
        <p className="rounded-lg border border-amber-400/40 bg-amber-400/10 p-3 text-sm text-amber-100">{t('sum.empty')}</p>
      )}

      <div className="space-y-3">
        <button
          type="button"
          onClick={handlePrint}
          disabled={!hasContent}
          className={`${actionBtn} bg-teal-500 text-slate-950 hover:bg-teal-400`}
        >
          {t('sum.btn.print')}
        </button>
        <button
          type="button"
          onClick={handleDownload}
          disabled={!hasContent}
          className={`${actionBtn} border border-slate-500 bg-slate-800 text-slate-100 hover:bg-slate-700`}
        >
          {t('sum.btn.download')}
        </button>
      </div>

      {message && (
        <p role="status" className="text-sm text-slate-200">
          {t(message.key)}
        </p>
      )}

      <p className="text-xs leading-relaxed text-slate-300">{t('sum.footer')}</p>
    </div>
  );
}

export default ExportReport;