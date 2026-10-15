export const OTHER = 'OTHER';

export interface Extra {
  labelKey: string;
  number: string;
}

export interface Country {
  code: string;
  name: string;
  /** The main number shown on the big call button. */
  number: string;
  /** Other numbers shown under it, such as police and fire. */
  extras?: Extra[];
  /** Where the number was checked. Every entry needs a local person to confirm it before launch. */
  source: string;
}

export const COUNTRIES: Country[] = [
  {
    code: 'BJ',
    name: 'Benin',
    number: '112',
    extras: [
      { labelKey: 'service.police', number: '117' },
      { labelKey: 'service.fire', number: '118' },
    ],
    source: 'ARCEP Benin short-number list: 112 SAMU-Benin (medical), 117 police, 118 fire. Confirm locally.',
  },
  { code: 'BG', name: 'Bulgaria', number: '112', source: 'EU single emergency number' },
  { code: 'HR', name: 'Croatia', number: '112', source: 'EU single emergency number' },
  { code: 'CZ', name: 'Czechia', number: '112', source: 'EU single emergency number' },
  { code: 'EE', name: 'Estonia', number: '112', source: 'EU single emergency number' },
  { code: 'HU', name: 'Hungary', number: '112', source: 'EU single emergency number' },
  { code: 'IN', name: 'India', number: '112', source: 'Not yet checked with a source' },
  { code: 'LV', name: 'Latvia', number: '112', source: 'EU single emergency number' },
  { code: 'LT', name: 'Lithuania', number: '112', source: 'EU single emergency number' },
  { code: 'NG', name: 'Nigeria', number: '112', source: 'National emergency number. Confirm it works in the local state.' },
  { code: 'PL', name: 'Poland', number: '112', source: 'EU single emergency number' },
  { code: 'RO', name: 'Romania', number: '112', source: 'EU single emergency number' },
  { code: 'RU', name: 'Russia', number: '112', source: 'Not yet checked with a source' },
  { code: 'SK', name: 'Slovakia', number: '112', source: 'EU single emergency number' },
  { code: 'SI', name: 'Slovenia', number: '112', source: 'EU single emergency number' },
  { code: 'UA', name: 'Ukraine', number: '112', source: 'Not yet checked with a source' },
];

const COUNTRY_KEY = 'healing_country';
// Every screen reads this storage name for the emergency number.
const NUMBER_KEY = 'healing_emergency_number';

export function getCountryCode(): string {
  try {
    return localStorage.getItem(COUNTRY_KEY) || '';
  } catch {
    return '';
  }
}

export function isNigeria(): boolean {
  return getCountryCode() === 'NG';
}

export function numberIsSet(): boolean {
  try {
    return !!localStorage.getItem(NUMBER_KEY);
  } catch {
    return false;
  }
}

export function getEmergencyNumber(): string {
  try {
    return localStorage.getItem(NUMBER_KEY) || '112';
  } catch {
    return '112';
  }
}

export function getExtraNumbers(): Extra[] {
  const country = COUNTRIES.find((c) => c.code === getCountryCode());
  return country?.extras ?? [];
}

export function validNumber(value: string): boolean {
  return /^\d{2,6}$/.test(value.trim());
}

export function saveRegion(code: string, number: string): boolean {
  try {
    localStorage.setItem(COUNTRY_KEY, code);
    localStorage.setItem(NUMBER_KEY, number.trim());
    return true;
  } catch {
    return false;
  }
}