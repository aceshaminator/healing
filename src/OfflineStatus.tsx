import { useEffect, useState } from 'react';
import { useI18n } from './i18n/I18nProvider';

// Tells the person when there is no internet, and whether the app is saved on the phone so it can work without it.
// variant "top": the offline notice and the "not saved yet" notices. variant "bottom": the quiet "ready" line.
const PREPARING_AFTER_MS = 3000;
const NOT_READY_AFTER_MS = 30000;

export default function OfflineStatus({ variant = 'top' }: { variant?: 'top' | 'bottom' }) {
  const { t } = useI18n();
  const [online, setOnline] = useState<boolean>(navigator.onLine);
  const [ready, setReady] = useState(false);
  const [waited, setWaited] = useState<'none' | 'preparing' | 'notready'>('none');

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  useEffect(() => {
    if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
    let cancelled = false;
    // A returning visitor is ready within a moment, so the "saving" notice only appears if it takes longer.
    const slow = window.setTimeout(() => {
      if (!cancelled) setWaited('preparing');
    }, PREPARING_AFTER_MS);
    const stuck = window.setTimeout(() => {
      if (!cancelled) setWaited('notready');
    }, NOT_READY_AFTER_MS);
    navigator.serviceWorker.ready
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      window.clearTimeout(slow);
      window.clearTimeout(stuck);
    };
  }, []);

  if (variant === 'bottom') {
    if (!online || !ready) return null;
    return (
      <p role="status" className="text-center text-xs font-medium text-tone-green">
        {t('app.offlineReady')}
      </p>
    );
  }

  if (!online) {
    return (
      <p role="status" className="rounded-xl border border-warn/40 bg-warn/10 p-3 text-sm text-ink">
        {t('app.offline')}
      </p>
    );
  }

  // While developing, the offline engine is switched off, so there is nothing to report.
  if (!import.meta.env.PROD || ready) return null;

  if (!('serviceWorker' in navigator)) {
    return (
      <p role="status" className="rounded-xl border border-warn/40 bg-warn/10 p-3 text-sm text-ink">
        {t('app.offlineUnsupported')}
      </p>
    );
  }
  if (waited === 'notready') {
    return (
      <p role="status" className="rounded-xl border border-warn/40 bg-warn/10 p-3 text-sm text-ink">
        {t('app.offlineNotReady')}
      </p>
    );
  }
  if (waited === 'preparing') {
    return (
      <p role="status" className="rounded-xl border border-muted/40 bg-surface p-3 text-sm text-ink">
        {t('app.offlinePreparing')}
      </p>
    );
  }
  return null;
}