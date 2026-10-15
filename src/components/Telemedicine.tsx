import { useState } from 'react';
import { useI18n } from '../i18n/I18nProvider';
import { getEmergencyNumber } from '../i18n/regions';
import { severityKey } from '../i18n/labels';
import { StorageService } from '../services/storageService';

type TFn = (key: string, vars?: Record<string, string | number>) => string;

// The sentences saved with voice notes. They are not shown in the shared text.
const VOICE_NOTES = ['Captured by voice. Severity was not rated by the person.', 'Captured via Voice Assistant'];

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

// Builds a short text from the latest three check-ins, in the app's language.
function latestText(t: TFn, lang: string): string | null {
  const list = StorageService.getCheckIns().slice(0, 3);
  if (list.length === 0) return null;
  const lines = [t('doc.share.title'), ''];
  list.forEach((c) => {
    const sk = c.severity ? severityKey(c.severity) : null;
    const severity =
      String(c.id).startsWith('voice-') || !c.severity ? t('sev.notrated') : sk ? t(sk) : c.severity;
    lines.push(`${formatWhen(c.timestamp, lang)}: ${c.symptoms.join(', ')} (${severity})`);
    if (c.reflections && !VOICE_NOTES.includes(c.reflections)) lines.push(`  ${c.reflections}`);
  });
  return lines.join('\n');
}

export default function Telemedicine({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const { t, lang } = useI18n();
  const number = getEmergencyNumber();
  const [message, setMessage] = useState('');

  const handleShare = async () => {
    setMessage('');
    const text = latestText(t, lang);
    if (!text) {
      setMessage(t('doc.share.none'));
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({ title: t('doc.share.title'), text });
      } catch (err) {
        // The person closing the share sheet is not an error.
        if ((err as DOMException).name !== 'AbortError') setMessage(t('doc.share.fail1'));
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setMessage(t('doc.share.copied'));
    } catch {
      setMessage(t('doc.share.fail2'));
    }
  };

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-100 shadow-xl">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-indigo-300">{t('doc.title')}</h2>
          <p className="text-sm text-slate-300">{t('doc.sub')}</p>
        </div>
        <span className="shrink-0 rounded-full border border-amber-600/50 bg-amber-950/60 px-3 py-1 text-xs font-semibold text-amber-300">
          {t('common.soon')}
        </span>
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border border-red-500/50 bg-red-950/40 p-4">
          <p className="mb-1 text-sm font-semibold text-red-200">{t('doc.emerg.title')}</p>
          <p className="mb-3 text-xs text-slate-200">{t('doc.emerg.body')}</p>
          <a
            href={`tel:${number}`}
            className="flex min-h-[48px] items-center justify-center rounded-xl bg-red-600 py-3 font-bold text-white transition-colors hover:bg-red-500"
          >
            {t('sos.call', { number })}
          </a>
        </div>

        <div className="rounded-xl border border-slate-600 bg-slate-800/60 p-4">
          <p className="mb-1 text-sm font-semibold text-slate-100">{t('doc.own.title')}</p>
          <p className="mb-3 text-xs text-slate-300">{t('doc.own.body')}</p>
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleShare}
              className="min-h-[48px] w-full rounded-xl bg-indigo-600 py-3 font-bold text-white transition-colors hover:bg-indigo-500"
            >
              {t('doc.share')}
            </button>
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('exportreport')}
                className="min-h-[48px] w-full rounded-xl border border-slate-500 py-3 text-sm font-semibold text-slate-100 transition-colors hover:bg-slate-700"
              >
                {t('doc.summary')}
              </button>
            )}
          </div>
          {message && (
            <p role="status" className="mt-3 text-xs text-slate-200">
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}