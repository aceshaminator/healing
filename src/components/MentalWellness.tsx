import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import WellnessRecommendations from './WellnessRecommendations';
import { useI18n } from '../i18n/I18nProvider';
import { getEmergencyNumber, isNigeria } from '../i18n/regions';
import { detectCrisis } from '../i18n/safety';

const STORAGE_KEY = 'healing_mood_journal';

// VERIFY BEFORE LAUNCH: call each number and check SURPIN's official website for the current lines.
const HELPLINES = [
  { display: '0814 224 1007', tel: '+2348142241007' },
  { display: '0908 021 7555', tel: '+2349080217555' },
  { display: '0903 440 0009', tel: '+2349034400009' },
];

// The saved value stays in English underneath. The words on screen are translated.
const MOODS = [
  { value: 'Calm', emoji: '😌', key: 'mood.calm' },
  { value: 'Happy', emoji: '😊', key: 'mood.happy' },
  { value: 'Okay', emoji: '🙂', key: 'mood.okay' },
  { value: 'Anxious', emoji: '😰', key: 'mood.anxious' },
  { value: 'Stressed', emoji: '😫', key: 'mood.stressed' },
  { value: 'Tired', emoji: '😴', key: 'mood.tired' },
  { value: 'Sad', emoji: '😔', key: 'mood.sad' },
  { value: 'Very low', emoji: '😞', key: 'mood.verylow' },
];

type Entry = { id: string; mood: string; score: number; text: string; date: string };
type Support = null | 'urgent' | 'gentle';

function loadEntries(): Entry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function supportLevel(text: string, mood: string, score: number): Support {
  if (detectCrisis(text) === 'selfharm') return 'urgent';
  if (mood === 'Very low' || mood === 'Sad' || score <= 2) return 'gentle';
  return null;
}

function showDate(value: string, lang: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  try {
    return d.toLocaleDateString(lang);
  } catch {
    return d.toLocaleDateString();
  }
}

function HelpLinks() {
  const { t } = useI18n();
  const number = getEmergencyNumber();
  return (
    <div className="mt-3 space-y-2">
      <a
        href={`tel:${number}`}
        className="flex min-h-[48px] items-center justify-center rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-500"
      >
        {t('mw.help.call', { number })}
      </a>
      {isNigeria() ? (
        <>
          <p className="text-xs text-slate-300">{t('mw.help.surpin')}</p>
          <div className="flex flex-wrap gap-2">
            {HELPLINES.map((h) => (
              <a
                key={h.tel}
                href={`tel:${h.tel}`}
                className="flex min-h-[44px] items-center rounded-xl border border-slate-500 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
              >
                {h.display}
              </a>
            ))}
          </div>
        </>
      ) : (
        <p className="text-xs leading-relaxed text-slate-300">{t('mw.help.other')}</p>
      )}
    </div>
  );
}

export default function MentalWellness() {
  const { t, lang } = useI18n();
  const emergencyNumber = getEmergencyNumber();
  const [mood, setMood] = useState<string>('Calm');
  const [score, setScore] = useState<number>(4);
  const [reflection, setReflection] = useState<string>('');
  const [entries, setEntries] = useState<Entry[]>(loadEntries);
  const [support, setSupport] = useState<Support>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
      /* ignore */
    }
  }, [entries]);

  const moodLabel = (value: string) => {
    const m = MOODS.find((x) => x.value === value);
    return m ? t(m.key) : value;
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (!reflection.trim()) return;
    const newEntry: Entry = {
      id: Date.now().toString(),
      mood,
      score,
      text: reflection.trim(),
      date: new Date().toISOString(),
    };
    setEntries([newEntry, ...entries]);
    setSupport(supportLevel(reflection, mood, score));
    setReflection('');
  };

  const deleteEntry = (id: string) => {
    setEntries(entries.filter((e) => e.id !== id));
  };

  return (
    <div className="space-y-8">
      <div className="space-y-6 rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-xl">
        <div className="border-b border-slate-700 pb-4">
          <h2 className="flex items-center gap-2 text-xl font-bold text-cyan-300">
            <span aria-hidden="true">🧠</span> {t('mw.title')}
          </h2>
          <p className="mt-1 text-sm text-slate-300">{t('mw.sub')}</p>
        </div>

        {/* Always visible */}
        <div className="rounded-xl border border-slate-600 bg-slate-950 p-4">
          <h3 className="text-sm font-bold text-slate-100">{t('mw.help.title')}</h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-300">{t('mw.help.body', { number: emergencyNumber })}</p>
          <HelpLinks />
        </div>

        <form onSubmit={handleSave} className="space-y-4 rounded-2xl border border-slate-700 bg-slate-950 p-6">
          <h3 className="text-base font-bold text-slate-100">{t('mw.new')}</h3>

          <div>
            <label htmlFor="mood" className="mb-1 block text-sm font-semibold text-slate-200">
              {t('mw.mood')}
            </label>
            <select
              id="mood"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              className="min-h-[48px] w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-3 text-slate-100 focus:border-cyan-400 focus:outline-none"
            >
              {MOODS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.emoji} {t(m.key)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="score" className="mb-1 block text-sm font-semibold text-slate-200">
              {t('mw.score', { score })}
            </label>
            <input
              id="score"
              type="range"
              min="1"
              max="5"
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              className="w-full cursor-pointer accent-cyan-400"
            />
          </div>

          <div>
            <label htmlFor="reflection" className="mb-1 block text-sm font-semibold text-slate-200">
              {t('mw.reflection')}
            </label>
            <textarea
              id="reflection"
              rows={3}
              required
              placeholder={t('mw.reflection.ph')}
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              className="w-full resize-none rounded-xl border border-slate-600 bg-slate-900 px-4 py-3 text-base text-slate-100 placeholder-slate-400 focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="min-h-[48px] w-full rounded-xl bg-cyan-500 py-3.5 text-base font-bold text-slate-950 shadow-lg transition-all hover:bg-cyan-400"
          >
            {t('mw.save')}
          </button>
        </form>

        {support === 'urgent' && (
          <div role="alert" className="rounded-xl border border-red-500/60 bg-red-950/60 p-4">
            <p className="text-sm font-bold text-red-100">{t('mw.urgent.title')}</p>
            <p className="mt-1 text-sm leading-relaxed text-red-50">{t('mw.urgent.body', { number: emergencyNumber })}</p>
            <HelpLinks />
            <button
              type="button"
              onClick={() => setSupport(null)}
              className="mt-3 min-h-[44px] rounded-lg px-3 text-xs font-medium text-red-100 underline"
            >
              {t('adv.close')}
            </button>
          </div>
        )}

        {support === 'gentle' && (
          <div role="status" className="rounded-xl border border-cyan-400/40 bg-cyan-950/40 p-4">
            <p className="text-sm font-bold text-cyan-100">{t('mw.gentle.title')}</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-100">{t('mw.gentle.body', { number: emergencyNumber })}</p>
            <button
              type="button"
              onClick={() => setSupport(null)}
              className="mt-3 min-h-[44px] rounded-lg px-3 text-xs font-medium text-cyan-100 underline"
            >
              {t('adv.close')}
            </button>
          </div>
        )}

        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            {t('mw.history', { count: entries.length })}
          </h3>
          {entries.length === 0 ? (
            <p className="text-sm italic text-slate-300">{t('mw.empty')}</p>
          ) : (
            entries.map((item) => (
              <div key={item.id} className="flex flex-col gap-2 rounded-xl border border-slate-700 bg-slate-950 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-cyan-300">{moodLabel(item.mood)}</span>
                    <span className="rounded-lg border border-slate-600 bg-slate-900 px-2.5 py-1 text-xs text-slate-200">
                      {t('mw.entry.score', { score: item.score })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-300">{showDate(item.date, lang)}</span>
                    <button
                      type="button"
                      onClick={() => deleteEntry(item.id)}
                      aria-label={t('mw.delete.aria')}
                      className="min-h-[44px] min-w-[44px] rounded-lg text-sm font-bold text-slate-300 transition hover:bg-slate-800 hover:text-red-300"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-slate-100">{item.text}</p>
              </div>
            ))
          )}
        </div>
      </div>

      <WellnessRecommendations />
    </div>
  );
}