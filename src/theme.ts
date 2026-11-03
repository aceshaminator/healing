export type ThemePref = 'dark' | 'light' | 'system';
export type MotionPref = 'system' | 'reduce' | 'full';

const THEME_KEY = 'healing_theme';
const MOTION_KEY = 'healing_motion';

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    window.dispatchEvent(new Event('healing:storage-error'));
  }
}

export function getThemePref(): ThemePref {
  const v = read(THEME_KEY);
  return v === 'light' || v === 'system' ? v : 'dark';
}

export function getMotionPref(): MotionPref {
  const v = read(MOTION_KEY);
  return v === 'reduce' || v === 'full' ? v : 'system';
}

export function applyPrefs() {
  const theme = getThemePref();
  const systemLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  const light = theme === 'light' || (theme === 'system' && systemLight);
  document.documentElement.dataset.theme = light ? 'light' : 'dark';

  const motion = getMotionPref();
  const systemReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reduce = motion === 'reduce' || (motion === 'system' && systemReduce);
  document.documentElement.dataset.reduceMotion = reduce ? 'true' : 'false';
}

export function setThemePref(p: ThemePref) {
  write(THEME_KEY, p);
  applyPrefs();
}

export function setMotionPref(p: MotionPref) {
  write(MOTION_KEY, p);
  applyPrefs();
}