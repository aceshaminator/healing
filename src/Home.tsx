import { useI18n } from './i18n/I18nProvider';
import { SECTIONS } from './sections';
import type { SectionId } from './sections';

export default function Home({ onOpen }: { onOpen: (id: SectionId) => void }) {
  const { t } = useI18n();

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-slate-100">{t('home.title')}</h2>
      <div className="grid grid-cols-2 gap-3">
        {SECTIONS.map((s) => {
          const Icon = s.Icon;
          const wide = s.id === 'emergency';
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onOpen(s.id)}
              className={`flex flex-col justify-between gap-4 rounded-3xl border-2 bg-[#0B132B] p-4 text-left transition hover:bg-slate-900 ${
                wide ? 'col-span-2 min-h-[120px]' : 'min-h-[160px]'
              } ${s.accent}`}
            >
              <Icon className="h-9 w-9" aria-hidden="true" />
              <span>
                <span className="block text-lg font-bold text-slate-100">{t(s.titleKey)}</span>
                <span className="mt-1 block text-sm leading-snug text-slate-300">{t(s.descKey)}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}