import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Activity, AlertTriangle, Radio } from 'lucide-react';
import { AgentStatus } from '../../types/agent';

interface AgentOrbProps {
  status: AgentStatus;
  isOpen: boolean;
  isSpeaking: boolean;
  unreadAlertsCount: number;
  riskScore: number;
  onClick: () => void;
}

export const AgentOrb: React.FC<AgentOrbProps> = ({
  status,
  isOpen,
  isSpeaking,
  unreadAlertsCount,
  riskScore,
  onClick,
}) => {
  const isAlert = status === 'ALERT' || riskScore >= 70 || unreadAlertsCount > 0;
  const isAnalyzing = status === 'ANALYZING';

  return (
    <div className="fixed bottom-5 right-5 z-50 select-none">
      <motion.button
        onClick={onClick}
        aria-label="Open FALCON AI assistant"
        title="FALCON AI Operational Assistant (⌘J)"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`group relative flex items-center justify-center rounded-full transition-all duration-300 ${
          isOpen ? 'ring-2 ring-[#E85D22] ring-offset-2 ring-offset-[#F7F5F0]' : ''
        }`}
      >
        {/* Outer Glow Ring */}
        <div
          className={`absolute -inset-1 rounded-full opacity-60 blur-md transition-all duration-500 ${
            isAlert
              ? 'bg-[#D9362E] animate-pulse opacity-80'
              : isSpeaking
              ? 'bg-[#E85D22] animate-pulse opacity-80'
              : 'bg-[#E85D22] opacity-40 group-hover:opacity-75'
          }`}
        />

        {/* Rotating Ring on Analyzing */}
        {isAnalyzing && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'linear' }}
            className="absolute -inset-1.5 rounded-full border-2 border-dashed border-[#E85D22]/60"
          />
        )}

        {/* Waveform Ring on Speaking */}
        {isSpeaking && (
          <motion.div
            animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0.2, 0.6] }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
            className="absolute -inset-2.5 rounded-full border border-[#E85D22]"
          />
        )}

        {/* Main Glass Orb Body */}
        <div
          className={`relative flex items-center space-x-2.5 px-4 py-2.5 rounded-full bg-white/90 backdrop-blur-xl border shadow-lg transition-all ${
            isAlert
              ? 'border-[#D9362E]/40 shadow-[#D9362E]/10'
              : 'border-black/[0.08] group-hover:border-[#E85D22]/40 shadow-black/5 group-hover:shadow-[#E85D22]/15'
          }`}
        >
          {/* Futuristic Core Indicator */}
          <div className="relative flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-tr from-[#E85D22] to-[#FF7A38] text-white shadow-sm shadow-[#E85D22]/40">
            {isAnalyzing ? (
              <Activity className="w-3.5 h-3.5 animate-spin" />
            ) : isAlert ? (
              <AlertTriangle className="w-3.5 h-3.5 text-white animate-bounce" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}

            {/* Subtle Inner Pulse Dot */}
            <span
              className={`absolute top-0 right-0 w-2 h-2 rounded-full border-2 border-white ${
                isAlert ? 'bg-[#D9362E]' : 'bg-[#2E9B68]'
              }`}
            />
          </div>

          {/* Label */}
          <div className="flex flex-col text-left">
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-xs tracking-wider text-text-primary font-display">
                FALCON AI
              </span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-black/[0.04] text-text-muted font-mono font-bold tracking-widest uppercase">
                {isAnalyzing ? 'THINKING' : isSpeaking ? 'SPEAKING' : 'READY'}
              </span>
            </div>
            <div className="text-[10px] text-text-muted font-mono -mt-0.5">
              {isAlert ? '● ATTENTION REQUIRED' : '● SITUATION BRIEF'}
            </div>
          </div>

          {/* Unread Alerts Counter Pill */}
          {unreadAlertsCount > 0 && (
            <span className="ml-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-[#D9362E] text-[9px] font-mono font-bold text-white shadow-sm">
              {unreadAlertsCount}
            </span>
          )}
        </div>
      </motion.button>
    </div>
  );
};
