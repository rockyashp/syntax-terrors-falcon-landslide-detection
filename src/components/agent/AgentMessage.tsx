import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, User, AlertTriangle, ShieldCheck, ArrowRight, CheckCircle } from 'lucide-react';
import { AgentMessage as AgentMessageType } from '../../types/agent';

interface AgentMessageProps {
  message: AgentMessageType;
}

export const AgentMessage: React.FC<AgentMessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-end my-2"
      >
        <div className="flex items-start space-x-2 max-w-[85%]">
          <div className="p-2.5 rounded-2xl rounded-tr-sm bg-[#E85D22] text-white text-xs font-medium shadow-sm">
            {message.text}
          </div>
          <div className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center text-text-secondary shrink-0 mt-1">
            <User className="w-3 h-3" />
          </div>
        </div>
      </motion.div>
    );
  }

  const res = message.response;
  if (!res) return null;

  const isCritical = res.priority === 'critical';
  const isWarning = res.priority === 'warning';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="my-3 flex items-start space-x-2.5 max-w-full"
    >
      {/* Agent Avatar */}
      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#E85D22] to-[#FF7A38] text-white flex items-center justify-center shrink-0 mt-1 shadow-sm">
        <Sparkles className="w-3.5 h-3.5" />
      </div>

      {/* Main Response Box */}
      <div
        className={`flex-1 rounded-xl p-3.5 border text-xs shadow-sm bg-white/90 backdrop-blur-md ${
          isCritical
            ? 'border-[#D9362E]/30 bg-red-50/30'
            : isWarning
            ? 'border-[#D98B16]/30 bg-amber-50/20'
            : 'border-black/[0.08]'
        }`}
      >
        {/* Header line */}
        <div className="flex items-center justify-between border-b border-black/[0.06] pb-2 mb-2">
          <div className="flex items-center space-x-1.5 font-bold text-text-primary">
            <span>{res.title || 'FALCON Intelligence Briefing'}</span>
          </div>
          <span
            className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
              isCritical
                ? 'bg-[#D9362E]/15 text-[#D9362E]'
                : isWarning
                ? 'bg-[#D98B16]/15 text-[#D98B16]'
                : 'bg-[#2E9B68]/15 text-[#2E9B68]'
            }`}
          >
            {res.priority}
          </span>
        </div>

        {/* Summary text */}
        <p className="text-text-primary font-medium leading-relaxed mb-2.5">
          {res.summary}
        </p>

        {/* Risk Explanation if present */}
        {res.riskExplanation && (
          <div className="mb-2 p-2 rounded-lg bg-black/[0.03] border border-black/[0.04] text-[11px] text-text-secondary leading-snug">
            <span className="font-semibold text-text-primary font-mono text-[10px] uppercase tracking-wider block mb-0.5">
              Risk Fusion
            </span>
            {res.riskExplanation}
          </div>
        )}

        {/* Observations list */}
        {res.observations && res.observations.length > 0 && (
          <div className="mb-2.5 space-y-1">
            <div className="text-[10px] font-mono text-text-muted font-bold tracking-wider uppercase">
              Key Observations
            </div>
            <ul className="space-y-1">
              {res.observations.map((obs, idx) => (
                <li key={idx} className="flex items-start space-x-1.5 text-text-secondary text-[11px]">
                  <ArrowRight className="w-3 h-3 text-[#E85D22] shrink-0 mt-0.5" />
                  <span>{obs}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actionable Recommendation */}
        {res.recommendation && (
          <div
            className={`p-2.5 rounded-lg border flex items-start space-x-2 text-[11px] font-medium leading-snug ${
              isCritical
                ? 'bg-[#D9362E]/10 border-[#D9362E]/20 text-[#D9362E]'
                : 'bg-[#2E9B68]/10 border-[#2E9B68]/20 text-[#2E9B68]'
            }`}
          >
            {isCritical ? (
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            )}
            <div>
              <span className="font-bold uppercase tracking-wider text-[10px] block mb-0.5 font-mono">
                Recommendation
              </span>
              <span>{res.recommendation}</span>
            </div>
          </div>
        )}

        {/* Footer timestamp */}
        <div className="mt-2 text-right text-[9px] font-mono text-text-muted">
          {new Date(res.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
      </div>
    </motion.div>
  );
};
