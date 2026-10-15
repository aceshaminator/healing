import { BookOpen, HeartPulse, PhoneCall, Settings, Stethoscope } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type SectionId = 'emergency' | 'sick' | 'health' | 'learn' | 'settings';

export interface ModuleDef {
  /** File name inside src/components. */
  file: string;
  labelKey: string;
  status?: 'soon';
}

export interface SectionDef {
  id: SectionId;
  titleKey: string;
  descKey: string;
  Icon: LucideIcon;
  /** Border and icon colour classes. */
  accent: string;
  modules: ModuleDef[];
}

export const SECTIONS: SectionDef[] = [
  {
    id: 'emergency',
    titleKey: 'tile.emergency',
    descKey: 'tile.emergency.desc',
    Icon: PhoneCall,
    accent: 'border-red-400/60 text-red-300',
    modules: [{ file: 'EmergencyPlan.tsx', labelKey: 'mod.plan' }],
  },
  {
    id: 'sick',
    titleKey: 'tile.sick',
    descKey: 'tile.sick.desc',
    Icon: Stethoscope,
    accent: 'border-amber-400/50 text-amber-300',
    modules: [
      { file: 'SickFlow.tsx', labelKey: 'mod.sickflow' },
      { file: 'MaternalCare.tsx', labelKey: 'mod.pregnancy' },
    ],
  },
  {
    id: 'health',
    titleKey: 'tile.health',
    descKey: 'tile.health.desc',
    Icon: HeartPulse,
    accent: 'border-emerald-400/50 text-emerald-300',
    modules: [
      { file: 'SensorVitalsScreening.tsx', labelKey: 'mod.vitals' },
      { file: 'VitalCharts.tsx', labelKey: 'mod.charts' },
      { file: 'MedicationTracker.tsx', labelKey: 'mod.meds' },
      { file: 'AppointmentTracker.tsx', labelKey: 'mod.appointments' },
      { file: 'MentalWellness.tsx', labelKey: 'mod.mental' },
      { file: 'FamilyGeneRisk.tsx', labelKey: 'mod.family' },
      { file: 'ExportReport.tsx', labelKey: 'mod.summary' },
    ],
  },
  {
    id: 'learn',
    titleKey: 'tile.learn',
    descKey: 'tile.learn.desc',
    Icon: BookOpen,
    accent: 'border-cyan-400/50 text-cyan-300',
    modules: [
      { file: 'ArticlesFeed.tsx', labelKey: 'mod.info' },
      { file: 'OutbreakRadar.tsx', labelKey: 'mod.outbreak', status: 'soon' },
      { file: 'Telemedicine.tsx', labelKey: 'mod.doctor', status: 'soon' },
    ],
  },
  {
    id: 'settings',
    titleKey: 'tile.settings',
    descKey: 'tile.settings.desc',
    Icon: Settings,
    accent: 'border-slate-400/50 text-slate-200',
    modules: [
      { file: 'SettingsScreen.tsx', labelKey: 'mod.settings' },
      { file: 'OfflineManager.tsx', labelKey: 'mod.backup' },
    ],
  },
];