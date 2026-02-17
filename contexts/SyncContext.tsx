import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { useAuth } from './AuthContext';
import {
  syncExpenses,
  forcePullFromRemote,
  setupAutoSync,
  getSyncStats,
  isOnline,
  SyncResult,
  SyncStatus,
} from '@/lib/sync-service';
import { AppState, AppStateStatus } from 'react-native';

interface SyncContextType {
  syncStatus: SyncStatus;
  lastSyncTime: Date | null;
  lastSyncResult: SyncResult | null;
  unsyncedCount: number;
  isOnline: boolean;
  sync: () => Promise<void>;
  forcePull: () => Promise<void>;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export function SyncProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);
  const [unsyncedCount, setUnsyncedCount] = useState(0);
  const [online, setOnline] = useState(false);

  // Check online status
  useEffect(() => {
    const checkOnlineStatus = async () => {
      const status = await isOnline();
      setOnline(status);
    };

    checkOnlineStatus();
    const interval = setInterval(checkOnlineStatus, 30000); // Check every 30s

    return () => clearInterval(interval);
  }, []);

  // Update unsynced count
  const updateUnsyncedCount = useCallback(() => {
    if (user?.id) {
      const stats = getSyncStats(user.id);
      setUnsyncedCount(stats.unsyncedCount);
    }
  }, [user?.id]);

  // Sync function
  const sync = useCallback(async () => {
    if (!user?.id) return;

    setSyncStatus('syncing');
    try {
      const result = await syncExpenses(user.id);
      setLastSyncResult(result);
      setLastSyncTime(new Date());
      setSyncStatus(result.success ? 'success' : 'error');
      
      // Update unsynced count after sync
      updateUnsyncedCount();

      // Reset status after 3 seconds
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (error) {
      console.error('Sync error:', error);
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  }, [user?.id, updateUnsyncedCount]);

  // Force pull function
  const forcePull = useCallback(async () => {
    if (!user?.id) return;

    setSyncStatus('syncing');
    try {
      const result = await forcePullFromRemote(user.id);
      setLastSyncResult(result);
      setLastSyncTime(new Date());
      setSyncStatus(result.success ? 'success' : 'error');
      
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (error) {
      console.error('Force pull error:', error);
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  }, [user?.id]);

  // Setup auto-sync on network changes
  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = setupAutoSync(user.id, (result) => {
      setLastSyncResult(result);
      setLastSyncTime(new Date());
      updateUnsyncedCount();
    });

    return unsubscribe;
  }, [user?.id, updateUnsyncedCount]);

  // Sync when app comes to foreground
  useEffect(() => {
    if (!user?.id) return;

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // App came to foreground, trigger sync if online
        isOnline().then((status) => {
          if (status) {
            sync();
          }
        });
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [user?.id, sync]);

  // Initial sync when user logs in
  useEffect(() => {
    if (user?.id) {
      // Small delay to let the UI render first
      setTimeout(() => {
        sync();
      }, 1000);
    }
  }, [user?.id]);

  // Update unsynced count periodically
  useEffect(() => {
    if (!user?.id) return;

    updateUnsyncedCount();
    const interval = setInterval(updateUnsyncedCount, 5000); // Check every 5s

    return () => clearInterval(interval);
  }, [user?.id, updateUnsyncedCount]);

  const value: SyncContextType = {
    syncStatus,
    lastSyncTime,
    lastSyncResult,
    unsyncedCount,
    isOnline: online,
    sync,
    forcePull,
  };

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}

export function useSync() {
  const context = useContext(SyncContext);
  if (context === undefined) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
}
