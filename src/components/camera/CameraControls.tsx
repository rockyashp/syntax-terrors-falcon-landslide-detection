import React from 'react';
import {
  Camera,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sliders,
  Flame,
  Moon,
  RefreshCw,
} from 'lucide-react';
import { useCameraStore } from '../../stores/useCameraStore';

interface Props {
  onCapture: () => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
  isAutoAnalysisEnabled: boolean;
  onToggleAutoAnalysis: () => void;
}

export const CameraControls: React.FC<Props> = ({
  onCapture,
  onToggleFullscreen,
  isFullscreen,
  isAutoAnalysisEnabled,
  onToggleAutoAnalysis,
}) => {
  const {
    zoom,
    setZoom,
    resetZoomPan,
    filterMode,
    setFilterMode,
    setInputModalOpen,
    isCapturing,
    isAnalyzing,
  } = useCameraStore();

  const handleZoomIn = () => setZoom(zoom + 0.25);
  const handleZoomOut = () => setZoom(zoom - 0.25);

  return (
    <div className="flex flex-wrap items-center justify-between gap-2.5 select-none">
      {/* Left: Snapshot Trigger & Source */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onCapture}
          disabled={isCapturing || isAnalyzing}
          className="px-4 py-2 rounded-lg text-xs font-bold glass-button-primary flex items-center space-x-2 disabled:opacity-50"
        >
          <Camera className="w-4 h-4" />
          <span>{isAnalyzing ? 'Analyzing Frame...' : 'Capture Snapshot'}</span>
        </button>

        <button
          onClick={() => setInputModalOpen(true)}
          className="px-3 py-2 rounded-lg text-xs font-semibold glass-button text-text-secondary hover:text-text-primary flex items-center space-x-1.5"
          title="Camera Source & Input Settings"
        >
          <Sliders className="w-3.5 h-3.5 text-accent" />
          <span className="hidden sm:inline">Source</span>
        </button>

        <button
          onClick={onToggleAutoAnalysis}
          className={`px-3 py-2 rounded-lg text-xs font-semibold glass-button flex items-center space-x-1.5 ${
            isAutoAnalysisEnabled ? 'text-[#E85D22] border-[#E85D22]/30' : 'text-text-muted'
          }`}
          title="Automatically capture and analyze a frame every 35 seconds"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isAutoAnalysisEnabled ? 'animate-spin-slow' : ''}`} />
          <span className="hidden md:inline">AUTO 35s</span>
        </button>
      </div>

      {/* Middle: Filter Modes */}
      <div className="flex items-center space-x-1 p-0.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
        <button
          onClick={() => setFilterMode('STANDARD')}
          className={`px-2.5 py-1 rounded text-[11px] font-mono font-medium transition-all ${
            filterMode === 'STANDARD'
              ? 'bg-accent/20 text-[#FF8A3D] font-bold'
              : 'text-text-muted hover:text-text-secondary'
          }`}
        >
          RGB
        </button>
        <button
          onClick={() => setFilterMode('IR_NIGHT')}
          className={`px-2.5 py-1 rounded text-[11px] font-mono font-medium transition-all flex items-center space-x-1 ${
            filterMode === 'IR_NIGHT'
              ? 'bg-status-safe/20 text-status-safe font-bold'
              : 'text-text-muted hover:text-text-secondary'
          }`}
        >
          <Moon className="w-3 h-3" />
          <span>IR</span>
        </button>
        <button
          onClick={() => setFilterMode('THERMAL_FALSE_COLOR')}
          className={`px-2.5 py-1 rounded text-[11px] font-mono font-medium transition-all flex items-center space-x-1 ${
            filterMode === 'THERMAL_FALSE_COLOR'
              ? 'bg-[#FF8A3D]/20 text-[#FF8A3D] font-bold'
              : 'text-text-muted hover:text-text-secondary'
          }`}
        >
          <Flame className="w-3 h-3" />
          <span>THERMAL</span>
        </button>
      </div>

      {/* Right: Zoom & Fullscreen Controls */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1 px-1.5 py-0.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
          <button
            onClick={handleZoomOut}
            disabled={zoom <= 0.5}
            className="p-1 rounded text-text-muted hover:text-text-primary disabled:opacity-30"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={resetZoomPan}
            className="px-1 text-[11px] font-mono text-text-secondary hover:text-text-primary"
            title="Reset Zoom"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            onClick={handleZoomIn}
            disabled={zoom >= 3.0}
            className="p-1 rounded text-text-muted hover:text-text-primary disabled:opacity-30"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          onClick={onToggleFullscreen}
          className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5 border border-white/[0.06] transition-colors"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
