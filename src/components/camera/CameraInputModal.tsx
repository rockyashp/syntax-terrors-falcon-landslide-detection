import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  Upload,
  Video,
  Radio,
  X,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useCameraStore } from '../../stores/useCameraStore';
import { useUIStore } from '../../stores/useUIStore';

export const CameraInputModal: React.FC = () => {
  const {
    isInputModalOpen,
    setInputModalOpen,
    sourceType,
    setSourceType,
    deviceId,
    setDeviceId,
    availableDevices,
    setAvailableDevices,
    setHasPermission,
    permissionError,
    setUploadedImage,
    setUploadedVideo,
  } = useCameraStore();
  const { showToast } = useUIStore();

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isInputModalOpen) {
      enumerateVideoDevices();
    }
  }, [isInputModalOpen]);

  const enumerateVideoDevices = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        setHasPermission(false, 'Media devices API not supported in this browser environment');
        return;
      }
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevs = devices.filter((d) => d.kind === 'videoinput');
      setAvailableDevices(videoDevs);
      if (videoDevs.length > 0 && !deviceId) {
        setDeviceId(videoDevs[0].deviceId);
      }
    } catch (err: any) {
      console.warn('Failed to enumerate media devices:', err);
    }
  };

  const handleEnableWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: deviceId ? { deviceId: { exact: deviceId } } : true,
      });
      stream.getTracks().forEach((track) => track.stop());
      setHasPermission(true, null);
      setSourceType('WEBCAM');
      showToast('Webcam Enabled', 'Live camera feed connected', 'success');
      setInputModalOpen(false);
    } catch (err: any) {
      console.error('Webcam permission error:', err);
      let msg = 'Camera access was denied or device is unavailable.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Camera permission denied by user or browser security policy.';
      } else if (err.name === 'NotFoundError') {
        msg = 'No video capture hardware detected.';
      }
      setHasPermission(false, msg);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setUploadedImage(result);
      showToast('Image Loaded', `${file.name} ready for AI inspection`, 'success');
      setInputModalOpen(false);
    };
    reader.readAsDataURL(file);
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setUploadedVideo(url);
    showToast('Video Stream Loaded', `${file.name} ready for playback`, 'success');
    setInputModalOpen(false);
  };

  if (!isInputModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={() => setInputModalOpen(false)}
    >
      <div
        className="w-full max-w-lg max-h-[78vh] bg-[#FFFFFF] border border-black/[0.1] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between p-4 border-b border-black/[0.06] bg-[#F7F5F0]">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-[#E85D22]/15 text-[#E85D22]">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider font-display">
                Camera Input Configuration
              </h2>
              <p className="text-[11px] font-mono text-text-muted">
                Select live capture device, video source, or offline frames
              </p>
            </div>
          </div>
          <button
            onClick={() => setInputModalOpen(false)}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-black/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="min-h-0 p-5 space-y-4 overflow-y-auto overscroll-contain">
          {permissionError && (
            <div className="p-3.5 rounded-xl bg-status-danger/10 border border-status-danger/30 flex items-start space-x-3 text-xs text-status-danger">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Camera Access Blocked</p>
                <p className="text-[11px] mt-0.5 opacity-90">{permissionError}</p>
              </div>
            </div>
          )}

          {/* Option 1: Live Webcam */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              sourceType === 'WEBCAM'
                ? 'bg-[#E85D22]/5 border-[#E85D22]/40 shadow-sm'
                : 'bg-[#F7F5F0]/60 border-black/[0.06] hover:border-black/[0.15]'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Camera className="w-4 h-4 text-[#E85D22]" />
                <span className="text-xs font-bold uppercase tracking-wider text-text-primary">
                  Live Browser Camera
                </span>
              </div>
              {sourceType === 'WEBCAM' && (
                <span className="flex items-center space-x-1 text-[10px] font-mono text-status-safe bg-status-safe/10 border border-status-safe/30 px-2 py-0.5 rounded font-bold">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>ACTIVE</span>
                </span>
              )}
            </div>

            <p className="text-[11px] text-text-secondary mb-3 leading-relaxed">
              Stream live video feed directly from your connected UAV video receiver or optical webcam.
            </p>

            {availableDevices.length > 0 && (
              <div className="mb-3">
                <label className="block telemetry-label mb-1">Select Capture Device</label>
                <select
                  value={deviceId || ''}
                  onChange={(e) => setDeviceId(e.target.value)}
                  className="w-full text-xs font-mono py-1.5 px-2.5 rounded-lg bg-white border border-black/[0.1] text-text-primary focus:outline-none focus:border-[#E85D22]"
                >
                  {availableDevices.map((d, i) => (
                    <option key={d.deviceId || i} value={d.deviceId}>
                      {d.label || `Camera ${i + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={handleEnableWebcam}
              className="w-full py-2 px-3 rounded-lg text-xs font-semibold glass-button-primary flex items-center justify-center space-x-2"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Enable Live Camera</span>
            </button>
          </div>

          {/* Option 2: Image Frame Upload */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              sourceType === 'UPLOAD_IMAGE'
                ? 'bg-[#E85D22]/5 border-[#E85D22]/40 shadow-sm'
                : 'bg-[#F7F5F0]/60 border-black/[0.06] hover:border-black/[0.15]'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Upload className="w-4 h-4 text-[#3478C8]" />
                <span className="text-xs font-bold uppercase tracking-wider text-text-primary">
                  Static Frame / Aerial Photo
                </span>
              </div>
              {sourceType === 'UPLOAD_IMAGE' && (
                <span className="flex items-center space-x-1 text-[10px] font-mono text-status-safe bg-status-safe/10 border border-status-safe/30 px-2 py-0.5 rounded font-bold">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>ACTIVE</span>
                </span>
              )}
            </div>

            <p className="text-[11px] text-text-secondary mb-3 leading-relaxed">
              Upload an aerial drone photo (JPG, PNG) to analyze potential slip faces or landslide zones.
            </p>

            <input
              type="file"
              ref={imageInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />

            <button
              onClick={() => imageInputRef.current?.click()}
              className="w-full py-2 px-3 rounded-lg text-xs font-semibold glass-button flex items-center justify-center space-x-2"
            >
              <Upload className="w-3.5 h-3.5 text-[#3478C8]" />
              <span>Choose Image File</span>
            </button>
          </div>

          {/* Option 3: Video Stream Upload */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              sourceType === 'UPLOAD_VIDEO'
                ? 'bg-[#E85D22]/5 border-[#E85D22]/40 shadow-sm'
                : 'bg-[#F7F5F0]/60 border-black/[0.06] hover:border-black/[0.15]'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Video className="w-4 h-4 text-[#E85D22]" />
                <span className="text-xs font-bold uppercase tracking-wider text-text-primary">
                  Recorded Drone Video
                </span>
              </div>
              {sourceType === 'UPLOAD_VIDEO' && (
                <span className="flex items-center space-x-1 text-[10px] font-mono text-status-safe bg-status-safe/10 border border-status-safe/30 px-2 py-0.5 rounded font-bold">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>ACTIVE</span>
                </span>
              )}
            </div>

            <input
              type="file"
              ref={videoInputRef}
              accept="video/*"
              className="hidden"
              onChange={handleVideoUpload}
            />

            <button
              onClick={() => videoInputRef.current?.click()}
              className="w-full py-2 px-3 rounded-lg text-xs font-semibold glass-button flex items-center justify-center space-x-2"
            >
              <Video className="w-3.5 h-3.5 text-[#E85D22]" />
              <span>Choose Video File</span>
            </button>
          </div>

          {/* Option 4: Synthetic Tactical Recon Simulation */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              sourceType === 'SYNTHETIC_DEMO'
                ? 'bg-[#E85D22]/5 border-[#E85D22]/40 shadow-sm'
                : 'bg-[#F7F5F0]/60 border-black/[0.06] hover:border-black/[0.15]'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Radio className="w-4 h-4 text-[#E85D22]" />
                <span className="text-xs font-bold uppercase tracking-wider text-text-primary">
                  Synthetic Escarpment Recon Simulation
                </span>
              </div>
              {sourceType === 'SYNTHETIC_DEMO' && (
                <span className="flex items-center space-x-1 text-[10px] font-mono text-status-safe bg-status-safe/10 border border-status-safe/30 px-2 py-0.5 rounded font-bold">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>ACTIVE</span>
                </span>
              )}
            </div>

            <p className="text-[11px] text-text-secondary mb-3 leading-relaxed">
              Standard autonomous reconnaissance loop simulating high-altitude optical &amp; infrared slope patrol over Sindhupalchok.
            </p>

            <button
              onClick={() => {
                setSourceType('SYNTHETIC_DEMO');
                showToast('Recon Simulation Active', 'Running synthetic drone optical loop', 'info');
                setInputModalOpen(false);
              }}
              className="w-full py-2 px-3 rounded-lg text-xs font-semibold glass-button flex items-center justify-center space-x-2"
            >
              <Radio className="w-3.5 h-3.5 text-[#E85D22]" />
              <span>Use Recon Simulation</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
