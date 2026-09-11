import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Minus,
  X,
  Volume2,
  VolumeX,
  Send,
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Radio,
  Eye,
  Activity,
  History,
  MessageSquare,
  Layers,
} from 'lucide-react';
import { AgentResponse, AgentMessage as AgentMessageType, AgentStatus, QuickActionId } from '../../types/agent';
import { AgentMetricsBar } from './AgentMetricsBar';
import { AgentQuickActions } from './AgentQuickActions';
import { AgentMessage } from './AgentMessage';

interface AgentPanelProps {
  isOpen: boolean;
  isMinimized: boolean;
  agentStatus: AgentStatus;
  currentBriefing: AgentResponse | null;
  messages: AgentMessageType[];
  isSpeaking: boolean;
  activeView: 'briefing' | 'chat';
  onClose: () => void;
  onMinimize: () => void;
  onAskQuestion: (text: string) => void;
  onQuickAction: (actionId: QuickActionId) => void;
  onToggleSpeech: () => void;
  onViewChange: (view: 'briefing' | 'chat') => void;
  onClearChat: () => void;
}

export const AgentPanel: React.FC<AgentPanelProps> = ({
  isOpen,
  isMinimized,
  agentStatus,
  currentBriefing,
  messages,
  isSpeaking,
  activeView,
  onClose,
  onMinimize,
  onAskQuestion,
  onQuickAction,
  onToggleSpeech,
  onViewChange,
  onClearChat,
}) => {
  const [inputText, setInputText] = useState<string>('');
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll chat view
  useEffect(() => {
    if (activeView === 'chat' && chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, activeView]);

  // Focus input on opening
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, isMinimized]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onAskQuestion(inputText.trim());
    setInputText('');
  };

  const isCritical = currentBriefing?.priority === 'critical';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.96 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        role="dialog"
        aria-label="FALCON AI Operational Intelligence Assistant"
        className={`fixed z-50 transition-all ${
          isMinimized
            ? 'bottom-20 right-5 w-80'
            : 'bottom-20 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[420px] max-h-[85vh] sm:max-h-[640px]'
        }`}
      >
        <div className="flex flex-col h-full bg-white/95 backdrop-blur-2xl border border-black/[0.1] rounded-2xl shadow-2xl overflow-hidden text-text-primary">
          {/* ======================================================== */}
          {/* HEADER */}
          {/* ======================================================== */}
          <div className="px-4 py-3 border-b border-black/[0.08] bg-white/60 flex items-center justify-between select-none">
            {/* Left: Identity */}
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#E85D22] to-[#FF7A38] text-white flex items-center justify-center shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-sm tracking-wider font-display text-text-primary">
                    ✦ FALCON AI
                  </span>
                  <span className="flex items-center space-x-1 text-[10px] font-mono font-bold text-[#2E9B68]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2E9B68] animate-pulse" />
                    <span>ONLINE</span>
                  </span>
                </div>
                <p className="text-[10px] text-text-muted font-mono leading-none mt-0.5">
                  Operational Intelligence
                </p>
              </div>
            </div>

            {/* Right: Controls (Voice, Minimize, Close) */}
            <div className="flex items-center space-x-1">
              {/* Voice Read Briefing button */}
              <button
                onClick={onToggleSpeech}
                title={isSpeaking ? 'Stop Audio Briefing' : 'Read Situation Briefing (Speech)'}
                className={`p-1.5 rounded-md text-xs font-mono transition-colors ${
                  isSpeaking
                    ? 'bg-[#E85D22] text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-black/[0.05]'
                }`}
              >
                {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              {/* Minimize button */}
              <button
                onClick={onMinimize}
                title={isMinimized ? 'Expand' : 'Minimize'}
                className="p-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-black/[0.05] transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>

              {/* Close button */}
              <button
                onClick={onClose}
                title="Close Panel (Esc)"
                className="p-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-black/[0.05] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ======================================================== */}
          {/* MINIMIZED VIEW */}
          {/* ======================================================== */}
          {isMinimized ? (
            <div className="p-3 bg-white/80 text-xs flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-[#2E9B68]" />
                <span className="font-semibold text-text-primary text-xs">
                  Risk: {currentBriefing?.metrics?.riskScore ?? 0}% {currentBriefing?.metrics?.riskLevel ?? 'SAFE'}
                </span>
              </div>
              <button
                onClick={onMinimize}
                className="text-[11px] font-mono text-[#E85D22] font-semibold hover:underline"
              >
                Expand
              </button>
            </div>
          ) : (
            <>
              {/* ======================================================== */}
              {/* VIEW SWITCHER / TABS */}
              {/* ======================================================== */}
              <div className="px-4 pt-2.5 pb-1 flex items-center justify-between border-b border-black/[0.04] bg-black/[0.01]">
                <div className="flex space-x-2">
                  <button
                    onClick={() => onViewChange('briefing')}
                    className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                      activeView === 'briefing'
                        ? 'bg-[#E85D22]/10 text-[#E85D22] border border-[#E85D22]/20 shadow-xs'
                        : 'text-text-secondary hover:text-text-primary hover:bg-black/[0.04]'
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>Live Briefing</span>
                  </button>

                  <button
                    onClick={() => onViewChange('chat')}
                    className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                      activeView === 'chat'
                        ? 'bg-[#E85D22]/10 text-[#E85D22] border border-[#E85D22]/20 shadow-xs'
                        : 'text-text-secondary hover:text-text-primary hover:bg-black/[0.04]'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Operator Q&A</span>
                    {messages.length > 0 && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/5 font-mono">
                        {messages.length}
                      </span>
                    )}
                  </button>
                </div>

                {activeView === 'chat' && messages.length > 0 && (
                  <button
                    onClick={onClearChat}
                    className="flex items-center space-x-1 text-[10px] font-mono text-text-muted hover:text-text-primary"
                    title="Clear Chat History"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                )}
              </div>

              {/* ======================================================== */}
              {/* SCROLLABLE MAIN CONTENT */}
              {/* ======================================================== */}
              <div
                ref={chatScrollRef}
                className="flex-1 p-4 overflow-y-auto max-h-[420px] space-y-3.5 text-xs"
              >
                {activeView === 'briefing' ? (
                  <>
                    {/* 1. Live Metrics Bar */}
                    {currentBriefing?.metrics && (
                      <AgentMetricsBar metrics={currentBriefing.metrics} />
                    )}

                    {/* 2. Critical Alert Highlight if applicable */}
                    {isCritical && (
                      <div className="p-3 rounded-xl bg-[#D9362E]/10 border border-[#D9362E]/25 text-[#D9362E] flex items-start space-x-2 shadow-sm">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold uppercase tracking-wider text-[10px] block font-mono">
                            Priority Alert Active
                          </span>
                          <span className="text-xs font-medium leading-tight">
                            Elevated landslide hazard confirmed in target monitoring sector.
                          </span>
                        </div>
                      </div>
                    )}

                    {/* 3. Situation Briefing Card */}
                    <div className="p-3.5 rounded-xl bg-white border border-black/[0.08] shadow-sm space-y-3">
                      {/* Section: CURRENT SITUATION */}
                      <div>
                        <div className="text-[10px] font-mono text-text-muted font-bold uppercase tracking-wider mb-1 flex items-center justify-between">
                          <span>Current Situation</span>
                          <span className="text-[9px] text-text-muted">
                            {new Date().toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-text-primary font-medium text-xs leading-relaxed">
                          {currentBriefing?.summary || 'Synthesizing live telemetry...'}
                        </p>
                      </div>

                      {/* Section: WHAT I'M SEEING */}
                      {currentBriefing?.visionObservation && (
                        <div className="pt-2 border-t border-black/[0.05]">
                          <div className="text-[10px] font-mono text-text-muted font-bold uppercase tracking-wider mb-1 flex items-center space-x-1.5">
                            <Eye className="w-3 h-3 text-[#E85D22]" />
                            <span>What I'm Seeing</span>
                          </div>
                          <p className="text-text-secondary text-[11px] leading-relaxed">
                            {currentBriefing.visionObservation}
                          </p>
                        </div>
                      )}

                      {/* Section: SENSOR STATUS */}
                      {currentBriefing?.sensorObservation && (
                        <div className="pt-2 border-t border-black/[0.05]">
                          <div className="text-[10px] font-mono text-text-muted font-bold uppercase tracking-wider mb-1 flex items-center space-x-1.5">
                            <Activity className="w-3 h-3 text-[#2E9B68]" />
                            <span>Sensor Condition</span>
                          </div>
                          <p className="text-text-secondary text-[11px] leading-relaxed">
                            {currentBriefing.sensorObservation}
                          </p>
                        </div>
                      )}

                      {/* Section: WHAT CHANGED (if delta present) */}
                      {currentBriefing?.deltaSummary && (
                        <div className="pt-2 border-t border-black/[0.05]">
                          <div className="text-[10px] font-mono text-text-muted font-bold uppercase tracking-wider mb-1 flex items-center space-x-1.5">
                            <History className="w-3 h-3 text-[#3478C8]" />
                            <span>Recent Shift</span>
                          </div>
                          <p className="text-text-secondary text-[11px] leading-relaxed">
                            {currentBriefing.deltaSummary}
                          </p>
                        </div>
                      )}

                      {/* Section: RECOMMENDATION */}
                      {currentBriefing?.recommendation && (
                        <div className="pt-2.5 border-t border-black/[0.05]">
                          <div
                            className={`p-2.5 rounded-lg border flex items-start space-x-2 text-[11px] leading-snug ${
                              isCritical
                                ? 'bg-[#D9362E]/10 border-[#D9362E]/20 text-[#D9362E]'
                                : 'bg-[#2E9B68]/10 border-[#2E9B68]/20 text-[#2E9B68]'
                            }`}
                          >
                            <ShieldCheck className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold uppercase tracking-wider text-[10px] block mb-0.5 font-mono">
                                Recommendation
                              </span>
                              <span className="font-medium">{currentBriefing.recommendation}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    {/* Chat / Conversation Stream */}
                    {messages.length === 0 ? (
                      <div className="text-center py-8 text-text-muted space-y-2">
                        <Sparkles className="w-6 h-6 mx-auto text-[#E85D22]/60" />
                        <p className="text-xs font-medium text-text-secondary">
                          Operator Assistant Ready
                        </p>
                        <p className="text-[11px] text-text-muted max-w-[280px] mx-auto">
                          Ask questions about current landslide risk, sensor anomalies, AI vision
                          detections, or drone positioning.
                        </p>
                      </div>
                    ) : (
                      messages.map((msg) => <AgentMessage key={msg.id} message={msg} />)
                    )}

                    {agentStatus === 'ANALYZING' && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center space-x-2 text-xs text-text-muted py-2 font-mono"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#E85D22] animate-spin" />
                        <span>FALCON AI is analyzing live telemetry...</span>
                      </motion.div>
                    )}
                  </>
                )}
              </div>

              {/* ======================================================== */}
              {/* QUICK PROMPTS & ASK INPUT */}
              {/* ======================================================== */}
              <div className="p-3 border-t border-black/[0.08] bg-black/[0.02] space-y-2">
                {/* Quick Actions Carousel */}
                <div className="overflow-x-auto pb-1 scrollbar-none">
                  <AgentQuickActions
                    onSelectAction={onQuickAction}
                    disabled={agentStatus === 'ANALYZING'}
                  />
                </div>

                {/* Input Form */}
                <form onSubmit={handleSubmit} className="flex items-center space-x-1.5">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Ask FALCON... (e.g. Why is risk high?)"
                    disabled={agentStatus === 'ANALYZING'}
                    className="flex-1 px-3 py-2 rounded-xl bg-white border border-black/[0.1] text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-[#E85D22] focus:ring-1 focus:ring-[#E85D22] transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim() || agentStatus === 'ANALYZING'}
                    className="p-2 rounded-xl bg-[#E85D22] hover:bg-[#F06A2A] text-white shadow-sm transition-all disabled:opacity-40 disabled:hover:bg-[#E85D22]"
                    title="Send Question"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
