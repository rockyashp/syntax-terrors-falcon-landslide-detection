import { create } from 'zustand';
import { CameraSourceType, CameraSettings } from '../types';

export interface CameraStoreState {
  sourceType: CameraSourceType;
  deviceId: string | null;
  availableDevices: MediaDeviceInfo[];
  isLive: boolean;
  hasPermission: boolean | null;
  permissionError: string | null;
  zoom: number;
  pan: { x: number; y: number };
  filterMode: 'STANDARD' | 'IR_NIGHT' | 'THERMAL_FALSE_COLOR' | 'EDGE_ENHANCED';
  isFlashActive: boolean;
  uploadedImageUrl: string | null;
  uploadedVideoUrl: string | null;
  isInputModalOpen: boolean;
  isCapturing: boolean;
  isAnalyzing: boolean;
  analysisProgressStep: 'IDLE' | 'CAPTURED' | 'UPLOADING' | 'ANALYZING' | 'DONE' | 'ERROR';
  analysisErrorMessage: string | null;

  // Actions
  setSourceType: (type: CameraSourceType) => void;
  setDeviceId: (id: string | null) => void;
  setAvailableDevices: (devices: MediaDeviceInfo[]) => void;
  setIsLive: (live: boolean) => void;
  setHasPermission: (has: boolean | null, error?: string | null) => void;
  setZoom: (zoom: number) => void;
  setPan: (pan: { x: number; y: number }) => void;
  resetZoomPan: () => void;
  setFilterMode: (mode: 'STANDARD' | 'IR_NIGHT' | 'THERMAL_FALSE_COLOR' | 'EDGE_ENHANCED') => void;
  triggerFlash: () => void;
  setUploadedImage: (url: string | null) => void;
  setUploadedVideo: (url: string | null) => void;
  setInputModalOpen: (open: boolean) => void;
  setIsCapturing: (capturing: boolean) => void;
  setAnalysisState: (
    step: 'IDLE' | 'CAPTURED' | 'UPLOADING' | 'ANALYZING' | 'DONE' | 'ERROR',
    error?: string | null
  ) => void;
}

export const useCameraStore = create<CameraStoreState>((set) => ({
  sourceType: 'SYNTHETIC_DEMO',
  deviceId: null,
  availableDevices: [],
  isLive: true,
  hasPermission: null,
  permissionError: null,
  zoom: 1.0,
  pan: { x: 0, y: 0 },
  filterMode: 'STANDARD',
  isFlashActive: false,
  uploadedImageUrl: null,
  uploadedVideoUrl: null,
  isInputModalOpen: false,
  isCapturing: false,
  isAnalyzing: false,
  analysisProgressStep: 'IDLE',
  analysisErrorMessage: null,

  setSourceType: (type) => set({ sourceType: type }),
  setDeviceId: (id) => set({ deviceId: id }),
  setAvailableDevices: (devices) => set({ availableDevices: devices }),
  setIsLive: (live) => set({ isLive: live }),
  setHasPermission: (has, error = null) => set({ hasPermission: has, permissionError: error }),
  setZoom: (zoom) => set({ zoom: Math.max(0.5, Math.min(3.0, zoom)) }),
  setPan: (pan) => set({ pan }),
  resetZoomPan: () => set({ zoom: 1.0, pan: { x: 0, y: 0 } }),
  setFilterMode: (mode) => set({ filterMode: mode }),
  triggerFlash: () => {
    set({ isFlashActive: true });
    setTimeout(() => {
      set({ isFlashActive: false });
    }, 450);
  },
  setUploadedImage: (url) => set({ uploadedImageUrl: url, sourceType: url ? 'UPLOAD_IMAGE' : 'SYNTHETIC_DEMO' }),
  setUploadedVideo: (url) => set({ uploadedVideoUrl: url, sourceType: url ? 'UPLOAD_VIDEO' : 'SYNTHETIC_DEMO' }),
  setInputModalOpen: (open) => set({ isInputModalOpen: open }),
  setIsCapturing: (capturing) => set({ isCapturing: capturing }),
  setAnalysisState: (step, error = null) =>
    set({
      analysisProgressStep: step,
      isAnalyzing: step === 'UPLOADING' || step === 'ANALYZING',
      analysisErrorMessage: error,
    }),
}));
