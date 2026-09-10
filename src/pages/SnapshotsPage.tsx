import React, { useEffect, useState } from 'react';
import {
  Image as ImageIcon,
  Search,
  Trash2,
  Download,
  AlertTriangle,
  CheckCircle2,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useSnapshotStore } from '../stores/useSnapshotStore';
import { useUIStore } from '../stores/useUIStore';
import { StoredSnapshot } from '../types';

export const SnapshotsPage: React.FC = () => {
  const {
    snapshots,
    loadSnapshots,
    deleteSnapshot,
    clearAllSnapshots,
    selectedSnapshot,
    selectSnapshot,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
  } = useSnapshotStore();
  const { showToast } = useUIStore();

  const [modalZoom, setModalZoom] = useState(1.0);
  const [showOverlay] = useState(true);

  useEffect(() => {
    loadSnapshots();
  }, []);

  const filteredSnapshots = snapshots.filter((s) => {
    if (filter === 'DETECTED' && !s.analysis?.detected) return false;
    if (filter === 'SAFE' && s.analysis?.detected) return false;
    if (filter === 'HIGH_RISK' && (s.riskScore || 0) < 50) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesId = s.id.toLowerCase().includes(q);
      const matchesDrone = s.droneId.toLowerCase().includes(q);
      const matchesDate = s.timestamp.toLowerCase().includes(q);
      if (!matchesId && !matchesDrone && !matchesDate) return false;
    }
    return true;
  });

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteSnapshot(id);
    showToast('Snapshot Removed', 'Frame deleted from local store', 'info');
  };

  const handleDownload = (snapshot: StoredSnapshot, e: React.MouseEvent) => {
    e.stopPropagation();
    const a = document.createElement('a');
    a.href = snapshot.imageDataUrl;
    a.download = `FALCON-snapshot-${snapshot.id}.jpg`;
    a.click();
    showToast('Image Downloaded', 'Frame saved to your device', 'success');
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200 select-none">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl glass-card">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-[#E85D22]/10 text-[#E85D22]">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-text-primary uppercase tracking-wider font-display">
              Drone Snapshot Archive
            </h1>
            <p className="text-xs font-mono text-text-muted">
              Editorial Frame Gallery &amp; Landslide Detections ({snapshots.length} total)
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1 p-1 rounded-lg bg-black/[0.03] border border-black/[0.06] text-xs font-mono">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1 rounded-md transition-all ${
              filter === 'ALL' ? 'bg-white text-[#E85D22] font-bold shadow-sm' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            All Frames
          </button>
          <button
            onClick={() => setFilter('DETECTED')}
            className={`px-3 py-1 rounded-md transition-all ${
              filter === 'DETECTED' ? 'bg-white text-status-danger font-bold shadow-sm' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Detected Slip Faces
          </button>
          <button
            onClick={() => setFilter('HIGH_RISK')}
            className={`px-3 py-1 rounded-md transition-all ${
              filter === 'HIGH_RISK' ? 'bg-white text-[#E85D22] font-bold shadow-sm' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            High Risk (≥50%)
          </button>
        </div>
      </div>

      {/* Search and Clear Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, drone, timestamp..."
            className="w-full py-1.5 pl-9 pr-3 rounded-lg glass-input text-xs font-mono text-text-primary placeholder:text-text-muted"
          />
        </div>

        {snapshots.length > 0 && (
          <button
            onClick={() => clearAllSnapshots()}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold glass-button text-status-danger hover:bg-status-danger/10 border border-status-danger/20 transition-all flex items-center space-x-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Archive</span>
          </button>
        )}
      </div>

      {/* Snapshots Grid */}
      {filteredSnapshots.length === 0 ? (
        <div className="p-16 text-center rounded-2xl glass-card space-y-3">
          <ImageIcon className="w-12 h-12 mx-auto text-text-muted opacity-40" />
          <div className="text-sm font-bold text-text-primary uppercase tracking-wider font-display">
            No Snapshots Captured Yet
          </div>
          <p className="text-xs text-text-muted max-w-sm mx-auto">
            Capture frames from the Live Camera feed to store georeferenced snapshots and AI segmentation inferences.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredSnapshots.map((snapshot) => {
            const isHazard = snapshot.analysis?.detected;

            return (
              <div
                key={snapshot.id}
                onClick={() => {
                  selectSnapshot(snapshot);
                  setModalZoom(1.0);
                }}
                className="rounded-xl glass-card hover:border-[#E85D22]/40 transition-all overflow-hidden flex flex-col justify-between cursor-pointer group select-none shadow-sm"
              >
                {/* Image Preview Container */}
                <div className="relative aspect-video bg-black overflow-hidden">
                  <img
                    src={snapshot.imageDataUrl}
                    alt="Captured frame"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Status Tag Overlay */}
                  <div className="absolute top-2 left-2">
                    {isHazard ? (
                      <span className="flex items-center space-x-1 bg-status-danger text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded shadow-sm">
                        <AlertTriangle className="w-3 h-3" />
                        <span>LANDSLIDE DETECTED</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1 bg-status-safe text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded shadow-sm">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>CLEAR</span>
                      </span>
                    )}
                  </div>

                  {/* Floating Risk Tag */}
                  <div className="absolute bottom-2 right-2 bg-white/95 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono font-bold text-[#E85D22] shadow-sm">
                    {snapshot.riskScore || 48}% RISK
                  </div>
                </div>

                {/* Metadata */}
                <div className="p-3.5 space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between text-[11px] text-text-muted">
                    <span className="text-text-primary font-bold">{snapshot.droneId}</span>
                    <span>{new Date(snapshot.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <div className="text-[10px] text-text-secondary">
                    {snapshot.latitude?.toFixed(4)}° N, {snapshot.longitude?.toFixed(4)}° E · {snapshot.altitude}m
                  </div>

                  {snapshot.analysis && (
                    <div className="pt-2 border-t border-black/[0.05] flex items-center justify-between text-[10px]">
                      <span className="text-text-muted">
                        Confidence: <strong className="text-text-primary">{(snapshot.analysis.confidence * 100).toFixed(1)}%</strong>
                      </span>
                      <span className="text-text-muted">
                        Area: <strong className="text-[#E85D22]">{(snapshot.analysis.affected_area * 100).toFixed(1)}%</strong>
                      </span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-black/[0.05] flex items-center justify-between">
                    <span className="text-[9px] text-text-muted uppercase">
                      {snapshot.sourceType}
                    </span>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => handleDownload(snapshot, e)}
                        className="p-1 text-text-muted hover:text-text-primary transition-colors"
                        title="Download Frame"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(snapshot.id, e)}
                        className="p-1 text-text-muted hover:text-status-danger transition-colors"
                        title="Delete Snapshot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Snapshot Detail Modal */}
      {selectedSnapshot && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div
            className="w-full max-w-5xl bg-white border border-black/[0.1] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-black/[0.06] bg-[#F7F5F0]">
              <div className="flex items-center space-x-3">
                <div className="p-1.5 rounded-lg bg-[#E85D22]/15 text-[#E85D22]">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider font-display">
                    Snapshot Analysis — {selectedSnapshot.id}
                  </h2>
                  <p className="text-[11px] font-mono text-text-muted">
                    {new Date(selectedSnapshot.timestamp).toLocaleString()} · UAV {selectedSnapshot.droneId}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => handleDownload(selectedSnapshot, e)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold glass-button flex items-center space-x-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Frame</span>
                </button>
                <button
                  onClick={() => selectSnapshot(null)}
                  className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-black/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="grid grid-cols-1 lg:grid-cols-12 overflow-y-auto flex-1">
              <div className="lg:col-span-7 bg-black p-4 flex flex-col items-center justify-center relative overflow-hidden min-h-[380px]">
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                  <img
                    src={selectedSnapshot.imageDataUrl}
                    alt="Inspection Frame"
                    className="max-h-[460px] object-contain transition-transform duration-150"
                    style={{ transform: `scale(${modalZoom})` }}
                  />

                  {showOverlay && selectedSnapshot.analysis?.detected && (
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          'radial-gradient(ellipse 45% 35% at 52% 48%, rgba(232, 93, 34, 0.4) 0%, rgba(217, 54, 46, 0.25) 60%, transparent 100%)',
                        mixBlendMode: 'screen',
                      }}
                    />
                  )}
                </div>

                <div className="absolute bottom-3 left-3 flex items-center space-x-1 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg border border-black/10 text-xs shadow-sm">
                  <button
                    onClick={() => setModalZoom(Math.max(0.5, modalZoom - 0.25))}
                    className="p-1 text-text-muted hover:text-text-primary"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono text-text-primary px-1">{Math.round(modalZoom * 100)}%</span>
                  <button
                    onClick={() => setModalZoom(Math.min(3.0, modalZoom + 0.25))}
                    className="p-1 text-text-muted hover:text-text-primary"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Right Telemetry */}
              <div className="lg:col-span-5 p-5 space-y-4 font-mono text-xs border-l border-black/[0.06] bg-[#F7F5F0]/60">
                <div
                  className={`p-3.5 rounded-xl border ${
                    selectedSnapshot.analysis?.detected
                      ? 'bg-status-danger/10 border-status-danger/40 text-status-danger'
                      : 'bg-status-safe/10 border-status-safe/40 text-status-safe'
                  }`}
                >
                  <div className="font-bold text-xs uppercase tracking-wider">
                    {selectedSnapshot.analysis?.detected ? 'LANDSLIDE-LIKE ZONE DETECTED' : 'CLEAR / STABLE SURFACE'}
                  </div>
                  <div className="text-[10px] mt-0.5 opacity-90">
                    Temporal Status: {selectedSnapshot.analysis?.temporalStatus || 'CONFIRMED_DETECTION'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-black/[0.06] space-y-2 shadow-sm">
                  <div className="telemetry-label text-text-secondary">AI Vision Metrics</div>
                  <div className="flex justify-between py-1 border-b border-black/[0.04]">
                    <span className="text-text-muted">Model Name</span>
                    <span className="text-text-primary font-bold">
                      {selectedSnapshot.analysis?.model || 'FALCON-SegFormer'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-black/[0.04]">
                    <span className="text-text-muted">Visual Confidence</span>
                    <span className="text-text-primary font-bold">
                      {((selectedSnapshot.analysis?.confidence || 0.914) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-black/[0.04]">
                    <span className="text-text-muted">Affected Landslide Area</span>
                    <span className="text-[#E85D22] font-bold">
                      {((selectedSnapshot.analysis?.affected_area || 0.182) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-text-muted">Inference Latency</span>
                    <span className="text-status-safe font-bold">
                      {selectedSnapshot.analysis?.inferenceTimeMs || 142} ms
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-black/[0.06] space-y-2 shadow-sm">
                  <div className="telemetry-label text-text-secondary">Spatial Coordinates</div>
                  <div className="flex justify-between py-1 border-b border-black/[0.04]">
                    <span className="text-text-muted">Latitude</span>
                    <span className="text-text-primary font-bold">{selectedSnapshot.latitude?.toFixed(5)}° N</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-black/[0.04]">
                    <span className="text-text-muted">Longitude</span>
                    <span className="text-text-primary font-bold">{selectedSnapshot.longitude?.toFixed(5)}° E</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-text-muted">Altitude (MSL)</span>
                    <span className="text-text-primary font-bold">{selectedSnapshot.altitude} m</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
