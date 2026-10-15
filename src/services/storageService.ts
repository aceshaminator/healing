// src/services/storageService.ts

export interface HealthCheckIn {
  id: string;
  timestamp: string;
  symptoms: string[];
  severity?: string;
  reflections?: string;
  /** Nothing in this app uploads check-ins yet, so this is always false. */
  synced: boolean;
}

export const STORAGE_KEYS = {
  CHECK_INS: 'healing_sanctuary_check_ins_v1',
  DIAGNOSTIC_LOGS: 'healing_sanctuary_diagnostics_v1',
  SYNC_QUEUE: 'healing_sanctuary_sync_queue_v1',
} as const;

// Keeps the stored list from growing until the browser refuses to save.
const MAX_CHECK_INS = 500;

export class StorageService {
  /**
   * Saves data in the browser. Returns false if the browser refuses
   * (for example, storage is full). Callers must check the result.
   */
  static save<T>(key: string, data: T): boolean {
    try {
      const serialized = JSON.stringify({
        version: 1,
        updatedAt: new Date().toISOString(),
        payload: data,
      });
      localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.error('Critical: LocalStorage quota exceeded.');
      } else {
        console.error('Storage persistence failure:', error);
      }
      return false;
    }
  }

  /**
   * Loads data. Returns the fallback if it is missing or damaged.
   */
  static load<T>(key: string, fallback: T): T {
    try {
      const item = localStorage.getItem(key);
      if (!item) return fallback;

      const parsed = JSON.parse(item);

      if (!parsed || typeof parsed !== 'object' || !('payload' in parsed)) {
        console.warn(`Data corruption detected for key "${key}". Falling back to safe state.`);
        return fallback;
      }

      return parsed.payload as T;
    } catch (error) {
      console.error(`Failed to parse storage key "${key}":`, error);
      return fallback;
    }
  }

  static getCheckIns(): HealthCheckIn[] {
    const list = this.load<unknown>(STORAGE_KEYS.CHECK_INS, []);
    return Array.isArray(list) ? (list as HealthCheckIn[]) : [];
  }

  /**
   * Saves the check-in list and tells the rest of the app what happened:
   * 'healing:checkins-saved' on success, 'healing:storage-error' if the browser refused.
   */
  static saveCheckIns(checkIns: HealthCheckIn[]): boolean {
    const ok = this.save(STORAGE_KEYS.CHECK_INS, checkIns.slice(0, MAX_CHECK_INS));
    window.dispatchEvent(
      new CustomEvent(ok ? 'healing:checkins-saved' : 'healing:storage-error', { detail: { key: 'check-ins' } }),
    );
    return ok;
  }

  /** Adds one check-in at the top of the list. Returns false if it could not be saved. */
  static addCheckIn(entry: HealthCheckIn): boolean {
    return this.saveCheckIns([entry, ...this.getCheckIns()]);
  }
}