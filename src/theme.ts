export type ThemePref = 'dark' | 'light' | 'system';
export type MotionPref = 'system' | 'reduce' | 'full';

const THEME_KEY = 'healing_theme';
const MOTION_KEY = 'healing_motion';

// Every screen now uses the theme colors, so the theme choice is on.
// Set this back to false to lock the whole app to dark again.
export const LIGHT_READY: boolean = true;

// The colour of the phone's address bar, to match the page.
const BAR_COLORS = { dark: '#070D1F', light: '#f8fafc' };

// Keeps the choice for this visit even if the browser refuses to save it.
let sessionTheme: ThemePref | null = null;
let sessionMotion: MotionPref | null = null;

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

// A display preference that does not save is harmless, so it stays silent.
// Failures to save health records are announced by the screens that save them.
function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

export function getThemePref(): ThemePref {
  if (sessionTheme) return sessionTheme;
  const v = read(THEME_KEY);
  return v === 'light' || v === 'system' ? v : 'dark';
}

export function getMotionPref(): MotionPref {
  if (sessionMotion) return sessionMotion;
  const v = read(MOTION_KEY);
  return v === 'reduce' || v === 'full' ? v : 'system';
}

export function applyPrefs() {
  const theme = LIGHT_READY ? getThemePref() : 'dark';
  const systemLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  const light = theme === 'light' || (theme === 'system' && systemLight);
  document.documentElement.dataset.theme = light ? 'light' : 'dark';
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', light ? BAR_COLORS.light : BAR_COLORS.dark);

  const motion = getMotionPref();
  const systemReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reduce = motion === 'reduce' || (motion === 'system' && systemReduce);
  document.documentElement.dataset.reduceMotion = reduce ? 'true' : 'false';
}

export function setThemePref(p: ThemePref) {
  sessionTheme = p;
  write(THEME_KEY, p);
  applyPrefs();
}

export function setMotionPref(p: MotionPref) {
  sessionMotion = p;
  write(MOTION_KEY, p);
  applyPrefs();
}