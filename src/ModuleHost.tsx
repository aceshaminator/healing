/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from 'react';
import SosButton from './components/SosButton';
import { useI18n } from './i18n/I18nProvider';
import { LANGUAGES } from './i18n/languages';
import { SECTIONS } from './sections';
import type { SectionId } from './sections';

type Loader = () => Promise<{ default?: React.ComponentType<any> }>;
const files = import.meta.glob('./components/*.tsx') as Record<string, Loader>;

const ALL_MODULES = SECTIONS.flatMap((s) => s.modules);

// A class cannot use the translation hook, so the words arrive as props.
class Guard extends React.Component<
  { children: React.ReactNode; onBack: () => void; title: string; body: string; ok: string },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="rounded-2xl border border-amber-400/40 bg-amber-400/10 p-5 text-sm text-amber-100">
        <p className="font-semibold">{this.props.title}</p>
        <p className="mt-1 text-amber-200/80">{this.props.body}</p>
        <button
          type="button"
          onClick={this.props.onBack}
          className="mt-4 min-h-[44px] rounded-xl border border-amber-300/50 px-4 py-2 text-sm font-semibold"
        >
          {this.props.ok}
        </button>
      </div>
    );
  }
}

const barBtn =
  'min-h-[44px] rounded-xl border border-slate-600 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-100 transition hover:bg-slate-800';

export default function ModuleHost({ section, onClose }: { section: SectionId | null; onClose: () => void }) {
  const { t, lang } = useI18n();
  const [active, setActive] = useState<{ labelKey: string; Comp: React.ComponentType<any> } | null>(null);
  const [note, setNote] = useState('');
  const [opening, setOpening] = useState('');
  const [large, setLarge] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const current = SECTIONS.find((s) => s.id === section) ?? null;

  useEffect(() => {
    document.documentElement.style.fontSize = large ? '125%' : '';
    return () => {
      document.documentElement.style.fontSize = '';
    };
  }, [large]);

  useEffect(() => {
    if (!current) window.speechSynthesis?.cancel();
  }, [current]);

  // Any screen that fails to save on this phone announces it, and we warn the person here.
  useEffect(() => {
    const onError = () => setStorageError(true);
    window.addEventListener('healing:storage-error', onError);
    return () => window.removeEventListener('healing:storage-error', onError);
  }, []);

  // While a section is open, quietly load its screens in the background so taps open instantly.
  useEffect(() => {
    if (!current) return;
    const w = window as any;
    const run = () => {
      current.modules.forEach((m) => {
        files[`./components/${m.file}`]?.().catch(() => {});
      });
    };
    const handle = w.requestIdleCallback ? w.requestIdleCallback(run) : window.setTimeout(run, 800);
    return () => {
      if (w.requestIdleCallback && w.cancelIdleCallback) w.cancelIdleCallback(handle);
      else window.clearTimeout(handle);
    };
  }, [current]);

  const openModule = async (file: string, labelKey: string) => {
    setNote('');
    setOpening(t(labelKey));
    const load = files[`./components/${file}`];
    if (!load) {
      setNote(t('host.notfound', { name: t(labelKey) }));
      setOpening('');
      return;
    }
    try {
      const mod = await load();
      if (!mod.default) {
        setNote(t('host.noopen', { name: t(labelKey) }));
        return;
      }
      setActive({ labelKey, Comp: mod.default });
    } catch {
      setNote(t('host.noload', { name: t(labelKey) }));
    } finally {
      setOpening('');
    }
  };

  // When a different tile is opened, start from its list. A tile with one screen opens it directly.
  useEffect(() => {
    setActive(null);
    setNote('');
    if (current && current.modules.length === 1) {
      openModule(current.modules[0].file, current.modules[0].labelKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

  // Some screens ask to jump to another one, for example from the readings to the charts.
  const navigate = (tab: string) => {
    const key = tab.toLowerCase().replace(/[^a-z]/g, '');
    if (key.length < 3) return;
    const hit = ALL_MODULES.find((m) => {
      const stem = m.file.replace('.tsx', '').toLowerCase();
      return stem === key || stem.includes(key) || key.includes(stem);
    });
    if (hit) openModule(hit.file, hit.labelKey);
  };

  const readScreen = () => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    if (synth.speaking) {
      synth.cancel();
      return;
    }
    const text = (panelRef.current?.innerText ?? '').slice(0, 4000);
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    const info = LANGUAGES.find((l) => l.code === lang);
    if (info) utterance.lang = info.speech;
    synth.speak(utterance);
  };

  if (!current) return null;

  const title = active ? t(active.labelKey) : t(current.titleKey);
  const showBack = !!active && current.modules.length > 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-40 overflow-y-auto bg-[#070D1F] text-slate-100"
    >
      <div className="mx-auto max-w-3xl px-4 py-5">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-700 pb-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <div className="flex flex-wrap items-center gap-2">
            <SosButton />
            <button type="button" onClick={readScreen} className={barBtn}>
              {t('common.readScreen')}
            </button>
            <button type="button" onClick={() => setLarge((v) => !v)} className={barBtn}>
              {large ? t('common.normalText') : t('common.bigText')}
            </button>
            {showBack && (
              <button type="button" onClick={() => setActive(null)} className={barBtn}>
                ← {t('common.back')}
              </button>
            )}
            <button type="button" onClick={onClose} className={barBtn}>
              {t('common.home')}
            </button>
          </div>
        </div>

        {storageError && (
          <div role="alert" className="mb-4 rounded-xl border border-red-500/50 bg-red-500/15 p-3 text-sm text-red-100">
            <p className="font-bold">{t('app.storage.title')}</p>
            <p className="mt-1">{t('app.storage.body')}</p>
          </div>
        )}

        <div ref={panelRef}>
          {active ? (
            <Guard
              key={active.labelKey}
              onBack={() => setActive(null)}
              title={t('host.fail.title')}
              body={t('host.fail.body')}
              ok={t('host.fail.ok')}
            >
              <active.Comp onNavigate={navigate} />
            </Guard>
          ) : (
            <>
              {opening && (
                <p role="status" className="mb-4 rounded-xl border border-slate-600 bg-slate-900 p-3 text-sm text-slate-100">
                  {t('common.opening', { name: opening })}
                </p>
              )}
              {note && (
                <p className="mb-4 rounded-xl border border-amber-400/40 bg-amber-400/10 p-3 text-sm text-amber-100">{note}</p>
              )}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {current.modules.map((m) => (
                  <button
                    key={m.file}
                    type="button"
                    onClick={() => openModule(m.file, m.labelKey)}
                    className="flex min-h-[64px] items-center justify-between gap-2 rounded-2xl border border-slate-600 bg-[#0B132B] px-4 py-4 text-left text-base font-semibold text-slate-100 transition hover:border-emerald-400/60 hover:bg-slate-900"
                  >
                    <span>{t(m.labelKey)}</span>
                    {m.status && (
                      <span className="shrink-0 rounded-full border border-amber-400/50 px-2 py-0.5 text-xs font-semibold text-amber-300">
                        {t('common.soon')}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}