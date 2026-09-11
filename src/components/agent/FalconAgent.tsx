import React from 'react';
import { useFalconAgent } from '../../hooks/useFalconAgent';
import { AgentOrb } from './AgentOrb';
import { AgentPanel } from './AgentPanel';

export const FalconAgent: React.FC = () => {
  const {
    isOpen,
    isMinimized,
    agentStatus,
    messages,
    currentBriefing,
    isSpeaking,
    activeView,
    metrics,
    toggleOpen,
    closeAgent,
    minimizeAgent,
    setActiveView,
    askQuestion,
    triggerQuickAction,
    speakBriefing,
    clearChat,
  } = useFalconAgent();

  return (
    <>
      {/* Floating Circular AI Orb Trigger */}
      <AgentOrb
        status={agentStatus}
        isOpen={isOpen}
        isSpeaking={isSpeaking}
        unreadAlertsCount={metrics.activeAlertsCount}
        riskScore={metrics.riskScore}
        onClick={toggleOpen}
      />

      {/* Floating Glassmorphism Intelligence Panel */}
      <AgentPanel
        isOpen={isOpen}
        isMinimized={isMinimized}
        agentStatus={agentStatus}
        currentBriefing={currentBriefing}
        messages={messages}
        isSpeaking={isSpeaking}
        activeView={activeView}
        onClose={closeAgent}
        onMinimize={minimizeAgent}
        onAskQuestion={askQuestion}
        onQuickAction={triggerQuickAction}
        onToggleSpeech={speakBriefing}
        onViewChange={setActiveView}
        onClearChat={clearChat}
      />
    </>
  );
};

export default FalconAgent;
