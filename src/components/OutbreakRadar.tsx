import { ShieldAlert } from 'lucide-react';
import { useI18n } from '../i18n/I18nProvider';
import { getEmergencyNumber, isNigeria } from '../i18n/regions';

// NCDC (Nigeria Centre for Disease Control) contact details, as listed on ncdc.gov.ng.
// Call 6232 once yourself before launch to make sure it still works.
const NCDC_SITE = 'https://ncdc.gov.ng';
const NCDC_TOLL_FREE = '6232';
const NCDC_WHATSAPP_DISPLAY = '0708 711 0839';
const NCDC_WHATSAPP_LINK = 'https://wa.me/2347087110839';

const linkButton =
  'flex min-h-[48px] items-center justify-center rounded-xl border border-slate-500 bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-700';

export default function OutbreakRadar() {
  const { t } = useI18n();
  const emergencyNumber = getEmergencyNumber();
  const nigeria = isNigeria();

  return (
    <div className="space-y-6 rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-xl">
      <div className="flex items-start justify-between gap-3 border-b border-slate-700 pb-4">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-cyan-300">
            <ShieldAlert className="h-5 w-5 text-amber-300" aria-hidden="true" /> {t('out.title')}
          </h2>
          <p className="mt-1 text-sm text-slate-300">{t('out.sub')}</p>
        </div>
        <span className="shrink-0 rounded-full border border-amber-500/50 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-200">
          {t('common.soon')}
        </span>
      </div>

      <p className="text-sm leading-relaxed text-slate-200">{t('out.p')}</p>

      {nigeria ? (
        <div className="space-y-3 rounded-2xl border border-slate-600 bg-slate-950 p-5">
          <h3 className="text-base font-bold text-slate-100">{t('info.src.ncdc.name')}</h3>
          <p className="text-sm text-slate-300">{t('out.ncdc.text')}</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <a href={`tel:${NCDC_TOLL_FREE}`} className={linkButton}>
              {t('out.ncdc.call', { phone: NCDC_TOLL_FREE })}
            </a>
            <a href={NCDC_WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className={linkButton}>
              {t('out.ncdc.whatsapp', { phone: NCDC_WHATSAPP_DISPLAY })}
            </a>
            <a href={NCDC_SITE} target="_blank" rel="noopener noreferrer" className={`${linkButton} sm:col-span-2`}>
              {t('out.ncdc.open')}
            </a>
          </div>
        </div>
      ) : (
        <div className="space-y-3 rounded-2xl border border-slate-600 bg-slate-950 p-5">
          <h3 className="text-base font-bold text-slate-100">{t('out.who.title')}</h3>
          <p className="text-sm text-slate-300">{t('out.who.text')}</p>
          <a href="https://afro.who.int" target="_blank" rel="noopener noreferrer" className={linkButton}>
            {t('out.who.open')}
          </a>
        </div>
      )}

      <div className="rounded-xl border border-red-500/50 bg-red-950/40 p-4">
        <p className="text-sm font-bold text-red-100">{t('out.ill.title')}</p>
        <p className="mt-1 text-sm leading-relaxed text-red-50">{t('out.ill.body', { number: emergencyNumber })}</p>
        <a
          href={`tel:${emergencyNumber}`}
          className="mt-3 flex min-h-[48px] items-center justify-center rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-500"
        >
          {t('sos.call', { number: emergencyNumber })}
        </a>
      </div>
    </div>
  );
}