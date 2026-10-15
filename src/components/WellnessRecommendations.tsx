import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useI18n } from '../i18n/I18nProvider';

type TabId = 'move' | 'reading' | 'wisdom';

const TABS: { id: TabId; key: string; icon: string }[] = [
  { id: 'move', key: 'well.tab.move', icon: '🧘' },
  { id: 'reading', key: 'well.tab.reading', icon: '📚' },
  { id: 'wisdom', key: 'well.tab.wisdom', icon: '🕊️' },
];

const MOVE_IDS = [1, 2];
// Book titles and authors stay as they are. Their descriptions are translated.
const READING = [
  { id: 1, title: "Man's Search for Meaning", author: 'Viktor Frankl' },
  { id: 2, title: 'The Body Keeps the Score', author: 'Bessel van der Kolk' },
  { id: 3, title: 'Tao Te Ching', author: 'Lao Tzu' },
];
const WISDOM_IDS = [1, 2, 3, 4];

export default function WellnessRecommendations() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<TabId>('move');

  return (
    <div className="space-y-6 rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-xl">
      <div className="border-b border-slate-700 pb-4">
        <h2 className="flex items-center gap-2 text-xl font-bold text-cyan-300">
          <Sparkles className="h-5 w-5 text-cyan-300" aria-hidden="true" /> {t('well.title')}
        </h2>
        <p className="mt-1 text-sm text-slate-300">{t('well.intro')}</p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-700 pb-3">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            aria-pressed={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex min-h-[44px] items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-cyan-500 text-slate-950'
                : 'border border-slate-600 bg-slate-950 text-slate-200 hover:text-white'
            }`}
          >
            <span aria-hidden="true">{tab.icon}</span> {t(tab.key)}
          </button>
        ))}
      </div>

      {activeTab === 'move' && (
        <div className="space-y-4">
          <p className="rounded-xl border border-amber-400/40 bg-amber-400/10 p-3 text-sm text-amber-100">{t('well.skip')}</p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {MOVE_IDS.map((n) => (
              <div key={n} className="space-y-3 rounded-xl border border-slate-700 bg-slate-950 p-5">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-md bg-cyan-500/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-cyan-300">
                    {t(`well.move.${n}.level`)}
                  </span>
                  <span className="text-xs text-slate-300">{t(`well.move.${n}.time`)}</span>
                </div>
                <h3 className="text-base font-bold text-slate-100">{t(`well.move.${n}.title`)}</h3>
                <p className="text-sm leading-relaxed text-slate-200">{t(`well.move.${n}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'reading' && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {READING.map((item) => (
            <div key={item.id} className="space-y-2 rounded-xl border border-slate-700 bg-slate-950 p-5">
              <span className="text-xs font-semibold text-cyan-300">{item.author}</span>
              <h3 className="text-base font-bold text-slate-100">{item.title}</h3>
              <p className="text-sm leading-relaxed text-slate-200">{t(`well.read.${item.id}.desc`)}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'wisdom' && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {WISDOM_IDS.map((n) => (
            <div key={n} className="space-y-2 rounded-xl border border-slate-700 bg-slate-950 p-5">
              <h3 className="text-base font-bold text-slate-100">{t(`well.wis.${n}.title`)}</h3>
              <p className="text-sm leading-relaxed text-slate-200">{t(`well.wis.${n}.desc`)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}