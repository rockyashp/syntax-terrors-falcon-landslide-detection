import React from 'react';
import {
  Shield,
  ArrowRight,
  Video,
  Cpu,
  Activity,
  Zap,
  Navigation,
  CheckCircle2,
  Radio,
  Layers,
  MapPin,
  Eye,
  ChevronRight,
} from 'lucide-react';
import { useUIStore } from '../stores/useUIStore';
import { useTelemetryStore } from '../stores/useTelemetryStore';

export const LandingPage: React.FC = () => {
  const { setCurrentPage } = useUIStore();
  const { drone, risk, aiLatest, sensors, location } = useTelemetryStore();

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#171514] font-sans antialiased select-none">
      {/* Top Hero Navigation */}
      <header className="h-20 border-b border-black/[0.06] bg-white/70 backdrop-blur-xl px-6 lg:px-12 flex items-center justify-between sticky top-0 z-50">
        {/* Brand */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentPage('landing')}>
          <div className="w-8 h-8 rounded-lg bg-[#E85D22] flex items-center justify-center text-white shadow-sm">
            <Shield className="w-4 h-4 fill-white" />
          </div>
          <div>
            <div className="font-extrabold text-lg tracking-wider text-text-primary font-display">
              FALCON
            </div>
            <p className="text-[10px] text-text-muted uppercase font-mono tracking-widest font-semibold">
              Landslide Intelligence
            </p>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-text-secondary">
          <button
            onClick={() => setCurrentPage('overview')}
            className="hover:text-text-primary transition-colors"
          >
            Overview
          </button>
          <button
            onClick={() => setCurrentPage('ai-analysis')}
            className="hover:text-text-primary transition-colors"
          >
            Technology &amp; AI
          </button>
          <button
            onClick={() => setCurrentPage('monitor')}
            className="hover:text-text-primary transition-colors"
          >
            Drone Monitoring
          </button>
          <button
            onClick={() => setCurrentPage('risk-engine')}
            className="hover:text-text-primary transition-colors"
          >
            Risk Engine
          </button>
        </nav>

        {/* Action button */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setCurrentPage('overview')}
            className="px-5 py-2.5 rounded-full text-xs font-bold glass-button-primary flex items-center space-x-2"
          >
            <span>Launch Command Center</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Hero Section */}
      <section className="relative px-6 lg:px-12 pt-12 pb-20 max-w-7xl mx-auto overflow-hidden">
        {/* Subtle Topographic Background SVGs */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <svg className="w-full h-full" viewBox="0 0 1200 800" fill="none">
            <path
              d="M-100 200 C 300 150, 700 400, 1300 250"
              stroke="rgba(23, 21, 20, 0.05)"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              d="M-100 350 C 400 300, 800 550, 1300 400"
              stroke="rgba(23, 21, 20, 0.04)"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              d="M-100 500 C 500 450, 900 700, 1300 550"
              stroke="rgba(232, 93, 34, 0.06)"
              strokeWidth="1.5"
              fill="none"
            />
          </svg>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Column: Huge Headline & Messaging */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#E85D22]/10 border border-[#E85D22]/20 text-[#E85D22] text-xs font-mono font-bold tracking-wider uppercase">
              <span className="h-2 w-2 rounded-full bg-[#E85D22] animate-pulse" />
              <span>Real-Time Autonomous System</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-text-primary font-display leading-[1.05]">
              REAL-TIME <br />
              <span className="text-[#E85D22]">LANDSLIDE</span> <br />
              INTELLIGENCE.
            </h1>

            <p className="text-lg font-semibold text-text-primary tracking-wide">
              Detect. Understand. Respond.
            </p>

            <p className="text-sm text-text-secondary leading-relaxed max-w-lg">
              FALCON combines autonomous drone optical reconnaissance, SegFormer semantic vision AI, in-situ geotechnical telemetry, and hybrid XGBoost numerical modeling to assess landslide hazard probability in real time.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setCurrentPage('overview')}
                className="px-6 py-3 rounded-xl text-sm font-bold glass-button-primary flex items-center space-x-2"
              >
                <span>Launch Live Monitor</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setCurrentPage('risk-engine')}
                className="px-5 py-3 rounded-xl text-sm font-semibold glass-button flex items-center space-x-2"
              >
                <span>Explore Risk Engine</span>
                <ChevronRight className="w-4 h-4 text-text-muted" />
              </button>
            </div>

            {/* Live Signals */}
            <div className="pt-6 border-t border-black/[0.06] flex items-center space-x-6 text-xs font-mono text-text-secondary">
              <div className="flex items-center space-x-1.5">
                <span className="h-2 w-2 rounded-full bg-status-safe" />
                <span>Drone connected</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="h-2 w-2 rounded-full bg-status-safe" />
                <span>Sensors active</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="h-2 w-2 rounded-full bg-status-safe" />
                <span>AI ready</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Mountain & Floating Glass Telemetry Visual */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-black/[0.08] bg-black aspect-[4/3] group">
              {/* High-Resolution Mountainous Escarpment Recon Image */}
              <img
                src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1400&auto=format&fit=crop&q=85"
                alt="Sindhupalchok Escarpment Monitoring"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />

              {/* Slip-face highlighted region */}
              <div
                className="absolute border-2 border-[#E85D22] bg-[#E85D22]/20 rounded-lg pointer-events-none shadow-accent-glow"
                style={{
                  top: '28%',
                  left: '24%',
                  width: '46%',
                  height: '42%',
                }}
              >
                <div className="absolute -top-6 left-0 bg-[#E85D22] text-white px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider flex items-center space-x-1 shadow-md">
                  <span>Landslide Slip Face</span>
                  <span>(91.4%)</span>
                </div>
              </div>

              {/* Floating Glass Telemetry Card 1: Live Status */}
              <div className="absolute top-4 left-4 bg-white/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-black/10 text-xs font-mono font-bold text-text-primary flex items-center space-x-2 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-status-danger animate-ping" />
                <span>LIVE UAV RECONNAISSANCE</span>
              </div>

              {/* Floating Glass Telemetry Card 2: GPS Coordinates */}
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md p-3 rounded-xl border border-black/10 text-xs font-mono shadow-md space-y-1">
                <div className="text-[10px] text-text-muted uppercase font-bold flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-[#E85D22]" />
                  <span>Sindhupalchok Zone</span>
                </div>
                <div className="text-text-primary font-bold">
                  27.9142° N, 85.8456° E
                </div>
                <div className="text-[10px] text-text-secondary">
                  UAV Alt: 1420m · Speed: 8.4 m/s
                </div>
              </div>

              {/* Floating Glass Telemetry Card 3: Final Risk Engine Verdict */}
              <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md p-3.5 rounded-xl border border-black/10 text-xs font-mono shadow-lg space-y-1.5 text-right">
                <div className="text-[10px] text-text-muted uppercase font-bold">
                  Landslide Probability
                </div>
                <div className="text-3xl font-extrabold text-[#E85D22] tracking-tight">
                  72%
                </div>
                <span className="inline-block text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-[#E85D22]/15 text-[#E85D22] border border-[#E85D22]/30">
                  HIGH RISK ZONE
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Capability Metrics Strip */}
      <section className="border-y border-black/[0.06] bg-white/60 py-10 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1 border-r border-black/[0.05] last:border-none">
            <div className="text-4xl font-extrabold font-mono text-text-primary tracking-tight">
              01
            </div>
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-text-muted">
              Recon UAV
            </div>
            <p className="text-[11px] text-text-secondary">DRONE-01 4K Optical</p>
          </div>

          <div className="space-y-1 border-r border-black/[0.05] last:border-none">
            <div className="text-4xl font-extrabold font-mono text-text-primary tracking-tight">
              04
            </div>
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-text-muted">
              Sensor Streams
            </div>
            <p className="text-[11px] text-text-secondary">Soil, Rain, Move, Pore</p>
          </div>

          <div className="space-y-1 border-r border-black/[0.05] last:border-none">
            <div className="text-4xl font-extrabold font-mono text-text-primary tracking-tight">
              02
            </div>
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-text-muted">
              AI Models
            </div>
            <p className="text-[11px] text-text-secondary">SegFormer &amp; XGBoost</p>
          </div>

          <div className="space-y-1">
            <div className="text-4xl font-extrabold font-mono text-[#E85D22] tracking-tight">
              50 / 50
            </div>
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-text-muted">
              Risk Fusion
            </div>
            <p className="text-[11px] text-text-secondary">Vision + Numerical</p>
          </div>
        </div>
      </section>

      {/* The Intelligence Pipeline Section */}
      <section className="py-20 px-6 lg:px-12 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="text-xs font-mono font-bold uppercase tracking-widest text-[#E85D22]">
            End-To-End Architecture
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary font-display tracking-tight">
            How FALCON Protects Communities
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            From raw drone optical video to sub-second hazard prediction, every step is designed for scientific precision and operator action.
          </p>
        </div>

        {/* 6 Step Interactive Architecture Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl glass-card space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#E85D22]/10 flex items-center justify-center text-[#E85D22]">
              <Video className="w-5 h-5" />
            </div>
            <div className="text-xs font-mono text-text-muted font-bold">01 · RECONNAISSANCE</div>
            <h3 className="text-base font-bold text-text-primary">Autonomous UAV Patrol</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Drones continuously orbit high-risk escarpments, capturing 4K optical frames with real-time GPS coordinates and altitude telemetry.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-card space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#3478C8]/10 flex items-center justify-center text-[#3478C8]">
              <Eye className="w-5 h-5" />
            </div>
            <div className="text-xs font-mono text-text-muted font-bold">02 · VISION INFERENCE</div>
            <h3 className="text-base font-bold text-text-primary">FALCON-SegFormer AI</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Transformer-based semantic segmentation identifies active slip faces, tension cracks, and scarp zones with pixel-level confidence maps.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-card space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#2E9B68]/10 flex items-center justify-center text-[#2E9B68]">
              <Activity className="w-5 h-5" />
            </div>
            <div className="text-xs font-mono text-text-muted font-bold">03 · SENSOR TELEMETRY</div>
            <h3 className="text-base font-bold text-text-primary">Geotechnical In-Situ Mesh</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Piezometers, inclinometers, and tipping-bucket rain gauges stream pore pressure, soil saturation, and ground movement every 2.0 seconds.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-card space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#D98B16]/10 flex items-center justify-center text-[#D98B16]">
              <Cpu className="w-5 h-5" />
            </div>
            <div className="text-xs font-mono text-text-muted font-bold">04 · NUMERICAL MODELING</div>
            <h3 className="text-base font-bold text-text-primary">XGBoost Hybrid Package</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Trained on meteorological and slope morphology data to compute numerical landslide probability from physical ground conditions.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-card space-y-3 border-2 border-[#E85D22]/30 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[#E85D22] flex items-center justify-center text-white">
              <Zap className="w-5 h-5" />
            </div>
            <div className="text-xs font-mono text-[#E85D22] font-bold">05 · RISK FUSION</div>
            <h3 className="text-base font-bold text-text-primary">50 / 50 Dual-Model Engine</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Combines optical image confidence (50%) and numerical risk (50%) into a definitive, explainable 0–100 composite disaster score.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-card space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#D9362E]/10 flex items-center justify-center text-[#D9362E]">
              <Shield className="w-5 h-5" />
            </div>
            <div className="text-xs font-mono text-text-muted font-bold">06 · ACTIONABLE ALERTS</div>
            <h3 className="text-base font-bold text-text-primary">Emergency Incident Center</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Disaster response teams receive georeferenced alerts, snapshot evidence, and recommended containment protocols in under 5 seconds.
            </p>
          </div>
        </div>

        {/* Bottom Launch Banner */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-[#171514] to-[#25201D] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-xl font-bold font-display">Ready for Operational Command?</h3>
            <p className="text-xs text-[#AAA29D]">
              Open the live Sindhupalchok monitoring center with active UAV feed and real-time risk scores.
            </p>
          </div>

          <button
            onClick={() => setCurrentPage('overview')}
            className="px-6 py-3 rounded-xl text-sm font-bold glass-button-primary flex items-center space-x-2 shrink-0"
          >
            <span>Open Command Center</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
};
