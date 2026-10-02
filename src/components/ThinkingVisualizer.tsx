import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, Cpu, Zap, Activity } from 'lucide-react';

interface ThinkingVisualizerProps {
  language?: 'roman-urdu' | 'urdu' | 'english';
  mode?: 'standard' | 'deep_thinking' | 'web_search';
}

export const ThinkingVisualizer: React.FC<ThinkingVisualizerProps> = ({
  language = 'roman-urdu',
  mode = 'standard',
}) => {
  const [phaseIndex, setPhaseIndex] = useState(0);

  const romanUrduPhases = [
    '2,000 AI Agents dimagh mein logic synchronize kar rahe hain...',
    'Deep neural mesh se constraints aur reasoning verify ho rahi hai...',
    'Muhammad 2000 AI architecture se optimal jawab tayyar kiya ja raha hai...',
    'Mukammal aur high-precision solution synthesize ho raha hai...',
  ];

  const urduPhases = [
    '2,000 اے آئی ایجنٹس سے منطقی ہم آہنگی کی جا رہی ہے...',
    'نیورل میش گہرے تجزئے اور قواعد کی تصدیق کر رہا ہے...',
    'محمد 2000 اے آئی جامع اور بہترین جواب ترتیب دے رہا ہے...',
    'مکمل اور معیاری حل تیار کیا جا رہا ہے...',
  ];

  const englishPhases = [
    'Synchronizing logic across 2,000 interconnected AI Agents...',
    'Traversing deep neural mesh and validating reasoning constraints...',
    'Synthesizing optimal, production-grade deliverable...',
    'Finalizing comprehensive solution and verification matrix...',
  ];

  const phases =
    language === 'urdu'
      ? urduPhases
      : language === 'english'
      ? englishPhases
      : romanUrduPhases;

  useEffect(() => {
    const interval = setInterval(() => {
      setPhaseIndex((prev) => (prev + 1) % phases.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [phases.length]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-slate-950/95 via-indigo-950/40 to-slate-950/95 p-4 sm:p-5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300">
      {/* Top Ambient Scanning Laser Beam */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />
      <div className="absolute -top-12 -left-12 h-32 w-32 rounded-full bg-indigo-500/15 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 h-32 w-32 rounded-full bg-cyan-500/15 blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
        {/* Left: Glowing Synaptic Brain Orb */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
            {/* Spinning Holographic Halo Ring */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-pink-500 animate-spin [animation-duration:3s] opacity-75 blur-xs" />
            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white border border-indigo-400/40 shadow-inner">
              <Brain className="h-6 w-6 text-cyan-300 animate-pulse" />
            </div>
            {/* Sparkle badge */}
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-pink-500 text-white shadow-sm ring-2 ring-slate-950">
              <Sparkles className="h-2.5 w-2.5 animate-spin [animation-duration:4s]" />
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                {language === 'roman-urdu'
                  ? 'Muhammad 2000 AI Thinking Active'
                  : language === 'urdu'
                  ? 'محمد 2000 اے آئی تفکیر فعال ہے'
                  : 'Muhammad 2000 AI Deep Reasoning'}
              </span>
              <span className="rounded-full bg-indigo-500/20 border border-indigo-500/40 px-2 py-0.5 text-[10px] font-mono text-indigo-300">
                2,000 Agents Connected
              </span>
              {mode === 'deep_thinking' && (
                <span className="rounded-full bg-purple-500/20 border border-purple-500/40 px-2 py-0.5 text-[10px] font-medium text-purple-300">
                  Deep Thinking Mode
                </span>
              )}
            </div>
            <p className="text-xs text-cyan-200/90 font-medium transition-all duration-300 line-clamp-1">
              {phases[phaseIndex]}
            </p>
          </div>
        </div>

        {/* Right: Live Undulating Neural Energy Waveform Bars */}
        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <div className="flex items-end gap-1 h-6 px-3 py-1 rounded-xl bg-slate-900/90 border border-slate-800 shadow-inner">
            <span className="w-1 rounded-full bg-cyan-400 animate-[bounce_0.8s_infinite] h-2.5" />
            <span className="w-1 rounded-full bg-indigo-400 animate-[bounce_0.9s_infinite] [animation-delay:0.15s] h-5" />
            <span className="w-1 rounded-full bg-pink-400 animate-[bounce_0.75s_infinite] [animation-delay:0.3s] h-3.5" />
            <span className="w-1 rounded-full bg-emerald-400 animate-[bounce_0.85s_infinite] [animation-delay:0.1s] h-4" />
            <span className="w-1 rounded-full bg-cyan-300 animate-[bounce_0.7s_infinite] [animation-delay:0.25s] h-6" />
            <span className="w-1 rounded-full bg-purple-400 animate-[bounce_0.9s_infinite] [animation-delay:0.4s] h-3" />
            <span className="w-1 rounded-full bg-indigo-300 animate-[bounce_0.8s_infinite] [animation-delay:0.2s] h-4.5" />
          </div>
          <span className="text-[11px] font-mono font-medium text-slate-400">
            Active
          </span>
        </div>
      </div>
    </div>
  );
};
