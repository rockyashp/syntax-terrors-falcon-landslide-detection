import React from 'react';
import {
  Activity,
  History,
  HelpCircle,
  Eye,
  Cpu,
  Navigation,
  Bell,
  CheckCircle2,
} from 'lucide-react';
import { QuickActionId, QuickActionItem } from '../../types/agent';

interface AgentQuickActionsProps {
  onSelectAction: (actionId: QuickActionId) => void;
  disabled?: boolean;
}

const QUICK_ACTIONS: QuickActionItem[] = [
  { id: 'status', label: 'Current Status', prompt: 'What is the current situation?' },
  { id: 'changed', label: 'What Changed?', prompt: 'What changed recently?' },
  { id: 'why_risk', label: 'Why is Risk High?', prompt: 'Why is the risk at this level?' },
  { id: 'ai_analysis', label: 'Latest AI Analysis', prompt: 'What did the camera detect?' },
  { id: 'sensors', label: 'Sensor Status', prompt: 'Are the sensors normal?' },
  { id: 'drone', label: 'Drone Status', prompt: 'Where is the drone?' },
  { id: 'alerts', label: 'Active Alerts', prompt: 'Are there any active alerts?' },
  { id: 'recommendation', label: 'Action Recommendation', prompt: 'What should I do?' },
];

export const AgentQuickActions: React.FC<AgentQuickActionsProps> = ({
  onSelectAction,
  disabled = false,
}) => {
  const getIcon = (id: QuickActionId) => {
    switch (id) {
      case 'status':
        return <Activity className="w-3 h-3 text-[#E85D22]" />;
      case 'changed':
        return <History className="w-3 h-3 text-[#3478C8]" />;
      case 'why_risk':
        return <HelpCircle className="w-3 h-3 text-[#D98B16]" />;
      case 'ai_analysis':
        return <Eye className="w-3 h-3 text-[#E85D22]" />;
      case 'sensors':
        return <Cpu className="w-3 h-3 text-[#2E9B68]" />;
      case 'drone':
        return <Navigation className="w-3 h-3 text-[#3478C8]" />;
      case 'alerts':
        return <Bell className="w-3 h-3 text-[#D9362E]" />;
      case 'recommendation':
        return <CheckCircle2 className="w-3 h-3 text-[#2E9B68]" />;
    }
  };

  return (
    <div className="flex flex-wrap gap-1.5 py-1">
      {QUICK_ACTIONS.map((action) => (
        <button
          key={action.id}
          onClick={() => onSelectAction(action.id)}
          disabled={disabled}
          className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-white/80 hover:bg-white border border-black/[0.08] hover:border-[#E85D22]/30 text-text-primary text-[11px] font-medium shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
        >
          {getIcon(action.id)}
          <span>{action.label}</span>
        </button>
      ))}
    </div>
  );
};
