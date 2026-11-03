import { useI18n } from './i18n/I18nProvider';
import { SECTIONS } from './sections';
import type { SectionId } from './sections';

export default function Home({ onOpen }: { onOpen: (id: SectionId) => void }) {
  const { t } = useI18n();

  return (
    <div className="space-y-4">
      <h2 className="rise text-2xl font-semibold text-ink">{t('home.title')}</h2>
      <div className="grid grid-cols-2 gap-3">
        {SECTIONS.map((s, i) => {
          const Icon = s.Icon;
          const wide = s.id === 'emergency';
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onOpen(s.id)}
              // Emergency appears at once; the other tiles follow one after another.
              style={{ animationDelay: `${i * 70}ms`, ...(wide ? { gridColumn: 'span 2 / span 2' } : {}) }}
              className={`rise flex flex-col justify-between gap-4 rounded-3xl border-2 bg-surface p-4 text-left transition active:scale-[0.98] hover:bg-canvas
                wide ? 'col-span-2 min-h-[120px]' : 'min-h-[160px]'
              } ${s.accent}`}
            >
              <Icon className="h-9 w-9" aria-hidden="true" />
              <span>
                <span className="block text-lg font-bold text-ink">{t(s.titleKey)}</span>
                <span className="mt-1 block text-sm leading-snug text-ink/80">{t(s.descKey)}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}