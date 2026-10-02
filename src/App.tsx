import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { ChatGPTWorkspace } from './components/ChatGPTWorkspace';
import { HiveMindWorkspace } from './components/HiveMindWorkspace';
import { DomainNavigator } from './components/DomainNavigator';
import { AgentCard } from './components/AgentCard';
import { TaskExecutionModal } from './components/TaskExecutionModal';
import { SwarmModal } from './components/SwarmModal';
import { SmartAutoDispatcher } from './components/SmartAutoDispatcher';
import { TaskHistoryDrawer } from './components/TaskHistoryDrawer';
import { AgentCustomizerModal } from './components/AgentCustomizerModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { VoiceAssistantHub } from './components/VoiceAssistantHub';
import { FuturisticAgentOffice } from './components/FuturisticAgentOffice';
import { Agent, TaskExecution } from './types';
import { searchAgentFleet, getAgentByNumber } from './data/agentFleet';
import { loadTaskHistory, saveTaskHistory } from './utils/storage';
import { Search, Sparkles, Layers, X, ChevronDown, Check, ArrowRight, Mic } from 'lucide-react';
import { ThemeProvider, useAppTheme } from './context/ThemeContext';

function AppContent() {
  const { themeConfig, mode } = useAppTheme();
  const [language, setLanguage] = useState<'roman-urdu' | 'urdu' | 'english'>('roman-urdu');
  const [activeTab, setActiveTab] = useState<'chat' | 'workspace' | 'directory'>('chat');

  // Directory filter state
  const [selectedDomainId, setSelectedDomainId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [visibleLimit, setVisibleLimit] = useState<number>(36);

  // Swarm & Execution state
  const [swarmAgents, setSwarmAgents] = useState<Agent[]>([]);
  const [taskHistory, setTaskHistory] = useState<TaskExecution[]>(() => loadTaskHistory());

  // Modals state
  const [selectedAgentForTask, setSelectedAgentForTask] = useState<Agent | null>(null);
  const [customizingAgent, setCustomizingAgent] = useState<Agent | null>(null);
  const [isSwarmModalOpen, setIsSwarmModalOpen] = useState<boolean>(false);
  const [isAutoDispatcherOpen, setIsAutoDispatcherOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState<boolean>(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState<boolean>(false);
  const [isFloatingVoiceVisible, setIsFloatingVoiceVisible] = useState<boolean>(() => {
    try {
      return localStorage.getItem('hide_floating_voice_orb_v1') !== 'true';
    } catch {
      return true;
    }
  });

  // Listen to TTS speaking events for live global visualizer
  useEffect(() => {
    const handleStart = () => setIsAiSpeaking(true);
    const handleEnd = () => setIsAiSpeaking(false);
    window.addEventListener('ai-speaking-start', handleStart);
    window.addEventListener('ai-speaking-end', handleEnd);
    return () => {
      window.removeEventListener('ai-speaking-start', handleStart);
      window.removeEventListener('ai-speaking-end', handleEnd);
    };
  }, []);

  // Voice execution handlers
  const handleExecutePromptInChat = (prompt: string, options?: { autoSpeak?: boolean }) => {
    setActiveTab('chat');
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent('execute-chat-prompt', {
          detail: { prompt, autoSpeak: options?.autoSpeak },
        })
      );
    }, 120);
  };

  const handleNewChatSession = () => {
    setActiveTab('chat');
    window.dispatchEvent(new CustomEvent('new-chat-session'));
  };

  const handleClearCurrentChat = () => {
    window.dispatchEvent(new CustomEvent('clear-chat-session'));
  };

  const handleReadLatestReply = () => {
    window.dispatchEvent(new CustomEvent('read-latest-reply'));
  };

  const handleSearchAgentsFromVoice = (query: string) => {
    setSearchQuery(query);
    setActiveTab('directory');
  };

  // Sync task history to localStorage
  useEffect(() => {
    saveTaskHistory(taskHistory);
  }, [taskHistory]);

  // Filtered agents list based on domain & query
  const filteredAgents = useMemo(() => {
    return searchAgentFleet(searchQuery, selectedDomainId, 2000);
  }, [searchQuery, selectedDomainId]);

  const displayedAgents = useMemo(() => {
    return filteredAgents.slice(0, visibleLimit);
  }, [filteredAgents, visibleLimit]);

  // Reset pagination when filter changes
  useEffect(() => {
    setVisibleLimit(36);
  }, [selectedDomainId, searchQuery]);

  const handleToggleSwarm = (agent: Agent) => {
    setSwarmAgents((prev) => {
      const exists = prev.some((a) => a.id === agent.id);
      if (exists) {
        return prev.filter((a) => a.id !== agent.id);
      }
      if (prev.length >= 5) {
        alert(
          language === 'roman-urdu'
            ? 'Ek swarm mein maximum 5 agents shamil kiye ja sakte hain.'
            : language === 'urdu'
            ? 'ایک سوارم میں زیادہ سے زیادہ ۵ ایجنٹس شامل کیے جا سکتے ہیں۔'
            : 'You can add up to 5 agents in a collaborative swarm.'
        );
        return prev;
      }
      return [...prev, agent];
    });
  };

  const handleTaskComplete = (task: TaskExecution) => {
    setTaskHistory((prev) => [task, ...prev]);
  };

  const handleSaveCustomPrompt = (agentId: string, updatedPrompt: string) => {
    // In-memory update
    const num = parseInt(agentId.replace(/\D/g, ''), 10);
    if (num) {
      const target = getAgentByNumber(num);
      target.systemPrompt = updatedPrompt;
    }
  };

  return (
    <div className={`min-h-screen ${mode === 'light' ? 'bg-slate-50 text-slate-900' : `${themeConfig.bgClass} text-slate-100`} flex flex-col font-sans transition-colors duration-300`}>
      {/* Top Header */}
      <Header
        activeLanguage={language}
        onLanguageChange={setLanguage}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        swarmCount={swarmAgents.length}
        onOpenSwarm={() => setIsSwarmModalOpen(true)}
        onOpenAutoMatch={() => setIsAutoDispatcherOpen(true)}
        tasksCount={taskHistory.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
        isVoiceAssistantOpen={isVoiceAssistantOpen}
        onToggleVoiceAssistant={() => setIsVoiceAssistantOpen((prev) => !prev)}
      />

      {/* Main Content Area */}
      {activeTab === 'chat' ? (
        <main className="flex-1 flex flex-col w-full h-[calc(100dvh-54px-56px)] md:h-[calc(100vh-54px)] overflow-hidden">
          <ChatGPTWorkspace
            language={language}
            onLanguageChange={setLanguage}
            onOpenExplorer={() => setActiveTab('directory')}
            onOpenVoiceAssistant={() => setIsVoiceAssistantOpen(true)}
          />
        </main>
      ) : activeTab === 'workspace' ? (
        <main className="flex-1 flex flex-col max-w-5xl w-full mx-auto px-3 sm:px-6 pb-20 md:pb-6">
          <HiveMindWorkspace language={language} />
        </main>
      ) : (
        <main className="flex-1 flex flex-col w-full">
          <FuturisticAgentOffice
            language={language}
            swarmAgents={swarmAgents}
            onToggleSwarm={handleToggleSwarm}
            onAssignTask={setSelectedAgentForTask}
            onCustomizeAgent={setCustomizingAgent}
            onOpenAutoMatch={() => setIsAutoDispatcherOpen(true)}
            onOpenSwarmModal={() => setIsSwarmModalOpen(true)}
          />
        </main>
      )}

      {/* Task Execution Modal */}
      {selectedAgentForTask && (
        <TaskExecutionModal
          agent={selectedAgentForTask}
          onClose={() => setSelectedAgentForTask(null)}
          onTaskCompleted={handleTaskComplete}
          language={language}
        />
      )}

      {/* Swarm Modal */}
      {isSwarmModalOpen && (
        <SwarmModal
          swarmAgents={swarmAgents}
          onRemoveAgent={(agentId) =>
            setSwarmAgents((prev) => prev.filter((a) => a.id !== agentId))
          }
          onClearSwarm={() => setSwarmAgents([])}
          onClose={() => setIsSwarmModalOpen(false)}
          language={language}
        />
      )}

      {/* Smart Auto-Dispatcher Modal */}
      {isAutoDispatcherOpen && (
        <SmartAutoDispatcher
          onClose={() => setIsAutoDispatcherOpen(false)}
          onSelectAgent={(agent) => {
            setIsAutoDispatcherOpen(false);
            setSelectedAgentForTask(agent);
          }}
          onLaunchSwarm={(agents) => {
            setIsAutoDispatcherOpen(false);
            setSwarmAgents(agents);
            setIsSwarmModalOpen(true);
          }}
          language={language}
        />
      )}

      {/* Task History Drawer */}
      {isHistoryOpen && (
        <TaskHistoryDrawer
          tasks={taskHistory}
          onClose={() => setIsHistoryOpen(false)}
          onClearHistory={() => setTaskHistory([])}
          onSelectTask={(task) => {
            // Find agent or open task details
            const num = parseInt(task.agentId.replace(/\D/g, ''), 10);
            if (num) {
              const agent = getAgentByNumber(num);
              setSelectedAgentForTask(agent);
            }
          }}
        />
      )}

      {/* Agent Customizer Modal */}
      {customizingAgent && (
        <AgentCustomizerModal
          agent={customizingAgent}
          onClose={() => setCustomizingAgent(null)}
          onSaveCustomPrompt={handleSaveCustomPrompt}
          language={language}
        />
      )}

      {/* Global Interactive Voice Control Hub */}
      <VoiceAssistantHub
        isOpen={isVoiceAssistantOpen}
        onClose={() => setIsVoiceAssistantOpen(false)}
        language={language}
        onLanguageChange={setLanguage}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenAutoMatch={() => setIsAutoDispatcherOpen(true)}
        onOpenSwarm={() => setIsSwarmModalOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onSearchAgents={handleSearchAgentsFromVoice}
        onExecutePromptInChat={handleExecutePromptInChat}
        onNewChatSession={handleNewChatSession}
        onClearCurrentChat={handleClearCurrentChat}
        onReadLatestReply={handleReadLatestReply}
      />

      {/* Floating Quick Voice Control Orb / Trigger */}
      {!isVoiceAssistantOpen && isFloatingVoiceVisible && (
        <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40 flex items-center gap-1.5 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <button
            type="button"
            onClick={() => setIsVoiceAssistantOpen(true)}
            className={`flex items-center gap-2 rounded-2xl p-3 md:px-4 md:py-2.5 text-white shadow-xl transition-all group border cursor-pointer ${
              isAiSpeaking
                ? 'bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 shadow-pink-600/50 ring-4 ring-pink-500/40 border-pink-400/50 animate-pulse'
                : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 shadow-indigo-600/40 hover:scale-105 active:scale-95 border-indigo-400/40'
            }`}
            title={
              isAiSpeaking
                ? 'Speaking live voice answer - Click to open / control'
                : language === 'roman-urdu'
                ? 'Voice Control: Kuch bhi bol kar kahein aur yeh karega'
                : language === 'urdu'
                ? 'آوازی کنٹرول: بول کر حکم دیں'
                : 'Voice Control: Speak any task or command'
            }
          >
            <div className="relative flex items-center justify-center">
              {isAiSpeaking ? (
                /* Dynamic dancing audio bars visualizer */
                <div className="flex items-center gap-0.5 h-4 w-5 justify-center">
                  <span className="w-1 bg-pink-200 rounded-full animate-bounce [animation-delay:-0.3s] h-3.5" />
                  <span className="w-1 bg-cyan-200 rounded-full animate-bounce [animation-delay:-0.15s] h-4.5" />
                  <span className="w-1 bg-purple-200 rounded-full animate-bounce [animation-delay:-0.4s] h-2.5" />
                  <span className="w-1 bg-pink-200 rounded-full animate-bounce h-4" />
                </div>
              ) : (
                <>
                  <Mic className="h-5 w-5 animate-pulse text-white" />
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
                  </span>
                </>
              )}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold leading-tight flex items-center gap-1">
                <span>{isAiSpeaking ? 'Bol Rahi Hoon...' : 'Voice Control'}</span>
                <Sparkles className="h-3 w-3 text-amber-300" />
              </span>
              <span className="text-[10px] text-indigo-200 leading-tight">
                {isAiSpeaking
                  ? 'Live Voice Active 🎙️'
                  : language === 'roman-urdu'
                  ? 'Bol kar command dein'
                  : language === 'urdu'
                  ? 'بول کر حکم دیں'
                  : 'Speak to AI'}
              </span>
            </div>
          </button>

          {/* Dismiss button to remove floating widget completely */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsFloatingVoiceVisible(false);
              try {
                localStorage.setItem('hide_floating_voice_orb_v1', 'true');
              } catch {}
            }}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900/90 text-slate-400 hover:text-white hover:bg-rose-600 transition-all border border-slate-700 shadow-lg cursor-pointer"
            title={
              language === 'roman-urdu'
                ? 'Is floating button ko screen se chupayein / remove karein'
                : 'Dismiss this floating button'
            }
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Mobile Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        language={language}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
