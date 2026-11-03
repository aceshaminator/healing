import { useEffect, useState } from 'react';
import { useI18n } from '../i18n/I18nProvider';
import { applyUpdate, updateIsWaiting } from '../registerSw';

// Appears at the top when a newer copy of the app has downloaded. Nothing changes until the person taps "Update now".
export default function UpdateBar() {
  const { t } = useI18n();
  const [ready, setReady] = useState<boolean>(updateIsWaiting());

  useEffect(() => {
    const onReady = () => setReady(true);
    window.addEventListener('healing:update-ready', onReady);
    return () => window.removeEventListener('healing:update-ready', onReady);
  }, []);

  if (!ready) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-0 top-0 z-40 border-b border-brand/40 bg-surface px-4 pb-3 text-ink shadow-lg"
      style={{ paddingTop: 'calc(0.75rem + env(safe-area-inset-top, 0px))' }}
    >
      <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold">{t('app.update.title')}</p>
          <p className="text-xs text-muted">{t('app.update.body')}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setReady(false)}
            className="min-h-[44px] rounded-xl border border-line px-4 py-2 text-sm font-medium"
          >
            {t('app.update.later')}
          </button>
          <button
            type="button"
            onClick={applyUpdate}
            className="min-h-[44px] rounded-xl bg-brand px-4 py-2 text-sm font-bold text-canvas"
          >
            {t('app.update.now')}
          </button>
        </div>
      </div>
    </div>
  );
}