export interface Language {
  code: string;
  native: string;
  english: string;
  dir: 'ltr' | 'rtl';
  /** Language tag for voice typing and spoken output. Support differs by phone and browser. */
  speech: string;
  /** True once a native speaker and a health professional have checked the translation. English is the source text. */
  reviewed: boolean;
}

export const DEFAULT_LANGUAGE = 'en';

// Before sharing Healing publicly, set this to false so only checked languages are offered.
export const SHOW_UNREVIEWED_LANGUAGES = true;

export const LANGUAGES: Language[] = [
  { code: 'en', native: 'English', english: 'English', dir: 'ltr', speech: 'en-US', reviewed: true },
  { code: 'fr', native: 'Français', english: 'French', dir: 'ltr', speech: 'fr-FR', reviewed: false },
  { code: 'ha', native: 'Hausa', english: 'Hausa', dir: 'ltr', speech: 'ha-NG', reviewed: false },
  { code: 'ig', native: 'Igbo', english: 'Igbo', dir: 'ltr', speech: 'ig-NG', reviewed: false },
  { code: 'yo', native: 'Yorùbá', english: 'Yoruba', dir: 'ltr', speech: 'yo-NG', reviewed: false },
  { code: 'es', native: 'Español', english: 'Spanish', dir: 'ltr', speech: 'es-419', reviewed: false },
  { code: 'pt', native: 'Português', english: 'Portuguese', dir: 'ltr', speech: 'pt-BR', reviewed: false },
  { code: 'sw', native: 'Kiswahili', english: 'Swahili', dir: 'ltr', speech: 'sw-KE', reviewed: false },
  { code: 'ar', native: 'العربية', english: 'Arabic', dir: 'rtl', speech: 'ar-SA', reviewed: false },
  { code: 'hi', native: 'हिन्दी', english: 'Hindi', dir: 'ltr', speech: 'hi-IN', reviewed: false },
  { code: 'ru', native: 'Русский', english: 'Russian', dir: 'ltr', speech: 'ru-RU', reviewed: false },
  { code: 'uk', native: 'Українська', english: 'Ukrainian', dir: 'ltr', speech: 'uk-UA', reviewed: false },
];

// The languages the pickers offer.
export const PICKABLE: Language[] = LANGUAGES.filter((l) => l.reviewed || SHOW_UNREVIEWED_LANGUAGES);

// Languages that are planned but not translated yet. They need native-speaker and clinical reviewers.
export const PLANNED_LANGUAGES: { region: string; names: string[] }[] = [
  {
    region: 'Africa',
    names: [
      'Nigerian Pidgin', 'Amharic', 'Oromo', 'Somali', 'Zulu', 'Xhosa', 'Afrikaans', 'Twi (Akan)', 'Fon',
      'Fula', 'Kinyarwanda', 'Lingala', 'Malagasy', 'Shona',
    ],
  },
  {
    region: 'Asia',
    names: [
      'Bengali', 'Urdu', 'Mandarin Chinese', 'Indonesian', 'Filipino', 'Vietnamese', 'Thai', 'Tamil',
      'Telugu', 'Marathi', 'Punjabi', 'Nepali', 'Burmese', 'Khmer', 'Pashto', 'Persian',
    ],
  },
  { region: 'South America', names: ['Quechua', 'Aymara', 'Guaraní', 'Mapudungun'] },
  {
    region: 'Eastern Europe',
    names: ['Polish', 'Romanian', 'Czech', 'Hungarian', 'Bulgarian', 'Serbian', 'Belarusian'],
  },
];