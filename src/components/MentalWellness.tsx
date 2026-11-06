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
          <p className="text-xs text-ink/80">{t('mw.help.surpin')}</p>
          <div className="flex flex-wrap gap-2">
            {HELPLINES.map((h) => (
              <a
                key={h.tel}
                href={`tel:${h.tel}`}
                className="flex min-h-[44px] items-center rounded-xl border border-muted/50 px-4 py-2 text-sm font-semibold text-ink transition hover:bg-line/40"
              >
                {h.display}
              </a>
            ))}
          </div>
        </>
      ) : (
        <p className="text-xs leading-relaxed text-ink/80">{t('mw.help.other')}</p>
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
      window.dispatchEvent(new CustomEvent('healing:storage-error', { detail: { key: 'mood-journal' } }));
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
      <div className="space-y-6 rounded-2xl border border-line bg-surface p-6 shadow-xl">
        <div className="border-b border-line pb-4">
          <h2 className="flex items-center gap-2 text-xl font-bold text-tone-cyan">
            <span aria-hidden="true">🧠</span> {t('mw.title')}
          </h2>
          <p className="mt-1 text-sm text-ink/80">{t('mw.sub')}</p>
        </div>

        {/* Always visible */}
        <div className="rounded-xl border border-muted/40 bg-canvas p-4">
          <h3 className="text-sm font-bold text-ink">{t('mw.help.title')}</h3>
          <p className="mt-1 text-xs leading-relaxed text-ink/80">{t('mw.help.body', { number: emergencyNumber })}</p>
          <HelpLinks />
        </div>

        <form onSubmit={handleSave} className="space-y-4 rounded-2xl border border-line bg-canvas p-6">
          <h3 className="text-base font-bold text-ink">{t('mw.new')}</h3>

          <div>
            <label htmlFor="mood" className="mb-1 block text-sm font-semibold text-ink">
              {t('mw.mood')}
            </label>
            <select
              id="mood"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              className="min-h-[48px] w-full rounded-xl border border-muted/40 bg-surface px-4 py-3 text-ink focus:border-tone-cyan-line focus:outline-none"
            >
              {MOODS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.emoji} {t(m.key)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="score" className="mb-1 block text-sm font-semibold text-ink">
              {t('mw.score', { score })}
            </label>
            <input
              id="score"
              type="range"
              min="1"
              max="5"
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              className="w-full cursor-pointer accent-tone-cyan-line"
            />
          </div>

          <div>
            <label htmlFor="reflection" className="mb-1 block text-sm font-semibold text-ink">
              {t('mw.reflection')}
            </label>
            <textarea
              id="reflection"
              rows={3}
              required
              placeholder={t('mw.reflection.ph')}
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              className="w-full resize-none rounded-xl border border-muted/40 bg-surface px-4 py-3 text-base text-ink placeholder-muted focus:border-tone-cyan-line focus:outline-none"
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
          <div role="alert" className="rounded-xl border border-danger/60 bg-danger/15 p-4">
            <p className="text-sm font-bold text-ink">{t('mw.urgent.title')}</p>
            <p className="mt-1 text-sm leading-relaxed text-ink">{t('mw.urgent.body', { number: emergencyNumber })}</p>
            <HelpLinks />
            <button
              type="button"
              onClick={() => setSupport(null)}
              className="mt-3 min-h-[44px] rounded-lg px-3 text-xs font-medium text-ink underline"
            >
              {t('adv.close')}
            </button>
          </div>
        )}

        {support === 'gentle' && (
          <div role="status" className="fade-in rounded-xl border border-tone-cyan-line/40 bg-tone-cyan-line/10 p-4">
            <p className="text-sm font-bold text-ink">{t('mw.gentle.title')}</p>
            <p className="mt-1 text-sm leading-relaxed text-ink">{t('mw.gentle.body', { number: emergencyNumber })}</p>
            <button
              type="button"
              onClick={() => setSupport(null)}
              className="mt-3 min-h-[44px] rounded-lg px-3 text-xs font-medium text-ink underline"
            >
              {t('adv.close')}
            </button>
          </div>
        )}

        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-ink">
            {t('mw.history', { count: entries.length })}
          </h3>
          {entries.length === 0 ? (
            <p className="text-sm italic text-ink/80">{t('mw.empty')}</p>
          ) : (
            entries.map((item) => (
              <div key={item.id} className="flex flex-col gap-2 rounded-xl border border-line bg-canvas p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-tone-cyan">{moodLabel(item.mood)}</span>
                    <span className="rounded-lg border border-muted/40 bg-surface px-2.5 py-1 text-xs text-ink">
                      {t('mw.entry.score', { score: item.score })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-ink/80">{showDate(item.date, lang)}</span>
                    <button
                      type="button"
                      onClick={() => deleteEntry(item.id)}
                      aria-label={t('mw.delete.aria')}
                      className="min-h-[44px] min-w-[44px] rounded-lg text-sm font-bold text-ink/80 transition hover:bg-line/40 hover:text-tone-red"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-ink">{item.text}</p>
              </div>
            ))
          )}
        </div>
      </div>

      <WellnessRecommendations />
    </div>
  );
}