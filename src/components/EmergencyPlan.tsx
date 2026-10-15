// src/components/EmergencyPlan.tsx
import React, { useEffect, useState } from 'react';
import { useI18n } from '../i18n/I18nProvider';
import { getEmergencyNumber, getExtraNumbers, numberIsSet } from '../i18n/regions';

const PLAN_KEY = 'healing_emergency_plan';
// Older versions kept contacts under this name. They are copied into the plan the first time.
const OLD_CONTACTS_KEY = 'visionace_caregiver_contacts';
// Older versions added these two sample contacts for everyone. They are not copied.
const SAMPLE_NAMES = ['Dr. Evelyn Vance', 'Alex Ebuka'];

// The saved value stays in English so saved plans and backups keep working. The label is translated on screen.
const TYPES: { value: string; key: string }[] = [
  { value: 'Clinic or hospital', key: 'plan.type.clinic' },
  { value: 'Ambulance or transport', key: 'plan.type.transport' },
  { value: 'Community health worker', key: 'plan.type.chw' },
  { value: 'Family, friend or neighbour', key: 'plan.type.family' },
  { value: 'Other', key: 'plan.type.other' },
];

type TFn = (key: string, vars?: Record<string, string | number>) => string;

interface Entry {
  id: string;
  type: string;
  name: string;
  phone: string;
  note: string;
}

interface Plan {
  route: string;
  entries: Entry[];
}

function digitsOf(value: string) {
  return value.replace(/\D/g, '');
}

function validPhone(value: string) {
  const n = digitsOf(value).length;
  return n >= 2 && n <= 15;
}

// Keeps a leading + so international numbers still work.
function dial(value: string) {
  return (value.trim().startsWith('+') ? '+' : '') + digitsOf(value);
}

// WhatsApp needs the country code, so the button only appears for numbers that start with +.
function canWhatsApp(value: string) {
  return value.trim().startsWith('+') && digitsOf(value).length >= 7;
}

function loadPlan(): Plan {
  try {
    const raw = localStorage.getItem(PLAN_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      return {
        route: typeof p?.route === 'string' ? p.route : '',
        entries: Array.isArray(p?.entries) ? p.entries : [],
      };
    }
    const oldRaw = localStorage.getItem(OLD_CONTACTS_KEY);
    const old: unknown = oldRaw ? JSON.parse(oldRaw) : [];
    const entries: Entry[] = [];
    if (Array.isArray(old)) {
      for (const c of old as Record<string, unknown>[]) {
        if (!c || typeof c.name !== 'string' || typeof c.phone !== 'string') continue;
        if ((c.id === '1' || c.id === '2') && SAMPLE_NAMES.includes(c.name)) continue;
        entries.push({
          id: `old_${String(c.id ?? entries.length)}`,
          type: 'Family, friend or neighbour',
          name: c.name,
          phone: c.phone,
          note: typeof c.relationship === 'string' ? c.relationship : '',
        });
      }
    }
    return { route: '', entries };
  } catch {
    return { route: '', entries: [] };
  }
}

function getLocationLink(): Promise<string | null> {
  return new Promise((resolve) => {
    if (!('geolocation' in navigator)) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(`https://www.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}`),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 },
    );
  });
}

function planText(plan: Plan, number: string, t: TFn, typeLabel: (value: string) => string): string {
  const lines = [t('plan.text.header'), t('plan.text.number', { number }), ''];
  if (plan.route.trim()) lines.push(t('plan.text.route'), plan.route.trim(), '');
  plan.entries.forEach((e) => {
    lines.push(`${typeLabel(e.type)}: ${e.name}${e.phone ? ` - ${e.phone}` : ''}${e.note ? ` (${e.note})` : ''}`);
  });
  return lines.join('\n');
}

const fieldClass =
  'min-h-[48px] w-full rounded-xl border border-slate-600 bg-slate-900 px-3.5 py-2.5 text-base text-slate-100 placeholder-slate-400 focus:border-emerald-400 focus:outline-none';
const actionBtn =
  'flex min-h-[44px] items-center justify-center rounded-lg border border-slate-500 bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-700 disabled:opacity-60';

export default function EmergencyPlan() {
  const { t } = useI18n();
  const [plan, setPlan] = useState<Plan>(loadPlan);
  const [type, setType] = useState(TYPES[0].value);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const number = getEmergencyNumber();
  const extras = getExtraNumbers();

  const typeLabel = (value: string) => {
    const match = TYPES.find((x) => x.value === value);
    return match ? t(match.key) : value;
  };

  useEffect(() => {
    try {
      localStorage.setItem(PLAN_KEY, JSON.stringify(plan));
    } catch {
      window.dispatchEvent(new CustomEvent('healing:storage-error', { detail: { key: 'emergency-plan' } }));
    }
  }, [plan]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(t('plan.err.name'));
      return;
    }
    if (phone.trim() && !validPhone(phone)) {
      setError(t('plan.err.phone'));
      return;
    }
    setError('');
    const entry: Entry = {
      id: Date.now().toString(),
      type,
      name: name.trim(),
      phone: phone.trim(),
      note: note.trim(),
    };
    setPlan((prev) => ({ ...prev, entries: [...prev.entries, entry] }));
    setName('');
    setPhone('');
    setNote('');
  };

  const handleRemove = (entry: Entry) => {
    if (window.confirm(t('plan.confirm.remove', { name: entry.name }))) {
      setPlan((prev) => ({ ...prev, entries: prev.entries.filter((x) => x.id !== entry.id) }));
    }
  };

  const sendHelp = async (entry: Entry, via: 'whatsapp' | 'sms') => {
    setBusy(true);
    setStatus(t('plan.status.locating'));
    const link = await getLocationLink();
    const text = link ? t('plan.msg.location', { link }) : t('plan.msg.nolocation');
    const url =
      via === 'whatsapp'
        ? `https://wa.me/${digitsOf(entry.phone)}?text=${encodeURIComponent(text)}`
        : `sms:${dial(entry.phone)}?body=${encodeURIComponent(text)}`;
    setStatus(
      t(via === 'whatsapp' ? 'plan.status.opening.whatsapp' : 'plan.status.opening.sms') +
        (link ? '' : t('plan.status.nolocation')),
    );
    setBusy(false);
    window.location.href = url;
  };

  const sharePlan = async () => {
    const text = planText(plan, number, t, typeLabel);
    try {
      if (navigator.share) {
        await navigator.share({ title: t('plan.share.title'), text });
        setStatus(t('plan.share.closed'));
      } else {
        await navigator.clipboard.writeText(text);
        setStatus(t('plan.share.copied'));
      }
    } catch (err) {
      if ((err as DOMException).name !== 'AbortError') setStatus(t('plan.share.failed'));
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 text-slate-100">
      <div className="border-b border-slate-700 pb-4">
        <h2 className="text-xl font-bold text-red-300">{t('plan.title')}</h2>
        <p className="mt-1 text-sm text-slate-300">{t('plan.intro')}</p>
      </div>

      {/* National number */}
      <section className="space-y-3 rounded-2xl border border-red-500/50 bg-red-950/40 p-5">
        <a
          href={`tel:${number}`}
          className="flex min-h-[56px] items-center justify-center rounded-xl bg-red-600 px-4 py-4 text-lg font-bold text-white transition hover:bg-red-500"
        >
          {t('plan.call', { number })}
        </a>
        {extras.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
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
        <p className="text-sm leading-relaxed text-red-50">{numberIsSet() ? t('plan.note.set') : t('sos.unset')}</p>
      </section>

      {status && (
        <p role="status" className="rounded-xl border border-slate-600 bg-slate-950 p-3 text-sm text-slate-100">
          {status}
        </p>
      )}

      {/* How to get to help */}
      <section className="space-y-2 rounded-2xl border border-slate-700 bg-[#0B132B] p-5">
        <label htmlFor="plan-route" className="block text-base font-bold text-emerald-300">
          {t('plan.route.label')}
        </label>
        <textarea
          id="plan-route"
          rows={4}
          value={plan.route}
          onChange={(e) => setPlan((prev) => ({ ...prev, route: e.target.value }))}
          placeholder={t('plan.route.placeholder')}
          className={`${fieldClass} resize-none`}
        />
      </section>

      {/* People and places */}
      <section className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
          {t('plan.list.title', { count: plan.entries.length })}
        </h3>
        {plan.entries.length === 0 ? (
          <p className="rounded-2xl border border-slate-700 bg-[#0B132B] p-6 text-center text-sm text-slate-300">
            {t('plan.list.empty')}
          </p>
        ) : (
          plan.entries.map((entry) => (
            <div key={entry.id} className="space-y-3 rounded-2xl border border-slate-700 bg-[#0B132B] p-4">
              <div>
                <span className="rounded border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-200">
                  {typeLabel(entry.type)}
                </span>
                <p className="mt-2 text-base font-bold text-slate-100">{entry.name}</p>
                {entry.phone && <p className="font-mono text-sm text-slate-300">{entry.phone}</p>}
                {entry.note && <p className="mt-1 text-sm text-slate-200">{entry.note}</p>}
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {entry.phone && (
                  <a href={`tel:${dial(entry.phone)}`} className={actionBtn}>
                    {t('plan.btn.call')}
                  </a>
                )}
                {canWhatsApp(entry.phone) && (
                  <button type="button" disabled={busy} onClick={() => sendHelp(entry, 'whatsapp')} className={actionBtn}>
                    {t('plan.btn.whatsapp')}
                  </button>
                )}
                {entry.phone && (
                  <button type="button" disabled={busy} onClick={() => sendHelp(entry, 'sms')} className={actionBtn}>
                    {t('plan.btn.sms')}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(entry)}
                  className="flex min-h-[44px] items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-red-300"
                >
                  {t('plan.btn.remove')}
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      {/* Add form */}
      <form onSubmit={handleAdd} noValidate className="space-y-4 rounded-2xl border border-slate-700 bg-[#0B132B] p-5">
        <h3 className="text-sm font-bold text-emerald-300">{t('plan.form.title')}</h3>
        <div>
          <label htmlFor="plan-type" className="mb-1 block text-sm font-semibold text-slate-200">
            {t('plan.form.type')}
          </label>
          <select id="plan-type" value={type} onChange={(e) => setType(e.target.value)} className={fieldClass}>
            {TYPES.map((x) => (
              <option key={x.value} value={x.value}>
                {t(x.key)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="plan-name" className="mb-1 block text-sm font-semibold text-slate-200">
            {t('plan.form.name')}
          </label>
          <input
            id="plan-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('plan.form.name.placeholder')}
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="plan-phone" className="mb-1 block text-sm font-semibold text-slate-200">
            {t('plan.form.phone')}
          </label>
          <input
            id="plan-phone"
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t('plan.form.phone.placeholder')}
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="plan-note" className="mb-1 block text-sm font-semibold text-slate-200">
            {t('plan.form.note')}
          </label>
          <input
            id="plan-note"
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t('plan.form.note.placeholder')}
            className={fieldClass}
          />
        </div>
        {error && (
          <p role="alert" className="text-sm text-amber-200">
            {error}
          </p>
        )}
        <button
          type="submit"
          className="min-h-[48px] w-full rounded-xl bg-emerald-600 py-2.5 text-base font-semibold text-white shadow-md transition hover:bg-emerald-500"
        >
          {t('plan.form.add')}
        </button>
      </form>

      <div className="space-y-3">
        <button type="button" onClick={sharePlan} className={`${actionBtn} w-full`}>
          {t('plan.share')}
        </button>
        <p className="text-xs leading-relaxed text-slate-300">{t('plan.footer')}</p>
      </div>
    </div>
  );
}