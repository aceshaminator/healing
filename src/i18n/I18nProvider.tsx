import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_LANGUAGE, LANGUAGES } from './languages';
import { DICTIONARIES } from './locales';

const LANG_KEY = 'healing_language';

type Vars = Record<string, string | number>;

interface I18n {
  lang: string;
  setLang: (code: string) => void;
  t: (key: string, vars?: Vars) => string;
}

function fill(raw: string, vars?: Vars): string {
  if (!vars) return raw;
  return raw.replace(/\{(\w+)\}/g, (_m, k: string) => (k in vars ? String(vars[k]) : `{${k}}`));
}

function readLanguage(): string {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved && LANGUAGES.some((l) => l.code === saved)) return saved;
  } catch {
    /* ignore */
  }
  return DEFAULT_LANGUAGE;
}

const I18nContext = createContext<I18n | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<string>(readLanguage);

  // Tell the browser the language and reading direction (Arabic reads right to left).
  useEffect(() => {
    const info = LANGUAGES.find((l) => l.code === lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = info ? info.dir : 'ltr';
  }, [lang]);

  const setLang = useCallback((code: string) => {
    if (!LANGUAGES.some((l) => l.code === code)) return;
    setLangState(code);
    try {
      localStorage.setItem(LANG_KEY, code);
    } catch {
      /* ignore */
    }
  }, []);

  const t = useCallback(
    (key: string, vars?: Vars) => {
      const raw = DICTIONARIES[lang]?.[key] ?? DICTIONARIES[DEFAULT_LANGUAGE][key] ?? key;
      return fill(raw, vars);
    },
    [lang],
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18n {
  const ctx = useContext(I18nContext);
  if (ctx) return ctx;
  // Used outside the provider: show English.
  return {
    lang: DEFAULT_LANGUAGE,
    setLang: () => {},
    t: (key, vars) => fill(DICTIONARIES[DEFAULT_LANGUAGE][key] ?? key, vars),
  };
}