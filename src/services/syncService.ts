// src/services/syncService.ts
import { StorageService } from './storageService';

export interface SyncResult {
  success: boolean;
  syncedCount: number;
  error?: string;
}

// Cloud backup is NOT built yet, so this must stay false.
// Turn it on only after a real server exists and dispatchQueue really uploads
// the check-ins and waits for the server's answer before marking anything as synced.
export const CLOUD_BACKUP_AVAILABLE: boolean = false;

export class SyncService {
  /**
   * Would send pending check-ins to a server. Today it sends nothing and changes nothing.
   */
  static async dispatchQueue(): Promise<SyncResult> {
    if (!CLOUD_BACKUP_AVAILABLE) {
      return {
        success: false,
        syncedCount: 0,
        error: 'Cloud backup is not available yet. Your check-ins are saved on this phone only.',
      };
    }

    if (!navigator.onLine) {
      return { success: false, syncedCount: 0, error: 'Device is currently offline.' };
    }

    const pendingItems = StorageService.getCheckIns().filter((item) => !item.synced);
    if (pendingItems.length === 0) {
      return { success: true, syncedCount: 0 };
    }

    // TODO: send pendingItems to your backend here. Mark an item as synced ONLY
    // after the server confirms it received that item.
    return { success: false, syncedCount: 0, error: 'Upload is not implemented yet.' };
  }
}