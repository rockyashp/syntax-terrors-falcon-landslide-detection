import { create } from 'zustand';
import { StoredSnapshot, AIAnalyzeResponse, RiskLevel } from '../types';
import { snapshotDB } from '../services/snapshotStore';

export interface SnapshotStoreState {
  snapshots: StoredSnapshot[];
  selectedSnapshot: StoredSnapshot | null;
  isLoading: boolean;
  filter: 'ALL' | 'DETECTED' | 'SAFE' | 'HIGH_RISK';
  searchQuery: string;

  // Actions
  loadSnapshots: () => Promise<void>;
  addSnapshot: (snapshot: StoredSnapshot) => Promise<void>;
  deleteSnapshot: (id: string) => Promise<void>;
  selectSnapshot: (snapshot: StoredSnapshot | null) => void;
  setFilter: (filter: 'ALL' | 'DETECTED' | 'SAFE' | 'HIGH_RISK') => void;
  setSearchQuery: (query: string) => void;
  clearAllSnapshots: () => Promise<void>;
}

export const useSnapshotStore = create<SnapshotStoreState>((set, get) => ({
  snapshots: [],
  selectedSnapshot: null,
  isLoading: false,
  filter: 'ALL',
  searchQuery: '',

  loadSnapshots: async () => {
    set({ isLoading: true });
    try {
      const all = await snapshotDB.getAllSnapshots();
      set({ snapshots: all, isLoading: false });
    } catch (err) {
      console.error('Failed to load snapshots from IndexedDB:', err);
      set({ isLoading: false });
    }
  },

  addSnapshot: async (snapshot: StoredSnapshot) => {
    try {
      await snapshotDB.saveSnapshot(snapshot);
      set((state) => ({
        snapshots: [snapshot, ...state.snapshots],
      }));
    } catch (err) {
      console.error('Failed to save snapshot to IndexedDB:', err);
      // Still keep in memory
      set((state) => ({
        snapshots: [snapshot, ...state.snapshots],
      }));
    }
  },

  deleteSnapshot: async (id: string) => {
    try {
      await snapshotDB.deleteSnapshot(id);
      set((state) => ({
        snapshots: state.snapshots.filter((s) => s.id !== id),
        selectedSnapshot: state.selectedSnapshot?.id === id ? null : state.selectedSnapshot,
      }));
    } catch (err) {
      console.error('Failed to delete snapshot:', err);
    }
  },

  selectSnapshot: (snapshot) => set({ selectedSnapshot: snapshot }),

  setFilter: (filter) => set({ filter }),

  setSearchQuery: (searchQuery) => set({ searchQuery }),

  clearAllSnapshots: async () => {
    try {
      await snapshotDB.clearAll();
      set({ snapshots: [], selectedSnapshot: null });
    } catch (err) {
      console.error('Failed to clear snapshot DB:', err);
    }
  },
}));
