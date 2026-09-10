import { create } from 'zustand';
import { AlertEvent } from '../types';
import { api } from '../services/api';

export interface AlertsStoreState {
  alerts: AlertEvent[];
  unreadCount: number;
  filter: 'ALL' | 'CRITICAL' | 'HIGH' | 'WARNING' | 'INFO';
  isAudioEnabled: boolean;
  isLoading: boolean;

  // Actions
  fetchAlerts: () => Promise<void>;
  addAlert: (alert: AlertEvent) => void;
  acknowledgeAlert: (id: string) => void;
  acknowledgeAll: () => void;
  setFilter: (filter: 'ALL' | 'CRITICAL' | 'HIGH' | 'WARNING' | 'INFO') => void;
  toggleAudio: () => void;
  clearAlerts: () => void;
}

const LOCAL_ACK_KEY = 'falcon_acknowledged_alerts';

function getAcknowledgedSet(): Set<string> {
  try {
    const raw = localStorage.getItem(LOCAL_ACK_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveAcknowledgedSet(set: Set<string>): void {
  try {
    localStorage.setItem(LOCAL_ACK_KEY, JSON.stringify(Array.from(set)));
  } catch {
    // Ignore storage quota
  }
}

export const useAlertsStore = create<AlertsStoreState>((set, get) => ({
  alerts: [],
  unreadCount: 0,
  filter: 'ALL',
  isAudioEnabled: false,
  isLoading: false,

  fetchAlerts: async () => {
    set({ isLoading: true });
    try {
      const serverAlerts = await api.getEvents();
      const ackSet = getAcknowledgedSet();
      const merged = (serverAlerts || []).map((a) => ({
        ...a,
        acknowledged: a.acknowledged || ackSet.has(a.id),
      }));

      const unread = merged.filter((a) => !a.acknowledged).length;
      set({ alerts: merged, unreadCount: unread, isLoading: false });
    } catch (err) {
      console.warn('Could not fetch server alerts:', err);
      set({ isLoading: false });
    }
  },

  addAlert: (alert) => {
    const ackSet = getAcknowledgedSet();
    const formatted: AlertEvent = {
      ...alert,
      acknowledged: alert.acknowledged || ackSet.has(alert.id),
    };

    set((state) => {
      // Prevent duplicates
      if (state.alerts.some((a) => a.id === formatted.id)) return state;
      const newAlerts = [formatted, ...state.alerts].slice(0, 100);
      const unread = newAlerts.filter((a) => !a.acknowledged).length;
      return { alerts: newAlerts, unreadCount: unread };
    });
  },

  acknowledgeAlert: (id) => {
    const ackSet = getAcknowledgedSet();
    ackSet.add(id);
    saveAcknowledgedSet(ackSet);

    set((state) => {
      const updated = state.alerts.map((a) => (a.id === id ? { ...a, acknowledged: true } : a));
      return {
        alerts: updated,
        unreadCount: updated.filter((a) => !a.acknowledged).length,
      };
    });
  },

  acknowledgeAll: () => {
    const ackSet = getAcknowledgedSet();
    get().alerts.forEach((a) => ackSet.add(a.id));
    saveAcknowledgedSet(ackSet);

    set((state) => ({
      alerts: state.alerts.map((a) => ({ ...a, acknowledged: true })),
      unreadCount: 0,
    }));
  },

  setFilter: (filter) => set({ filter }),

  toggleAudio: () => set((state) => ({ isAudioEnabled: !state.isAudioEnabled })),

  clearAlerts: () => set({ alerts: [], unreadCount: 0 }),
}));
