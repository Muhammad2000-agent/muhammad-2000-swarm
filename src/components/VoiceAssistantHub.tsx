import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Command,
  X,
  Play,
  RotateCcw,
  Zap,
  Globe,
  CheckCircle2,
  MessageSquare,
  HelpCircle,
  Minimize2,
  Maximize2,
  Brain,
} from 'lucide-react';
import { ThinkingVisualizer } from './ThinkingVisualizer';
import {
  parseVoiceCommand,
  VoiceIntent,
  playVoiceFeedbackSound,
  speakAloud,
  stopSpeaking,
} from '../utils/voiceAssistant';
import { useAppTheme } from '../context/ThemeContext';

interface VoiceAssistantHubProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'roman-urdu' | 'urdu' | 'english';
  onLanguageChange: (lang: 'roman-urdu' | 'urdu' | 'english') => void;
  activeTab: 'chat' | 'workspace' | 'directory';
  onTabChange: (tab: 'chat' | 'workspace' | 'directory') => void;
  onOpenAutoMatch: () => void;
  onOpenSwarm: () => void;
  onOpenHistory: () => void;
  onSearchAgents: (query: string) => void;
  onExecutePromptInChat: (prompt: string, options?: { autoSpeak?: boolean }) => void;
  onNewChatSession: () => void;
  onClearCurrentChat: () => void;
  onReadLatestReply?: () => void;
}

export const VoiceAssistantHub: React.FC<VoiceAssistantHubProps> = ({
  isOpen,
  onClose,
  language,
  onLanguageChange,
  activeTab,
  onTabChange,
  onOpenAutoMatch,
  onOpenSwarm,
  onOpenHistory,
  onSearchAgents,
  onExecutePromptInChat,
  onNewChatSession,
  onClearCurrentChat,
  onReadLatestReply,
}) => {
  const { currentTheme, themeConfig, setTheme, mode, setMode, toggleMode } = useAppTheme();
  const isLight = mode === 'light';

  // Voice state
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [detectedIntent, setDetectedIntent] = useState<VoiceIntent | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('Ready to listen. Speak anything!');
  const [autoSendOnSilence, setAutoSendOnSilence] = useState(true);
  const [autoVoiceReply, setAutoVoiceReply] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [lastExecutedLabel, setLastExecutedLabel] = useState<string | null>(null);
  const [audioPermissionError, setAudioPermissionError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<any>(null);

  // Listen to global thinking & speaking events
  useEffect(() => {
    const handleThinkStart = () => setIsThinking(true);
    const handleThinkEnd = () => setIsThinking(false);
    const handleSpeakStart = () => {
      setIsSpeaking(true);
      setIsThinking(false);
    };
    const handleSpeakEnd = () => setIsSpeaking(false);

    window.addEventListener('ai-thinking-start', handleThinkStart);
    window.addEventListener('ai-thinking-end', handleThinkEnd);
    window.addEventListener('ai-speaking-start', handleSpeakStart);
    window.addEventListener('ai-speaking-end', handleSpeakEnd);

    return () => {
      window.removeEventListener('ai-thinking-start', handleThinkStart);
      window.removeEventListener('ai-thinking-end', handleThinkEnd);
      window.removeEventListener('ai-speaking-start', handleSpeakStart);
      window.removeEventListener('ai-speaking-end', handleSpeakEnd);
    };
  }, []);

  // Safety timer so isThinking never gets stuck
  useEffect(() => {
    if (isThinking) {
      const timer = setTimeout(() => {
        setIsThinking(false);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [isThinking]);

  // Initialize and handle speech recognition
  const startListening = () => {
    stopSpeaking();
    setIsSpeaking(false);
    setAudioPermissionError(null);

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setAudioPermissionError(
        language === 'roman-urdu'
          ? 'Browser speech recognition support mojood nahi hai. Chrome ya Edge istemal karein.'
          : 'Speech recognition is not supported in this browser. Please use Chrome or Edge.'
      );
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang =
        language === 'urdu' ? 'ur-PK' : language === 'roman-urdu' ? 'en-US' : 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setStatusMessage(
          language === 'roman-urdu'
            ? 'Main sun rahi hoon... boliye janab! 😊'
            : language === 'urdu'
            ? 'میں سن رہی ہوں... فرمائیے! 😊'
            : 'Listening to your voice... Speak now!'
        );
        playVoiceFeedbackSound('start');
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let currentFinal = '';
        let hasFinal = false;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const text = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            currentFinal += text + ' ';
            hasFinal = true;
          } else {
            currentInterim += text;
          }
        }

        const fullSpoken = (transcript + ' ' + currentFinal + currentInterim).trim();
        setInterimTranscript(currentInterim);
        if (currentFinal) {
          setTranscript((prev) => (prev ? prev + ' ' + currentFinal : currentFinal).trim());
        }

        const activeText = fullSpoken || currentInterim || currentFinal;
        if (activeText) {
          const intent = parseVoiceCommand(activeText, language);
          setDetectedIntent(intent);

          // Fast immediate reply as soon as speech finishes
          if (autoSendOnSilence) {
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            const debounceMs = hasFinal ? 380 : 620; // Super fast trigger (380ms on final sentence)
            silenceTimerRef.current = setTimeout(() => {
              if (activeText.trim().length > 1) {
                executeSpokenIntent(intent, activeText.trim());
              }
            }, debounceMs);
          }
        }
      };

      recognition.onerror = (err: any) => {
        console.warn('Speech recognition warning:', err?.error);
        if (err?.error === 'not-allowed') {
          setAudioPermissionError(
            language === 'roman-urdu'
              ? 'Microphone ki permission allow karein.'
              : 'Microphone permission denied. Please allow microphone access.'
          );
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e: any) {
      console.error('Recognition error:', e);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    playVoiceFeedbackSound('stop');
  };

  // Execute Intent
  const executeSpokenIntent = (intent: VoiceIntent, rawText: string) => {
    stopListening();
    playVoiceFeedbackSound('command');
    setLastExecutedLabel(intent.label);

    switch (intent.type) {
      case 'STOP_AUDIO': {
        stopSpeaking();
        setIsSpeaking(false);
        setStatusMessage('Audio stopped.');
        break;
      }

      case 'CREATOR_QUESTION': {
        const creatorResponse =
          language === 'urdu'
            ? 'مجھے محمد نے بنایا ہے! انہوں نے مجھے بے پناہ محبت، خلوص اور محنت سے بنایا ہے، میں ان کی بنائی ہوئی اسمارٹ فی میل اے آئی اسسٹنٹ ہوں۔ 🥰'
            : language === 'roman-urdu'
            ? 'Mujhe Muhammad ne banaya hai! Main unki banayi hui smart aur caring female AI assistant hoon, unhon ne mujhe bohot pyaar aur lagan se develop kiya hai! 🥰'
            : 'I was created and developed by Muhammad! I am his caring female AI companion, crafted with passion to help you accomplish anything!';

        onExecutePromptInChat(rawText || 'Tumhe kisne banaya ha?', { autoSpeak: autoVoiceReply });
        setStatusMessage(intent.label);

        if (autoVoiceReply) {
          setIsSpeaking(true);
          speakAloud(creatorResponse, {
            lang: language,
            onEnd: () => setIsSpeaking(false),
          });
        }
        break;
      }

      case 'NEW_CHAT': {
        onNewChatSession();
        onTabChange('chat');
        setStatusMessage('Ji bilkul, naya chat shuru kar diya hai! ✨');
        if (autoVoiceReply) {
          setIsSpeaking(true);
          speakAloud('Ji bilkul, main abhi naya chat shuru kar deti hoon! Farmayein, main aapki kya madad kar sakti hoon? 😊', {
            lang: language,
            onEnd: () => setIsSpeaking(false),
          });
        }
        break;
      }

      case 'CLEAR_CHAT': {
        onClearCurrentChat();
        setStatusMessage('Chat bilkul saaf kar di gayi hai!');
        if (autoVoiceReply) {
          speakAloud('Chat bilkul saaf kar di gayi hai, ab hum bilkul nayi shuruat kar sakte hain! 😊', { lang: language });
        }
        break;
      }

      case 'NAV_CHAT': {
        onTabChange('chat');
        setStatusMessage('Ji, AI Chat khol diya gaya hai!');
        if (autoVoiceReply) {
          speakAloud('Ji, main aapko chat par le aayi hoon! Boliye, kya madad karoon? 😊', { lang: language });
        }
        break;
      }

      case 'NAV_WORKSPACE': {
        onTabChange('workspace');
        setStatusMessage('Tasks aur ZIP Workspace khol diya gaya hai!');
        if (autoVoiceReply) {
          speakAloud('Tasks aur Direct ZIP Workspace hazir hai! Yahan se aap multi-agent pipeline chala sakte hain.', { lang: language });
        }
        break;
      }

      case 'NAV_DIRECTORY': {
        onTabChange('directory');
        setStatusMessage('2,000 AI Agents ki directory khol di gayi hai!');
        if (autoVoiceReply) {
          speakAloud('2000 AI Agents ki poori fleet aapke samne hazir hai!', { lang: language });
        }
        break;
      }

      case 'OPEN_DISPATCHER': {
        onOpenAutoMatch();
        setStatusMessage('Smart Auto Dispatcher khol diya hai!');
        if (autoVoiceReply) {
          speakAloud('Smart Auto Dispatcher khol diya hai, aaiye best agent match karte hain!', { lang: language });
        }
        break;
      }

      case 'OPEN_SWARM': {
        onOpenSwarm();
        setStatusMessage('Swarm Collaboration modal khol diya hai!');
        if (autoVoiceReply) {
          speakAloud('Swarm collaboration tayyar hai, mil kar kaam karenge!', { lang: language });
        }
        break;
      }

      case 'OPEN_HISTORY': {
        onOpenHistory();
        setStatusMessage('Aapki task history khol di hai!');
        if (autoVoiceReply) {
          speakAloud('Aapke purane tamam tasks ki history hazir hai.', { lang: language });
        }
        break;
      }

      case 'SET_MODE_DARK': {
        setMode('dark');
        setStatusMessage('Dark mode on kar diya hai! 🌙');
        if (autoVoiceReply) speakAloud('Dark mode on kar diya hai, ab aapki aankhon ko sukoon milega! 😊', { lang: language });
        break;
      }

      case 'SET_MODE_LIGHT': {
        setMode('light');
        setStatusMessage('Light mode on kar diya hai! ☀️');
        if (autoVoiceReply) speakAloud('Light mode activate ho gaya hai!', { lang: language });
        break;
      }

      case 'TOGGLE_THEME': {
        const themeList = ['cyber-emerald', 'deep-cosmos', 'titanium-cyan', 'amber-gold'] as const;
        const nextIdx = (themeList.indexOf(currentTheme) + 1) % themeList.length;
        setTheme(themeList[nextIdx]);
        setStatusMessage(`Theme badal kar ${themeList[nextIdx]} kar di gayi hai! ✨`);
        if (autoVoiceReply) speakAloud(`Theme badal kar ${themeList[nextIdx]} kar di hai!`, { lang: language });
        break;
      }

      case 'SET_LANG_URDU': {
        onLanguageChange('urdu');
        setStatusMessage('زبان اردو منتخب کر لی گئی ہے!');
        if (autoVoiceReply) speakAloud('جی بالکل! اردو زبان فعال کر دی گئی ہے۔ میں آپ کی خدمت میں حاضر ہوں۔ 😊', { lang: 'urdu' });
        break;
      }

      case 'SET_LANG_ROMAN': {
        onLanguageChange('roman-urdu');
        setStatusMessage('Language set to Roman Urdu!');
        if (autoVoiceReply) speakAloud('Ji zaroor! Roman Urdu activate ho gayi hai, aaiye gup-shup lagate hain! 😊', { lang: 'roman-urdu' });
        break;
      }

      case 'SET_LANG_ENGLISH': {
        onLanguageChange('english');
        setStatusMessage('Language set to English!');
        if (autoVoiceReply) speakAloud('English mode is active! How can I assist you today?', { lang: 'english' });
        break;
      }

      case 'SEARCH_AGENTS': {
        onSearchAgents(intent.query);
        onTabChange('directory');
        setStatusMessage(`Agents dhoond rahi hoon: "${intent.query}"`);
        if (autoVoiceReply) {
          speakAloud(`Main aapke liye ${intent.query} ke agents dhoond rahi hoon!`, { lang: language });
        }
        break;
      }

      case 'READ_ANSWER': {
        if (onReadLatestReply) {
          onReadLatestReply();
        } else {
          setStatusMessage('Reading answer...');
        }
        break;
      }

      case 'PROMPT_EXECUTE':
      default: {
        // Direct execution of any request or prompt! ("Kuch bhi bol kar kahein aur yeh karein")
        const promptToRun = intent.prompt || rawText;
        setIsThinking(true);
        setStatusMessage(
          language === 'roman-urdu'
            ? `2,000 AI Agents dimagh mein soch rahe hain: "${promptToRun}"...`
            : language === 'urdu'
            ? `2,000 اے آئی ایجنٹس جواب سوچ رہے ہیں: "${promptToRun}"...`
            : `Synthesizing answer through 2,000 AI Agents: "${promptToRun}"...`
        );
        onTabChange('chat');
        onExecutePromptInChat(promptToRun, { autoSpeak: autoVoiceReply });
        break;
      }
    }

    // Clear transcript after successful execution
    setTranscript('');
    setInterimTranscript('');
  };

  // Trigger quick voice chip simulation
  const handleQuickCommand = (samplePrompt: string) => {
    setTranscript(samplePrompt);
    const intent = parseVoiceCommand(samplePrompt, language);
    setDetectedIntent(intent);
    executeSpokenIntent(intent, samplePrompt);
  };

  // Start listening automatically when opened
  useEffect(() => {
    if (isOpen && !isListening) {
      startListening();
    }
    return () => {
      stopListening();
      stopSpeaking();
    };
  }, [isOpen]);

  // Sync isSpeaking state with global TTS events
  useEffect(() => {
    const handleSpeakingStart = () => setIsSpeaking(true);
    const handleSpeakingEnd = () => setIsSpeaking(false);
    window.addEventListener('ai-speaking-start', handleSpeakingStart);
    window.addEventListener('ai-speaking-end', handleSpeakingEnd);
    return () => {
      window.removeEventListener('ai-speaking-start', handleSpeakingStart);
      window.removeEventListener('ai-speaking-end', handleSpeakingEnd);
    };
  }, []);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        stopListening();
        stopSpeaking();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Click outside to close backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity"
        onClick={() => {
          stopListening();
          stopSpeaking();
          onClose();
        }}
        title="Bahar click karke band karein"
      />

      <div
        className={`fixed z-50 transition-all duration-300 ${
          isMinimized
            ? 'bottom-20 right-4 sm:bottom-6 sm:right-6 w-80'
            : 'bottom-16 sm:bottom-6 right-3 sm:right-6 left-3 sm:left-auto sm:w-[480px] max-w-[calc(100vw-24px)]'
        }`}
      >
        <div
          className={`rounded-2xl border backdrop-blur-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
            isLight
              ? 'border-indigo-200 bg-white/95 text-slate-800 shadow-indigo-500/10'
              : 'border-indigo-500/40 bg-slate-950/95 text-slate-100 shadow-indigo-950/70'
          }`}
        >
          {/* Header Bar */}
          <div
            className={`flex items-center justify-between px-4 py-2.5 border-b ${
              isLight ? 'border-slate-200 bg-slate-50/80' : 'border-slate-800 bg-slate-900/60'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
                <Mic className="h-4 w-4" />
                {isListening && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                  </span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold tracking-tight">Voice Control Assistant</span>
                  <span className="rounded bg-indigo-500/20 px-1.5 py-0.2 text-[9px] font-mono text-indigo-300 font-semibold border border-indigo-500/30">
                    Live Voice
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  {language === 'roman-urdu'
                    ? 'Kuch bhi bol kar kahein aur yeh karega'
                    : language === 'urdu'
                    ? 'کچھ بھی بول کر کہیں اور یہ کرے گا'
                    : 'Speak any task, question, or app command'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Auto-Voice Reply Toggle */}
              <button
                onClick={() => {
                  if (isSpeaking) stopSpeaking();
                  setAutoVoiceReply(!autoVoiceReply);
                }}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  autoVoiceReply
                    ? isLight
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'bg-indigo-500/20 text-indigo-300'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
                title={autoVoiceReply ? 'Voice Reply is ON (جواب سنائے گا)' : 'Voice Reply is Muted'}
              >
                {autoVoiceReply ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>

              {/* Minimize / Maximize */}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? <Maximize2 className="h-3.5 w-3.5" /> : <Minimize2 className="h-3.5 w-3.5" />}
              </button>

              {/* Close Button - prominent */}
              <button
                onClick={() => {
                  stopListening();
                  stopSpeaking();
                  onClose();
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-300 hover:text-white bg-rose-500/20 hover:bg-rose-600 transition-all border border-rose-500/40 shadow-sm"
                title="Voice Assistant band karein (Escape key dabayein)"
              >
                <X className="h-3.5 w-3.5" />
                <span>Close</span>
              </button>
            </div>
          </div>

        {/* Minimized View */}
        {isMinimized ? (
          <div className="p-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <button
                onClick={isListening ? stopListening : startListening}
                className={`h-9 w-9 shrink-0 flex items-center justify-center rounded-xl transition-all ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/30'
                    : 'bg-indigo-600 text-white hover:bg-indigo-500'
                }`}
              >
                {isListening ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              </button>
              <div className="truncate text-xs">
                <span className="font-semibold text-indigo-400">
                  {isListening ? 'Listening...' : 'Paused'}
                </span>
                <p className="truncate text-[11px] text-slate-400">
                  {transcript || 'Click mic and speak your command...'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsMinimized(false)}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200"
            >
              Open
            </button>
          </div>
        ) : (
          /* Full Expanded View */
          <div className="p-4 space-y-4">
            {/* Permission Warning / Fallback Notice */}
            {audioPermissionError && (
              <div className="p-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-300 text-xs flex items-start gap-2">
                <HelpCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
                <div className="flex-1">
                  <span>{audioPermissionError}</span>
                  <p className="text-[10px] text-amber-400/80 mt-1">
                    Aap niche diye gaye sample chips par click karke bhi voice commands test kar sakte hain!
                  </p>
                </div>
              </div>
            )}

            {/* Central Animated Microphone & Wave Visualizer */}
            <div className="flex flex-col items-center justify-center py-2">
              <div className="relative flex items-center justify-center">
                {/* Multi-ring Pulse Animation when speaking, thinking, or listening */}
                {isSpeaking ? (
                  <>
                    <div className="absolute h-28 w-28 rounded-full bg-pink-500/25 animate-ping opacity-80" />
                    <div className="absolute h-24 w-24 rounded-full bg-purple-500/35 animate-pulse" />
                    <div className="absolute h-20 w-20 rounded-full bg-cyan-400/20 animate-pulse" />
                  </>
                ) : isThinking ? (
                  <>
                    <div className="absolute h-28 w-28 rounded-full bg-cyan-400/25 animate-ping opacity-80" />
                    <div className="absolute h-24 w-24 rounded-full bg-indigo-500/35 animate-pulse" />
                    <div className="absolute h-20 w-20 rounded-full bg-pink-400/20 animate-pulse" />
                  </>
                ) : isListening ? (
                  <>
                    <div className="absolute h-24 w-24 rounded-full bg-indigo-500/20 animate-ping opacity-75" />
                    <div className="absolute h-20 w-20 rounded-full bg-indigo-500/30 animate-pulse" />
                  </>
                ) : null}

                <button
                  type="button"
                  onClick={
                    isSpeaking
                      ? stopSpeaking
                      : isListening
                      ? stopListening
                      : startListening
                  }
                  className={`relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl shadow-xl transition-all duration-300 active:scale-95 ${
                    isSpeaking
                      ? 'bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-600 text-white shadow-pink-600/40 ring-4 ring-pink-500/40 animate-pulse'
                      : isThinking
                      ? 'bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 text-white shadow-cyan-600/40 ring-4 ring-cyan-500/40 animate-pulse'
                      : isListening
                      ? 'bg-gradient-to-tr from-rose-600 to-indigo-600 text-white shadow-rose-600/30 ring-4 ring-rose-500/20'
                      : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/30 ring-4 ring-indigo-500/20'
                  }`}
                  title={
                    isSpeaking
                      ? 'Click to stop voice'
                      : isThinking
                      ? 'AI Dimagh mein jawab soch rahi hai...'
                      : isListening
                      ? 'Click to pause listening'
                      : 'Click to start listening'
                  }
                >
                  {isSpeaking ? (
                    <Volume2 className="h-7 w-7 text-white animate-bounce" />
                  ) : isThinking ? (
                    <Brain className="h-7 w-7 text-cyan-200 animate-pulse" />
                  ) : isListening ? (
                    <Mic className="h-7 w-7 animate-bounce" />
                  ) : (
                    <MicOff className="h-7 w-7 opacity-80" />
                  )}
                </button>
              </div>

              {/* Sound Bars Equalizer Animation (Dynamic Reactive Waveform) */}
              <div className="flex items-center gap-1 mt-3 h-6">
                {[14, 26, 18, 30, 22, 16, 28, 20, 24, 15, 27].map((h, i) => (
                  <span
                    key={i}
                    className={`w-1 rounded-full transition-all duration-150 ${
                      isSpeaking
                        ? 'bg-gradient-to-t from-pink-500 via-purple-400 to-cyan-300'
                        : isThinking
                        ? 'bg-gradient-to-t from-cyan-400 via-indigo-400 to-pink-400 animate-pulse'
                        : isListening
                        ? 'bg-indigo-500'
                        : 'bg-slate-700 h-1.5'
                    }`}
                    style={{
                      height: isSpeaking
                        ? `${Math.max(6, Math.sin(Date.now() / 150 + i * 0.8) * 14 + h * 0.6)}px`
                        : isThinking
                        ? `${Math.max(8, Math.sin(Date.now() / 120 + i * 0.7) * 16 + h * 0.6)}px`
                        : isListening
                        ? `${Math.max(4, Math.sin(Date.now() / 200 + i) * 12 + h * 0.5)}px`
                        : '4px',
                    }}
                  />
                ))}
              </div>

              <div className="mt-1.5 text-center flex flex-col items-center gap-1">
                {isSpeaking ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-pink-400 flex items-center gap-1">
                      <span>
                        {language === 'roman-urdu'
                          ? 'Aapko bol kar suna rahi hoon... 🎙️'
                          : language === 'urdu'
                          ? 'آپ کو آواز میں سنا رہی ہوں... 🎙️'
                          : 'Speaking live voice answer... 🎙️'}
                      </span>
                    </span>
                    <button
                      onClick={stopSpeaking}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white border border-rose-500/30 transition-colors"
                    >
                      Stop ✕
                    </button>
                  </div>
                ) : isThinking ? (
                  <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 animate-pulse">
                    <Brain className="h-3.5 w-3.5 text-cyan-300" />
                    <span>
                      {language === 'roman-urdu'
                        ? '2,000 AI Agents dimagh mein jawab soch rahe hain... ⚡'
                        : language === 'urdu'
                        ? '2,000 اے آئی ایجنٹس جواب سوچ رہے ہیں... ⚡'
                        : 'Reasoning through 2,000 AI Agents... ⚡'}
                    </span>
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-indigo-400">
                    {isListening
                      ? language === 'roman-urdu'
                        ? 'Main sun rahi hoon... boliye! 😊'
                        : language === 'urdu'
                        ? 'میں سن رہی ہوں... فرمائیے! 😊'
                        : 'Listening... Speak clearly'
                      : 'Microphone Paused (Click to activate)'}
                  </span>
                )}
              </div>

              {/* Thinking Visualizer (Sochna Visual Effect right inside Voice Assistant Hub) */}
              {isThinking && (
                <div className="w-full my-2.5 animate-in fade-in zoom-in-95 duration-200">
                  <ThinkingVisualizer language={language} mode="deep_thinking" />
                </div>
              )}
            </div>

            {/* Live Spoken Transcript Display */}
            <div
              className={`rounded-xl border p-3 min-h-[70px] max-h-32 overflow-y-auto transition-all ${
                isLight ? 'border-slate-200 bg-slate-100/80' : 'border-slate-800 bg-slate-900/90'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                <span className="font-semibold uppercase tracking-wider flex items-center gap-1">
                  <Command className="h-3 w-3 text-indigo-400" />
                  Live Transcript / آواز کی شناخت
                </span>
                {transcript && (
                  <button
                    onClick={() => {
                      setTranscript('');
                      setInterimTranscript('');
                    }}
                    className="hover:text-rose-400 text-slate-500"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="text-xs font-medium leading-relaxed">
                {transcript ? (
                  <span className={isLight ? 'text-slate-900' : 'text-slate-100'}>
                    {transcript}{' '}
                    {interimTranscript && (
                      <span className="text-indigo-400 italic opacity-80">{interimTranscript}</span>
                    )}
                  </span>
                ) : interimTranscript ? (
                  <span className="text-indigo-400 italic">{interimTranscript}</span>
                ) : (
                  <span className="text-slate-500 italic">
                    {language === 'roman-urdu'
                      ? 'Kuch bhi boliye... e.g. "Tumhe kisne banaya", "Ek calculator bana do", "Dark mode on karo"...'
                      : language === 'urdu'
                      ? 'کچھ بھی بولیں... مثلاً "مجھے محمد نے بنایا ہے"، "ایک کیلکولیٹر بنا دو"، "ڈارک موڈ"...'
                      : 'Speak anything... e.g. "Who made you?", "Create a snake game", "Switch to dark mode"...'}
                  </span>
                )}
              </div>

              {/* Detected Intent Badge */}
              {detectedIntent && (transcript || interimTranscript) && (
                <div className="mt-2 pt-2 border-t border-slate-800/50 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                    <Zap className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">{detectedIntent.label}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      executeSpokenIntent(detectedIntent, transcript || interimTranscript)
                    }
                    className="flex items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-indigo-500 shadow-sm shrink-0"
                  >
                    <Play className="h-3 w-3" />
                    <span>Execute</span>
                  </button>
                </div>
              )}
            </div>

            {/* Quick Voice Command Chips / Cheatsheet */}
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-400" />
                <span>Kuch bhi kahein (Popular Voice Commands):</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { text: 'Tumhe kisne banaya?', icon: '👑' },
                  { text: 'Ek Python Prime Number script bana do', icon: '🐍' },
                  { text: 'Ek HTML5 Snake Game bana do', icon: '🎮' },
                  { text: 'Naya Chat', icon: '✨' },
                  { text: 'Dark Mode', icon: '🌙' },
                  { text: 'Light Mode', icon: '☀️' },
                  { text: 'Agents Directory kholo', icon: '👥' },
                  { text: 'Auto Match Dispatcher', icon: '⚡' },
                  { text: 'Search React Agent', icon: '🔍' },
                  { text: 'Jawab parho', icon: '🔊' },
                  { text: 'Ruk jao (Stop)', icon: '🛑' },
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickCommand(chip.text)}
                    className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] transition-all border ${
                      isLight
                        ? 'border-slate-200 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700'
                        : 'border-slate-800 bg-slate-900/80 hover:bg-slate-800 hover:text-indigo-300 text-slate-300'
                    }`}
                  >
                    <span>{chip.icon}</span>
                    <span>{chip.text}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Settings & Info Footer */}
            <div
              className={`pt-3 border-t flex flex-wrap items-center justify-between gap-2 text-[11px] ${
                isLight ? 'border-slate-200 text-slate-500' : 'border-slate-800 text-slate-400'
              }`}
            >
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSendOnSilence}
                  onChange={(e) => setAutoSendOnSilence(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                />
                <span>Auto-Execute on speech pause (1.4s)</span>
              </label>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoVoiceReply}
                    onChange={(e) => setAutoVoiceReply(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                  />
                  <span>Auto Voice Reply (جواب سنائیں)</span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    stopListening();
                    stopSpeaking();
                    onClose();
                  }}
                  className="px-2 py-0.5 rounded-md text-rose-400 hover:text-white hover:bg-rose-600/80 border border-rose-500/30 text-[10px] font-medium transition-colors ml-1"
                >
                  Close ×
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  </>
);
};
