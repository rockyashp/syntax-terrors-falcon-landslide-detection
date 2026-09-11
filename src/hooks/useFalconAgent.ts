import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTelemetryStore } from '../stores/useTelemetryStore';
import { useAlertsStore } from '../stores/useAlertsStore';
import { useSnapshotStore } from '../stores/useSnapshotStore';
import { useCameraStore } from '../stores/useCameraStore';
import { useUIStore } from '../stores/useUIStore';
import {
  FalconNormalizedContext,
  AgentResponse,
  AgentMessage,
  AgentStatus,
  QuickActionId,
} from '../types/agent';
import {
  generateSituationBriefing,
  answerOperatorQuestion,
  computeContextDelta,
  extractMetricsSummary,
} from '../services/agentService';

export function useFalconAgent() {
  // 1. Subscribe to existing Zustand stores
  const telemetry = useTelemetryStore();
  const alertsStore = useAlertsStore();
  const snapshotStore = useSnapshotStore();
  const cameraStore = useCameraStore();
  const uiStore = useUIStore();

  // 2. Local Agent States
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [agentStatus, setAgentStatus] = useState<AgentStatus>('IDLE');
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [currentBriefing, setCurrentBriefing] = useState<AgentResponse | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<'briefing' | 'chat'>('briefing');

  // Track previous context for "What Changed?" analysis
  const prevContextRef = useRef<FalconNormalizedContext | null>(null);
  const lastBriefingTimeRef = useRef<number>(0);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // 3. Derive Normalized Context from all active sources
  const normalizedContext: FalconNormalizedContext = useMemo(() => {
    return {
      currentPage: uiStore.currentPage,
      systemStatus: telemetry.wsStatus === 'CONNECTED' ? 'ONLINE' : telemetry.apiConnected ? 'POLLING' : 'OFFLINE',
      risk: telemetry.risk,
      aiAnalysis: telemetry.aiLatest,
      sensors: telemetry.sensors,
      drone: telemetry.drone,
      weather: telemetry.weather,
      location: telemetry.location,
      alerts: alertsStore.alerts,
      unreadAlertsCount: alertsStore.unreadCount,
      latestSnapshot: snapshotStore.snapshots[0] || null,
      cameraSettings: {
        isLive: cameraStore.isLive,
        sourceType: cameraStore.sourceType,
        zoom: cameraStore.zoom,
        filterMode: cameraStore.filterMode,
        isAnalyzing: cameraStore.isAnalyzing,
      },
      iotPayload: telemetry.iotPayload,
      systemHealth: telemetry.systemHealth,
      wsConnected: telemetry.wsStatus === 'CONNECTED',
      timestamp: telemetry.lastUpdateTimestamp,
    };
  }, [
    uiStore.currentPage,
    telemetry.wsStatus,
    telemetry.apiConnected,
    telemetry.risk,
    telemetry.aiLatest,
    telemetry.sensors,
    telemetry.drone,
    telemetry.weather,
    telemetry.location,
    telemetry.iotPayload,
    telemetry.systemHealth,
    telemetry.lastUpdateTimestamp,
    alertsStore.alerts,
    alertsStore.unreadCount,
    snapshotStore.snapshots,
    cameraStore.isLive,
    cameraStore.sourceType,
    cameraStore.zoom,
    cameraStore.filterMode,
    cameraStore.isAnalyzing,
  ]);

  // Determine Agent Status
  const computedAgentStatus: AgentStatus = useMemo(() => {
    if (cameraStore.isAnalyzing || telemetry.isLoading) {
      return 'ANALYZING';
    }
    if (
      telemetry.risk.score >= 70 ||
      telemetry.risk.level === 'CRITICAL' ||
      telemetry.aiLatest.detected ||
      alertsStore.unreadCount > 0
    ) {
      return 'ALERT';
    }
    return 'READY';
  }, [
    cameraStore.isAnalyzing,
    telemetry.isLoading,
    telemetry.risk.score,
    telemetry.risk.level,
    telemetry.aiLatest.detected,
    alertsStore.unreadCount,
  ]);

  // Keep agent status updated
  useEffect(() => {
    setAgentStatus(computedAgentStatus);
  }, [computedAgentStatus]);

  // 4. Update Situation Briefing on meaningful changes (Debounced)
  const refreshBriefing = useCallback(() => {
    const briefing = generateSituationBriefing(normalizedContext, prevContextRef.current);
    setCurrentBriefing(briefing);
    lastBriefingTimeRef.current = Date.now();
  }, [normalizedContext]);

  // Initial briefing & meaningful change detection
  useEffect(() => {
    const now = Date.now();
    const prev = prevContextRef.current;

    if (!prev) {
      // First boot
      const initial = generateSituationBriefing(normalizedContext, null);
      setCurrentBriefing(initial);
      prevContextRef.current = normalizedContext;
      lastBriefingTimeRef.current = now;
      return;
    }

    // Check if meaningful delta occurred
    const delta = computeContextDelta(normalizedContext, prev);
    const timeSinceLast = now - lastBriefingTimeRef.current;

    // Meaningful delta or 30s elapsed
    if (delta.hasChanged || timeSinceLast > 30000) {
      const updated = generateSituationBriefing(normalizedContext, prev);
      setCurrentBriefing(updated);
      prevContextRef.current = normalizedContext;
      lastBriefingTimeRef.current = now;
    }
  }, [normalizedContext]);

  // 5. Ask Question
  const askQuestion = useCallback(
    (questionText: string) => {
      if (!questionText.trim()) return;

      const userMsg: AgentMessage = {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: questionText,
        timestamp: new Date().toISOString(),
      };

      setAgentStatus('ANALYZING');
      setActiveView('chat');

      // Add user message
      setMessages((prev) => [...prev, userMsg]);

      // Generate response with small realistic thinking delay for natural JARVIS feel
      setTimeout(() => {
        const response = answerOperatorQuestion(
          questionText,
          normalizedContext,
          prevContextRef.current
        );

        const agentMsg: AgentMessage = {
          id: `agent-${Date.now()}`,
          sender: 'agent',
          response,
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, agentMsg]);
        setAgentStatus(computedAgentStatus);
      }, 400);
    },
    [normalizedContext, computedAgentStatus]
  );

  // 6. Quick Action Triggers
  const triggerQuickAction = useCallback(
    (actionId: QuickActionId) => {
      let promptText = '';
      switch (actionId) {
        case 'status':
          promptText = 'What is the current situation?';
          break;
        case 'changed':
          promptText = 'What changed recently?';
          break;
        case 'why_risk':
          promptText = 'Why is the risk at this level?';
          break;
        case 'ai_analysis':
          promptText = 'What has the AI vision model detected?';
          break;
        case 'sensors':
          promptText = 'What is the current sensor status?';
          break;
        case 'drone':
          promptText = 'Where is the drone and what is its status?';
          break;
        case 'alerts':
          promptText = 'Are there any active alerts?';
          break;
        case 'recommendation':
          promptText = 'What is your recommended operational action?';
          break;
      }
      askQuestion(promptText);
    },
    [askQuestion]
  );

  // 7. Web Speech API (Voice Briefing)
  const speakBriefing = useCallback(() => {
    if (!('speechSynthesis' in window)) {
      uiStore.showToast('Voice Unavailable', 'Speech synthesis is not supported in this browser.', 'warning');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!currentBriefing) return;

    window.speechSynthesis.cancel();

    // Construct a concise audio text
    const textToSpeak = `${currentBriefing.summary} ${currentBriefing.riskExplanation || ''} ${
      currentBriefing.recommendation || ''
    }`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    // Pick a clear English voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice =
      voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Victoria'))) ||
      voices.find((v) => v.lang.startsWith('en'));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [currentBriefing, isSpeaking, uiStore]);

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Keyboard shortcut listener (Escape to close, ⌘J / Ctrl+J to toggle)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return {
    isOpen,
    isMinimized,
    agentStatus,
    messages,
    currentBriefing,
    isSpeaking,
    activeView,
    metrics: extractMetricsSummary(normalizedContext),
    normalizedContext,
    toggleOpen: () => setIsOpen((prev) => !prev),
    openAgent: () => {
      setIsOpen(true);
      setIsMinimized(false);
    },
    closeAgent: () => {
      setIsOpen(false);
      stopSpeaking();
    },
    minimizeAgent: () => setIsMinimized((prev) => !prev),
    setActiveView,
    askQuestion,
    triggerQuickAction,
    speakBriefing,
    stopSpeaking,
    refreshBriefing,
    clearChat: () => {
      setMessages([]);
      setActiveView('briefing');
    },
  };
}
