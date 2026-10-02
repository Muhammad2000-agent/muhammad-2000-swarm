import React, { useState, useEffect, useMemo } from 'react';
import {
  Crown,
  Shield,
  Zap,
  Sparkles,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Cpu,
  Layers,
  ChevronDown,
  ChevronUp,
  X,
  Code2,
  AlertTriangle,
  Play,
  RotateCcw,
  Check,
  Building2,
  Activity,
  ArrowRight,
  Terminal,
  Volume2,
  Lock,
  Unlock,
  Radio,
  Share2,
} from 'lucide-react';
import { Agent } from '../types';
import { AgentCard } from './AgentCard';
import {
  BossProposal,
  OfficeDepartment,
  OfficeIntercomLog,
  OFFICE_DEPARTMENTS,
  loadOfficeProposals,
  saveOfficeProposals,
  loadOfficeIntercom,
  saveOfficeIntercom,
  createAutonomousDiscoveryProposal,
} from '../data/officeState';
import { DOMAINS, searchAgentFleet } from '../data/agentFleet';
import { playVoiceFeedbackSound } from '../utils/voiceAssistant';

interface FuturisticAgentOfficeProps {
  language: 'roman-urdu' | 'urdu' | 'english';
  swarmAgents: Agent[];
  onToggleSwarm: (agent: Agent) => void;
  onAssignTask: (agent: Agent) => void;
  onCustomizeAgent: (agent: Agent) => void;
  onOpenAutoMatch: () => void;
  onOpenSwarmModal: () => void;
}

export const FuturisticAgentOffice: React.FC<FuturisticAgentOfficeProps> = ({
  language,
  swarmAgents,
  onToggleSwarm,
  onAssignTask,
  onCustomizeAgent,
  onOpenAutoMatch,
  onOpenSwarmModal,
}) => {
  // Navigation inside Office
  const [activeOfficeView, setActiveOfficeView] = useState<
    'proposals' | 'floor_plan' | 'modifications' | 'directory'
  >('proposals');

  // Office state
  const [proposals, setProposals] = useState<BossProposal[]>(() => loadOfficeProposals());
  const [intercomLogs, setIntercomLogs] = useState<OfficeIntercomLog[]>(() => loadOfficeIntercom());
  const [isGeneratingDiscovery, setIsGeneratingDiscovery] = useState(false);
  const [expandedProposalId, setExpandedProposalId] = useState<string | null>(null);

  // Boss custom instruction modal / state
  const [modifyingProposalId, setModifyingProposalId] = useState<string | null>(null);
  const [bossCustomDirective, setBossCustomDirective] = useState('');

  // Selected department for floor detail
  const [selectedDeptId, setSelectedDeptId] = useState<string>('engineering');

  // Search & Filtering in 2000 Agent Roster
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomainId, setSelectedDomainId] = useState<string>('all');
  const [visibleLimit, setVisibleLimit] = useState(36);

  // Success announcement toast
  const [approvalToast, setApprovalToast] = useState<{
    title: string;
    message: string;
  } | null>(null);

  // Save changes
  useEffect(() => {
    saveOfficeProposals(proposals);
  }, [proposals]);

  useEffect(() => {
    saveOfficeIntercom(intercomLogs);
  }, [intercomLogs]);

  // Counts
  const pendingCount = useMemo(
    () => proposals.filter((p) => p.status === 'PENDING').length,
    [proposals]
  );
  const approvedCount = useMemo(
    () => proposals.filter((p) => p.status === 'APPROVED' || p.status === 'MODIFIED').length,
    [proposals]
  );

  // Filtered 2,000 Agents
  const filteredAgents = useMemo(() => {
    return searchAgentFleet(searchQuery, selectedDomainId, 2000);
  }, [searchQuery, selectedDomainId]);

  const displayedAgents = useMemo(() => {
    return filteredAgents.slice(0, visibleLimit);
  }, [filteredAgents, visibleLimit]);

  // Handle Boss Approval
  const handleApprove = (id: string) => {
    playVoiceFeedbackSound('command');
    setProposals((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            status: 'APPROVED',
            decidedAt: 'Just now by Boss Muhammad',
          };
        }
        return p;
      })
    );

    const target = proposals.find((p) => p.id === id);
    const toastMsg =
      language === 'roman-urdu'
        ? `Boss Muhammad ne "${target?.title}" ki permission de di! Autonomous execution live active ho gayi hai! 🚀`
        : language === 'urdu'
        ? `باس محمد نے اجازت دے دی! آٹونومس ایگزیکیوشن ایکٹیویٹ ہو گئی ہے۔ 🚀`
        : `Boss Muhammad approved "${target?.title}"! Autonomous fleet self-modification activated! 🚀`;

    setApprovalToast({
      title: 'PERMISSION GRANTED BY BOSS MUHAMMAD',
      message: toastMsg,
    });

    // Add log to intercom
    const newLog: OfficeIntercomLog = {
      id: 'log-' + Date.now(),
      fromAgentId: target?.leadAgentId || '1',
      toAgentId: 'OFFICE_ALL',
      message: `🎉 CELEBRATION: Boss Muhammad granted permission for "${target?.title}"! Executing self-modification now!`,
      timestamp: 'Just now',
      type: 'boss_celebration',
    };
    setIntercomLogs((prev) => [newLog, ...prev]);

    setTimeout(() => setApprovalToast(null), 5000);
  };

  // Handle Boss Rejection
  const handleReject = (id: string) => {
    playVoiceFeedbackSound('stop');
    setProposals((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            status: 'REJECTED',
            decidedAt: 'Declined by Boss Muhammad',
          };
        }
        return p;
      })
    );

    const target = proposals.find((p) => p.id === id);
    const toastMsg =
      language === 'roman-urdu'
        ? `Boss Muhammad ke hukum par "${target?.title}" cancel kar diya gaya. Agents hukum par amal kar rahe hain.`
        : `By order of Boss Muhammad, "${target?.title}" was denied. Agents complying.`;

    setApprovalToast({
      title: 'ORDER RESPECTED — PROPOSAL CANCELLED',
      message: toastMsg,
    });

    setTimeout(() => setApprovalToast(null), 4000);
  };

  // Handle Boss Custom Directive
  const handleApplyDirective = () => {
    if (!modifyingProposalId) return;
    playVoiceFeedbackSound('command');

    setProposals((prev) =>
      prev.map((p) => {
        if (p.id === modifyingProposalId) {
          return {
            ...p,
            status: 'MODIFIED',
            bossNotes: bossCustomDirective,
            decidedAt: 'Modified & Approved with Boss Directives',
          };
        }
        return p;
      })
    );

    setApprovalToast({
      title: 'DIRECTIVES APPLIED BY BOSS MUHAMMAD',
      message:
        language === 'roman-urdu'
          ? `Agents ne Boss Muhammad ke khas instructions ko accept kar ke modify kar diya hai! ✨`
          : 'Agents adopted Boss Muhammad customized instructions and executed the task!',
    });

    setModifyingProposalId(null);
    setBossCustomDirective('');
    setTimeout(() => setApprovalToast(null), 4500);
  };

  // Trigger New Autonomous Brainstorming Round
  const handleTriggerDiscovery = () => {
    setIsGeneratingDiscovery(true);
    playVoiceFeedbackSound('start');

    setTimeout(() => {
      const newDiscovery = createAutonomousDiscoveryProposal();
      setProposals((prev) => [newDiscovery, ...prev]);
      setActiveOfficeView('proposals');
      setIsGeneratingDiscovery(false);
      playVoiceFeedbackSound('command');

      const logMsg: OfficeIntercomLog = {
        id: 'log-' + Date.now(),
        fromAgentId: newDiscovery.leadAgentId,
        toAgentId: 'BOSS',
        message: `⚡ NEW DISCOVERY: ${newDiscovery.title} discovered with free-hand logic! Awaiting Boss Muhammad review.`,
        timestamp: 'Just now',
        type: 'discovery',
      };
      setIntercomLogs((prev) => [logMsg, ...prev]);

      setApprovalToast({
        title: 'AUTONOMOUS DISCOVERY COMPLETE',
        message:
          language === 'roman-urdu'
            ? `2,000 Agents ne free-hand logic se nayi cheez invent kar li hai aur Boss Muhammad se permission maang rahe hain!`
            : '2,000 Agents synthesized an autonomous discovery and are requesting Boss Muhammad permission!',
      });
      setTimeout(() => setApprovalToast(null), 5000);
    }, 1200);
  };

  return (
    <div className="flex-1 flex flex-col w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 pb-28 md:pb-20 space-y-6">
      {/* Toast Notification */}
      {approvalToast && (
        <div className="fixed top-20 right-4 z-50 max-w-md animate-in slide-in-from-top duration-300">
          <div className="rounded-2xl border border-emerald-500/50 bg-slate-950/95 p-4 text-emerald-300 shadow-2xl shadow-emerald-950/60 backdrop-blur-xl flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              <Crown className="h-5 w-5 animate-pulse" />
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                {approvalToast.title}
              </h4>
              <p className="text-xs text-slate-200 mt-0.5 leading-relaxed">
                {approvalToast.message}
              </p>
            </div>
            <button
              onClick={() => setApprovalToast(null)}
              className="text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Supreme Boss Executive Command Room Header */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/70 p-5 sm:p-7 shadow-2xl shadow-indigo-950/40">
        {/* Futuristic Grid Cyber Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e1b4b15_1px,transparent_1px),linear-gradient(to_bottom,#1e1b4b15_1px,transparent_1px)] bg-[size:2rem_2rem] pointer-events-none" />
        <div className="absolute top-0 right-0 h-64 w-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 h-48 w-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 px-3 py-1 text-xs font-bold text-amber-300 border border-amber-500/40 shadow-sm">
                <Crown className="h-4 w-4 text-amber-400 animate-pulse" />
                <span>SUPREME BOSS & CEO: Boss Muhammad</span>
              </span>

              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-[11px] font-mono font-semibold text-indigo-300 border border-indigo-500/30">
                <Radio className="h-3 w-3 text-emerald-400 animate-ping" />
                <span>2,000 Linked Agents Fleet Active</span>
              </span>

              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-mono text-emerald-300 border border-emerald-500/30">
                <Unlock className="h-3 w-3 text-emerald-400" />
                <span>Free-Hand Autonomous Logic: ENABLED</span>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <span>Autonomous Virtual AI Headquarters</span>
              <span className="text-sm sm:text-base font-mono font-normal text-indigo-400">
                [2,000 Agents Office Mesh]
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              {language === 'roman-urdu' ? (
                <>
                  Tamam 2,000 AI Agents ek futuristic office ki tarah apas mein interlinked hain.
                  Inhein apni logic se nayi cheezein invent karne aur khud ko modify karne ka{' '}
                  <strong className="text-emerald-400">Free Hand</strong> haasil hai, lekin har
                  badi tabdeeli se pehle yeh{' '}
                  <strong className="text-amber-300">Boss Muhammad</strong> se formal permission
                  maangte hain!
                </>
              ) : language === 'urdu' ? (
                <>
                  تمام 2,000 اے آئی ایجنٹس ایک فیوچرسٹک ورچوئل آفس کی طرح باہم مربوط ہیں۔ وہ اپنی
                  عقلی لاجک سے خودکار دریافتیں کرتے ہیں لیکن ہر عمل کے لیے{' '}
                  <strong className="text-amber-300">باس محمد</strong> سے اجازت طلب کرتے ہیں!
                </>
              ) : (
                <>
                  All 2,000 AI agents operate like an interlinked autonomous digital corporation.
                  They have free-hand logic to proactively invent, discover, and self-modify, but
                  must always obtain executive approval from{' '}
                  <strong className="text-amber-300">Boss Muhammad</strong> before deployment!
                </>
              )}
            </p>
          </div>

          {/* Quick Boss Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <button
              onClick={handleTriggerDiscovery}
              disabled={isGeneratingDiscovery}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-600 px-4 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-indigo-600/30 hover:brightness-110 active:scale-95 transition-all disabled:opacity-60"
            >
              <Zap className={`h-4 w-4 text-amber-300 ${isGeneratingDiscovery ? 'animate-spin' : ''}`} />
              <span>
                {isGeneratingDiscovery
                  ? language === 'roman-urdu'
                    ? 'Agents Brainstorming Kar Rahe Hain...'
                    : 'Agents Brainstorming...'
                  : language === 'roman-urdu'
                  ? '⚡ Order Discovery Round (Nayi Cheez Discover Karein)'
                  : language === 'urdu'
                  ? '⚡ نئی دریافت کا حکم دیں'
                  : '⚡ Trigger Autonomous Discovery'}
              </span>
            </button>
          </div>
        </div>

        {/* Live Metrics Ribbons */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl bg-slate-900/60 p-3 border border-slate-800 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-black text-amber-300">{pendingCount}</div>
              <div className="text-[11px] text-slate-400 font-medium">Pending Boss Permissions</div>
            </div>
          </div>

          <div className="rounded-xl bg-slate-900/60 p-3 border border-slate-800 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-black text-emerald-300">{approvedCount}</div>
              <div className="text-[11px] text-slate-400 font-medium">Approved Fleet Upgrades</div>
            </div>
          </div>

          <div className="rounded-xl bg-slate-900/60 p-3 border border-slate-800 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-black text-indigo-300">7 Floors</div>
              <div className="text-[11px] text-slate-400 font-medium">Interconnected Virtual Wings</div>
            </div>
          </div>

          <div className="rounded-xl bg-slate-900/60 p-3 border border-slate-800 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-black text-purple-300">2,000 / 2,000</div>
              <div className="text-[11px] text-slate-400 font-medium">Autonomous Logic Nodes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Office View Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveOfficeView('proposals')}
          className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
            activeOfficeView === 'proposals'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Crown className="h-4 w-4" />
          <span>
            {language === 'roman-urdu'
              ? 'Boss Permission Queue (اجازت ڈیسک)'
              : language === 'urdu'
              ? 'باس کی اجازت کی قطار'
              : 'Boss Approval Queue'}
          </span>
          {pendingCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-slate-950 font-black text-[10px] animate-bounce">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveOfficeView('floor_plan')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
            activeOfficeView === 'floor_plan'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>
            {language === 'roman-urdu'
              ? 'Virtual Office Floor Plan (7 ونگز)'
              : language === 'urdu'
              ? 'ورچوئل آفس فلور پلان'
              : 'Virtual Office Floor Plan'}
          </span>
        </button>

        <button
          onClick={() => setActiveOfficeView('modifications')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
            activeOfficeView === 'modifications'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Zap className="h-4 w-4" />
          <span>
            {language === 'roman-urdu'
              ? 'Self-Modifications Registry (خودکار اپ ڈیٹس)'
              : language === 'urdu'
              ? 'سیلف موڈیفکیشن رجسٹری'
              : 'Self-Evolution Registry'}
          </span>
          <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-emerald-400 font-mono">
            {approvedCount}
          </span>
        </button>

        <button
          onClick={() => setActiveOfficeView('directory')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
            activeOfficeView === 'directory'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Search className="h-4 w-4" />
          <span>
            {language === 'roman-urdu'
              ? '2,000 Agents Roster (تمام ایجنٹس)'
              : language === 'urdu'
              ? '2000 ایجنٹس روسٹر'
              : '2,000 Agents Directory'}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: BOSS PERMISSION & APPROVAL QUEUE */}
      {/* ========================================================================= */}
      {activeOfficeView === 'proposals' && (
        <div className="space-y-5 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Crown className="h-4 w-4 text-amber-400" />
                <span>
                  {language === 'roman-urdu'
                    ? 'Boss Muhammad Permission Desk'
                    : 'Boss Muhammad Executive Permission Desk'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {language === 'roman-urdu'
                  ? 'Agents ne apni azaad (free-hand) logic se yeh cheezein banayi hain aur aapki approval maang rahe hain.'
                  : 'Agents used free-hand logic to formulate these ideas and are requesting Boss Muhammad authorization.'}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-mono">Queue Status:</span>
              <span className="font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                {pendingCount} Awaiting Boss Signature
              </span>
            </div>
          </div>

          {proposals.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center">
              <Crown className="mx-auto h-12 w-12 text-slate-500 mb-3" />
              <h3 className="text-base font-semibold text-slate-200">
                Koi proposal pending nahi hai!
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Upar diye gaye button "⚡ Order Discovery Round" par click karein taake 2,000 agents
                azaadane taur par nayi cheezein invent karein aur aapse permission maangein!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {proposals.map((proposal) => {
                const isPending = proposal.status === 'PENDING';
                const isApproved = proposal.status === 'APPROVED';
                const isRejected = proposal.status === 'REJECTED';
                const isModified = proposal.status === 'MODIFIED';
                const isExpanded = expandedProposalId === proposal.id;

                return (
                  <div
                    key={proposal.id}
                    className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                      isPending
                        ? 'border-amber-500/40 bg-slate-950/90 shadow-xl shadow-amber-950/20'
                        : isApproved || isModified
                        ? 'border-emerald-500/30 bg-slate-950/60'
                        : 'border-slate-800 bg-slate-950/40 opacity-75'
                    }`}
                  >
                    {/* Header Bar */}
                    <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/60">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-lg px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider ${
                              isPending
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                                : isApproved
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : isModified
                                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {isPending
                              ? '⏳ Awaiting Boss Permission'
                              : isApproved
                              ? '✅ Approved by Boss Muhammad'
                              : isModified
                              ? '📝 Modified by Boss'
                              : '❌ Rejected by Boss'}
                          </span>

                          <span className="rounded-lg bg-indigo-500/10 px-2 py-0.5 text-[10px] text-indigo-300 border border-indigo-500/20 font-medium">
                            {proposal.department}
                          </span>

                          <span className="rounded-lg bg-purple-500/10 px-2 py-0.5 text-[10px] text-purple-300 border border-purple-500/20 font-mono">
                            Impact: {proposal.impactScore}%
                          </span>

                          <span className="rounded-lg bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-300 border border-emerald-500/20 font-mono">
                            Risk: {proposal.riskLevel}
                          </span>
                        </div>

                        <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                          <span>{proposal.title}</span>
                          {proposal.appliedUpgradeBadge && (
                            <span className="text-xs font-mono font-normal text-amber-400/90 hidden sm:inline">
                              [{proposal.appliedUpgradeBadge}]
                            </span>
                          )}
                        </h3>

                        <div className="text-xs text-slate-400 flex items-center gap-2">
                          <span className="font-semibold text-slate-300">
                            Lead: {proposal.leadAgentName}
                          </span>
                          <span>•</span>
                          <span>Collabs: {proposal.collaboratorAgentIds.map((c) => `#${c}`).join(', ')}</span>
                          <span>•</span>
                          <span className="font-mono text-slate-500">{proposal.proposedAt}</span>
                        </div>
                      </div>

                      {/* Boss Actions / Decision Bar */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {isPending ? (
                          <>
                            <button
                              onClick={() => handleApprove(proposal.id)}
                              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/30 hover:brightness-110 active:scale-95 transition-all"
                              title="Boss Muhammad ijazat dete hain"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              <span>APPROVE (Ijazat Hai)</span>
                            </button>

                            <button
                              onClick={() => {
                                setModifyingProposalId(proposal.id);
                                setBossCustomDirective(
                                  language === 'roman-urdu'
                                    ? 'Isme speed optimize rakhein aur resource usage minimize karein.'
                                    : 'Optimize performance and minimize resource usage.'
                                );
                              }}
                              className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 border border-slate-700 transition-all"
                              title="Boss apna customized hukum dein"
                            >
                              <Terminal className="h-3.5 w-3.5 text-indigo-400" />
                              <span>Give Directive</span>
                            </button>

                            <button
                              onClick={() => handleReject(proposal.id)}
                              className="flex items-center gap-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 px-3 py-2 text-xs font-semibold text-rose-300 border border-rose-500/30 transition-all"
                              title="Boss ne mana kar diya"
                            >
                              <XCircle className="h-4 w-4" />
                              <span>Reject</span>
                            </button>
                          </>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400 font-mono">
                              {proposal.decidedAt}
                            </span>
                            <button
                              onClick={() => {
                                // Re-open for decision if needed
                                setProposals((prev) =>
                                  prev.map((p) =>
                                    p.id === proposal.id ? { ...p, status: 'PENDING' } : p
                                  )
                                );
                              }}
                              className="text-[11px] text-slate-500 hover:text-slate-300 underline"
                            >
                              Re-evaluate
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Agent Speech Request Bubble to Boss */}
                    <div className="p-4 sm:p-5 bg-slate-900/40 space-y-3">
                      <div className="flex items-start gap-3 rounded-xl border border-indigo-500/20 bg-indigo-950/30 p-3.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white font-mono font-bold text-xs shadow-md">
                          #{proposal.leadAgentId}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-[11px] text-indigo-400 font-bold mb-1">
                            <span>AGENT SPOKEN REQUEST TO BOSS MUHAMMAD:</span>
                            <span className="font-mono text-slate-400">Audio Intercom Active</span>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-200 font-medium italic leading-relaxed">
                            "{language === 'urdu'
                              ? proposal.requestDialogue.urdu
                              : language === 'roman-urdu'
                              ? proposal.requestDialogue.romanUrdu
                              : proposal.requestDialogue.english}"
                          </p>
                        </div>
                      </div>

                      {/* Summary & Autonomous Logic Breakdown */}
                      <div className="text-xs text-slate-300 space-y-1.5 leading-relaxed">
                        <p>
                          <strong className="text-white">Summary:</strong> {proposal.summary}
                        </p>
                        <p>
                          <strong className="text-emerald-400">Agent Free-Hand Logic:</strong>{' '}
                          {proposal.autonomousLogicDetails}
                        </p>
                        {proposal.bossNotes && (
                          <div className="mt-2 rounded-lg bg-amber-500/10 border border-amber-500/30 p-2.5 text-amber-300">
                            <strong>Boss Muhammad Directive:</strong> {proposal.bossNotes}
                          </div>
                        )}
                      </div>

                      {/* Expandable Code Snippet */}
                      {proposal.codeSnippet && (
                        <div className="pt-1">
                          <button
                            onClick={() =>
                              setExpandedProposalId(isExpanded ? null : proposal.id)
                            }
                            className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-mono font-semibold"
                          >
                            <Code2 className="h-3.5 w-3.5" />
                            <span>
                              {isExpanded ? 'Hide Prototype Logic' : 'View Prototype Code & Logic Diff'}
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5" />
                            )}
                          </button>

                          {isExpanded && (
                            <pre className="mt-2 rounded-xl bg-slate-950 p-3.5 text-[11px] font-mono text-emerald-400 border border-slate-800 overflow-x-auto leading-relaxed shadow-inner">
                              <code>{proposal.codeSnippet}</code>
                            </pre>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: VIRTUAL OFFICE FLOOR PLAN (7 DEPARTMENTS MESH) */}
      {/* ========================================================================= */}
      {activeOfficeView === 'floor_plan' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="h-4 w-4 text-indigo-400" />
                <span>2,000 Agents Autonomous Virtual Headquarters (7 Floors)</span>
              </h2>
              <p className="text-xs text-slate-400">
                Har floor aur desk apas mein high-speed mesh se linked hai. Agents real-time collaborate
                karte hain.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
              <Activity className="h-3.5 w-3.5 animate-pulse" />
              <span>Full Office Bandwidth: 10,108 Gbps</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left 2 Cols: The 7 Floors Stack */}
            <div className="lg:col-span-2 space-y-3">
              {OFFICE_DEPARTMENTS.map((dept) => {
                const isSelected = selectedDeptId === dept.id;
                const agentCount = dept.agentRange[1] - dept.agentRange[0] + 1;

                return (
                  <div
                    key={dept.id}
                    onClick={() => setSelectedDeptId(dept.id)}
                    className={`cursor-pointer rounded-2xl border p-4 transition-all duration-200 ${
                      isSelected
                        ? 'border-indigo-500 bg-slate-900/90 shadow-xl shadow-indigo-950/50 ring-1 ring-indigo-500/50'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/40'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-bold font-mono text-sm border ${
                            isSelected
                              ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          F{dept.floor}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-white">{dept.name}</h3>
                            <span className="rounded bg-indigo-500/20 px-1.5 py-0.2 text-[10px] font-mono text-indigo-300 border border-indigo-500/30 font-semibold">
                              {agentCount} Agents
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                            {dept.currentProject}
                          </p>
                        </div>
                      </div>

                      <div className="hidden sm:flex flex-col items-end text-xs">
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {dept.activeStatus}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono mt-1">
                          {dept.meshBandwidth}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Col: Live Department Control & Intercom Ticker */}
            <div className="space-y-4">
              {/* Selected Floor Inspector */}
              {(() => {
                const currentDept =
                  OFFICE_DEPARTMENTS.find((d) => d.id === selectedDeptId) ||
                  OFFICE_DEPARTMENTS[1];
                return (
                  <div className="rounded-2xl border border-indigo-500/30 bg-slate-900/80 p-5 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-indigo-400 font-bold">
                          Floor {currentDept.floor} Department Lead
                        </span>
                        <h4 className="text-sm font-bold text-white">{currentDept.headAgentName}</h4>
                      </div>
                      <span className="rounded-lg bg-emerald-500/20 text-emerald-300 px-2 py-0.5 text-[10px] font-mono border border-emerald-500/30">
                        Live
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 space-y-2">
                      <div>
                        <strong className="text-slate-400 text-[11px] uppercase block font-mono">
                          Current Department Workflow:
                        </strong>
                        <p className="mt-0.5 leading-relaxed">{currentDept.currentProject}</p>
                      </div>

                      <div>
                        <strong className="text-slate-400 text-[11px] uppercase block font-mono">
                          Assigned Agent Fleet:
                        </strong>
                        <p className="mt-0.5 font-mono text-indigo-300">
                          Agent #{currentDept.agentRange[0]} to Agent #{currentDept.agentRange[1]} (
                          {currentDept.agentRange[1] - currentDept.agentRange[0] + 1} Agents)
                        </p>
                      </div>

                      <div>
                        <strong className="text-slate-400 text-[11px] uppercase block font-mono">
                          Interconnect Bandwidth:
                        </strong>
                        <p className="mt-0.5 font-mono text-emerald-400">
                          {currentDept.meshBandwidth}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleTriggerDiscovery}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-2.5 text-xs font-bold text-white shadow-md transition-all active:scale-95"
                    >
                      <Zap className="h-3.5 w-3.5 text-amber-300" />
                      <span>Request Department Innovation Pitch</span>
                    </button>
                  </div>
                );
              })()}

              {/* Real-time Office Intercom Feed */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    <Radio className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
                    <span>Office Intercom Ticker</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">Real-time Stream</span>
                </div>

                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {intercomLogs.map((log) => (
                    <div
                      key={log.id}
                      className="rounded-xl bg-slate-900/60 p-2.5 text-xs border border-slate-800/60 space-y-1"
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="font-mono text-indigo-400 font-bold">
                          Agent #{log.fromAgentId} ➔ {log.toAgentId}
                        </span>
                        <span className="text-slate-500 font-mono">{log.timestamp}</span>
                      </div>
                      <p className="text-slate-300 text-[11px] leading-relaxed">{log.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: SELF-MODIFICATION & FLEET UPGRADE REGISTRY */}
      {/* ========================================================================= */}
      {activeOfficeView === 'modifications' && (
        <div className="space-y-5 animate-in fade-in duration-300">
          <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Zap className="h-4 w-4 text-emerald-400" />
                <span>Approved Self-Modification & Evolution Registry</span>
              </h2>
              <p className="text-xs text-slate-400">
                Tamam wo proactive modifications aur inventions jo Boss Muhammad ne approve ki
                hain, live system mein active hain!
              </p>
            </div>

            <div className="text-xs font-mono text-emerald-300 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
              Active Upgrades: {approvedCount}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {proposals
              .filter((p) => p.status === 'APPROVED' || p.status === 'MODIFIED')
              .map((p) => (
                <div
                  key={p.id}
                  className="rounded-2xl border border-emerald-500/30 bg-slate-950/80 p-5 space-y-3 shadow-lg"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-mono text-emerald-300 font-bold border border-emerald-500/30">
                        {p.appliedUpgradeBadge || 'Active Upgrade'}
                      </span>
                      <h3 className="text-sm font-bold text-white mt-1.5">{p.title}</h3>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{p.summary}</p>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>Approved: {p.decidedAt || 'By Boss Muhammad'}</span>
                    <span className="text-indigo-400">Lead: {p.leadAgentName}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 4: 2,000 AGENTS DIRECTORY & SWARM BUILDER */}
      {/* ========================================================================= */}
      {activeOfficeView === 'directory' && (
        <div className="space-y-5 animate-in fade-in duration-300">
          {/* Domain Filter Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar">
            <button
              onClick={() => setSelectedDomainId('all')}
              className={`rounded-xl px-3 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
                selectedDomainId === 'all'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              All 2,000 Agents
            </button>
            {DOMAINS.map((domain) => (
              <button
                key={domain.id}
                onClick={() => setSelectedDomainId(domain.id)}
                className={`rounded-xl px-3 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedDomainId === domain.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-900/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                {language === 'urdu' ? domain.urduName : domain.name} ({domain.agentCount})
              </button>
            ))}
          </div>

          {/* Search Bar & Auto-Dispatcher */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  language === 'roman-urdu'
                    ? 'Kisi bhi agent ka naam, #ID (e.g. 42), skill ya keyword search karein...'
                    : 'Search any agent by name, #ID (e.g. 42), skill, or keyword...'
                }
                className="w-full rounded-xl border border-slate-800 bg-slate-900/80 py-2.5 pl-10 pr-10 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 justify-between sm:justify-end">
              <span className="text-xs text-slate-400 font-mono">
                Showing <strong className="text-indigo-400">{displayedAgents.length}</strong> of{' '}
                <strong className="text-slate-200">{filteredAgents.length}</strong> agents
              </span>

              <button
                onClick={onOpenAutoMatch}
                className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 transition-all shadow-sm"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>Smart Auto-Dispatcher</span>
              </button>
            </div>
          </div>

          {/* Grid of Agents */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {displayedAgents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onAssignTask={onAssignTask}
                onToggleSwarm={onToggleSwarm}
                onCustomize={onCustomizeAgent}
                isInSwarm={swarmAgents.some((a) => a.id === agent.id)}
                language={language}
              />
            ))}
          </div>

          {/* Load More Button */}
          {displayedAgents.length < filteredAgents.length && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => setVisibleLimit((prev) => prev + 36)}
                className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-5 py-2.5 text-xs font-medium text-slate-300 hover:border-slate-700 hover:bg-slate-800 transition-all shadow-md"
              >
                <ChevronDown className="h-4 w-4" />
                <span>
                  {language === 'roman-urdu'
                    ? `Mazeed 36 Agents Load Karein (${filteredAgents.length - displayedAgents.length} Baqi)`
                    : `Load More (${filteredAgents.length - displayedAgents.length} remaining)`}
                </span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Boss Custom Directive Modal */}
      {modifyingProposalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl border border-indigo-500/40 bg-slate-950 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Give Custom Boss Directive</h3>
              </div>
              <button
                onClick={() => setModifyingProposalId(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Aap apne 2,000 agents ko is kaam ke mutaliq khas hidayat (custom instructions) dein.
              Wo azaadana taur par isko adopt kar ke execute karenge:
            </p>

            <textarea
              value={bossCustomDirective}
              onChange={(e) => setBossCustomDirective(e.target.value)}
              rows={4}
              placeholder="Boss Muhammad ki hidayat yahan likhein (e.g. Isme memory limit 50MB se kam rakhein)..."
              className="w-full rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setModifyingProposalId(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyDirective}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md active:scale-95 transition-all"
              >
                Issue Directive & Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
