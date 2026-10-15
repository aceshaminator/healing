/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useI18n } from '../i18n/I18nProvider';
import { LANGUAGES } from '../i18n/languages';
import { getEmergencyNumber } from '../i18n/regions';
import { detectCrisis } from '../i18n/safety';
import { severityKey } from '../i18n/labels';
import { StorageService } from '../services/storageService';
import type { HealthCheckIn } from '../services/storageService';

type Severity = 'Mild' | 'Moderate' | 'Severe';
type Urgency = 'emergency' | 'soon' | 'monitor' | 'none';
type Panel = 'selfharm' | 'emergency' | 'severe' | 'worse' | null;

// New checks are saved in the symptom log, so Backup, Restore and the doctor summary include them.
interface SymptomLog {
  id: string;
  symptom: string;
  severity: Severity;
  duration: string;
  dateLogged: string;
  notes: string;
  fever?: boolean;
  urgency?: Urgency;
}

interface Result {
  hasInfo: boolean;
  urgency: Urgency;
  panel: Panel;
  noteKeys: string[];
  symptomText: string;
  days: number;
  severity: Severity;
  fever: boolean;
}

type Item = {
  key: string;
  source: 'log' | 'checkin';
  id: string;
  time: number;
  title: string;
  severityLabel: string;
  urgency?: Urgency;
  fever?: boolean;
  meta: string;
  notes: string;
  tag: string;
};

// These ten symptoms and the rules below are the same as in the old urgency check. Have a doctor review the list.
const CHIPS: { id: string; critical: boolean }[] = [
  { id: 'shortness_breath', critical: true },
  { id: 'chest_pain', critical: true },
  { id: 'confusion', critical: true },
  { id: 'limb_weakness', critical: true },
  { id: 'seizure', critical: true },
  { id: 'cough_blood', critical: true },
  { id: 'persistent_cough', critical: false },
  { id: 'fatigue', critical: false },
  { id: 'headache', critical: false },
  { id: 'dizziness', critical: false },
];
const CRITICAL_IDS = CHIPS.filter((c) => c.critical).map((c) => c.id);

const SEVERITIES: Severity[] = ['Mild', 'Moderate', 'Severe'];
const RANK: Record<Severity, number> = { Mild: 1, Moderate: 2, Severe: 3 };

const BADGE: Record<Urgency, { key: string; cls: string }> = {
  emergency: { key: 'urg.badge.emergency', cls: 'bg-red-500/20 text-red-300 border-red-500/40' },
  soon: { key: 'urg.badge.soon', cls: 'bg-red-500/20 text-red-300 border-red-500/40' },
  monitor: { key: 'urg.badge.monitor', cls: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  none: { key: 'urg.badge.none', cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
};

// Saved values stay in English underneath, so older entries and backups keep working.
const STORED_NO_NOTES = 'No additional details.';
const STORED_UNSPECIFIED = 'Unspecified';
const VOICE_SENTENCES = ['Captured by voice. Severity was not rated by the person.', 'Captured via Voice Assistant'];

const ERROR_KEYS: Record<string, string> = {
  'not-allowed': 'voice.err.denied',
  'service-not-allowed': 'voice.err.denied',
  'no-speech': 'voice.err.nospeech',
  'audio-capture': 'voice.err.nomic',
  network: 'voice.err.network',
  'language-not-supported': 'voice.err.lang',
};

// Older versions added this sample entry for everyone. It is hidden.
function isSample(log: SymptomLog) {
  return log.id === '1' && log.symptom === 'Migraine / Headache' && log.notes.startsWith('Triggered by bright light');
}

function evaluate(input: {
  chosen: string[];
  other: string;
  severity: Severity;
  fever: boolean;
  days: number;
  previous: Severity | null;
}) {
  const text = input.other.trim();
  const count = input.chosen.length + (text ? 1 : 0);
  const hasInfo = count > 0 || input.fever;
  const crisis = detectCrisis(input.other);
  const hasCritical = input.chosen.some((id) => CRITICAL_IDS.includes(id)) || crisis === 'emergency';

  let urgency: Urgency;
  if (crisis === 'selfharm' || hasCritical) urgency = 'emergency';
  else if ((input.fever && input.days >= 5) || input.severity === 'Severe') urgency = 'soon';
  else if (count >= 2 || input.fever || input.severity === 'Moderate') urgency = 'monitor';
  else urgency = 'none';

  let panel: Panel = null;
  if (crisis === 'selfharm') panel = 'selfharm';
  else if (hasCritical) panel = 'emergency';
  else if (input.severity === 'Severe') panel = 'severe';
  else if (input.previous && RANK[input.severity] > RANK[input.previous]) panel = 'worse';

  const noteKeys: string[] = [];
  if (crisis !== 'selfharm') {
    if (hasCritical) noteKeys.push('urg.note.critical');
    else if (input.fever && input.days >= 5) noteKeys.push('urg.note.fever5');
    else if (input.severity === 'Severe') {
      /* the advice box covers it */
    } else if (count >= 2 || input.fever) noteKeys.push('urg.note.several');
    else if (input.severity === 'Moderate') noteKeys.push('sick.note.moderate');
    else noteKeys.push('urg.note.nothing');
    if (count === 0 && input.fever) noteKeys.push('urg.note.feveronly');
    if (input.fever) noteKeys.push('urg.note.malaria');
    if (input.chosen.includes('headache')) noteKeys.push('urg.note.headache');
    if (input.days > 10 && urgency === 'none') noteKeys.push('urg.note.long');
  }

  return { hasInfo, urgency, panel, noteKeys };
}

function formatWhen(value: string, lang: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const o: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' };
  try {
    return d.toLocaleString(lang, o);
  } catch {
    return d.toLocaleString(undefined, o);
  }
}

const card = 'rounded-2xl border border-slate-700 bg-[#0B132B] p-6';
const fieldClass =
  'min-h-[48px] w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-base text-slate-100 placeholder-slate-400 focus:border-emerald-400 focus:outline-none';

export function SickFlow({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const { t, lang } = useI18n();
  const emergencyNumber = getEmergencyNumber();
  const [rawLogs, setLogs] = useLocalStorage<SymptomLog[]>('Healing_symptom_logs', []);
  const logs = rawLogs.filter((l) => !isSample(l));
  const [checkIns, setCheckIns] = useState<HealthCheckIn[]>(() => StorageService.getCheckIns());

  const [tab, setTab] = useState<'new' | 'history'>('new');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [chosen, setChosen] = useState<string[]>([]);
  const [other, setOther] = useState('');
  const [severity, setSeverity] = useState<Severity>('Mild');
  const [fever, setFever] = useState(false);
  const [days, setDays] = useState(1);
  const [notes, setNotes] = useState('');
  const [result, setResult] = useState<Result | null>(null);

  // Voice typing, in the language the app is set to.
  const [listening, setListening] = useState(false);
  const [voiceMsg, setVoiceMsg] = useState('');
  const [voiceSupported, setVoiceSupported] = useState(true);
  const recRef = useRef<any>(null);
  const baseRef = useRef('');
  const hadErrorRef = useRef(false);
  const speechLang = LANGUAGES.find((l) => l.code === lang)?.speech ?? 'en-US';

  useEffect(() => {
    const win = window as any;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceSupported(false);
      return;
    }
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (event: any) => {
      let text = '';
      for (let i = 0; i < event.results.length; i++) text += event.results[i][0].transcript;
      const base = baseRef.current.trim();
      setOther((base ? base + ' ' : '') + text.trim());
    };
    rec.onerror = (event: any) => {
      hadErrorRef.current = true;
      setListening(false);
      setVoiceMsg(ERROR_KEYS[String(event.error)] ?? 'voice.err.default');
    };
    rec.onend = () => {
      setListening(false);
      if (!hadErrorRef.current) setVoiceMsg('');
    };
    recRef.current = rec;
    // Turn the microphone off if the person leaves this screen.
    return () => {
      try {
        rec.abort();
      } catch {
        /* ignore */
      }
    };
  }, []);

  const toggleMic = () => {
    const rec = recRef.current;
    if (!rec) {
      setVoiceMsg('voice.err.unsupported');
      return;
    }
    if (!window.isSecureContext) {
      setVoiceMsg('voice.err.secure');
      return;
    }
    if (listening) {
      rec.stop();
      return;
    }
    hadErrorRef.current = false;
    baseRef.current = other;
    rec.lang = speechLang;
    try {
      rec.start();
      setListening(true);
      setVoiceMsg('voice.fb.listening');
    } catch {
      setListening(false);
      setVoiceMsg('voice.err.start');
    }
  };

  const toggleChip = (id: string) => setChosen((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const finish = () => {
    if (listening) recRef.current?.stop();
    const symptomText = [...chosen.map((id) => t(`sym.${id}`)), other.trim()].filter(Boolean).join(', ');
    const previousLog = symptomText
      ? logs.find((l) => l.symptom.toLowerCase() === symptomText.toLowerCase())
      : undefined;
    const ev = evaluate({ chosen, other, severity, fever, days, previous: previousLog ? previousLog.severity : null });

    if (ev.hasInfo) {
      const entry: SymptomLog = {
        id: Date.now().toString(),
        symptom: symptomText || t('sick.fever.tag'),
        severity,
        duration: `${days} ${t(days === 1 ? 'urg.day' : 'urg.days')}`,
        dateLogged: new Date().toLocaleDateString(),
        notes: notes.trim() || STORED_NO_NOTES,
        fever,
        urgency: ev.urgency,
      };
      setLogs([entry, ...logs]);
    }
    setResult({ ...ev, symptomText, days, severity, fever });
    setStep(3);
  };

  const startNew = () => {
    if (listening) recRef.current?.stop();
    setChosen([]);
    setOther('');
    setSeverity('Mild');
    setFever(false);
    setDays(1);
    setNotes('');
    setResult(null);
    setVoiceMsg('');
    setStep(1);
    setTab('new');
  };

  // History: new checks, plus older check-ins and voice notes.
  const items: Item[] = [
    ...logs.map<Item>((l) => {
      const sk = severityKey(l.severity);
      return {
        key: `l-${l.id}`,
        source: 'log',
        id: l.id,
        time: Number(l.id) || 0,
        title: l.symptom,
        severityLabel: sk ? t(sk) : l.severity,
        urgency: l.urgency,
        fever: l.fever,
        meta: t('trk.duration.line', {
          duration: l.duration === STORED_UNSPECIFIED ? t('trk.unspecified') : l.duration,
          date: l.dateLogged,
        }),
        notes: l.notes === STORED_NO_NOTES ? '' : l.notes,
        tag: '',
      };
    }),
    ...checkIns.map<Item>((c) => {
      const isVoice = String(c.id).startsWith('voice-');
      const sk = c.severity ? severityKey(c.severity) : null;
      return {
        key: `c-${c.id}`,
        source: 'checkin',
        id: c.id,
        time: Date.parse(c.timestamp) || 0,
        title: c.symptoms.join(', '),
        severityLabel: isVoice || !c.severity ? t('sev.notrated') : sk ? t(sk) : c.severity,
        meta: formatWhen(c.timestamp, lang),
        notes: c.reflections && !VOICE_SENTENCES.includes(c.reflections) ? c.reflections : '',
        tag: t(isVoice ? 'sick.item.voice' : 'sick.item.checkin'),
      };
    }),
  ].sort((a, b) => b.time - a.time);

  const removeItem = (item: Item) => {
    if (!window.confirm(t('trk.confirm.delete', { name: item.title }))) return;
    if (item.source === 'log') {
      setLogs(logs.filter((l) => l.id !== item.id));
    } else {
      const next = checkIns.filter((c) => c.id !== item.id);
      StorageService.saveCheckIns(next);
      setCheckIns(next);
    }
  };

  const callButton = (
    <a
      href={`tel:${emergencyNumber}`}
      className="flex min-h-[48px] items-center justify-center rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-500"
    >
      {t('sos.call', { number: emergencyNumber })}
    </a>
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6 text-slate-100">
      {/* Tabs */}
      <div className="flex gap-2" role="group">
        <button
          type="button"
          aria-pressed={tab === 'new'}
          onClick={() => setTab('new')}
          className={`min-h-[48px] flex-1 rounded-xl border px-3 py-2 text-sm font-bold transition ${
            tab === 'new' ? 'border-emerald-400 bg-emerald-500/20 text-emerald-100' : 'border-slate-600 text-slate-200'
          }`}
        >
          {t('sick.tab.new')}
        </button>
        <button
          type="button"
          aria-pressed={tab === 'history'}
          onClick={() => setTab('history')}
          className={`min-h-[48px] flex-1 rounded-xl border px-3 py-2 text-sm font-bold transition ${
            tab === 'history' ? 'border-emerald-400 bg-emerald-500/20 text-emerald-100' : 'border-slate-600 text-slate-200'
          }`}
        >
          {t('sick.tab.history', { count: items.length })}
        </button>
      </div>

      {tab === 'new' && step === 1 && (
        <div className={`${card} space-y-5`}>
          <div>
            <h3 className="text-lg font-bold text-white">{t('sick.step1')}</h3>
            <p className="mt-1 text-sm text-slate-300">{t('sick.tap')}</p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {CHIPS.map((c) => {
              const selected = chosen.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleChip(c.id)}
                  className={`flex min-h-[56px] items-center justify-between gap-3 rounded-xl border p-4 text-left transition ${
                    selected
                      ? 'border-emerald-400 bg-emerald-400/10 text-white'
                      : 'border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-500'
                  }`}
                >
                  <span className="text-sm font-medium">{t(`sym.${c.id}`)}</span>
                  {c.critical && (
                    <span className="shrink-0 rounded-md bg-red-500/20 px-2 py-0.5 text-xs text-red-300">
                      {t('urg.cat.critical')}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="space-y-2">
            <label htmlFor="sick-other" className="block text-sm font-semibold text-slate-200">
              {t('sick.other.label')}
            </label>
            <div className="flex items-start gap-3">
              <textarea
                id="sick-other"
                rows={3}
                value={other}
                readOnly={listening}
                onChange={(e) => setOther(e.target.value)}
                placeholder={t('sick.other.ph')}
                className={`${fieldClass} resize-none`}
              />
              {voiceSupported && (
                <button
                  type="button"
                  onClick={toggleMic}
                  aria-label={listening ? t('voice.mic.stop') : t('voice.mic.start')}
                  aria-pressed={listening}
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-2xl shadow-xl transition-all ${
                    listening ? 'bg-red-600 text-white hover:bg-red-500' : 'bg-teal-500 text-slate-950 hover:bg-teal-400'
                  }`}
                >
                  {listening ? '⏹' : '🎤'}
                </button>
              )}
            </div>
            {voiceMsg && (
              <p role="status" aria-live="polite" className="text-sm font-medium text-teal-200">
                {t(voiceMsg)}
              </p>
            )}
            {voiceSupported ? (
              <p className="text-xs leading-relaxed text-slate-300">{t('voice.privacy')}</p>
            ) : (
              <p className="text-xs text-amber-200">{t('voice.unsupported')}</p>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="min-h-[48px] rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-emerald-400"
            >
              {t('urg.next')}
            </button>
          </div>
          <p className="text-xs text-slate-300">
            {t('urg.notListed')}{' '}
            <a href={`tel:${emergencyNumber}`} className="font-semibold underline">
              {t('sos.call', { number: emergencyNumber })}
            </a>
          </p>
        </div>
      )}

      {tab === 'new' && step === 2 && (
        <div className={`${card} space-y-6`}>
          <h3 className="text-lg font-bold text-white">{t('sick.step2')}</h3>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-200">{t('chk.severity.label')}</p>
            <div className="grid grid-cols-3 gap-3">
              {SEVERITIES.map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={severity === s}
                  onClick={() => setSeverity(s)}
                  className={`min-h-[48px] rounded-xl border py-3 text-sm font-bold transition ${
                    severity === s
                      ? 'border-emerald-400 bg-emerald-400/10 text-white'
                      : 'border-slate-700 bg-slate-900 text-slate-300'
                  }`}
                >
                  {t(`sev.${s.toLowerCase()}`)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-200">{t('urg.fever.q')}</p>
            <div className="flex gap-3">
              <button
                type="button"
                aria-pressed={fever}
                onClick={() => setFever(true)}
                className={`min-h-[48px] flex-1 rounded-xl border py-3 text-sm font-bold transition ${
                  fever ? 'border-amber-400 bg-amber-400/20 text-amber-200' : 'border-slate-700 bg-slate-900 text-slate-300'
                }`}
              >
                {t('urg.fever.yes')}
              </button>
              <button
                type="button"
                aria-pressed={!fever}
                onClick={() => setFever(false)}
                className={`min-h-[48px] flex-1 rounded-xl border py-3 text-sm font-bold transition ${
                  !fever ? 'border-slate-500 bg-slate-800 text-white' : 'border-slate-700 bg-slate-900 text-slate-300'
                }`}
              >
                {t('urg.fever.no')}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="sick-days" className="block text-sm font-semibold text-slate-200">
              {t('urg.duration.label', { count: days, unit: t(days === 1 ? 'urg.day' : 'urg.days') })}
            </label>
            <input
              id="sick-days"
              type="range"
              min="1"
              max="21"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="w-full accent-emerald-400"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="sick-notes" className="block text-sm font-semibold text-slate-200">
              {t('chk.notes.label')}
            </label>
            <textarea
              id="sick-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('chk.notes.ph')}
              className={`${fieldClass} resize-none`}
            />
          </div>

          <div className="flex justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="min-h-[48px] rounded-xl bg-slate-800 px-4 py-2 text-sm font-bold text-slate-200 transition hover:bg-slate-700"
            >
              ← {t('common.back')}
            </button>
            <button
              type="button"
              onClick={finish}
              className="min-h-[48px] rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-emerald-400"
            >
              {t('urg.see')}
            </button>
          </div>
        </div>
      )}

      {tab === 'new' && step === 3 && result && (
        <div className={`${card} space-y-6`}>
          {!result.hasInfo ? (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">{t('urg.noinfo.title')}</h3>
              <p className="text-sm text-slate-300">{t('urg.noinfo.body')}</p>
              <p className="text-sm text-slate-300">{t('urg.noinfo.sos')}</p>
              {callButton}
              <button
                type="button"
                onClick={startNew}
                className="min-h-[48px] rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-slate-900 transition hover:bg-emerald-400"
              >
                {t('urg.startover')}
              </button>
            </div>
          ) : (
            <>
              {result.panel === 'selfharm' && (
                <div role="alert" className="space-y-3 rounded-xl border border-red-500/60 bg-red-950/50 p-4 text-red-50">
                  <p className="text-base font-bold">{t('adv.selfharm.title')}</p>
                  <p className="text-sm leading-relaxed">{t('adv.selfharm.body', { number: emergencyNumber })}</p>
                  {callButton}
                </div>
              )}
              {result.panel === 'emergency' && (
                <div role="alert" className="space-y-3 rounded-xl border border-red-500/50 bg-red-500/15 p-4">
                  <p className="text-sm font-bold text-red-200">{t('urg.emergency.title')}</p>
                  <p className="text-sm text-red-100">{t('urg.emergency.body', { number: emergencyNumber })}</p>
                  {callButton}
                </div>
              )}
              {result.panel === 'severe' && (
                <div role="status" className="space-y-2 rounded-xl border border-amber-400/60 bg-amber-950/40 p-4 text-amber-50">
                  <p className="text-base font-bold">{t('adv.severe.title')}</p>
                  <p className="text-sm leading-relaxed">{t('adv.severe.body', { number: emergencyNumber })}</p>
                </div>
              )}
              {result.panel === 'worse' && (
                <div role="status" className="space-y-2 rounded-xl border border-amber-400/60 bg-amber-950/40 p-4 text-amber-50">
                  <p className="text-base font-bold">{t('adv.worse.title')}</p>
                  <p className="text-sm leading-relaxed">{t('adv.worse.body')}</p>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white">{t('urg.result.title')}</h3>
                  <p className="text-sm text-slate-300">{t('urg.result.sub')}</p>
                </div>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-bold uppercase ${BADGE[result.urgency].cls}`}
                >
                  {t(BADGE[result.urgency].key)}
                </span>
              </div>

              <div className="space-y-1 rounded-xl border border-slate-700 bg-slate-900 p-4">
                <p className="text-xs uppercase tracking-wider text-slate-300">{t('urg.entered')}</p>
                {result.symptomText && (
                  <p className="text-base font-bold text-white">{t('chk.entry.symptoms', { list: result.symptomText })}</p>
                )}
                <p className="text-sm text-slate-300">
                  {severityKey(result.severity) ? t(severityKey(result.severity) as string) : result.severity} ·{' '}
                  {result.days} {t(result.days === 1 ? 'urg.day' : 'urg.days')} ·{' '}
                  {t('urg.fever.line', { answer: result.fever ? t('urg.yes') : t('urg.no') })}
                </p>
              </div>

              {result.noteKeys.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-slate-200">{t('urg.means')}</h4>
                  <ul className="space-y-2">
                    {result.noteKeys.map((key) => (
                      <li key={key} className="rounded-lg border border-slate-700 bg-slate-900 p-3 text-sm text-slate-200">
                        {t(key)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="rounded-lg border border-slate-700 p-3 text-xs leading-relaxed text-slate-300">
                {t('urg.disclaimer')}
              </p>
              <p role="status" className="text-sm font-semibold text-emerald-300">
                {t('sick.saved')}
              </p>

              {onNavigate && (
                <button
                  type="button"
                  onClick={() => onNavigate('maternalcare')}
                  className="min-h-[48px] w-full rounded-xl border border-slate-500 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
                >
                  {t('sick.pregnant.link')}
                </button>
              )}

              <div className="flex flex-wrap justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setTab('history')}
                  className="min-h-[48px] rounded-xl border border-slate-500 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
                >
                  {t('sick.view.history')}
                </button>
                <button
                  type="button"
                  onClick={startNew}
                  className="min-h-[48px] rounded-xl bg-slate-800 px-4 py-2 text-sm font-bold text-slate-200 transition hover:bg-slate-700"
                >
                  {t('urg.new')}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {tab === 'history' && (
        <div className="space-y-3">
          {items.length === 0 ? (
            <div className="rounded-2xl border border-slate-700 bg-slate-900 p-8 text-center text-sm text-slate-300">
              {t('sick.history.empty')}
            </div>
          ) : (
            items.map((item) => (
              <div key={item.key} className="space-y-2 rounded-xl border border-slate-700 bg-slate-900 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-base font-bold text-slate-100">{item.title}</h4>
                      <span className="rounded-full border border-slate-600 px-2 py-0.5 text-xs font-medium text-slate-200">
                        {item.severityLabel}
                      </span>
                      {item.tag && (
                        <span className="rounded-full border border-cyan-500/40 px-2 py-0.5 text-xs text-cyan-200">{item.tag}</span>
                      )}
                      {item.fever && (
                        <span className="rounded-full border border-amber-400/50 px-2 py-0.5 text-xs text-amber-200">
                          {t('sick.fever.tag')}
                        </span>
                      )}
                      {item.urgency && (
                        <span
                          className={`rounded-full border px-2 py-0.5 text-xs font-bold ${BADGE[item.urgency].cls}`}
                        >
                          {t(BADGE[item.urgency].key)}
                        </span>
                      )}
                    </div>
                    <span className="mt-1 block text-xs text-slate-300">{item.meta}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item)}
                    aria-label={t('trk.delete.aria', { name: item.title })}
                    className="min-h-[44px] min-w-[44px] rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-red-300"
                  >
                    ✕
                  </button>
                </div>
                {item.notes && (
                  <p className="rounded-md border border-slate-700 bg-slate-950/60 p-2.5 text-sm text-slate-100">{item.notes}</p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      <p className="text-xs leading-relaxed text-slate-300">{t('trk.disclaimer')}</p>
    </div>
  );
}

export default SickFlow;