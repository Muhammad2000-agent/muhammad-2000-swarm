import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Workflow,
  GripVertical,
  Play,
  RotateCcw,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Bot,
  Zap,
  ArrowRight,
  ArrowDown,
  Layers,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Download,
  Copy,
  Check,
  Sparkles,
  Archive,
  Loader2,
  FileCode,
  Info,
  Maximize2,
  Minimize2,
  Sliders,
  X,
  Code2,
  Shield,
  Search,
  Database,
  Terminal,
  Rocket,
  ExternalLink,
  Eye,
  Pencil,
  Globe,
} from 'lucide-react';
import { WorkflowStage, AutomatedWorkflow } from '../types';
import { extractFilesFromDeliverable, downloadProjectAsZip, buildRunnableHtml } from '../utils/zipGenerator';
import { ProjectZipModal } from './ProjectZipModal';

export interface VisualWorkflowDashboardProps {
  initialWorkflow?: AutomatedWorkflow | null;
  onWorkflowChange?: (workflow: AutomatedWorkflow) => void;
  languagePreference?: 'auto' | 'roman-urdu' | 'urdu' | 'english';
  onLanguageChange?: (lang: 'roman-urdu' | 'urdu' | 'english') => void;
  isEmbedded?: boolean;
  onClose?: () => void;
}

// Built-in complex project template chains for instant exploration
const PROJECT_PRESET_CHAINS: Array<{
  id: string;
  name: string;
  urduName: string;
  description: string;
  icon: string;
  taskPrompt: string;
  stages: Array<Omit<WorkflowStage, 'id' | 'stageNumber'> & { id?: string }>;
}> = [
  {
    id: 'saas-fullstack',
    name: 'Full-Stack SaaS Platform Architecture',
    urduName: 'مکمل ساس پلیٹ فارم آرکیٹیکچر',
    description: 'Autonomous multi-tier build: System Specs, DB Schemas, API Microservices, React UI, & Security Audit.',
    icon: '⚡',
    taskPrompt: 'Build a production-ready, full-stack multi-tenant SaaS application with modern React frontend, Node Express backend, PostgreSQL database schemas, authentication middleware, and Stripe webhook payments flow.',
    stages: [
      {
        title: 'System Architecture & Data Modeling',
        description: 'Define multi-tenant architecture, entity relationship diagrams, database schemas, and caching layers.',
        assignedAgent: {
          id: 'agent-12',
          number: 12,
          name: 'Core Systems Architect',
          domain: 'Engineering',
          specialization: 'High-Concurrency Distributed Architecture',
        },
        status: 'pending',
      },
      {
        title: 'Database Schema & Migration DDL',
        description: 'Write complete PostgreSQL SQL schemas, indexed foreign keys, RLS security policies, and seed scripts.',
        assignedAgent: {
          id: 'agent-89',
          number: 89,
          name: 'Postgres DB Specialist',
          domain: 'Data Systems',
          specialization: 'Relational Schemas & Index Optimization',
        },
        status: 'pending',
      },
      {
        title: 'Backend REST API & Auth Middleware',
        description: 'Construct modular Express.js controllers, JWT auth tokens, rate-limiting, and Stripe webhook handlers.',
        assignedAgent: {
          id: 'agent-104',
          number: 104,
          name: 'Node.js Microservices Lead',
          domain: 'Backend Engineering',
          specialization: 'Secure API Endpoints & Payment Webhooks',
        },
        status: 'pending',
      },
      {
        title: 'Frontend Component State & Layouts',
        description: 'Design responsive React TypeScript dashboards, data tables, modal dialogs, and mutation state hooks.',
        assignedAgent: {
          id: 'agent-245',
          number: 245,
          name: 'React UI/UX Architect',
          domain: 'Frontend Engineering',
          specialization: 'Tailwind CSS & Responsive State Interfaces',
        },
        status: 'pending',
      },
      {
        title: 'Zero-Trust Security & Reliability Audit',
        description: 'Scan code for OWASP Top 10 vulnerabilities, input sanitization, CSRF defenses, and exception logging.',
        assignedAgent: {
          id: 'agent-77',
          number: 77,
          name: 'SecOps Penetration Auditor',
          domain: 'Security',
          specialization: 'Vulnerability Detection & Zero-Trust Policies',
        },
        status: 'pending',
      },
    ],
  },
  {
    id: 'ai-pipeline',
    name: 'Autonomous Multi-Agent AI Pipeline',
    urduName: 'ملٹی ایجنٹ اے آئی پائپ لائن',
    description: 'Orchestrated intelligent swarm: Ingestion, Vector Embeddings, Reasoning Swarm, and Evaluation.',
    icon: '🧠',
    taskPrompt: 'Formulate an end-to-end multi-agent AI knowledge retrieval system with dynamic prompt routers, vector search, and automated answer verification.',
    stages: [
      {
        title: 'Information Ingestion & Normalization',
        description: 'Parse raw enterprise documents, extract clean token chunks, and construct standardized JSON schemas.',
        assignedAgent: {
          id: 'agent-301',
          number: 301,
          name: 'ETL Pipeline Specialist',
          domain: 'Data Systems',
          specialization: 'Document Parsing & Structured Text Processing',
        },
        status: 'pending',
      },
      {
        title: 'Vector Embedding & Semantic Indexing',
        description: 'Calculate high-dimensional vector embeddings, configure similarity distance metrics, and metadata filtering.',
        assignedAgent: {
          id: 'agent-415',
          number: 415,
          name: 'Vector Database Engineer',
          domain: 'Core AI',
          specialization: 'Semantic Search & HNSW Indexing',
        },
        status: 'pending',
      },
      {
        title: 'Multi-Agent Consensus & Deep Reasoning',
        description: 'Deploy peer review swarm where multiple specialized agents cross-examine claims and draft unified synthesis.',
        assignedAgent: {
          id: 'agent-99',
          number: 99,
          name: 'Swarm Reasoning Orchestrator',
          domain: 'Core AI',
          specialization: 'Agent Swarm Consensus & Chain-of-Thought',
        },
        status: 'pending',
      },
      {
        title: 'Safety Evaluation & Hallucination Guardrails',
        description: 'Cross-reference outputs against ground truth source chunks and score confidence thresholds.',
        assignedAgent: {
          id: 'agent-520',
          number: 520,
          name: 'AI Safety & Factuality Inspector',
          domain: 'Security & Quality',
          specialization: 'Hallucination Mitigation & Output Verification',
        },
        status: 'pending',
      },
    ],
  },
  {
    id: 'startup-launch',
    name: 'Comprehensive Startup Launch & Go-To-Market',
    urduName: 'اسٹارٹ اپ لانچ اور بزنس اسٹریٹجی',
    description: 'Strategic roadmap: Market Intelligence, Product Strategy, Growth Loops, & Financial Model.',
    icon: '🚀',
    taskPrompt: 'Formulate a comprehensive end-to-end launch plan for an AI SaaS startup, including product market fit analysis, pricing tiers, customer acquisition funnels, and 90-day operational roadmap.',
    stages: [
      {
        title: 'Market Intelligence & Competitive Moat',
        description: 'Analyze TAM/SAM/SOM, identify incumbent blind spots, and define defensible technology advantages.',
        assignedAgent: {
          id: 'agent-1102',
          number: 1102,
          name: 'Strategic Market Analyst',
          domain: 'Business Strategy',
          specialization: 'Competitive Moats & Opportunity Sizing',
        },
        status: 'pending',
      },
      {
        title: 'Product Positioning & Monetization Tiers',
        description: 'Structure customer personas, value propositions, freemium-to-paid conversion triggers, and pricing tiers.',
        assignedAgent: {
          id: 'agent-1150',
          number: 1150,
          name: 'Pricing & Monetization Strategist',
          domain: 'Product Strategy',
          specialization: 'SaaS Unit Economics & Pricing Psychology',
        },
        status: 'pending',
      },
      {
        title: 'Customer Acquisition & Growth Funnels',
        description: 'Design automated onboarding flows, virality loops, developer advocacy programs, and retention mechanics.',
        assignedAgent: {
          id: 'agent-1234',
          number: 1234,
          name: 'Growth Systems Architect',
          domain: 'Growth Marketing',
          specialization: 'Viral Loops & Automated Funnel Engineering',
        },
        status: 'pending',
      },
      {
        title: 'Financial Model & 90-Day Execution Plan',
        description: 'Deliver month-by-month burn rate forecasts, milestone deliverables, hiring roadmap, and KPI dashboards.',
        assignedAgent: {
          id: 'agent-1301',
          number: 1301,
          name: 'Chief Operations Strategist',
          domain: 'Executive Leadership',
          specialization: 'Runway Forecasting & Milestones Roadmapping',
        },
        status: 'pending',
      },
    ],
  },
];

// Helper to create fresh workflow instance from template
function createWorkflowFromPreset(preset: typeof PROJECT_PRESET_CHAINS[0]): AutomatedWorkflow {
  return {
    id: 'wf-' + Date.now(),
    taskTitle: preset.name,
    taskPrompt: preset.taskPrompt,
    languagePreference: 'auto',
    status: 'idle',
    createdAt: new Date().toISOString(),
    stages: preset.stages.map((st, idx) => ({
      id: `stage-${Date.now()}-${idx + 1}`,
      stageNumber: idx + 1,
      title: st.title,
      description: st.description,
      assignedAgent: st.assignedAgent,
      status: 'pending',
    })),
  };
}

export const VisualWorkflowDashboard: React.FC<VisualWorkflowDashboardProps> = ({
  initialWorkflow,
  onWorkflowChange,
  languagePreference = 'auto',
  onLanguageChange,
  isEmbedded = false,
  onClose,
}) => {
  // Main Workflow State
  const [workflow, setWorkflow] = useState<AutomatedWorkflow>(() => {
    if (initialWorkflow && initialWorkflow.stages && initialWorkflow.stages.length > 0) {
      return initialWorkflow;
    }
    return createWorkflowFromPreset(PROJECT_PRESET_CHAINS[0]);
  });

  // Drag and Drop States
  const [draggedStageId, setDraggedStageId] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dropPosition, setDropPosition] = useState<'before' | 'after' | null>(null);
  const [reorderNotification, setReorderNotification] = useState<string | null>(null);

  // Execution & UI States
  const [isRunning, setIsRunning] = useState(false);
  const [activeStageIndex, setActiveStageIndex] = useState<number | null>(null);
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
  const [isConsolidating, setIsConsolidating] = useState(false);
  const [masterDeliverable, setMasterDeliverable] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedDeliverable, setCopiedDeliverable] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [isZipModalOpen, setIsZipModalOpen] = useState(false);
  const [zipModalMode, setZipModalMode] = useState<'preview' | 'files'>('preview');
  const [viewOrientation, setViewOrientation] = useState<'horizontal' | 'grid'>('horizontal');
  const [isAddStageOpen, setIsAddStageOpen] = useState(false);

  // Add Stage Form State
  const [newStageTitle, setNewStageTitle] = useState('');
  const [newStageDesc, setNewStageDesc] = useState('');
  const [newStageAgentName, setNewStageAgentName] = useState('Senior Operations Engineer');
  const [newStageDomain, setNewStageDomain] = useState('Engineering');

  // Inline Stage Editing State
  const [isEditingStage, setIsEditingStage] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');

  // Keep parent in sync
  useEffect(() => {
    if (onWorkflowChange) {
      onWorkflowChange(workflow);
    }
  }, [workflow, onWorkflowChange]);

  // If initialWorkflow changes from outside
  useEffect(() => {
    if (initialWorkflow && initialWorkflow.id !== workflow.id) {
      setWorkflow(initialWorkflow);
      if (initialWorkflow.stages[0]) {
        setSelectedStageId(initialWorkflow.stages[0].id);
      }
    }
  }, [initialWorkflow]);

  // Set default selected stage
  useEffect(() => {
    if (!selectedStageId && workflow.stages.length > 0) {
      setSelectedStageId(workflow.stages[0].id);
    }
  }, [workflow.stages, selectedStageId]);

  // Sync edit form with selected stage
  useEffect(() => {
    const cur = workflow.stages.find((s) => s.id === selectedStageId);
    if (cur) {
      setEditTitle(cur.title);
      setEditDesc(cur.description);
    }
  }, [selectedStageId, workflow.stages]);

  const handleUpdateSelectedStage = (updates: Partial<WorkflowStage>) => {
    if (!selectedStageId || isRunning) return;
    setWorkflow((prev) => ({
      ...prev,
      stages: prev.stages.map((stage) =>
        stage.id === selectedStageId ? { ...stage, ...updates } : stage
      ),
    }));
  };

  const handleSaveStageEdit = () => {
    if (!selectedStageId) return;
    const cur = workflow.stages.find((s) => s.id === selectedStageId);
    if (!cur) return;
    handleUpdateSelectedStage({
      title: editTitle.trim() || cur.title,
      description: editDesc.trim() || cur.description,
    });
    setIsEditingStage(false);
    setReorderNotification('Stage updated successfully');
  };

  // Clear reorder notification after timeout
  useEffect(() => {
    if (reorderNotification) {
      const timer = setTimeout(() => setReorderNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [reorderNotification]);

  // --------------------------------------------------------------------------
  // DRAG AND DROP REORDERING ENGINE
  // --------------------------------------------------------------------------
  const handleDragStart = (e: React.DragEvent, stageId: string) => {
    if (isRunning) return;
    setDraggedStageId(stageId);
    e.dataTransfer.setData('text/plain', stageId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (isRunning) return;
    e.dataTransfer.dropEffect = 'move';

    // Calculate if cursor is in first half or second half of node
    const rect = e.currentTarget.getBoundingClientRect();
    const isHorizontal = viewOrientation === 'horizontal';
    const offset = isHorizontal ? e.clientX - rect.left : e.clientY - rect.top;
    const dimension = isHorizontal ? rect.width : rect.height;

    setDragOverIndex(index);
    setDropPosition(offset < dimension / 2 ? 'before' : 'after');
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
    setDropPosition(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (isRunning) return;

    const sourceStageId = e.dataTransfer.getData('text/plain') || draggedStageId;
    if (!sourceStageId) return;

    const currentStages = [...workflow.stages];
    const sourceIndex = currentStages.findIndex((s) => s.id === sourceStageId);
    if (sourceIndex === -1) return;

    const [movedStage] = currentStages.splice(sourceIndex, 1);
    let finalIndex = targetIndex;

    // Adjust for 'after' positioning
    if (dropPosition === 'after' && sourceIndex > targetIndex) {
      finalIndex = targetIndex + 1;
    } else if (dropPosition === 'before' && sourceIndex < targetIndex) {
      finalIndex = Math.max(0, targetIndex - 1);
    }

    currentStages.splice(finalIndex, 0, movedStage);

    // Re-index stage numbers
    const updatedStages = currentStages.map((s, idx) => ({
      ...s,
      stageNumber: idx + 1,
    }));

    setWorkflow((prev) => ({
      ...prev,
      stages: updatedStages,
    }));

    setReorderNotification(
      `Sequence reordered: "${movedStage.title}" is now Stage #${finalIndex + 1} of ${updatedStages.length}`
    );

    setDraggedStageId(null);
    setDragOverIndex(null);
    setDropPosition(null);
  };

  const handleDragEnd = () => {
    setDraggedStageId(null);
    setDragOverIndex(null);
    setDropPosition(null);
  };

  // --------------------------------------------------------------------------
  // 1-CLICK ACCESSIBILITY REORDER BUTTONS (MOVE PREVIOUS / MOVE NEXT)
  // --------------------------------------------------------------------------
  const moveStage = (index: number, direction: 'left' | 'right') => {
    if (isRunning) return;
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= workflow.stages.length) return;

    const newStages = [...workflow.stages];
    const [item] = newStages.splice(index, 1);
    newStages.splice(targetIndex, 0, item);

    const updated = newStages.map((s, idx) => ({
      ...s,
      stageNumber: idx + 1,
    }));

    setWorkflow((prev) => ({
      ...prev,
      stages: updated,
    }));

    setReorderNotification(`Moved "${item.title}" to Stage #${targetIndex + 1}`);
  };

  // Delete Stage
  const handleDeleteStage = (stageId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isRunning) return;
    if (workflow.stages.length <= 1) {
      setErrorMessage('A workflow chain must have at least one stage.');
      return;
    }

    const filtered = workflow.stages.filter((s) => s.id !== stageId);
    const updated = filtered.map((s, idx) => ({
      ...s,
      stageNumber: idx + 1,
    }));

    setWorkflow((prev) => ({
      ...prev,
      stages: updated,
    }));

    if (selectedStageId === stageId && updated.length > 0) {
      setSelectedStageId(updated[0].id);
    }
  };

  // Add Custom Stage
  const handleAddNewStage = () => {
    if (!newStageTitle.trim()) {
      setErrorMessage('Please enter a title for the new agent node.');
      return;
    }

    const randomAgentNumber = Math.floor(Math.random() * 1900) + 100;
    const newStage: WorkflowStage = {
      id: `stage-${Date.now()}`,
      stageNumber: workflow.stages.length + 1,
      title: newStageTitle.trim(),
      description: newStageDesc.trim() || 'Execute specialized domain analysis and code synthesis.',
      assignedAgent: {
        id: `agent-${randomAgentNumber}`,
        number: randomAgentNumber,
        name: newStageAgentName.trim() || `Specialized Agent #${randomAgentNumber}`,
        domain: newStageDomain,
        specialization: `${newStageDomain} Implementation Specialist`,
      },
      status: 'pending',
    };

    setWorkflow((prev) => ({
      ...prev,
      stages: [...prev.stages, newStage],
    }));

    setSelectedStageId(newStage.id);
    setIsAddStageOpen(false);
    setNewStageTitle('');
    setNewStageDesc('');
    setReorderNotification(`Added new Stage #${workflow.stages.length + 1}: ${newStage.title}`);
  };

  // Reset Workflow to a chosen preset
  const handleSelectPreset = (presetId: string) => {
    if (isRunning) return;
    const found = PROJECT_PRESET_CHAINS.find((p) => p.id === presetId);
    if (!found) return;

    const newWf = createWorkflowFromPreset(found);
    setWorkflow(newWf);
    setSelectedStageId(newWf.stages[0]?.id || null);
    setMasterDeliverable('');
    setReorderNotification(`Loaded template: ${found.name}`);
  };

  // --------------------------------------------------------------------------
  // RUN PIPELINE SEQUENTIALLY THROUGH RESILIENT MULTI-AGENT BACKEND
  // --------------------------------------------------------------------------
  const handleRunPipeline = async () => {
    if (isRunning || workflow.stages.length === 0) return;

    setIsRunning(true);
    setErrorMessage(null);
    setActiveStageIndex(0);

    const stagesCopy: WorkflowStage[] = workflow.stages.map((s) => ({
      ...s,
      status: 'pending' as WorkflowStage['status'],
      output: undefined,
      durationMs: undefined,
    }));

    setWorkflow((prev) => ({
      ...prev,
      status: 'running',
      stages: stagesCopy,
    }));

    const priorOutputs: Array<{
      stageNumber: number;
      title: string;
      agentNumber: number;
      agentName: string;
      output: string;
    }> = [];

    const startTime = Date.now();

    for (let i = 0; i < stagesCopy.length; i++) {
      setActiveStageIndex(i);
      const stage = stagesCopy[i];
      setSelectedStageId(stage.id);

      stage.status = 'active';
      setWorkflow((prev) => ({
        ...prev,
        stages: [...stagesCopy],
      }));

      try {
        const res = await fetch('/api/workflow/execute-stage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            stage,
            taskPrompt: workflow.taskPrompt || workflow.taskTitle,
            languagePreference,
            priorOutputs,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || `Execution of Stage ${i + 1} failed`);
        }

        stage.status = 'completed';
        stage.output = data.output;
        stage.durationMs = data.durationMs;
        if (data.thoughtLog) {
          stage.thoughtLog = data.thoughtLog;
        }

        priorOutputs.push({
          stageNumber: stage.stageNumber,
          title: stage.title,
          agentNumber: stage.assignedAgent.number,
          agentName: stage.assignedAgent.name,
          output: data.output,
        });

        setWorkflow((prev) => ({
          ...prev,
          stages: [...stagesCopy],
        }));
      } catch (err: any) {
        console.error(`Stage ${i + 1} error:`, err);
        stage.status = 'failed';
        setErrorMessage(`Stage ${i + 1} error: ${err.message || 'Execution failed'}`);
        setWorkflow((prev) => ({
          ...prev,
          status: 'failed',
          stages: [...stagesCopy],
        }));
        setIsRunning(false);
        setActiveStageIndex(null);
        return;
      }
    }

    setIsRunning(false);
    setActiveStageIndex(null);

    // Consolidate
    setIsConsolidating(true);
    try {
      const consRes = await fetch('/api/workflow/consolidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskTitle: workflow.taskTitle,
          taskPrompt: workflow.taskPrompt || workflow.taskTitle,
          stages: stagesCopy,
          languagePreference,
        }),
      });
      const consData = await consRes.json();
      if (consRes.ok && consData.success && consData.deliverable) {
        setMasterDeliverable(consData.deliverable);
      }
    } catch (e) {
      console.warn('Consolidation failed gracefully:', e);
    } finally {
      setIsConsolidating(false);
      setWorkflow((prev) => ({
        ...prev,
        status: 'completed',
        stages: [...stagesCopy],
        totalDurationMs: Date.now() - startTime,
      }));
    }
  };

  // Consolidated Deliverables & Multi-File extraction
  const consolidatedContent = useMemo(() => {
    return (
      masterDeliverable ||
      workflow.stages
        .filter((s) => s.output)
        .map((s) => `### Stage ${s.stageNumber}: ${s.title}\nAgent: #${s.assignedAgent.number} ${s.assignedAgent.name}\n\n${s.output || ''}`)
        .join('\n\n---\n\n')
    );
  }, [masterDeliverable, workflow.stages]);

  const extractedConsolidated = useMemo(() => {
    return extractFilesFromDeliverable(consolidatedContent, workflow.taskTitle || 'chain_project');
  }, [consolidatedContent, workflow.taskTitle]);

  const hasConsolidatedRunnable = useMemo(() => {
    return Boolean(buildRunnableHtml(extractedConsolidated.files));
  }, [extractedConsolidated.files]);

  // Export Deliverables
  const handleCopy = () => {
    navigator.clipboard.writeText(consolidatedContent);
    setCopiedDeliverable(true);
    setTimeout(() => setCopiedDeliverable(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsDownloadingZip(true);
    try {
      await downloadProjectAsZip(extractedConsolidated.files, extractedConsolidated.projectName);
    } catch (e) {
      console.error('ZIP generation error:', e);
    } finally {
      setIsDownloadingZip(false);
    }
  };

  const selectedStage = workflow.stages.find((s) => s.id === selectedStageId) || workflow.stages[0];

  return (
    <div className={`flex flex-col bg-slate-950 text-slate-100 ${isEmbedded ? 'w-full min-h-full flex-1' : 'min-h-screen'}`}>
      {/* TOP DASHBOARD CONTROL BAR */}
      <div className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 sm:px-6 py-3 sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-sky-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
            <Workflow className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                <span>Agent Task Chains & Visual Director</span>
                <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Drag & Drop
                </span>
              </h2>
              {workflow.status === 'completed' && (
                <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" />
                  Chain Complete
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 truncate max-w-md">
              Drag nodes to re-order execution sequence. Agents pass outputs down the chain.
            </p>
          </div>
        </div>

        {/* Action Controls & Presets */}
        <div className="flex items-center gap-2">
          {/* Preset Selector */}
          <div className="hidden lg:flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 p-1 text-xs">
            <span className="text-[11px] text-slate-400 px-1.5 font-medium">Template:</span>
            {PROJECT_PRESET_CHAINS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset.id)}
                disabled={isRunning}
                className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-850 transition-colors disabled:opacity-50"
                title={preset.description}
              >
                <span>{preset.icon}</span>{' '}
                <span className="hidden xl:inline">{preset.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center rounded-xl border border-slate-800 bg-slate-900 p-1 text-xs">
            <button
              onClick={() => setViewOrientation('horizontal')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                viewOrientation === 'horizontal'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Horizontal Flow Chain View"
            >
              Horizontal Chain
            </button>
            <button
              onClick={() => setViewOrientation('grid')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                viewOrientation === 'grid'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Multi-Column Canvas Matrix View"
            >
              Node Grid
            </button>
          </div>

          {/* Add Stage Node Button */}
          <button
            onClick={() => setIsAddStageOpen(true)}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium border border-slate-700 transition-colors disabled:opacity-50"
            title="Add a new specialized agent stage into this chain"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Add Node</span>
          </button>

          {/* Unified Single-Box Language Selector Option next to Add Node button */}
          {onLanguageChange && (
            <div
              className="flex items-center rounded-xl border border-slate-800 bg-slate-900 px-2 py-1 text-xs shadow-sm hover:border-slate-700 transition-all shrink-0"
              title="Change Language (زبان تبدیل کریں)"
            >
              <Globe className="h-3.5 w-3.5 text-indigo-400 mr-1.5 shrink-0" />
              <select
                value={languagePreference === 'auto' ? 'roman-urdu' : languagePreference}
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
          )}

          {/* Run / Re-run Pipeline Button */}
          <button
            id="btn-execute-task-chain"
            onClick={handleRunPipeline}
            disabled={isRunning || workflow.stages.length === 0}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Running Node {(activeStageIndex ?? 0) + 1}...</span>
              </>
            ) : workflow.status === 'completed' ? (
              <>
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Re-Execute Chain</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Execute Chain</span>
              </>
            )}
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* NOTIFICATIONS & GUIDANCE BAR */}
      <div className="bg-slate-900/60 border-b border-slate-800/80 px-6 py-2 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span>
            {reorderNotification ? (
              <strong className="text-indigo-300 font-semibold">{reorderNotification}</strong>
            ) : (
              <span>
                <strong>Sequence Control:</strong> Drag any node card left/right or click the arrow buttons to rearrange execution order.
              </span>
            )}
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-[11px] font-mono text-slate-500">
          <span>Capacity: 2,000 AI Agents</span>
          <span>•</span>
          <span>Stages: {workflow.stages.length}</span>
        </div>
      </div>

      {/* ERROR BANNER */}
      {errorMessage && (
        <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="underline hover:text-rose-100">
            Dismiss
          </button>
        </div>
      )}

      {/* MAIN WORKSPACE AREA: VISUAL CHAIN CANVAS & INSPECTOR */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
        {/* LEFT / TOP: VISUAL NODE DRAG-AND-DROP CANVAS */}
        <div className="w-full lg:flex-1 p-4 sm:p-6 space-y-6 lg:overflow-y-auto lg:min-h-0 scrollbar-thin scrollbar-thumb-slate-800">
          {/* Active Chain Title & Meta */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-semibold text-white">
                  Active Task Chain: {workflow.taskTitle}
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                {workflow.taskPrompt}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                {workflow.stages.length} Nodes in Sequence
              </span>
            </div>
          </div>

          {/* DYNAMIC DRAGGABLE NODE CANVAS */}
          {viewOrientation === 'horizontal' ? (
            /* HORIZONTAL PIPELINE VIEW WITH CONNECTOR ARROWS */
            <div className="flex items-stretch gap-3 overflow-x-auto pb-4 pt-2 px-1 scrollbar-thin scrollbar-thumb-slate-800">
              {workflow.stages.map((stage, index) => {
                const isSelected = selectedStageId === stage.id;
                const isActive = stage.status === 'active';
                const isDone = stage.status === 'completed';
                const isFailed = stage.status === 'failed';
                const isDraggingThis = draggedStageId === stage.id;
                const isTarget = dragOverIndex === index;

                return (
                  <React.Fragment key={stage.id}>
                    {/* Node Card */}
                    <div
                      draggable={!isRunning}
                      onDragStart={(e) => handleDragStart(e, stage.id)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                      onClick={() => setSelectedStageId(stage.id)}
                      className={`relative min-w-[280px] max-w-[320px] rounded-2xl border p-4 flex flex-col justify-between transition-all duration-200 cursor-pointer select-none group ${
                        isDraggingThis
                          ? 'opacity-40 scale-95 border-dashed border-indigo-400'
                          : isTarget
                          ? 'border-indigo-400 bg-indigo-950/40 ring-2 ring-indigo-500/50 scale-[1.02]'
                          : isSelected
                          ? 'bg-slate-900 border-indigo-500 shadow-xl shadow-indigo-500/10 ring-1 ring-indigo-500/40'
                          : isActive
                          ? 'bg-indigo-950/30 border-indigo-400 shadow-lg shadow-indigo-500/20'
                          : isDone
                          ? 'bg-slate-900/80 border-emerald-500/40'
                          : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/70'
                      }`}
                    >
                      {/* Drag Insertion Indicator Line */}
                      {isTarget && dropPosition === 'before' && (
                        <div className="absolute -left-2 top-0 bottom-0 w-1 bg-indigo-400 rounded-full shadow-[0_0_8px_#818cf8]" />
                      )}
                      {isTarget && dropPosition === 'after' && (
                        <div className="absolute -right-2 top-0 bottom-0 w-1 bg-indigo-400 rounded-full shadow-[0_0_8px_#818cf8]" />
                      )}

                      {/* Header of Node */}
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          {/* Drag Handle & Sequence Number */}
                          <div className="flex items-center gap-1.5">
                            <div
                              className="cursor-grab active:cursor-grabbing p-1 text-slate-500 hover:text-indigo-400 hover:bg-slate-800/80 rounded transition-colors"
                              title="Drag to reorder sequence"
                            >
                              <GripVertical className="w-4 h-4" />
                            </div>
                            <span className="px-2 py-0.5 rounded-lg text-xs font-bold font-mono bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                              #{stage.stageNumber}
                            </span>
                          </div>

                          {/* Status Badge */}
                          <div className="flex items-center gap-1">
                            {isActive ? (
                              <span className="flex items-center gap-1 text-[11px] font-medium text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full animate-pulse">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Active
                              </span>
                            ) : isDone ? (
                              <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                                <Check className="w-3 h-3" />
                                {stage.durationMs ? `${Math.round(stage.durationMs / 1000)}s` : 'Done'}
                              </span>
                            ) : isFailed ? (
                              <span className="text-[11px] font-medium text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
                                Failed
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                                In Queue
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Title & Description */}
                        <h4 className="text-sm font-semibold text-white leading-snug line-clamp-1 mb-1 group-hover:text-indigo-200 transition-colors">
                          {stage.title}
                        </h4>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                          {stage.description}
                        </p>
                      </div>

                      {/* Agent Badge & Specialization */}
                      <div className="pt-2.5 border-t border-slate-800/80 space-y-2">
                        <div className="flex items-center gap-2 text-xs">
                          <div className="w-6 h-6 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0">
                            <Bot className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-slate-200 truncate text-[11px]">
                              Agent #{stage.assignedAgent.number} • {stage.assignedAgent.name}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">
                              {stage.assignedAgent.domain}
                            </div>
                          </div>
                        </div>

                        {/* Card Reordering Footbar (1-Click Arrows + Delete) */}
                        <div className="flex items-center justify-between pt-1 text-slate-500 text-xs">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                moveStage(index, 'left');
                              }}
                              disabled={index === 0 || isRunning}
                              className="p-1 rounded hover:bg-slate-800 hover:text-slate-200 disabled:opacity-30 transition-colors"
                              title="Move Earlier in Sequence"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-[10px] font-mono text-slate-400">Order</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                moveStage(index, 'right');
                              }}
                              disabled={index === workflow.stages.length - 1 || isRunning}
                              className="p-1 rounded hover:bg-slate-800 hover:text-slate-200 disabled:opacity-30 transition-colors"
                              title="Move Later in Sequence"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => handleDeleteStage(stage.id, e)}
                            disabled={isRunning}
                            className="p-1 rounded hover:bg-rose-950 hover:text-rose-400 text-slate-600 transition-colors"
                            title="Remove Stage Node"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Connector Arrow Between Nodes */}
                    {index < workflow.stages.length - 1 && (
                      <div className="flex items-center justify-center px-1 text-slate-600">
                        <div
                          className={`flex items-center justify-center w-8 h-8 rounded-full border transition-all ${
                            isActive
                              ? 'border-indigo-400 text-indigo-400 bg-indigo-500/20 animate-pulse shadow-[0_0_12px_#6366f1]'
                              : isDone
                              ? 'border-emerald-500/40 text-emerald-400 bg-slate-900'
                              : 'border-slate-800 text-slate-600 bg-slate-900/40'
                          }`}
                          title={`Next: Stage #${index + 2}`}
                        >
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          ) : (
            /* MULTI-COLUMN GRID CANVAS VIEW */
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {workflow.stages.map((stage, index) => {
                const isSelected = selectedStageId === stage.id;
                const isActive = stage.status === 'active';
                const isDone = stage.status === 'completed';
                const isDraggingThis = draggedStageId === stage.id;
                const isTarget = dragOverIndex === index;

                return (
                  <div
                    key={stage.id}
                    draggable={!isRunning}
                    onDragStart={(e) => handleDragStart(e, stage.id)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    onClick={() => setSelectedStageId(stage.id)}
                    className={`relative rounded-2xl border p-4.5 flex flex-col justify-between transition-all duration-200 cursor-pointer select-none ${
                      isDraggingThis
                        ? 'opacity-40 scale-95 border-dashed border-indigo-400'
                        : isTarget
                        ? 'border-indigo-400 bg-indigo-950/40 ring-2 ring-indigo-500/50'
                        : isSelected
                        ? 'bg-slate-900 border-indigo-500 shadow-xl shadow-indigo-500/10 ring-1 ring-indigo-500/40'
                        : isActive
                        ? 'bg-indigo-950/30 border-indigo-400'
                        : isDone
                        ? 'bg-slate-900/80 border-emerald-500/40'
                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="cursor-grab active:cursor-grabbing p-1 text-slate-500 hover:text-indigo-400 hover:bg-slate-800 rounded transition-colors"
                            title="Drag to reorder"
                          >
                            <GripVertical className="w-4 h-4" />
                          </div>
                          <span className="px-2 py-0.5 rounded-lg text-xs font-bold font-mono bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                            Stage 0{stage.stageNumber}
                          </span>
                        </div>
                        {isDone && (
                          <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Done
                          </span>
                        )}
                        {isActive && (
                          <span className="text-[11px] font-medium text-indigo-400 flex items-center gap-1 animate-pulse">
                            <Loader2 className="w-3 h-3 animate-spin" /> Running
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-semibold text-white mb-1">{stage.title}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2">{stage.description}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-[11px] text-slate-300">
                        <Bot className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="truncate">#{stage.assignedAgent.number} {stage.assignedAgent.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveStage(index, 'left');
                          }}
                          disabled={index === 0 || isRunning}
                          className="p-1 rounded hover:bg-slate-800 text-slate-400 disabled:opacity-30"
                          title="Move Earlier"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveStage(index, 'right');
                          }}
                          disabled={index === workflow.stages.length - 1 || isRunning}
                          className="p-1 rounded hover:bg-slate-800 text-slate-400 disabled:opacity-30"
                          title="Move Later"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* MASTER DELIVERABLE PREVIEW & EXPORT BAR (IF COMPLETED) */}
          {(masterDeliverable || workflow.status === 'completed' || isConsolidating) && (
            <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      Consolidated Project Deliverable
                    </h4>
                    <p className="text-xs text-slate-400">
                      Synthesized outputs from all {workflow.stages.length} sequence stages
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {hasConsolidatedRunnable && (
                    <button
                      id="btn-workflow-launch-google"
                      onClick={() => {
                        setZipModalMode('preview');
                        setIsZipModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/30 transition-all"
                      title="Direct launch in Google Chrome / Live browser sandbox"
                    >
                      <Rocket className="w-3.5 h-3.5 text-emerald-200" />
                      <span>Launch in Google</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setZipModalMode('files');
                      setIsZipModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
                    title="Inspect File Tree & Code"
                  >
                    <Eye className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Inspect Files ({extractedConsolidated.files.length})</span>
                  </button>

                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
                  >
                    {copiedDeliverable ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy All</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleDownloadZip}
                    disabled={isDownloadingZip}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-colors disabled:opacity-50"
                  >
                    {isDownloadingZip ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Archive className="w-3.5 h-3.5" />
                    )}
                    <span>Download Project ZIP</span>
                  </button>
                </div>
              </div>

              {isConsolidating ? (
                <div className="p-6 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col items-center justify-center space-y-2 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                  <p className="text-xs font-medium text-slate-300">
                    Lead Synthesis Officer is compiling master deliverable...
                  </p>
                </div>
              ) : (
                <div className="max-h-72 overflow-y-auto p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed select-text">
                  {masterDeliverable ||
                    workflow.stages
                      .filter((s) => s.output)
                      .map((s) => `### Stage ${s.stageNumber}: ${s.title}\n\n${s.output}`)
                      .join('\n\n---\n\n') ||
                    'Deliverables ready.'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT / BOTTOM: STAGE NODE INSPECTOR DRAWER */}
        <div className="w-full lg:w-96 shrink-0 border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-900/70 p-5 flex flex-col space-y-4 lg:overflow-y-auto lg:min-h-0 scrollbar-thin scrollbar-thumb-slate-800">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-indigo-400" />
              <h4 className="text-sm font-semibold text-white">Node Inspector</h4>
            </div>
            {selectedStage && (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Stage 0{selectedStage.stageNumber}
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditingStage(!isEditingStage)}
                  className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-all ${
                    isEditingStage
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-750'
                  }`}
                  title="Edit stage details"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span className="text-[11px]">{isEditingStage ? 'Editing' : 'Edit'}</span>
                </button>
              </div>
            )}
          </div>

          {selectedStage ? (
            <div className="space-y-4">
              {/* Quick Node Position and Delete Actions */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                <span className="text-slate-400 text-[11px]">Sequence Order:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => moveStage(selectedStage.stageNumber - 1, 'left')}
                    disabled={selectedStage.stageNumber === 1 || isRunning}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    title="Move earlier (Left)"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-mono text-indigo-300 px-1">
                    {selectedStage.stageNumber} / {workflow.stages.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => moveStage(selectedStage.stageNumber - 1, 'right')}
                    disabled={selectedStage.stageNumber === workflow.stages.length || isRunning}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    title="Move later (Right)"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteStage(selectedStage.id, e)}
                    disabled={workflow.stages.length <= 1 || isRunning}
                    className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:text-rose-200 hover:bg-rose-500/20 disabled:opacity-30 disabled:cursor-not-allowed ml-1 transition-all"
                    title="Delete stage"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Title & Description: Editable when isEditingStage is true */}
              {isEditingStage ? (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-indigo-500/40 space-y-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-300 uppercase tracking-wider">
                      Stage Title
                    </label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-300 uppercase tracking-wider">
                      Stage Objective / Description
                    </label>
                    <textarea
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      rows={3}
                      className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsEditingStage(false)}
                      className="px-2.5 py-1 text-xs rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveStageEdit}
                      className="flex items-center gap-1 px-3 py-1 text-xs rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    Stage Title
                  </label>
                  <div className="text-sm font-semibold text-white mt-0.5">
                    {selectedStage.title}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {selectedStage.description}
                  </p>
                </div>
              )}

              {/* Assigned Agent Details */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-indigo-300 flex items-center gap-1.5">
                    <Bot className="w-3.5 h-3.5" />
                    Agent #{selectedStage.assignedAgent.number}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    {selectedStage.assignedAgent.domain}
                  </span>
                </div>
                <div className="text-xs font-medium text-slate-200">
                  {selectedStage.assignedAgent.name}
                </div>
                <div className="text-[11px] text-slate-400">
                  Specialization: {selectedStage.assignedAgent.specialization}
                </div>
              </div>

              {/* Status & Timing */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase">Status</div>
                  <div className="font-medium text-slate-200 capitalize mt-0.5">
                    {selectedStage.status}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase">Duration</div>
                  <div className="font-medium text-slate-200 mt-0.5">
                    {selectedStage.durationMs
                      ? `${(selectedStage.durationMs / 1000).toFixed(1)}s`
                      : '--'}
                  </div>
                </div>
              </div>

              {/* Stage Deliverable Output Preview */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    Stage Output Deliverable
                  </label>
                  {selectedStage.output && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedStage.output || '');
                        setReorderNotification('Copied Stage Deliverable');
                      }}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300"
                    >
                      Copy Output
                    </button>
                  )}
                </div>

                {selectedStage.output ? (
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 max-h-72 overflow-y-auto whitespace-pre-wrap leading-relaxed select-text">
                    {selectedStage.output}
                  </div>
                ) : selectedStage.status === 'active' ? (
                  <div className="p-6 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col items-center justify-center text-center space-y-2">
                    <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                    <p className="text-xs font-medium text-slate-300">
                      Generating live assets...
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60 text-xs text-slate-500 text-center">
                    Pending execution. Deliverables will appear here once this node completes.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              Select a stage node from the canvas to inspect its parameters.
            </div>
          )}
        </div>
      </div>

      {/* ADD CUSTOM AGENT STAGE MODAL DIALOG */}
      {isAddStageOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-white">Add Agent Node to Chain</h3>
              </div>
              <button
                onClick={() => setIsAddStageOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-300">Stage Title</label>
                <input
                  type="text"
                  value={newStageTitle}
                  onChange={(e) => setNewStageTitle(e.target.value)}
                  placeholder="e.g. Stripe Webhook & Invoicing Engine"
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300">Objective / Description</label>
                <textarea
                  value={newStageDesc}
                  onChange={(e) => setNewStageDesc(e.target.value)}
                  placeholder="Describe what this specialized stage will implement..."
                  rows={2}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-slate-300">Agent Role Name</label>
                  <input
                    type="text"
                    value={newStageAgentName}
                    onChange={(e) => setNewStageAgentName(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300">AI Agent Domain</label>
                  <select
                    value={newStageDomain}
                    onChange={(e) => setNewStageDomain(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Data Systems">Data Systems</option>
                    <option value="Backend Engineering">Backend Engineering</option>
                    <option value="Frontend Engineering">Frontend Engineering</option>
                    <option value="Security">Security</option>
                    <option value="Core AI">Core AI</option>
                    <option value="Business Strategy">Business Strategy</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddStageOpen(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddNewStage}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20"
              >
                Insert Node
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Project Deliverable & Google Launch Modal */}
      <ProjectZipModal
        isOpen={isZipModalOpen}
        onClose={() => setIsZipModalOpen(false)}
        projectName={extractedConsolidated.projectName}
        files={extractedConsolidated.files}
        language={languagePreference === 'auto' ? 'roman-urdu' : languagePreference}
        initialMode={zipModalMode}
      />
    </div>
  );
};
