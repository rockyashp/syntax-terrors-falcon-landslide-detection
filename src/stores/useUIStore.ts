import { create } from 'zustand';
import { NavigationPage } from '../types';

export interface UIStoreState {
  currentPage: NavigationPage;
  isSidebarCollapsed: boolean;
  isMobileMenuOpen: boolean;
  isCommandPaletteOpen: boolean;
  isWeatherModalOpen: boolean;
  isSettingsModalOpen: boolean;
  isDemoModeModalOpen: boolean;
  activeToast: {
    id: string;
    title: string;
    message: string;
    type: 'success' | 'warning' | 'error' | 'info';
  } | null;

  // Actions
  setCurrentPage: (page: NavigationPage) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleMobileMenu: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setWeatherModalOpen: (open: boolean) => void;
  setSettingsModalOpen: (open: boolean) => void;
  setDemoModeModalOpen: (open: boolean) => void;
  showToast: (title: string, message: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
  hideToast: () => void;
}

export const useUIStore = create<UIStoreState>((set) => ({
  currentPage: 'landing',
  isSidebarCollapsed: false,
  isMobileMenuOpen: false,
  isCommandPaletteOpen: false,
  isWeatherModalOpen: false,
  isSettingsModalOpen: false,
  isDemoModeModalOpen: false,
  activeToast: null,

  setCurrentPage: (page) => set({ currentPage: page, isMobileMenuOpen: false }),
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
  setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),
  setWeatherModalOpen: (open) => set({ isWeatherModalOpen: open }),
  setSettingsModalOpen: (open) => set({ isSettingsModalOpen: open }),
  setDemoModeModalOpen: (open) => set({ isDemoModeModalOpen: open }),
  showToast: (title, message, type = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    set({ activeToast: { id, title, message, type } });
    setTimeout(() => {
      set((state) => (state.activeToast?.id === id ? { activeToast: null } : state));
    }, 4000);
  },
  hideToast: () => set({ activeToast: null }),
}));
