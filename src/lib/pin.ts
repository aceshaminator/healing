const PIN_KEY = 'healing_pin';
const ITERATIONS = 100000;

function toB64(bytes: Uint8Array): string {
  let s = '';
  bytes.forEach((b) => (s += String.fromCharCode(b)));
  return btoa(s);
}

function fromB64(text: string): Uint8Array {
  return Uint8Array.from(atob(text), (c) => c.charCodeAt(0));
}

async function derive(pin: string, salt: Uint8Array): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(pin) as BufferSource,
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations: ITERATIONS, hash: 'SHA-256' },
    key,
    256,
  );
  return toB64(new Uint8Array(bits));
}

// A PIN can only be set on a secure (https or localhost) page, where the browser's encryption tools are available.
export function canUsePin(): boolean {
  return window.isSecureContext && typeof crypto !== 'undefined' && !!crypto.subtle;
}

export function pinIsSet(): boolean {
  try {
    return localStorage.getItem(PIN_KEY) !== null;
  } catch {
    return false;
  }
}

export async function setPin(pin: string): Promise<boolean> {
  try {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const hash = await derive(pin, salt);
    localStorage.setItem(PIN_KEY, JSON.stringify({ v: 1, salt: toB64(salt), hash }));
    return true;
  } catch {
    return false;
  }
}

export async function checkPin(pin: string): Promise<boolean> {
  try {
    const saved = JSON.parse(localStorage.getItem(PIN_KEY) || 'null');
    if (!saved?.salt || !saved?.hash) return false;
    return (await derive(pin, fromB64(saved.salt))) === saved.hash;
  } catch {
    return false;
  }
}

export function removePin(): void {
  try {
    localStorage.removeItem(PIN_KEY);
  } catch {
    /* ignore */
  }
}

// Removes every record Healing has saved on this phone, including the PIN and the first-run setup.
export function eraseEverything(): void {
  try {
    Object.keys(localStorage)
      .filter((k) => /^(healing|visionace)/i.test(k))
      .forEach((k) => localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
}