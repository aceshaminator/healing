import { useEffect, useState } from 'react';
import { useI18n } from './i18n/I18nProvider';

// Tells the person when there is no internet, and when the app is saved on the phone and ready to work without it.
export default function OfflineStatus() {
  const { t } = useI18n();
  const [online, setOnline] = useState<boolean>(navigator.onLine);
  const [ready, setReady] = useState(false);

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
    navigator.serviceWorker.ready
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!online) {
    return (
      <p role="status" className="rounded-xl border border-amber-400/40 bg-amber-400/10 p-3 text-sm text-amber-100">
        {t('app.offline')}
      </p>
    );
  }
  if (ready) {
    return (
      <p role="status" className="text-xs font-medium text-emerald-300">
        {t('app.offlineReady')}
      </p>
    );
  }
  return null;
}