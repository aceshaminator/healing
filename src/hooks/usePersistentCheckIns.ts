// src/hooks/usePersistentCheckIns.ts
import { useCallback, useEffect, useState } from 'react';
import { StorageService } from '../services/storageService';
import type { HealthCheckIn } from '../services/storageService';

// Older versions of the home page kept check-ins under this name, in a different shape.
const OLD_KEY = 'healing_checkins';

function readOldEntries(): HealthCheckIn[] {
  try {
    const raw = localStorage.getItem(OLD_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const out: HealthCheckIn[] = [];
    for (const o of parsed) {
      if (!o || typeof o.symptoms !== 'string' || typeof o.date !== 'string') continue;
      out.push({
        id: `old_${o.id ?? o.date}`,
        timestamp: o.date,
        symptoms: o.symptoms.split(',').map((s: string) => s.trim()).filter(Boolean),
        reflections: typeof o.notes === 'string' ? o.notes : '',
        synced: false,
      });
    }
    return out;
  } catch {
    return [];
  }
}

function mergeOld(stored: HealthCheckIn[]): { list: HealthCheckIn[]; hadOld: boolean } {
  const old = readOldEntries();
  if (old.length === 0) return { list: stored, hadOld: false };
  const have = new Set(stored.map((e) => e.id));
  const merged = [...stored, ...old.filter((o) => !have.has(o.id))].sort((a, b) =>
    String(b.timestamp).localeCompare(String(a.timestamp)),
  );
  return { list: merged, hadOld: true };
}

export function usePersistentCheckIns() {
  const [checkIns, setCheckIns] = useState<HealthCheckIn[]>(() => mergeOld(StorageService.getCheckIns()).list);

  // Keep the list up to date when anything else saves a check-in (for example Voice Notes).
  useEffect(() => {
    const refresh = () => setCheckIns(StorageService.getCheckIns());
    window.addEventListener('healing:checkins-saved', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('healing:checkins-saved', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  // One-time move of old home-page entries: save them in the shared list first,
  // and remove the old copy only if that save worked.
  useEffect(() => {
    const { list, hadOld } = mergeOld(StorageService.getCheckIns());
    if (!hadOld) return;
    if (StorageService.saveCheckIns(list)) {
      try {
        localStorage.removeItem(OLD_KEY);
      } catch {
        /* ignore */
      }
    }
  }, []);

  const addCheckIn = useCallback((symptoms: string[], reflections: string, severity: string) => {
    const newEntry: HealthCheckIn = {
      id: `chk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      symptoms,
      reflections,
      severity,
      synced: false,
    };

    // Always start from what is really stored, so entries saved elsewhere are never lost.
    const saved = StorageService.saveCheckIns([newEntry, ...StorageService.getCheckIns()]);
    if (!saved) {
      // The browser refused to save. Show the entry for now. A warning has already been announced.
      setCheckIns((prev) => [newEntry, ...prev]);
    }
    return newEntry;
  }, []);

  const clearHistory = useCallback(() => {
    try {
      localStorage.removeItem(OLD_KEY);
    } catch {
      /* ignore */
    }
    if (!StorageService.saveCheckIns([])) setCheckIns([]);
  }, []);

  return {
    checkIns,
    addCheckIn,
    clearHistory,
  };
}