// src/hooks/useOfflineSync.ts
import { useState, useEffect, useCallback } from 'react';
import { StorageService } from '../services/storageService';
import { SyncService } from '../services/syncService';

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const refreshPendingCount = useCallback(() => {
    const checkIns = StorageService.getCheckIns();
    const count = checkIns.filter((item) => !item.synced).length;
    setPendingCount(count);
  }, []);

  useEffect(() => {
    refreshPendingCount();

    const handleOnline = () => {
      setIsOnline(true);
      setStatusMessage('Connection restored. Ready to sync.');
    };

    const handleOffline = () => {
      setIsOnline(false);
      setStatusMessage('Offline mode active. Records securely cached.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [refreshPendingCount]);

  const triggerSync = async () => {
    if (!isOnline) {
      setStatusMessage('Cannot sync while offline.');
      return;
    }

    setIsSyncing(true);
    setStatusMessage('Synchronizing pending records...');

    const result = await SyncService.dispatchQueue();

    setIsSyncing(false);
    if (result.success) {
      refreshPendingCount();
      setStatusMessage(
        result.syncedCount > 0 ? 'Synced Successfully ✓' : 'All records are fully synchronized.'
      );
    } else {
      setStatusMessage(result.error || 'Sync transmission failed.');
    }
  };

  return {
    isOnline,
    pendingCount,
    isSyncing,
    statusMessage,
    triggerSync,
    refreshPendingCount,
  };
}