import { useEffect, useState } from 'react';

function readStored<T>(key: string, initialValue: T): T {
  try {
    const item = window.localStorage.getItem(key);
    if (!item) return initialValue;
    const parsed = JSON.parse(item);
    if (parsed === null || parsed === undefined) return initialValue;
    // If the screen expects a list, never hand it anything else.
    if (Array.isArray(initialValue) && !Array.isArray(parsed)) return initialValue;
    return parsed as T;
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return initialValue;
  }
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => readStored(key, initialValue));
  const [saveFailed, setSaveFailed] = useState(false);

  // Save whenever the value changes. If the browser refuses (storage full or blocked),
  // remember it and announce it so the menu can warn the person.
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
      setSaveFailed(false);
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
      setSaveFailed(true);
      window.dispatchEvent(new CustomEvent('healing:storage-error', { detail: { key } }));
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue, saveFailed] as const;
}