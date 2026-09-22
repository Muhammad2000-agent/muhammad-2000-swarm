import React, { useState, useEffect } from 'react';
import {
  Workflow,
  Sparkles,
  Play,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ArrowRight,
  Download,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Bot,
  Layers,
  Zap,
  X,
  FileText,
  Archive,
  RotateCcw,
} from 'lucide-react';
import { WorkflowStage, AutomatedWorkflow } from '../types';
import { extractFilesFromDeliverable, downloadProjectAsZip } from '../utils/zipGenerator';
import { VisualWorkflowDashboard } from './VisualWorkflowDashboard';

interface AutomatedWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTaskPrompt?: string;
  languagePreference?: 'auto' | 'roman-urdu' | 'urdu' | 'english';
}

const PRESET_WORKFLOWS = [
  {
    title: 'Full-Stack Web App Architecture',
    urduTitle: 'مکمل ویب ایپ اور بیک اینڈ سسٹم',
    prompt:
      'Build a production-ready, full-stack multi-tenant SaaS application with modern React frontend, Node Express backend, PostgreSQL database schemas, authentication middleware, and Stripe webhook payments flow.',
    icon: '💻',
    category: 'Engineering',
  },
  {
    title: 'Complete Startup Launch Strategy',
    urduTitle: 'نیا بزنس اور اسٹارٹ اپ روڈ میپ',
    prompt:
      'Formulate a comprehensive end-to-end launch plan for an AI SaaS startup, including product market fit analysis, pricing tiers, customer acquisition funnels, and 90-day operational roadmap.',
    icon: '🚀',
    category: 'Business',
  },
  {
    title: 'Autonomous Deep Market Intelligence',
    urduTitle: 'مارکیٹ ریسرچ اور مسابقتی تجزیہ',
    prompt:
      'Conduct an exhaustive competitive landscape analysis and feasibility study for digital creator monetization platforms in 2026, including market sizing, threat modeling, and differentiation moat.',
    icon: '🔍',
    category: 'Research',
  },
  {
    title: 'Cybersecurity & Code Reliability Audit',
    urduTitle: 'کوڈ آڈٹ اور سیکیورٹی چیک',
    prompt:
      'Perform a deep cybersecurity audit and vulnerability assessment for a web API application: review OWASP top 10 risks, rate limiting, SQL injection defense, JWT token management, and data sanitization.',
    icon: '🛡️',
    category: 'Security',
  },
];

export const AutomatedWorkflowModal: React.FC<AutomatedWorkflowModalProps> = ({
  isOpen,
  onClose,
  initialTaskPrompt = '',
  languagePreference = 'auto',
}) => {
  const [taskPrompt, setTaskPrompt] = useState(initialTaskPrompt);
  const [stagesCount, setStagesCount] = useState<number>(4);
  const [currentLang, setCurrentLang] = useState<'auto' | 'roman-urdu' | 'urdu' | 'english'>(languagePreference);
  const [workflow, setWorkflow] = useState<AutomatedWorkflow | null>(null);
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [currentRunningStageIndex, setCurrentRunningStageIndex] = useState<number | null>(null);
  const [expandedStageIds, setExpandedStageIds] = useState<Record<string, boolean>>({});
  const [masterDeliverable, setMasterDeliverable] = useState<string>('');
  const [isConsolidating, setIsConsolidating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedDeliverable, setCopiedDeliverable] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [pipelineViewMode, setPipelineViewMode] = useState<'visual_canvas' | 'cards'>('visual_canvas');

  useEffect(() => {
    if (initialTaskPrompt) {
      setTaskPrompt(initialTaskPrompt);
    }
  }, [initialTaskPrompt]);

  if (!isOpen) return null;

  // Toggle stage card expand/collapse
  const toggleStageExpand = (stageId: string) => {
    setExpandedStageIds((prev) => ({
      ...prev,
      [stageId]: !prev[stageId],
    }));
  };

  // 1. Generate Multi-Agent Workflow Plan
  const handleOrchestrateWorkflow = async () => {
    if (!taskPrompt.trim()) {
      setErrorMessage('Please describe the task you want our 2,000 AI Agent Fleet to automate.');
      return;
    }

    setErrorMessage(null);
    setIsOrchestrating(true);
    setWorkflow(null);
    setMasterDeliverable('');
    setCurrentRunningStageIndex(null);

    try {
      const res = await fetch('/api/workflow/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskPrompt: taskPrompt.trim(),
          languagePreference: currentLang,
          requestedStagesCount: stagesCount,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.workflow) {
        throw new Error(data.error || 'Failed to orchestrate workflow');
      }

      setWorkflow(data.workflow);
      // Auto-expand all stage cards
      const expanded: Record<string, boolean> = {};
      data.workflow.stages.forEach((s: WorkflowStage) => {
        expanded[s.id] = true;
      });
      setExpandedStageIds(expanded);
    } catch (err: any) {
      console.error('Orchestration error:', err);
      setErrorMessage(err.message || 'Workflow orchestration failed.');
    } finally {
      setIsOrchestrating(false);
    }
  };

  // 2. Run Entire Workflow Pipeline Sequentially
  const handleRunFullWorkflow = async (customWorkflow?: AutomatedWorkflow) => {
    const activeWf = customWorkflow || workflow;
    if (!activeWf || !activeWf.stages || activeWf.stages.length === 0) return;

    setIsRunning(true);
    setErrorMessage(null);
    const updatedStages = [...activeWf.stages];
    const priorOutputs: Array<{
      stageNumber: number;
      title: string;
      agentNumber: number;
      agentName: string;
      output: string;
    }> = [];

    const workflowStartTime = Date.now();

    for (let i = 0; i < updatedStages.length; i++) {
      setCurrentRunningStageIndex(i);
      const stage = updatedStages[i];
      
      // Update stage to active
      stage.status = 'active';
      setWorkflow({
        ...activeWf,
        status: 'running',
        stages: [...updatedStages],
      });

      try {
        const stageRes = await fetch('/api/workflow/execute-stage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            stage,
            taskPrompt: activeWf.taskPrompt,
            languagePreference: activeWf.languagePreference,
            priorOutputs,
          }),
        });

        const stageData = await stageRes.json();
        if (!stageRes.ok || !stageData.success) {
          throw new Error(stageData.error || `Stage ${i + 1} execution failed`);
        }

        stage.status = 'completed';
        stage.output = stageData.output;
        stage.durationMs = stageData.durationMs;
        if (stageData.thoughtLog) {
          stage.thoughtLog = stageData.thoughtLog;
        }

        priorOutputs.push({
          stageNumber: stage.stageNumber,
          title: stage.title,
          agentNumber: stage.assignedAgent.number,
          agentName: stage.assignedAgent.name,
          output: stageData.output,
        });

        setWorkflow({
          ...activeWf,
          status: 'running',
          stages: [...updatedStages],
        });
      } catch (stageErr: any) {
        console.error(`Stage ${i + 1} error:`, stageErr);
        stage.status = 'failed';
        setErrorMessage(`Stage ${i + 1} encountered an issue: ${stageErr.message}`);
        setWorkflow({
          ...activeWf,
          status: 'failed',
          stages: [...updatedStages],
        });
        setIsRunning(false);
        setCurrentRunningStageIndex(null);
        return;
      }
    }

    setCurrentRunningStageIndex(null);
    setIsRunning(false);

    // 3. Consolidate Deliverables
    setIsConsolidating(true);
    try {
      const consRes = await fetch('/api/workflow/consolidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskTitle: activeWf.taskTitle,
          taskPrompt: activeWf.taskPrompt,
          stages: updatedStages,
          languagePreference: activeWf.languagePreference,
        }),
      });

      const consData = await consRes.json();
      if (consRes.ok && consData.success && consData.deliverable) {
        setMasterDeliverable(consData.deliverable);
      }
    } catch (consErr) {
      console.warn('Consolidation failed gracefully:', consErr);
    } finally {
      setIsConsolidating(false);
      setWorkflow({
        ...activeWf,
        status: 'completed',
        stages: [...updatedStages],
        totalDurationMs: Date.now() - workflowStartTime,
      });
    }
  };

  // 1-Click Copy Master Deliverable
  const handleCopyDeliverable = () => {
    const textToCopy =
      masterDeliverable ||
      (workflow?.stages || [])
        .map((s) => `### Stage ${s.stageNumber}: ${s.title}\nAgent: #${s.assignedAgent.number} - ${s.assignedAgent.name}\n\n${s.output || ''}`)
        .join('\n\n---\n\n');

    navigator.clipboard.writeText(textToCopy);
    setCopiedDeliverable(true);
    setTimeout(() => setCopiedDeliverable(false), 2500);
  };

  // 1-Click Download Markdown
  const handleDownloadMarkdown = () => {
    const textToSave =
      masterDeliverable ||
      `# ${workflow?.taskTitle || 'Automated Task Deliverable'}\n\n` +
        (workflow?.stages || [])
          .map((s) => `## Stage ${s.stageNumber}: ${s.title}\n**Agent:** #${s.assignedAgent.number} - ${s.assignedAgent.name} (${s.assignedAgent.domain})\n\n${s.output || ''}`)
          .join('\n\n---\n\n');

    const blob = new Blob([textToSave], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(workflow?.taskTitle || 'task-deliverable').toLowerCase().replace(/[^a-z0-9]/g, '-')}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // 1-Click Download Project ZIP
  const handleDownloadZip = async () => {
    const content =
      masterDeliverable ||
      (workflow?.stages || []).map((s) => s.output || '').join('\n\n');

    const project = extractFilesFromDeliverable(content, workflow?.taskTitle || 'automated_workflow');
    setIsDownloadingZip(true);
    try {
      await downloadProjectAsZip(project);
    } catch (e) {
      console.error('ZIP generation error:', e);
    } finally {
      setIsDownloadingZip(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl my-8 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Workflow className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-white tracking-tight">
                  2,000 AI Agent Fleet Task Automation
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Autonomous Multi-Stage Workflow
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Orchestrate multi-step pipelines where specialized agents collaborate to handle your entire task autonomously.
              </p>
            </div>
          </div>
          <button
            id="btn-close-workflow-modal"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Error Banner */}
          {errorMessage && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">Workflow Error</p>
                <p className="text-xs text-rose-300/90 mt-0.5">{errorMessage}</p>
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-xs text-rose-400 hover:text-rose-200 underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Task Formulation Card */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Describe Your Task to Automate (اپنا ٹاسک بتائیں)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Language:</span>
                <select
                  value={currentLang}
                  onChange={(e) => setCurrentLang(e.target.value as any)}
                  className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:border-indigo-500"
                >
                  <option value="auto">Auto Detect (Roman Urdu / English / Urdu)</option>
                  <option value="roman-urdu">Roman Urdu (Urdu in English)</option>
                  <option value="urdu">Urdu Script (اردو)</option>
                  <option value="english">English</option>
                </select>

                <span className="text-xs text-slate-400 ml-2">Stages:</span>
                <select
                  value={stagesCount}
                  onChange={(e) => setStagesCount(Number(e.target.value))}
                  className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:border-indigo-500"
                >
                  <option value={3}>3 Stages (Fast)</option>
                  <option value={4}>4 Stages (Balanced)</option>
                  <option value={5}>5 Stages (Exhaustive)</option>
                </select>
              </div>
            </div>

            <textarea
              value={taskPrompt}
              onChange={(e) => setTaskPrompt(e.target.value)}
              placeholder="e.g. 'Mujhe ek complete e-commerce store ka architecture aur backend design karke do with full authentication, database schema, payment flow, and security audit' or enter any complex coding, business, or research task..."
              rows={3}
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
            />

            {/* 1-Click Preset Badges */}
            <div className="space-y-1.5">
              <span className="text-xs text-slate-400 font-medium">Quick 1-Click Automated Workflows:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PRESET_WORKFLOWS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setTaskPrompt(preset.prompt);
                    }}
                    className="flex items-center gap-2.5 text-left p-2.5 rounded-lg bg-slate-900/70 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-850 text-xs text-slate-300 transition-all group"
                  >
                    <span className="text-base shrink-0">{preset.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-slate-200 group-hover:text-indigo-300 truncate">
                        {preset.title}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">{preset.urduTitle}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-slate-500">
                {workflow
                  ? `Active Pipeline: ${workflow.stages.length} Stages planned`
                  : 'Click below to allocate specialized fleet agents and build pipeline'}
              </p>
              <div className="flex items-center gap-3">
                <button
                  id="btn-orchestrate-workflow"
                  onClick={handleOrchestrateWorkflow}
                  disabled={isOrchestrating || isRunning || !taskPrompt.trim()}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-all disabled:opacity-50"
                >
                  {isOrchestrating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                      Orchestrating Pipeline...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      Formulate Pipeline Plan
                    </>
                  )}
                </button>

                {workflow && (
                  <button
                    id="btn-run-autonomous-workflow"
                    onClick={() => handleRunFullWorkflow()}
                    disabled={isRunning || isOrchestrating}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    {isRunning ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                        Running Stage {(currentRunningStageIndex ?? 0) + 1} of {workflow.stages.length}...
                      </>
                    ) : workflow.status === 'completed' ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5 text-white" />
                        Re-run Entire Workflow
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 text-white fill-white" />
                        Run Autonomous Workflow
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Workflow Execution Pipeline Visualizer */}
          {workflow && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-semibold text-white">
                    Workflow Pipeline: {workflow.taskTitle}
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    {workflow.stages.length} Stages
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center rounded-xl border border-slate-800 bg-slate-900 p-0.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setPipelineViewMode('visual_canvas')}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                        pipelineViewMode === 'visual_canvas'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Drag & Drop Canvas
                    </button>
                    <button
                      type="button"
                      onClick={() => setPipelineViewMode('cards')}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                        pipelineViewMode === 'cards'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Stage Cards
                    </button>
                  </div>

                  {workflow.status === 'completed' && (
                    <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Completed
                    </span>
                  )}
                </div>
              </div>

              {pipelineViewMode === 'visual_canvas' ? (
                <div className="rounded-2xl border border-slate-800/80 overflow-hidden shadow-inner min-h-[480px]">
                  <VisualWorkflowDashboard
                    initialWorkflow={workflow}
                    onWorkflowChange={(newWf) => setWorkflow(newWf)}
                    languagePreference={currentLang}
                    isEmbedded={true}
                  />
                </div>
              ) : (
                <>
                  {/* Pipeline Progress Stages Bar */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {workflow.stages.map((stage, sIdx) => {
                  const isActive = currentRunningStageIndex === sIdx;
                  const isDone = stage.status === 'completed';
                  const isFailed = stage.status === 'failed';

                  return (
                    <div
                      key={stage.id}
                      className={`p-3 rounded-xl border transition-all ${
                        isActive
                          ? 'bg-indigo-950/40 border-indigo-500 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/50'
                          : isDone
                          ? 'bg-slate-900/90 border-emerald-500/30'
                          : isFailed
                          ? 'bg-rose-950/30 border-rose-500/30'
                          : 'bg-slate-900/60 border-slate-800 opacity-75'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-semibold text-slate-400">STAGE 0{stage.stageNumber}</span>
                        {isActive ? (
                          <span className="flex items-center gap-1 text-indigo-400 font-medium">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Executing
                          </span>
                        ) : isDone ? (
                          <span className="flex items-center gap-1 text-emerald-400 font-medium">
                            <Check className="w-3 h-3" />
                            Done {stage.durationMs ? `(${Math.round(stage.durationMs / 1000)}s)` : ''}
                          </span>
                        ) : isFailed ? (
                          <span className="text-rose-400 font-medium">Failed</span>
                        ) : (
                          <span className="text-slate-500">Pending</span>
                        )}
                      </div>

                      <div className="text-xs font-semibold text-white truncate mb-1">
                        {stage.title}
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <Bot className="w-3 h-3 text-indigo-400 shrink-0" />
                        <span className="truncate">
                          #{stage.assignedAgent.number} {stage.assignedAgent.name}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Detailed Stage Execution Cards */}
              <div className="space-y-3 pt-2">
                {workflow.stages.map((stage, idx) => {
                  const isExpanded = !!expandedStageIds[stage.id];
                  const isActive = currentRunningStageIndex === idx;

                  return (
                    <div
                      key={stage.id}
                      className={`border rounded-xl overflow-hidden transition-all ${
                        isActive
                          ? 'border-indigo-500 bg-slate-900 shadow-md'
                          : stage.status === 'completed'
                          ? 'border-slate-800 bg-slate-900/90'
                          : 'border-slate-800/80 bg-slate-900/50'
                      }`}
                    >
                      {/* Card Header */}
                      <button
                        type="button"
                        onClick={() => toggleStageExpand(stage.id)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-850/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                              stage.status === 'completed'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : isActive
                                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 animate-pulse'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {stage.status === 'completed' ? (
                              <Check className="w-3.5 h-3.5" />
                            ) : (
                              stage.stageNumber
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-semibold text-white truncate">
                                Stage {stage.stageNumber}: {stage.title}
                              </h4>
                              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60 shrink-0">
                                #{stage.assignedAgent.number} {stage.assignedAgent.name}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 truncate mt-0.5">
                              {stage.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 ml-2">
                          {isActive && (
                            <span className="flex items-center gap-1.5 text-xs text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              Collaborating...
                            </span>
                          )}
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </button>

                      {/* Card Content (When expanded) */}
                      {isExpanded && (
                        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 space-y-3">
                          {/* Agent Specialization Badge */}
                          <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                            <div className="flex items-center gap-2">
                              <Bot className="w-3.5 h-3.5 text-indigo-400" />
                              <span>
                                <strong className="text-slate-200">
                                  Agent #{stage.assignedAgent.number}:
                                </strong>{' '}
                                {stage.assignedAgent.specialization} ({stage.assignedAgent.domain})
                              </span>
                            </div>
                            {stage.durationMs && (
                              <span className="text-slate-500">
                                Duration: {Math.round(stage.durationMs / 1000)}s
                              </span>
                            )}
                          </div>

                          {/* Stage Output Content */}
                          {stage.output ? (
                            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 space-y-2 max-h-96 overflow-y-auto font-mono whitespace-pre-wrap leading-relaxed select-text">
                              {stage.output}
                            </div>
                          ) : isActive ? (
                            <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col items-center justify-center text-center space-y-2">
                              <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                              <p className="text-xs font-medium text-slate-300">
                                Agent #{stage.assignedAgent.number} is synthesizing deliverables for Stage {stage.stageNumber}...
                              </p>
                              <p className="text-[11px] text-slate-500">
                                Ingesting task constraints, reasoning, and drafting production-ready assets.
                              </p>
                            </div>
                          ) : (
                            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 text-xs text-slate-500 text-center">
                              Stage queued. Will execute autonomously when previous stages complete.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
                </>
              )}
            </div>
          )}

          {/* Consolidated Master Deliverable Section */}
          {(masterDeliverable || isConsolidating) && (
            <div className="bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">
                      Consolidated Master Deliverable
                    </h3>
                    <p className="text-xs text-slate-400">
                      Unified deliverable synthesized from all {workflow?.stages.length || 4} specialized agents
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id="btn-copy-workflow-deliverable"
                    onClick={handleCopyDeliverable}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-colors"
                  >
                    {copiedDeliverable ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        Copy All
                      </>
                    )}
                  </button>

                  <button
                    id="btn-download-workflow-md"
                    onClick={handleDownloadMarkdown}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-400" />
                    Download .MD
                  </button>

                  <button
                    id="btn-download-workflow-zip"
                    onClick={handleDownloadZip}
                    disabled={isDownloadingZip}
                    className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-colors disabled:opacity-50"
                  >
                    {isDownloadingZip ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Archive className="w-3.5 h-3.5" />
                    )}
                    Download Project ZIP
                  </button>
                </div>
              </div>

              {isConsolidating ? (
                <div className="p-8 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col items-center justify-center text-center space-y-2">
                  <Loader2 className="w-7 h-7 animate-spin text-indigo-400" />
                  <p className="text-sm font-medium text-slate-200">
                    Lead Synthesis Officer is compiling master deliverable...
                  </p>
                  <p className="text-xs text-slate-400">
                    Organizing code modules, documentation, and executive summaries.
                  </p>
                </div>
              ) : (
                <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 max-h-[450px] overflow-y-auto text-xs text-slate-200 space-y-3 font-mono leading-relaxed whitespace-pre-wrap select-text">
                  {masterDeliverable}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-slate-900/90 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-indigo-400" />
            <span>2,000 AI Agent Fleet Reasoning Engine</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
