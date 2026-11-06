import { useEffect, useState } from 'react';
import { useI18n } from '../i18n/I18nProvider';
import { backupAgeDays, hasRecords, isSnoozed, snooze } from '../lib/backupReminder';

const DUE_AFTER_DAYS = 30;

// A gentle note on the home screen when there are records but no recent backup copy.
export default function BackupReminder() {
  const { t } = useI18n();
  const [, refresh] = useState(0);

  useEffect(() => {
    const again = () => refresh((n) => n + 1);
    window.addEventListener('healing:backup-done', again);
    return () => window.removeEventListener('healing:backup-done', again);
  }, []);

  const days = backupAgeDays();
  const due = hasRecords() && !isSnoozed() && (days === null || days >= DUE_AFTER_DAYS);
  if (!due) return null;

  return (
    <div role="status" className="space-y-3 rounded-xl border border-warn/40 bg-warn/10 p-3 text-sm text-ink">
      <p>{days === null ? t('bak.remind.never') : t('bak.remind.old', { days })}</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent('healing:open-section', { detail: 'settings' }))}
          className="min-h-[44px] rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-slate-900 transition hover:bg-emerald-400"
        >
          {t('bak.remind.open')}
        </button>
        <button
          type="button"
          onClick={() => {
            snooze();
            refresh((n) => n + 1);
          }}
          className="min-h-[44px] rounded-xl border border-muted/50 px-4 py-2 text-sm font-semibold text-ink transition hover:bg-line/40"
        >
          {t('app.update.later')}
        </button>
      </div>
    </div>
  );
}