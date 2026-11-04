import { create } from 'zustand';

interface SyncState {
  isSyncing: boolean;
  pendingCount: number;
  lastSyncedAt: string | null; // ISO string
  setIsSyncing: (v: boolean) => void;
  setPendingCount: (v: number) => void;
  setLastSyncedAt: (v: string) => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  isSyncing: false,
  pendingCount: 0,
  lastSyncedAt: null,
  setIsSyncing: (v) => set({ isSyncing: v }),
  setPendingCount: (v) => set({ pendingCount: v }),
  setLastSyncedAt: (v) => set({ lastSyncedAt: v }),
}));
