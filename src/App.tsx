import { useEffect, useState } from 'react';
import OfflineStatus from './OfflineStatus';
import { registerServiceWorker } from './registerSw';
import ModuleHost from './ModuleHost';
import Home from './Home';
import SosButton from './components/SosButton';
import FirstRun from './components/FirstRun';
import { I18nProvider, useI18n } from './i18n/I18nProvider';
import { getEmergencyNumber } from './i18n/regions';
import type { SectionId } from './sections';
import PinGate from './components/PinGate';
import UpdateBar from './components/UpdateBar';

const LOGO_SRC = '/healing-logo.jpeg';
const SETUP_KEY = 'healing_setup_done';

function readSetupDone(): boolean {
  try {
    return localStorage.getItem(SETUP_KEY) === '1';
  } catch {
    return false;
  }
}

function Logo({ className = 'h-16 w-16' }: { className?: string }) {
  return (
    <div className={`${className} shrink-0 overflow-hidden rounded-2xl border border-brand/30 bg-brand/10`}>
      <img src={LOGO_SRC} alt="Healing logo" className="h-full w-full object-cover" />
    </div>
  );
}

// SOS stays in the bottom-right corner on every screen. Open screens have their own SOS button.
function FloatingSos() {
  return (
    <div className="fixed right-4 z-30" style={{ bottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}>
      <SosButton />
    </div>
  );
}

function Shell() {
    if (window.location.hash === '#crash') throw new Error('test crash');
  const { t } = useI18n();
  const [inPortal, setInPortal] = useState(false);
  const [setupDone, setSetupDone] = useState<boolean>(readSetupDone);
  const [storageError, setStorageError] = useState(false);
  const [section, setSection] = useState<SectionId | null>(null);
  const emergencyNumber = getEmergencyNumber();

  // Any screen that fails to save on this phone announces it, and we warn the person here.
  useEffect(() => {
    const onError = () => setStorageError(true);
    window.addEventListener('healing:storage-error', onError);
    return () => window.removeEventListener('healing:storage-error', onError);
  }, []);

  useEffect(() => {
    registerServiceWorker();
  }, []);

  // SOS can ask to open a section, for example the emergency plan.
  useEffect(() => {
    const onOpen = (e: Event) => {
      setInPortal(true);
      setSection((e as CustomEvent<SectionId>).detail);
    };
    window.addEventListener('healing:open-section', onOpen);
    return () => window.removeEventListener('healing:open-section', onOpen);
  }, []);

  const finishSetup = (reload: boolean) => {
    try {
      localStorage.setItem(SETUP_KEY, '1');
    } catch {
      /* ignore */
    }
    if (reload) window.location.reload();
    else setSetupDone(true);
  };

  if (!setupDone) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas p-4 pb-24 text-ink">
        <div className="w-full max-w-md space-y-6 rounded-3xl border border-brand/20 bg-surface p-8 shadow-xl">
          <Logo className="mx-auto h-16 w-16" />
          <FirstRun onDone={finishSetup} />
        </div>
        <FloatingSos />
      </div>
    );
  }

  if (!inPortal) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas p-4 pb-24 text-ink">
        <div className="rise w-full max-w-md space-y-8 rounded-3xl border border-brand/20 bg-surface p-8 text-center shadow-xl">
          <Logo className="mx-auto h-16 w-16" />
          <div className="rise rise-2 space-y-3">
            <h1 className="text-4xl font-light tracking-tight">{t('welcome.title')}</h1>
            <p className="text-xs font-medium uppercase tracking-widest text-muted">by VisionAce</p>
            <p className="text-sm text-ink/80">{t('welcome.tagline')}</p>
          </div>
          <button
            type="button"
            onClick={() => setInPortal(true)}
            className="rise rise-3 min-h-[52px] w-full rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 px-6 py-4 text-sm font-bold uppercase tracking-wide text-slate-900 shadow-lg shadow-emerald-500/20 transition hover:brightness-110"
          >
            {t('welcome.enter')}
          </button>
        </div>
        <FloatingSos />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <div className="mx-auto max-w-2xl space-y-8 px-4 pb-28 pt-6">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-5">
          <div className="flex items-center gap-3">
            <Logo className="h-11 w-11" />
            <div>
              <h1 className="text-xl font-medium">Healing</h1>
              <p className="text-xs text-ink/80">{t('home.tagline')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setInPortal(false)}
            className="min-h-[44px] rounded-xl border border-muted/40 bg-surface px-4 py-2 text-sm font-medium text-ink transition hover:bg-canvas"
          >
            {t('home.welcomeBack')}
          </button>
        </header>
        <OfflineStatus />

        {storageError && (
          <div role="alert" className="rounded-xl border border-danger/50 bg-danger/15 p-3 text-sm text-ink">
            <p className="font-bold">{t('app.storage.title')}</p>
            <p className="mt-1">{t('app.storage.body')}</p>
          </div>
        )}

        <Home onOpen={setSection} />

        <p className="pb-6 text-center text-xs leading-relaxed text-ink/80">
          {t('home.disclaimer')}{' '}
          <a href={`tel:${emergencyNumber}`} className="font-semibold underline">
            {t('sos.call', { number: emergencyNumber })}
          </a>
        </p>
      </div>

      <ModuleHost section={section} onClose={() => setSection(null)} />
      <FloatingSos />
    </div>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <PinGate>
        <Shell />
      </PinGate>
      <UpdateBar />
    </I18nProvider>
  );
}