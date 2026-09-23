import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Send,
  Plus,
  Search,
  Trash2,
  Edit2,
  Copy,
  Check,
  Volume2,
  VolumeX,
  RotateCw,
  Paperclip,
  Mic,
  MicOff,
  Sparkles,
  Globe,
  Brain,
  Bot,
  User,
  PanelLeft,
  PanelLeftClose,
  Settings,
  X,
  ChevronDown,
  Terminal,
  Play,
  Share2,
  ThumbsUp,
  ThumbsDown,
  LayoutGrid,
  FolderArchive,
  Workflow,
  Zap,
  MessageSquare,
  Rocket,
  ExternalLink,
} from 'lucide-react';
import { AutomatedWorkflowModal } from './AutomatedWorkflowModal';
import { BrandLogo } from './BrandLogo';
import { useAppTheme } from '../context/ThemeContext';
import { extractFilesFromDeliverable, downloadProjectAsZip, buildRunnableHtml, ProjectFile } from '../utils/zipGenerator';
import { ProjectZipModal } from './ProjectZipModal';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  image?: string;
  mode?: 'standard' | 'deep_thinking' | 'web_search';
  thoughtProcess?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

interface ChatGPTWorkspaceProps {
  language: 'roman-urdu' | 'urdu' | 'english';
  onLanguageChange: (lang: 'roman-urdu' | 'urdu' | 'english') => void;
  onOpenExplorer: () => void;
}

const STORAGE_KEY = 'muhammad_ai_sessions_v2';
const ACTIVE_SESSION_KEY = 'muhammad_ai_active_id_v2';

export const ChatGPTWorkspace: React.FC<ChatGPTWorkspaceProps> = ({
  language,
  onLanguageChange,
  onOpenExplorer,
}) => {
  // Sessions State
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('muhammad_chatgpt_sessions_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load sessions:', e);
    }
    const initialSession: ChatSession = {
      id: 'session-' + Date.now(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return [initialSession];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    const saved = localStorage.getItem(ACTIVE_SESSION_KEY) || localStorage.getItem('muhammad_chatgpt_active_id_v1');
    return saved || (sessions[0]?.id ?? '');
  });

  // UI States
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [sessionSearch, setSessionSearch] = useState<string>('');
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitleInput, setEditTitleInput] = useState<string>('');

  // Mode: standard | deep_thinking | web_search
  const [activeMode, setActiveMode] = useState<'standard' | 'deep_thinking' | 'web_search'>('standard');
  
  // Task Workflow Automation Modal State
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState<boolean>(false);
  
  // Project Deliverable & Google Launch Modal
  const [activeZipModal, setActiveZipModal] = useState<{
    open: boolean;
    files: ProjectFile[];
    projectName: string;
    mode: 'preview' | 'files';
  }>({
    open: false,
    files: [],
    projectName: '',
    mode: 'preview',
  });
  
  const [customInstructions, setCustomInstructions] = useState<string>(() => {
    return localStorage.getItem('muhammad_ai_custom_instructions_v2') || localStorage.getItem('chatgpt_custom_instructions_v1') || '';
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Input States
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Code Sandbox preview
  const [sandboxCode, setSandboxCode] = useState<{ id: string; code: string; lang: string } | null>(null);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const speechRecognitionRef = useRef<any>(null);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  // Save sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
      if (activeSessionId) {
        localStorage.setItem(ACTIVE_SESSION_KEY, activeSessionId);
      }
    } catch (e) {
      console.warn('Failed to save sessions:', e);
    }
  }, [sessions, activeSessionId]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages, isLoading]);

  // Handle textarea auto-resize
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [inputValue]);

  // New Chat Handler
  const handleCreateNewChat = () => {
    const newSession: ChatSession = {
      id: 'session-' + Date.now(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setInputValue('');
    setAttachedImage(null);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  // Delete Chat
  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== id);
      if (filtered.length === 0) {
        const fresh: ChatSession = {
          id: 'session-' + Date.now(),
          title: 'New Chat',
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setActiveSessionId(fresh.id);
        return [fresh];
      }
      if (activeSessionId === id) {
        setActiveSessionId(filtered[0].id);
      }
      return filtered;
    });
  };

  // Rename Chat
  const handleSaveRename = (id: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editTitleInput.trim()) {
      setEditingSessionId(null);
      return;
    }
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: editTitleInput.trim(), updatedAt: new Date().toISOString() } : s))
    );
    setEditingSessionId(null);
  };

  // Voice Input Speech Recognition
  const toggleVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        language === 'roman-urdu'
          ? 'Aapke browser mein voice recognition support nahi hai. Chrome ya Edge istemal karein.'
          : 'Voice recognition is not supported in this browser. Please use Chrome or Edge.'
      );
      return;
    }

    if (isListening) {
      speechRecognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language === 'urdu' ? 'ur-PK' : 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInputValue((prev) => (prev ? prev + ' ' + transcript : transcript));
        }
      };

      recognition.onerror = (err: any) => {
        console.warn('Speech recognition error:', err);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      speechRecognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
    }
  };

  // Image / File Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAttachedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Text to Speech
  const toggleSpeak = (messageId: string, text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (speakingMessageId === messageId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/```[\s\S]*?```/g, '').replace(/[#*_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);

    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setSpeakingMessageId(null);
    };
    utterance.onerror = () => {
      setSpeakingMessageId(null);
    };

    setSpeakingMessageId(messageId);
    window.speechSynthesis.speak(utterance);
  };

  // Copy to clipboard
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Send Message Handler
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if ((!text && !attachedImage) || isLoading) return;

    if (isListening && speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
      setIsListening(false);
    }

    const userMessageId = 'msg-' + Date.now();
    const userMessage: ChatMessage = {
      id: userMessageId,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
      image: attachedImage || undefined,
      mode: activeMode,
    };

    // Update session title on first message
    const isFirstMessage = activeSession.messages.length === 0;
    const autoTitle = text.slice(0, 36) + (text.length > 36 ? '...' : '');

    const updatedMessages = [...activeSession.messages, userMessage];

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSession.id) {
          return {
            ...s,
            title: isFirstMessage ? autoTitle : s.title,
            messages: updatedMessages,
            updatedAt: new Date().toISOString(),
          };
        }
        return s;
      })
    );

    setInputValue('');
    setAttachedImage(null);
    setIsLoading(true);

    try {
      // Conversational reasoning with Muhammad 2000 AI
      const payload = {
        messages: updatedMessages.map((m) => ({
          role: m.role,
          content: m.content,
          image: m.image,
        })),
        mode: activeMode,
        languagePreference: language,
        customSystemInstruction: customInstructions,
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to get response from assistant');
      }

      const assistantMessage: ChatMessage = {
        id: 'msg-asst-' + Date.now(),
        role: 'assistant',
        content: data.reply,
        timestamp: data.timestamp || new Date().toISOString(),
        mode: activeMode,
      };

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === activeSession.id) {
            return {
              ...s,
              messages: [...updatedMessages, assistantMessage],
              updatedAt: new Date().toISOString(),
            };
          }
          return s;
        })
      );
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMessage: ChatMessage = {
        id: 'msg-err-' + Date.now(),
        role: 'assistant',
        content: `**Error:** ${err.message || 'Kuch masla hua, barah-e-karam dobara koshish karein.'}`,
        timestamp: new Date().toISOString(),
        mode: activeMode,
      };

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === activeSession.id) {
            return {
              ...s,
              messages: [...updatedMessages, errorMessage],
              updatedAt: new Date().toISOString(),
            };
          }
          return s;
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Regenerate Response
  const handleRegenerate = async () => {
    if (isLoading || activeSession.messages.length === 0) return;
    const lastUserIdx = [...activeSession.messages]
      .reverse()
      .findIndex((m) => m.role === 'user');

    if (lastUserIdx === -1) return;
    const targetIdx = activeSession.messages.length - 1 - lastUserIdx;
    const messagesToKeep = activeSession.messages.slice(0, targetIdx + 1);

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSession.id) {
          return {
            ...s,
            messages: messagesToKeep,
            updatedAt: new Date().toISOString(),
          };
        }
        return s;
      })
    );

    setIsLoading(true);

    try {
      const payload = {
        messages: messagesToKeep.map((m) => ({
          role: m.role,
          content: m.content,
          image: m.image,
        })),
        mode: activeMode,
        languagePreference: language,
        customSystemInstruction: customInstructions,
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to regenerate response');
      }

      const newAssistantMessage: ChatMessage = {
        id: 'msg-asst-' + Date.now(),
        role: 'assistant',
        content: data.reply,
        timestamp: data.timestamp || new Date().toISOString(),
        mode: activeMode,
      };

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === activeSession.id) {
            return {
              ...s,
              messages: [...messagesToKeep, newAssistantMessage],
              updatedAt: new Date().toISOString(),
            };
          }
          return s;
        })
      );
    } catch (err: any) {
      console.error('Regenerate error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(sessionSearch.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-60px)] w-full overflow-hidden bg-slate-950 text-slate-100 antialiased">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*,.txt,.pdf,.py,.js,.html,.css,.json"
        className="hidden"
      />

      {/* Mobile Backdrop for Sidebar */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/75 backdrop-blur-xs sm:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* LEFT SIDEBAR (ChatGPT style) */}
      <aside
        className={`${
          isSidebarOpen ? 'w-64 sm:w-72 fixed inset-y-0 left-0 sm:relative sm:inset-auto z-40 sm:z-20' : 'w-0 -translate-x-full'
        } transition-all duration-300 ease-in-out flex flex-col border-r border-slate-800/80 bg-slate-900/95 backdrop-blur-md shrink-0 overflow-hidden select-none`}
      >
        {/* New Chat Button & Search */}
        <div className="p-3 border-b border-slate-800/80 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCreateNewChat}
              className="flex-1 flex items-center justify-between rounded-xl bg-indigo-600/90 hover:bg-indigo-600 px-3.5 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span>
                  {language === 'roman-urdu'
                    ? 'Nayi Chat'
                    : language === 'urdu'
                    ? 'نئی چیٹ'
                    : 'New chat'}
                </span>
              </div>
              <span className="text-[10px] bg-indigo-700/60 px-1.5 py-0.5 rounded font-mono">
                +
              </span>
            </button>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="sm:hidden p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              title="Close sidebar"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </div>

          {/* Search Chats */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              value={sessionSearch}
              onChange={(e) => setSessionSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full rounded-lg border border-slate-800 bg-slate-950/60 py-1.5 pl-8 pr-3 text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
          <div className="px-2 py-1 text-[11px] font-medium tracking-wider text-slate-500 uppercase">
            Recent Chats
          </div>

          {filteredSessions.map((session) => {
            const isActive = session.id === activeSession.id;
            return (
              <div
                key={session.id}
                onClick={() => {
                  setActiveSessionId(session.id);
                  if (window.innerWidth < 768) setIsSidebarOpen(false);
                }}
                className={`group relative flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                {editingSessionId === session.id ? (
                  <form
                    onSubmit={(e) => handleSaveRename(session.id, e)}
                    className="flex-1 mr-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="text"
                      value={editTitleInput}
                      onChange={(e) => setEditTitleInput(e.target.value)}
                      onBlur={() => handleSaveRename(session.id)}
                      autoFocus
                      className="w-full bg-slate-950 px-2 py-0.5 rounded text-xs text-white border border-indigo-500 outline-none"
                    />
                  </form>
                ) : (
                  <span className="truncate flex-1 pr-2">{session.title}</span>
                )}

                {/* Quick action buttons on hover */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingSessionId(session.id);
                      setEditTitleInput(session.title);
                    }}
                    className="p-1 rounded text-slate-400 hover:text-indigo-400 hover:bg-slate-700/60"
                    title="Rename chat"
                  >
                    <Edit2 className="h-3 w-3" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteSession(session.id, e)}
                    className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-700/60"
                    title="Delete chat"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Sidebar: 2,000 Agents Connected Status & Settings */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 flex flex-col gap-2">
          {/* Link to 2,000 Agents Directory */}
          <button
            onClick={onOpenExplorer}
            className="flex items-center justify-between w-full rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-2 text-xs font-medium text-slate-300 hover:border-slate-700 hover:text-white transition-colors"
          >
            <div className="flex items-center gap-2">
              <LayoutGrid className="h-3.5 w-3.5 text-indigo-400" />
              <span>2,000 AI Agents</span>
            </div>
            <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-mono text-emerald-400">
              Active
            </span>
          </button>

          {/* User / Settings Bar */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-xs">
                M
              </div>
              <div>
                <div className="text-xs font-semibold text-white">Muhammad 2000 AI</div>
                <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                  Creative AI & Media Studio
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Custom Instructions & Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CHAT & STUDIO AREA */}
      <main className="flex-1 flex flex-col relative h-full overflow-hidden bg-slate-950">
        {/* Top Chat Bar: Toggle Sidebar, Studio Switcher & Model Pill */}
        <div className="h-14 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              title={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            >
              {isSidebarOpen ? (
                <PanelLeftClose className="h-4 w-4" />
              ) : (
                <PanelLeft className="h-4 w-4" />
              )}
            </button>

            {/* Pipeline Wizard Action Button (Opens modal with Pipeline Wizard + Workflow Canvas) */}
            <button
              id="btn-open-workflow-modal"
              onClick={() => setIsWorkflowModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-indigo-500/40 bg-indigo-500/15 hover:bg-indigo-500/25 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-indigo-300 shadow-sm transition-all group shrink-0"
              title="2,000 AI Agent Task Automation & Pipeline Wizard"
            >
              <Zap className="h-3.5 w-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
              <span className="hidden xs:inline sm:inline">Pipeline Wizard & Canvas</span>
              <span className="xs:hidden sm:hidden">Pipeline</span>
              <span className="rounded bg-indigo-500/30 px-1.5 py-0.5 text-[9px] font-mono text-indigo-200">
                2,000 AI Agent
              </span>
            </button>

            {/* Single Box Language Selector (Shifted next to Pipeline box where Plus box was) */}
            <div
              id="box-mobile-language-selector"
              className="flex items-center rounded-xl border border-slate-800 bg-slate-900/95 px-2 py-1 text-xs shadow-sm hover:border-slate-700 transition-all shrink-0"
              title="Change Language (زبان تبدیل کریں)"
            >
              <Globe className="h-3.5 w-3.5 text-indigo-400 mr-1.5 shrink-0" />
              <select
                id="select-language-dropdown"
                value={language}
                onChange={(e) => onLanguageChange(e.target.value as any)}
                aria-label="Change Language"
                className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none cursor-pointer pr-1"
              >
                <option value="roman-urdu" className="bg-slate-950 text-slate-100">
                  Roman Urdu
                </option>
                <option value="urdu" className="bg-slate-950 text-slate-100">
                  اردو (Urdu)
                </option>
                <option value="english" className="bg-slate-950 text-slate-100">
                  English (EN)
                </option>
              </select>
            </div>

            {/* Model & Capability Pill */}
            <div className="hidden md:flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900/80 p-0.5 text-xs font-medium">
              <button
                onClick={() => setActiveMode('standard')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 transition-all ${
                  activeMode === 'standard'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Direct intelligent conversational model"
              >
                <Sparkles className="h-3 w-3" />
                <span>Standard</span>
              </button>

              <button
                onClick={() => setActiveMode('deep_thinking')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 transition-all ${
                  activeMode === 'deep_thinking'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="2,000 Agents Community Deep Reasoning"
              >
                <Brain className="h-3 w-3" />
                <span>Deep Think</span>
              </button>

              <button
                onClick={() => setActiveMode('web_search')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 transition-all ${
                  activeMode === 'web_search'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Search the live web for up-to-date answers"
              >
                <Globe className="h-3 w-3" />
                <span>Web Search</span>
              </button>
            </div>
          </div>

          {/* Right Header: New Chat Button */}
          <div className="flex items-center gap-2">
            <button
              id="btn-header-new-chat"
              onClick={handleCreateNewChat}
              className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/90 hover:bg-slate-800 hover:border-slate-700 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white shadow-sm transition-all"
              title="Start New Chat"
            >
              <Plus className="h-3.5 w-3.5 text-indigo-400" />
              <span className="hidden sm:inline">New Chat</span>
            </button>
          </div>
        </div>

        {/* SINGLE CHAT VIEW */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* MESSAGE STREAM */}
          <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5 sm:space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
          {activeSession.messages.length === 0 ? (
            /* Empty State: ChatGPT Signature Greeting & Suggestions */
            <div className="max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
              <div className="mb-4">
                <BrandLogo size="hero" showText={false} />
              </div>

              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2">
                {language === 'roman-urdu'
                  ? 'Aap aaj kya poochna ya karna chahte hain?'
                  : language === 'urdu'
                  ? 'آپ آج کیا پوچھنا یا کرنا چاہتے ہیں؟'
                  : 'What can I help you with today?'}
              </h2>

              <p className="text-sm text-slate-400 max-w-md mb-8">
                {language === 'roman-urdu'
                  ? 'Main Muhammad 2000 AI hoon. 2,000 Autonomous AI Agents ke sath har qism ke complex tasks, code development, business strategy aur workflows ko automate karein.'
                  : language === 'urdu'
                  ? 'محمد 2000 اے آئی: 2000 خودکار ایجنٹس کی طاقت سے اپنے پیچیدہ کام، کوڈنگ اور بزنس ورک فلو خودکار کروائیں۔'
                  : 'Muhammad 2000 AI - Advanced 2,000 AI Agent reasoning, code development, and autonomous workflow automation.'}
              </p>

              {/* Task Automation Workflow Quick Launcher Banner */}
              <div className="w-full max-w-xl mb-6">
                <button
                  type="button"
                  id="btn-hero-launch-workflow"
                  onClick={() => setIsWorkflowModalOpen(true)}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-indigo-500/40 bg-gradient-to-r from-indigo-950/70 via-slate-900 to-sky-950/60 hover:border-indigo-400 hover:from-indigo-900/80 transition-all shadow-lg shadow-indigo-600/10 group"
                >
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 group-hover:scale-105 transition-transform">
                      <Workflow className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white group-hover:text-indigo-200 transition-colors">
                          Automate Any Task with 2,000 AI Agents
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          ورک فلو
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Autonomous multi-stage pipeline: agents plan, code, audit, and consolidate your deliverables.
                      </p>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-1 text-xs font-medium text-indigo-400 group-hover:translate-x-1 transition-transform pr-2">
                    <span>Launch</span>
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                </button>
              </div>

              {/* Suggestion Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full text-left">
                {/* Workflow Card */}
                <button
                  onClick={() => setIsWorkflowModalOpen(true)}
                  className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-3.5 hover:border-indigo-400 hover:bg-indigo-900/30 transition-all text-xs group"
                >
                  <div className="font-semibold text-indigo-300 group-hover:text-indigo-200 mb-1 flex items-center gap-1.5">
                    ⚡ <span>Autonomous Task Workflow</span>
                  </div>
                  <div className="text-slate-300 line-clamp-2">
                    2,000 AI Agents se apna complete project ya complex task automate karwayein.
                  </div>
                </button>

                <button
                  onClick={() =>
                    handleSendMessage(
                      language === 'roman-urdu'
                        ? 'Pakistan me digital marketing ya online business shuru karne ke liye 5 smart ideas aur steps batao.'
                        : 'Give me 5 creative business ideas to launch in Pakistan with actionable steps.'
                    )
                  }
                  className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3.5 hover:border-indigo-500/40 hover:bg-slate-900/90 transition-all text-xs group"
                >
                  <div className="font-semibold text-slate-200 group-hover:text-indigo-300 mb-1 flex items-center gap-1.5">
                    💡 <span>Business & Brainstorming</span>
                  </div>
                  <div className="text-slate-400 line-clamp-2">
                    Pakistan me online business shuru karne ke 5 smart ideas aur roadmap.
                  </div>
                </button>

                <button
                  onClick={() =>
                    handleSendMessage(
                      language === 'roman-urdu'
                        ? 'Office ke boss ko formal sick leave ya remote work request email Roman Urdu aur English dono me likho.'
                        : 'Write a professional email requesting leave or remote work.'
                    )
                  }
                  className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3.5 hover:border-indigo-500/40 hover:bg-slate-900/90 transition-all text-xs group"
                >
                  <div className="font-semibold text-slate-200 group-hover:text-indigo-300 mb-1 flex items-center gap-1.5">
                    ✍️ <span>Writing & Emails</span>
                  </div>
                  <div className="text-slate-400 line-clamp-2">
                    Professional leave application ya official email drafting.
                  </div>
                </button>

                <button
                  onClick={() =>
                    handleSendMessage(
                      language === 'roman-urdu'
                        ? 'Theory of Relativity aur Quantum Physics ka farq aam zaban me asaan misalon ke sath samjhao.'
                        : 'Explain the difference between General Relativity and Quantum Mechanics simply.'
                    )
                  }
                  className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3.5 hover:border-indigo-500/40 hover:bg-slate-900/90 transition-all text-xs group"
                >
                  <div className="font-semibold text-slate-200 group-hover:text-indigo-300 mb-1 flex items-center gap-1.5">
                    🧮 <span>Concept & Education</span>
                  </div>
                  <div className="text-slate-400 line-clamp-2">
                    Physics aur complex topics ko bilkul asaan alfaz me samjhein.
                  </div>
                </button>

                <button
                  onClick={() =>
                    handleSendMessage(
                      language === 'roman-urdu'
                        ? 'Ek complete Python program likho jo list me se duplicates remove kare aur clean output print kare.'
                        : 'Write a clean Python script to remove duplicates from a list with tests.'
                    )
                  }
                  className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3.5 hover:border-indigo-500/40 hover:bg-slate-900/90 transition-all text-xs group"
                >
                  <div className="font-semibold text-slate-200 group-hover:text-indigo-300 mb-1 flex items-center gap-1.5">
                    💻 <span>Code & Programming</span>
                  </div>
                  <div className="text-slate-400 line-clamp-2">
                    Python, React, JavaScript ya kisi bhi language ka complete code.
                  </div>
                </button>
              </div>
            </div>
          ) : (
            /* Active Messages List */
            <div className="max-w-3xl mx-auto space-y-6">
              {activeSession.messages.map((message) => {
                const isUser = message.role === 'user';
                return (
                  <div
                    key={message.id}
                    className={`flex items-start gap-3 sm:gap-4 ${
                      isUser ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold shadow-md ${
                        isUser
                          ? 'bg-slate-700 text-white'
                          : 'bg-gradient-to-br from-indigo-500 to-indigo-700 text-white'
                      }`}
                    >
                      {isUser ? <User className="h-4 w-4" /> : <Bot className="h-5 w-5" />}
                    </div>

                    {/* Content Box */}
                    <div
                      className={`flex flex-col max-w-[85%] sm:max-w-[82%] ${
                        isUser ? 'items-end' : 'items-start'
                      }`}
                    >
                      {/* Attached Image Preview if User sent an image */}
                      {message.image && (
                        <div className="mb-2 rounded-xl overflow-hidden border border-slate-800 max-w-xs shadow-md">
                          <img
                            src={message.image}
                            alt="Uploaded attachment"
                            className="max-h-56 w-auto object-cover"
                          />
                        </div>
                      )}

                      {/* Bubble */}
                      <div
                        className={`rounded-2xl px-4 py-3 text-sm shadow-sm leading-relaxed ${
                          isUser
                            ? 'bg-indigo-600 text-white rounded-tr-sm'
                            : 'bg-slate-900/90 text-slate-100 border border-slate-800/80 rounded-tl-sm w-full'
                        }`}
                      >
                        {isUser ? (
                          <div className="whitespace-pre-wrap">{message.content}</div>
                        ) : (
                          <div>
                            {/* Deep thinking badge if applicable */}
                            {message.mode === 'deep_thinking' && (
                              <div className="mb-3 flex items-center gap-1.5 text-xs text-purple-400 bg-purple-950/40 border border-purple-800/40 px-2.5 py-1 rounded-lg w-fit">
                                <Brain className="h-3.5 w-3.5" />
                                <span>2,000 Agents Community Deep Thought</span>
                              </div>
                            )}

                            {/* Web search badge if applicable */}
                            {message.mode === 'web_search' && (
                              <div className="mb-3 flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1 rounded-lg w-fit">
                                <Globe className="h-3.5 w-3.5" />
                                <span>Web Grounded Verification</span>
                              </div>
                            )}

                            {/* Markdown Renderer with custom code blocks */}
                            <div className="chat-markdown">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  code({ node, inline, className, children, ...props }: any) {
                                    const match = /language-(\w+)/.exec(className || '');
                                    const codeText = String(children).replace(/\n$/, '');

                                    if (!inline && match) {
                                      const langName = match[1];
                                      return (
                                        <div className="my-3 rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-md">
                                          {/* Code Block Header */}
                                          <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-3.5 py-1.5 text-xs text-slate-400">
                                            <span className="font-mono text-[11px] uppercase tracking-wider text-indigo-400">
                                              {langName}
                                            </span>
                                            <div className="flex items-center gap-2">
                                              <button
                                                onClick={() => {
                                                  const extracted = extractFilesFromDeliverable(message.content, activeSession.title || 'chatgpt_project');
                                                  setActiveZipModal({
                                                    open: true,
                                                    files: extracted.files,
                                                    projectName: extracted.projectName,
                                                    mode: 'preview',
                                                  });
                                                }}
                                                className="flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 transition-colors font-medium"
                                                title="Launch live web app directly in browser preview"
                                              >
                                                <Rocket className="h-3 w-3" />
                                                <span>Launch Live</span>
                                              </button>

                                              <button
                                                onClick={() => {
                                                  const extracted = extractFilesFromDeliverable(message.content, activeSession.title || 'chatgpt_project');
                                                  setActiveZipModal({
                                                    open: true,
                                                    files: extracted.files,
                                                    projectName: extracted.projectName,
                                                    mode: 'files',
                                                  });
                                                }}
                                                className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
                                                title="Inspect Files & Download Project ZIP"
                                              >
                                                <FolderArchive className="h-3 w-3" />
                                                <span>Direct ZIP</span>
                                              </button>

                                              <button
                                                onClick={() =>
                                                  handleCopy(codeText, `code-${message.id}-${langName}`)
                                                }
                                                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors"
                                              >
                                                {copiedId === `code-${message.id}-${langName}` ? (
                                                  <>
                                                    <Check className="h-3 w-3 text-emerald-400" />
                                                    <span className="text-emerald-400">Copied</span>
                                                  </>
                                                ) : (
                                                  <>
                                                    <Copy className="h-3 w-3" />
                                                    <span>Copy code</span>
                                                  </>
                                                )}
                                              </button>
                                            </div>
                                          </div>
                                          {/* Code Body */}
                                          <pre className="overflow-x-auto p-3.5 font-mono text-xs text-slate-200 leading-relaxed scrollbar-thin scrollbar-thumb-slate-800">
                                            <code>{codeText}</code>
                                          </pre>
                                        </div>
                                      );
                                    }
                                    return (
                                      <code
                                        className="rounded bg-slate-800/80 px-1.5 py-0.5 font-mono text-[12px] text-indigo-300"
                                        {...props}
                                      >
                                        {children}
                                      </code>
                                    );
                                  },
                                }}
                              >
                                {message.content}
                              </ReactMarkdown>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Bar below assistant message */}
                      {!isUser && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                          {/* Copy */}
                          <button
                            onClick={() => handleCopy(message.content, message.id)}
                            className="flex items-center gap-1 rounded px-2 py-1 hover:bg-slate-800 hover:text-white transition-colors"
                            title="Copy message"
                          >
                            {copiedId === message.id ? (
                              <>
                                <Check className="h-3.5 w-3.5 text-emerald-400" />
                                <span className="text-emerald-400 text-[11px]">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5" />
                                <span className="text-[11px]">Copy</span>
                              </>
                            )}
                          </button>

                          {/* Speak / TTS */}
                          <button
                            onClick={() => toggleSpeak(message.id, message.content)}
                            className="flex items-center gap-1 rounded px-2 py-1 hover:bg-slate-800 hover:text-white transition-colors"
                            title={speakingMessageId === message.id ? 'Stop speaking' : 'Read aloud'}
                          >
                            {speakingMessageId === message.id ? (
                              <>
                                <VolumeX className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
                                <span className="text-[11px] text-indigo-400">Speaking...</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="h-3.5 w-3.5" />
                                <span className="text-[11px]">Read</span>
                              </>
                            )}
                          </button>

                          {/* Direct Launch in Google & ZIP Package Buttons if message contains code */}
                          {message.content.includes('```') && (
                            <div className="flex items-center gap-1.5">
                              <button
                                id={`btn-launch-google-${message.id}`}
                                onClick={() => {
                                  const extracted = extractFilesFromDeliverable(message.content, activeSession.title || 'chatgpt_project');
                                  setActiveZipModal({
                                    open: true,
                                    files: extracted.files,
                                    projectName: extracted.projectName,
                                    mode: 'preview',
                                  });
                                }}
                                className="flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-gradient-to-r from-emerald-950/60 to-teal-950/60 px-2.5 py-1 text-emerald-300 hover:text-white hover:border-emerald-500 transition-colors font-medium shadow-sm"
                                title="Direct Launch on Google Chrome / Browser Sandbox"
                              >
                                <Rocket className="h-3.5 w-3.5 text-emerald-400" />
                                <span className="text-[11px]">Launch in Google</span>
                              </button>

                              <button
                                onClick={() => {
                                  const extracted = extractFilesFromDeliverable(message.content, activeSession.title || 'chatgpt_project');
                                  setActiveZipModal({
                                    open: true,
                                    files: extracted.files,
                                    projectName: extracted.projectName,
                                    mode: 'files',
                                  });
                                }}
                                className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/80 px-2 py-1 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                                title="Inspect all project files & download complete ZIP"
                              >
                                <FolderArchive className="h-3.5 w-3.5 text-slate-400" />
                                <span className="text-[11px] font-medium">Files / ZIP</span>
                              </button>
                            </div>
                          )}

                          {/* Regenerate (if last message) */}
                          {message.id ===
                            activeSession.messages[activeSession.messages.length - 1]?.id && (
                            <button
                              onClick={handleRegenerate}
                              className="flex items-center gap-1 rounded px-2 py-1 hover:bg-slate-800 hover:text-white transition-colors"
                              title="Regenerate response"
                            >
                              <RotateCw className="h-3.5 w-3.5" />
                              <span className="text-[11px]">Regenerate</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-md">
                    <Bot className="h-5 w-5 animate-pulse" />
                  </div>
                  <div className="rounded-2xl border border-slate-800/80 bg-slate-900/90 px-4 py-3 text-sm text-slate-300 rounded-tl-sm flex items-center gap-2">
                    <span className="inline-flex gap-1 items-center">
                      <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce"></span>
                      <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]"></span>
                      <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]"></span>
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {activeMode === 'deep_thinking'
                        ? 'Thinking deeply through 2,000 agents network...'
                        : activeMode === 'web_search'
                        ? 'Searching the web for latest verified info...'
                        : 'Generating response...'}
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* BOTTOM INPUT DOCK (ChatGPT signature style) */}
        <div className="p-3 sm:p-5 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent shrink-0">
          <div className="max-w-3xl mx-auto flex flex-col gap-2">
            {/* Attachment Preview Chip */}
            {attachedImage && (
              <div className="flex items-center gap-2 p-1.5 pl-2.5 bg-slate-900 border border-slate-800 rounded-xl w-fit shadow-md">
                <img
                  src={attachedImage}
                  alt="Attachment"
                  className="h-8 w-8 rounded-lg object-cover"
                />
                <span className="text-xs text-slate-300">Image attached</span>
                <button
                  onClick={() => setAttachedImage(null)}
                  className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Input Capsule */}
            <div className="relative flex flex-col rounded-2xl border border-slate-800 bg-slate-900/90 p-2 sm:p-3 shadow-2xl focus-within:border-indigo-500/70 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all">
              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                rows={1}
                placeholder={
                  language === 'roman-urdu'
                    ? 'Muhammad 2000 AI se kuch bhi poochein... (Shift+Enter for new line)'
                    : language === 'urdu'
                    ? 'مجھ سے کچھ بھی پوچھیں... (Shift+Enter نئی لائن کے لیے)'
                    : 'Ask Muhammad 2000 AI anything... (Shift+Enter for new line)'
                }
                className="w-full resize-none bg-transparent px-2 py-1 text-base sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none max-h-48 scrollbar-thin scrollbar-thumb-slate-700"
              />

              {/* Bottom Controls Bar */}
              <div className="flex items-center justify-between pt-2 px-1 gap-2">
                {/* Left: Tools (Attach, Voice, Deep Think, Web Search) */}
                <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto scrollbar-none py-0.5">
                  {/* File / Image Attach */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
                    title="Attach image or document"
                  >
                    <Paperclip className="h-4 w-4" />
                  </button>

                  {/* Voice Microphone */}
                  <button
                    onClick={toggleVoiceInput}
                    className={`p-1.5 rounded-lg transition-all shrink-0 ${
                      isListening
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                    title={isListening ? 'Stop listening' : 'Voice input (Dictation)'}
                  >
                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </button>

                  {/* Deep Think Toggle Button */}
                  <button
                    onClick={() =>
                      setActiveMode(activeMode === 'deep_thinking' ? 'standard' : 'deep_thinking')
                    }
                    className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition-all shrink-0 ${
                      activeMode === 'deep_thinking'
                        ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                    title="Deep Think mode"
                  >
                    <Brain className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Deep Think</span>
                  </button>

                  {/* Web Search Toggle Button */}
                  <button
                    onClick={() =>
                      setActiveMode(activeMode === 'web_search' ? 'standard' : 'web_search')
                    }
                    className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition-all shrink-0 ${
                      activeMode === 'web_search'
                        ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                    title="Web Search mode"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Search</span>
                  </button>

                  {/* Automate Task Workflow Shortcut */}
                  <button
                    type="button"
                    onClick={() => setIsWorkflowModalOpen(true)}
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-indigo-300 hover:bg-indigo-500/15 hover:text-indigo-200 border border-indigo-500/30 transition-all shadow-sm shrink-0"
                    title="Automate Task with 2,000 AI Agents Pipeline Wizard"
                  >
                    <Workflow className="h-3.5 w-3.5 text-indigo-400" />
                    <span className="hidden sm:inline">Automate</span>
                    <span className="rounded bg-indigo-500/20 px-1 py-0.2 text-[9px] font-mono text-indigo-300">
                      2000 AI Agent
                    </span>
                  </button>
                </div>

                {/* Right: Send Button */}
                <button
                  onClick={() => handleSendMessage()}
                  disabled={isLoading || (!inputValue.trim() && !attachedImage)}
                  className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all shrink-0 ${
                    isLoading || (!inputValue.trim() && !attachedImage)
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/30 active:scale-95'
                  }`}
                  title="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Disclaimer note */}
            <div className="text-center text-[11px] text-slate-500">
              Muhammad 2000 AI can make mistakes. Verify critical facts and information.
            </div>
          </div>
        </div>
      </div>
    </main>

      {/* SETTINGS MODAL */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">
                  Muhammad AI Custom Instructions & Studio Settings
                </h3>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  What would you like Muhammad 2000 AI to know about you to provide better responses?
                </label>
                <textarea
                  value={customInstructions}
                  onChange={(e) => {
                    setCustomInstructions(e.target.value);
                    localStorage.setItem('chatgpt_custom_instructions_v1', e.target.value);
                  }}
                  rows={4}
                  placeholder="e.g. I am a software engineer in Pakistan. I prefer answers in Roman Urdu with clear bullet points..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Default Language Preference
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['roman-urdu', 'urdu', 'english'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => onLanguageChange(lang)}
                      className={`py-2 px-3 rounded-lg border text-xs font-medium capitalize transition-all ${
                        language === lang
                          ? 'border-indigo-500 bg-indigo-600/20 text-indigo-300'
                          : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {lang === 'roman-urdu' ? 'Roman Urdu' : lang === 'urdu' ? 'اردو' : 'English'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to clear all conversation history?')) {
                      localStorage.removeItem(STORAGE_KEY);
                      const fresh: ChatSession = {
                        id: 'session-' + Date.now(),
                        title: 'New Chat',
                        messages: [],
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                      };
                      setSessions([fresh]);
                      setActiveSessionId(fresh.id);
                      setIsSettingsOpen(false);
                    }
                  }}
                  className="text-rose-400 hover:underline"
                >
                  Clear all chat history
                </button>

                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2,000 AI AGENT AUTONOMOUS WORKFLOW MODAL */}
      <AutomatedWorkflowModal
        isOpen={isWorkflowModalOpen}
        onClose={() => setIsWorkflowModalOpen(false)}
        languagePreference={language}
        onLanguageChange={onLanguageChange}
      />

      {/* Project Deliverable & Google Launch Modal */}
      <ProjectZipModal
        isOpen={activeZipModal.open}
        onClose={() => setActiveZipModal((prev) => ({ ...prev, open: false }))}
        projectName={activeZipModal.projectName || activeSession.title || 'project'}
        files={activeZipModal.files}
        language={language}
        initialMode={activeZipModal.mode}
      />
    </div>
  );
};
