import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { useUIStore } from '../../stores/useUIStore';

export const Toast: React.FC = () => {
  const { activeToast, hideToast } = useUIStore();

  if (!activeToast) return null;

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-status-safe shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-status-warning shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-status-danger shrink-0" />,
    info: <Info className="w-4 h-4 text-[#3478C8] shrink-0" />,
  };

  const borderColors = {
    success: 'border-status-safe/40',
    warning: 'border-status-warning/40',
    error: 'border-status-danger/40',
    info: 'border-[#E85D22]/40',
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200 select-none">
      <div
        className={`flex items-start space-x-3 p-3.5 rounded-xl bg-white/95 backdrop-blur-xl border ${
          borderColors[activeToast.type]
        } max-w-sm shadow-xl text-xs`}
      >
        {icons[activeToast.type]}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-text-primary text-xs">{activeToast.title}</div>
          <div className="text-text-secondary text-[11px] mt-0.5 leading-relaxed">{activeToast.message}</div>
        </div>
        <button
          onClick={hideToast}
          className="text-text-muted hover:text-text-primary p-0.5 rounded transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
