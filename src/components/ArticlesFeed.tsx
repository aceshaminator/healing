import { useCallback, useEffect, useState } from 'react';
import { useI18n } from '../i18n/I18nProvider';
import { getEmergencyNumber, isNigeria } from '../i18n/regions';

// Address of your news server, set in the .env.local file.
const NEWS_URL = ((import.meta as any).env?.VITE_NEWS_URL as string | undefined)?.trim();
const CACHE_KEY = 'healing_news_cache';

type NewsItem = {
  id: string;
  title: string;
  link: string;
  source: string;
  kind: 'news' | 'outbreak';
  date: string | null;
  summary: string;
};
type NewsState = { generatedAt: string | null; fetchedAt: string; items: NewsItem[] };

const ARTICLES = [
  { id: 'a1', cat: 'art.cat.cardio' },
  { id: 'a2', cat: 'art.cat.maternal' },
  { id: 'a3', cat: 'art.cat.mental' },
  { id: 'a4', cat: 'art.cat.resp' },
  { id: 'a5', cat: 'art.cat.prev' },
  { id: 'a6', cat: 'art.cat.family' },
  { id: 'a7', cat: 'art.cat.well' },
];

const SOURCES = [
  { id: 'ncdc', url: 'https://ncdc.gov.ng', nigeriaOnly: true },
  { id: 'whonews', url: 'https://www.who.int/news', nigeriaOnly: false },
  { id: 'whotopics', url: 'https://www.who.int/health-topics', nigeriaOnly: false },
  { id: 'medline', url: 'https://medlineplus.gov', nigeriaOnly: false },
];

function cleanItems(raw: unknown): NewsItem[] {
  if (!Array.isArray(raw)) return [];
  const out: NewsItem[] = [];
  for (const r of raw) {
    if (!r || typeof r !== 'object') continue;
    const o = r as Record<string, unknown>;
    if (typeof o.title !== 'string' || typeof o.link !== 'string' || !o.link.startsWith('https://')) continue;
    out.push({
      id: typeof o.id === 'string' ? o.id : o.link,
      title: o.title.slice(0, 200),
      link: o.link,
      source: typeof o.source === 'string' ? o.source.slice(0, 80) : '',
      kind: o.kind === 'outbreak' ? 'outbreak' : 'news',
      date: typeof o.date === 'string' ? o.date : null,
      summary: typeof o.summary === 'string' ? o.summary.slice(0, 400) : '',
    });
  }
  return out.slice(0, 40);
}

function loadCache(): NewsState | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    const items = cleanItems(p?.items);
    if (items.length === 0) return null;
    return {
      generatedAt: typeof p.generatedAt === 'string' ? p.generatedAt : null,
      fetchedAt: typeof p.fetchedAt === 'string' ? p.fetchedAt : '',
      items,
    };
  } catch {
    return null;
  }
}

function showDate(iso: string | null, lang: string, none: string) {
  if (!iso) return none;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return none;
  const o: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
  try {
    return d.toLocaleDateString(lang, o);
  } catch {
    return d.toLocaleDateString(undefined, o);
  }
}

function showTime(iso: string | null, lang: string, unknown: string) {
  if (!iso) return unknown;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return unknown;
  const o: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' };
  try {
    return d.toLocaleString(lang, o);
  } catch {
    return d.toLocaleString(undefined, o);
  }
}

function daysOld(iso: string | null): number | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return Math.floor((Date.now() - d.getTime()) / 86400000);
}

export default function ArticlesFeed() {
  const { t, lang } = useI18n();
  const [openId, setOpenId] = useState<string | null>(null);
  const [news, setNews] = useState<NewsState | null>(loadCache);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [onlyOutbreaks, setOnlyOutbreaks] = useState(false);
  const emergencyNumber = getEmergencyNumber();
  const nigeria = isNigeria();

  const load = useCallback(async () => {
    if (!NEWS_URL) return;
    setStatus('loading');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    try {
      const res = await fetch(NEWS_URL, { signal: controller.signal, cache: 'no-store' });
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      const items = cleanItems(data?.items);
      if (items.length === 0) throw new Error('empty');
      const next: NewsState = {
        generatedAt: typeof data?.generatedAt === 'string' ? data.generatedAt : null,
        fetchedAt: new Date().toISOString(),
        items,
      };
      setNews(next);
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      setStatus('idle');
    } catch {
      setStatus('error');
    } finally {
      clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const unknown = t('info.unknown');
  const shown = news ? news.items.filter((i) => !onlyOutbreaks || i.kind === 'outbreak') : [];
  const age = news ? daysOld(news.generatedAt) : null;

  return (
    <div className="space-y-8 text-ink">
      <div className="border-b border-line pb-4">
        <h2 className="text-xl font-bold text-tone-green">{t('info.title')}</h2>
        <p className="mt-1 text-sm text-ink/80">{t('info.sub')}</p>
      </div>

      {/* Latest news from official sources */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-ink">{t('info.news.title')}</h3>
          {NEWS_URL && (
            <button
              type="button"
              onClick={load}
              disabled={status === 'loading'}
              className="min-h-[44px] rounded-lg border border-muted/50 bg-line/40 px-4 py-2 text-sm font-semibold text-ink transition hover:bg-line/70 disabled:opacity-60"
            >
              {status === 'loading' ? t('info.news.checking') : t('info.news.check')}
            </button>
          )}
        </div>

        {!NEWS_URL ? (
          <p className="rounded-xl border border-muted/40 bg-canvas p-4 text-sm text-ink">{t('info.news.notset')}</p>
        ) : (
          <>
            <p className="rounded-xl border border-warn/40 bg-warn/10 p-3 text-sm leading-relaxed text-ink">
              {t('info.news.disclaimer')}{' '}
              <a href={`tel:${emergencyNumber}`} className="font-bold underline">
                {emergencyNumber}
              </a>
              .
              {nigeria && (
                <>
                  {' '}
                  {t('info.news.ncdc')}{' '}
                  <a href="tel:6232" className="font-bold underline">
                    6232
                  </a>
                  .
                </>
              )}
            </p>
            <p className="text-xs text-ink/80">{t('info.news.srclang')}</p>

            {status === 'error' && (
              <p role="status" className="rounded-xl border border-muted/40 bg-canvas p-3 text-sm text-ink">
                {news
                  ? t('info.news.errsaved', { when: showTime(news.fetchedAt, lang, unknown) })
                  : t('info.news.errnone')}
              </p>
            )}

            {news && (
              <p className="text-xs text-ink/80">
                {t('info.news.updated', {
                  updated: showTime(news.generatedAt, lang, unknown),
                  checked: showTime(news.fetchedAt, lang, unknown),
                })}
              </p>
            )}

            {age !== null && age >= 3 && (
              <p role="status" className="rounded-xl border border-warn/40 bg-warn/10 p-3 text-sm text-ink">
                {t('info.news.stale', { days: age })}
              </p>
            )}

            {news && (
              <div className="flex gap-2">
                <button
                  type="button"
                  aria-pressed={!onlyOutbreaks}
                  onClick={() => setOnlyOutbreaks(false)}
                  className={`min-h-[44px] rounded-lg border px-4 py-2 text-sm font-semibold ${
                    !onlyOutbreaks ? 'border-brand bg-brand/20 text-ink' : 'border-muted/40 text-ink'
                  }`}
                >
                  {t('info.filter.all')}
                </button>
                <button
                  type="button"
                  aria-pressed={onlyOutbreaks}
                  onClick={() => setOnlyOutbreaks(true)}
                  className={`min-h-[44px] rounded-lg border px-4 py-2 text-sm font-semibold ${
                    onlyOutbreaks ? 'border-brand bg-brand/20 text-ink' : 'border-muted/40 text-ink'
                  }`}
                >
                  {t('info.filter.outbreak')}
                </button>
              </div>
            )}

            {news && shown.length === 0 && (
              <p className="rounded-xl border border-muted/40 bg-canvas p-4 text-sm text-ink">
                {t('info.filter.empty')}
              </p>
            )}

            <div className="grid grid-cols-1 gap-4">
              {shown.map((item) => (
                <article key={item.id} className="rounded-2xl border border-line bg-surface p-5 shadow-lg">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs text-ink/80">
                    <span
                      className={`rounded-full border px-2 py-0.5 font-semibold ${
                        item.kind === 'outbreak'
                          ? 'border-warn/60 bg-warn/10 text-tone-amber'
                          : 'border-muted/50 text-ink'
                      }`}
                    >
                      {item.kind === 'outbreak' ? t('info.badge.outbreak') : t('info.badge.news')}
                    </span>
                    <span>{showDate(item.date, lang, t('info.nodate'))}</span>
                  </div>
                  <h4 className="mb-1 text-base font-bold text-ink">{item.title}</h4>
                  <p className="mb-2 text-xs text-ink/80">{t('info.source', { name: item.source || unknown })}</p>
                  {item.summary && <p className="mb-3 text-sm leading-relaxed text-ink">{item.summary}</p>}
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[44px] items-center rounded-lg border border-tone-cyan-line/40 bg-tone-cyan-line/10 px-4 py-2 text-sm font-semibold text-tone-cyan transition hover:bg-tone-cyan-line/20"
                  >
                    {t('info.read.official')}
                  </a>
                </article>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Health basics: written into the app, works offline */}
      <section className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-ink">{t('info.basics')}</h3>
        <div className="grid grid-cols-1 gap-4">
          {ARTICLES.map((art) => {
            const open = openId === art.id;
            return (
              <article key={art.id} className="rounded-2xl border border-line bg-surface p-5 shadow-lg">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-tone-green">{t(art.cat)}</div>
                <h4 className="mb-2 text-base font-bold text-ink">{t(`art.${art.id}.title`)}</h4>
                <p className="mb-3 text-sm leading-relaxed text-ink">{t(`art.${art.id}.excerpt`)}</p>

                {open && (
                  <p className="mb-3 rounded-xl border border-line bg-surface/80 p-4 text-sm leading-relaxed text-ink">
                    {t(`art.${art.id}.content`)}
                  </p>
                )}

                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setOpenId(open ? null : art.id)}
                  className="min-h-[44px] rounded-lg border border-tone-green-line/40 bg-brand/10 px-4 py-2 text-sm font-semibold text-tone-green transition hover:bg-brand/20"
                >
                  {open ? t('info.close') : t('info.read')}
                </button>
              </article>
            );
          })}
        </div>
      </section>

      {/* Official sources */}
      <section className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-ink">{t('info.official.title')}</h3>
        <p className="text-sm text-ink/80">{t('info.official.help')}</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {SOURCES.filter((s) => !s.nigeriaOnly || nigeria).map((s) => (
            <a
              key={s.id}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block min-h-[56px] rounded-2xl border border-muted/40 bg-surface p-4 transition hover:border-tone-cyan-line/60"
            >
              <span className="block text-sm font-bold text-tone-cyan">{t(`info.src.${s.id}.name`)} ↗</span>
              <span className="mt-1 block text-sm leading-relaxed text-ink">{t(`info.src.${s.id}.desc`)}</span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}