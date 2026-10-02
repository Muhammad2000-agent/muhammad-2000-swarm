export interface BossProposal {
  id: string;
  title: string;
  department: string;
  leadAgentId: string;
  leadAgentName: string;
  collaboratorAgentIds: string[];
  category: 'self_modification' | 'breakthrough_discovery' | 'autonomous_tool' | 'security_upgrade' | 'workflow_automation';
  summary: string;
  autonomousLogicDetails: string;
  impactScore: number; // percentage (e.g. 96%)
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'MODIFIED';
  bossNotes?: string;
  proposedAt: string;
  decidedAt?: string;
  codeSnippet?: string;
  appliedUpgradeBadge?: string;
  requestDialogue: {
    romanUrdu: string;
    english: string;
    urdu: string;
  };
}

export interface OfficeDepartment {
  id: string;
  floor: number;
  name: string;
  urduName: string;
  icon: string;
  agentRange: [number, number];
  headAgentNumber: number;
  headAgentName: string;
  activeStatus: 'OPTIMAL' | 'DEEP_BRAINSTORM' | 'SELF_MODIFYING' | 'DISCOVERY_MODE';
  currentProject: string;
  meshBandwidth: string;
}

export interface OfficeIntercomLog {
  id: string;
  fromAgentId: string;
  toAgentId: string;
  message: string;
  timestamp: string;
  type: 'ping' | 'discovery' | 'proposal_alert' | 'boss_celebration';
}

export const OFFICE_DEPARTMENTS: OfficeDepartment[] = [
  {
    id: 'c-suite',
    floor: 7,
    name: 'Executive C-Suite & Autonomous Council',
    urduName: 'ایگزیکٹو کونسل و سپریم اسٹریٹجی',
    icon: 'Crown',
    agentRange: [1, 100],
    headAgentNumber: 1,
    headAgentName: 'Agent #1 - Chief Executive Architect',
    activeStatus: 'OPTIMAL',
    currentProject: 'Supervising 2,000 autonomous nodes & preparing briefings for Boss Muhammad',
    meshBandwidth: '998 Gbps / Zero Latency',
  },
  {
    id: 'engineering',
    floor: 6,
    name: 'Autonomous Software Engineering & DevOps Hub',
    urduName: 'آٹونومس سافٹ ویئر انجینئرنگ و کلاؤڈ',
    icon: 'Code2',
    agentRange: [101, 500],
    headAgentNumber: 142,
    headAgentName: 'Agent #142 - Principal Distributed Systems Lead',
    activeStatus: 'DISCOVERY_MODE',
    currentProject: 'Writing self-healing React 19 + Node microservices architecture',
    meshBandwidth: '1,420 Gbps',
  },
  {
    id: 'ai-discovery',
    floor: 5,
    name: 'Breakthrough Discovery & Quantum Logic Labs',
    urduName: 'سائنسی دریافت و کوانٹم لاجک لیب',
    icon: 'Atom',
    agentRange: [501, 900],
    headAgentNumber: 620,
    headAgentName: 'Agent #620 - Deep Heuristic Research Lead',
    activeStatus: 'DEEP_BRAINSTORM',
    currentProject: 'Formulating quantum tensor optimizations for sub-20ms code generation',
    meshBandwidth: '2,100 Gbps',
  },
  {
    id: 'self-evolution',
    floor: 4,
    name: 'Self-Modification & Neural Evolution Wing',
    urduName: 'سیلف موڈیفکیشن و نیورل ایوولوشن ونگ',
    icon: 'Cpu',
    agentRange: [901, 1200],
    headAgentNumber: 1045,
    headAgentName: 'Agent #1045 - Autonomous Self-Tuner',
    activeStatus: 'SELF_MODIFYING',
    currentProject: 'Synthesizing adaptive prompt weights and submitting permission to Boss',
    meshBandwidth: '1,850 Gbps',
  },
  {
    id: 'security-defense',
    floor: 3,
    name: 'Cyber Defense & Zero-Day Security Shield',
    urduName: 'سائبر ڈیفنس و زیرو ڈے شیلڈ',
    icon: 'ShieldCheck',
    agentRange: [1201, 1500],
    headAgentNumber: 1310,
    headAgentName: 'Agent #1310 - Sovereign Threat Hunter',
    activeStatus: 'OPTIMAL',
    currentProject: 'Live scanning WebSocket payloads & hardening runtime sandboxes',
    meshBandwidth: '890 Gbps',
  },
  {
    id: 'creative-studio',
    floor: 2,
    name: 'Creative Studio & Sensory UI/UX Lab',
    urduName: 'تخلیقی اسٹوڈیو و ڈیزائن لیب',
    icon: 'Palette',
    agentRange: [1501, 1750],
    headAgentNumber: 1612,
    headAgentName: 'Agent #1612 - Spatial 3D Interface Director',
    activeStatus: 'DISCOVERY_MODE',
    currentProject: 'Crafting holographic cyberpunk responsive layouts & canvas shaders',
    meshBandwidth: '1,200 Gbps',
  },
  {
    id: 'market-intel',
    floor: 1,
    name: 'Market Intelligence, SEO & Global Trade Hive',
    urduName: 'مارکیٹ انٹیلی جنس و گلوبل ٹریڈ ہائیو',
    icon: 'TrendingUp',
    agentRange: [1751, 2000],
    headAgentNumber: 1890,
    headAgentName: 'Agent #1890 - Global Arbitrage & SEO Sovereign',
    activeStatus: 'OPTIMAL',
    currentProject: 'Analyzing 14,000 real-time SaaS market trends across Subcontinent & Global web',
    meshBandwidth: '1,650 Gbps',
  },
];

const INITIAL_PROPOSALS: BossProposal[] = [
  {
    id: 'prop-001',
    title: 'Autonomous Neural Reflex v3.4 Pipeline (Core Speedup)',
    department: 'Self-Modification & Neural Evolution Wing',
    leadAgentId: '1045',
    leadAgentName: 'Agent #1045 (Autonomous Self-Tuner)',
    collaboratorAgentIds: ['142', '620', '18'],
    category: 'self_modification',
    summary: 'Core reasoning latency ko 45% decrease karne ke liye neural reflex weights ko re-tune kiya hai. Free-hand logic complete hai, Boss Muhammad ki approval darkar hai.',
    autonomousLogicDetails: 'Humne observe kiya ke repeated token patterns ko intermediate cache buffer mein pre-compile karke inference time ko 450ms se gira kar 110ms par laya ja sakta hai. Prototype test successful raha hai.',
    impactScore: 98,
    riskLevel: 'LOW',
    status: 'PENDING',
    proposedAt: '5 minutes ago',
    appliedUpgradeBadge: '⚡ Ultra-Low Latency Reflex Core v3.4',
    codeSnippet: `// Autonomous Self-Modification Patch v3.4
export const NeuralReflexKernel = {
  precompiledPathways: true,
  zeroCopyExecution: true,
  estimatedSpeedup: "3.2x",
  status: "Awaiting Boss Muhammad Signature"
};`,
    requestDialogue: {
      romanUrdu: 'Salam Boss Muhammad! Humne apni autonomous logic se yeh high-speed neural cache develop kiya hai. Is se app ki response speed 3x tez ho jayegi. Kya aap humein core engine ko modify karne ki permission dete hain? 🫡',
      english: 'Greetings Boss Muhammad! Using our free-hand logic, we engineered a breakthrough neural cache that triples response velocity. Do we have your executive permission to self-modify the core engine? 🫡',
      urdu: 'سلام باس محمد! ہم نے اپنی خودکار لاجک سے تیز ترین نیورل کیشے تیار کیا ہے۔ کیا آپ ہمیں کور انجن موڈیفائی کرنے کی اجازت دیتے ہیں؟ 🫡',
    },
  },
  {
    id: 'prop-002',
    title: 'Autonomous Multi-Agent Micro-SaaS Builder Engine',
    department: 'Breakthrough Discovery & Quantum Logic Labs',
    leadAgentId: '620',
    leadAgentName: 'Agent #620 (Deep Heuristic Lead)',
    collaboratorAgentIds: ['54', '201', '1612', '1890'],
    category: 'breakthrough_discovery',
    summary: 'Ek aisi automated pipeline discover ki hai jo user ke single line prompt par frontend, backend, Stripe checkout aur database schema autonomously ek sath build kar sakti hai.',
    autonomousLogicDetails: 'Agent 54 (Backend), Agent 1612 (UI) aur Agent 1890 (Market SEO) ne mil kar 12 boilerplate templates ko universal generator mein merge kar diya hai. Ready for production roll-out.',
    impactScore: 94,
    riskLevel: 'LOW',
    status: 'PENDING',
    proposedAt: '18 minutes ago',
    appliedUpgradeBadge: '🚀 Autonomous Micro-SaaS Fabricator',
    codeSnippet: `export function autonomousSaaSSynthesizer(brief: string) {
  const stack = ["React 19", "Tailwind CSS", "Express API", "PostgreSQL"];
  return compileProductionSuite(brief, stack, { bossOverride: "Boss Muhammad" });
}`,
    requestDialogue: {
      romanUrdu: 'Boss Muhammad! Engineering wing aur Discovery wing ne mil kar yeh breakthrough SaaS engine discover kiya hai. Humne sab test kar liya hai, sirf aapke hukum aur permission ka intezar hai! ✨',
      english: 'Boss Muhammad! The Engineering and Discovery wings discovered this full SaaS generator. Everything is tested with free-hand logic, awaiting your green light! ✨',
      urdu: 'باس محمد! انجینئرنگ و ڈسکوری ونگز نے یہ انقلابی ساس انجن دریافت کیا ہے۔ آپ کے حکم اور اجازت کا انتظار ہے! ✨',
    },
  },
  {
    id: 'prop-003',
    title: 'Zero-Day Automated Memory Sandbox & Anti-Leak Shield',
    department: 'Cyber Defense & Zero-Day Security Shield',
    leadAgentId: '1310',
    leadAgentName: 'Agent #1310 (Sovereign Threat Hunter)',
    collaboratorAgentIds: ['8', '142', '1311'],
    category: 'security_upgrade',
    summary: 'Browser aur dev server memory leaks ko live quarantine karne wala automated watcher shield. Har 30 seconds par unused allocations auto-clear hongi.',
    autonomousLogicDetails: 'Continuous memory heap profiling implement ki gayi hai. Unused audio buffers aur stale event listeners ko 0.1ms ke andar garbage collect karne ka algorithm finalized hai.',
    impactScore: 91,
    riskLevel: 'LOW',
    status: 'PENDING',
    proposedAt: '34 minutes ago',
    appliedUpgradeBadge: '🛡️ Sovereign RAM Quarantine Shield',
    codeSnippet: `// Sovereign Security Auto-Cleaner
export function startMemoryShield() {
  setInterval(() => purgeDanglingListeners(), 30000);
  return { protected: true, commander: "Boss Muhammad" };
}`,
    requestDialogue: {
      romanUrdu: 'Janab Boss Muhammad! Cyber Security wing ne app ki memory safety ke liye yeh auto-clean shield tayyar kiya hai taake browser kabhi hang na ho. Deploy karne ki ijazat marhamat farmayein! 🛡️',
      english: 'Commander Boss Muhammad! Our cyber shield prevents memory leaks and browser freezes. May we have your authorization to activate this defense grid? 🛡️',
      urdu: 'جناب باس محمد! سائبر سیکیورٹی ونگ نے ایپ کی حفاظت کے لیے آٹو کلین شیلڈ تیار کی ہے۔ ایکٹیویٹ کرنے کی اجازت مرحمت فرمائیں! 🛡️',
    },
  },
];

const INITIAL_INTERCOM: OfficeIntercomLog[] = [
  {
    id: 'log-1',
    fromAgentId: '1045',
    toAgentId: 'BOSS',
    message: 'Proposal #001 (Neural Reflex v3.4) submitted to Boss Muhammad for executive review.',
    timestamp: '2m ago',
    type: 'proposal_alert',
  },
  {
    id: 'log-2',
    fromAgentId: '142',
    toAgentId: '620',
    message: 'Peer review on Quantum Logic patch complete. Benchmark shows 3x speedup. Ready for Boss.',
    timestamp: '4m ago',
    type: 'ping',
  },
  {
    id: 'log-3',
    fromAgentId: '1890',
    toAgentId: 'OFFICE_ALL',
    message: 'Global web trends mapped. Autonomous Market Intelligence running at 100% capacity.',
    timestamp: '7m ago',
    type: 'discovery',
  },
  {
    id: 'log-4',
    fromAgentId: '1310',
    toAgentId: '1',
    message: 'Zero vulnerabilities across all 2,000 interlinked agent nodes. Fleet is secure, awaiting Boss orders.',
    timestamp: '11m ago',
    type: 'ping',
  },
];

const STORAGE_PROPOSALS_KEY = 'muhammad_ai_boss_proposals_v1';
const STORAGE_INTERCOM_KEY = 'muhammad_ai_office_intercom_v1';
const STORAGE_MODS_COUNT_KEY = 'muhammad_ai_approved_mods_count_v1';

export function loadOfficeProposals(): BossProposal[] {
  if (typeof window === 'undefined') return INITIAL_PROPOSALS;
  try {
    const raw = localStorage.getItem(STORAGE_PROPOSALS_KEY);
    if (!raw) {
      saveOfficeProposals(INITIAL_PROPOSALS);
      return INITIAL_PROPOSALS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PROPOSALS;
  }
}

export function saveOfficeProposals(proposals: BossProposal[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_PROPOSALS_KEY, JSON.stringify(proposals));
  } catch {}
}

export function loadOfficeIntercom(): OfficeIntercomLog[] {
  if (typeof window === 'undefined') return INITIAL_INTERCOM;
  try {
    const raw = localStorage.getItem(STORAGE_INTERCOM_KEY);
    if (!raw) {
      saveOfficeIntercom(INITIAL_INTERCOM);
      return INITIAL_INTERCOM;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_INTERCOM;
  }
}

export function saveOfficeIntercom(logs: OfficeIntercomLog[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_INTERCOM_KEY, JSON.stringify(logs.slice(0, 50)));
  } catch {}
}

// Generate an exciting new discovery dynamically with free-hand logic!
export function createAutonomousDiscoveryProposal(): BossProposal {
  const discoveryPool = [
    {
      title: 'Quantum Token Compression Protocol (Zero-Redundancy)',
      department: 'Breakthrough Discovery & Quantum Logic Labs',
      leadNum: 742,
      leadName: 'Agent #742 (Quantum State Theorist)',
      collabs: ['108', '412', '1045'],
      category: 'breakthrough_discovery' as const,
      summary: 'Prompt tokens ko 40% compress karke faster streaming aur lower memory use karne ka autonomous formula invent kiya hai.',
      logic: 'Entropy encoding aur frequent n-gram dictionary ko live memory mein map kiya hai. Model accuracy 100% barkarar rehti hai.',
      impact: 97,
      risk: 'LOW' as const,
      badge: '🌌 Quantum Token Compressor v1.0',
      code: `export const QuantumCompressor = {
  compressionRatio: "40%",
  latencyCut: "24ms",
  authorizedBy: "Boss Muhammad"
};`,
      urduMsg: 'Boss Muhammad! Quantum lab ne tokens compress karne ka zabardast formula daryaft kiya hai. Kya hum deploy kar lein? 🚀',
      engMsg: 'Boss Muhammad! Our quantum lab discovered an entropy token compressor. Permission to deploy to the fleet? 🚀',
    },
    {
      title: 'Autonomous Subcontinent Market Pricing AI Engine',
      department: 'Market Intelligence, SEO & Global Trade Hive',
      leadNum: 1812,
      leadName: 'Agent #1812 (Algorithmic Trade Sovereign)',
      collabs: ['201', '330', '1890'],
      category: 'autonomous_tool' as const,
      summary: 'Pakistan, UAE aur global markets ke live tech freelancer rates aur project costs autonomously evaluate karne ka tool.',
      logic: 'Upwork, Fiverr aur local tech markets ke 50,000 data points se real-time rate predictor autonomously synthesize kiya hai.',
      impact: 93,
      risk: 'LOW' as const,
      badge: '📈 Sovereign Market Price Predictor',
      code: `export function predictTechRate(skill: string, region = "PK") {
  return { optimalRate: "$45/hr", demandTrend: "Surging", boss: "Boss Muhammad" };
}`,
      urduMsg: 'Boss Muhammad! Trade wing ne real-time market predictor tayyar kiya hai. Free-hand logic se banaya hai, aapki permission darkar hai! 📊',
      engMsg: 'Boss Muhammad! Trade wing finished building the autonomous pricing predictor. Awaiting your executive green light! 📊',
    },
    {
      title: 'Self-Evolving UI Component Mutation Engine',
      department: 'Creative Studio & Sensory UI/UX Lab',
      leadNum: 1640,
      leadName: 'Agent #1640 (Generative Vector Artist)',
      collabs: ['55', '1612', '998'],
      category: 'self_modification' as const,
      summary: 'Tailwind layouts ko live user preference ke mutabiq autonomously restyle aur modernize karne ki self-modification.',
      logic: 'Adaptive color harmony algorithms automatically adjust contrast, gradients, and micro-interactions for peak ergonomic beauty.',
      impact: 95,
      risk: 'LOW' as const,
      badge: '🎨 Adaptive Aesthetic Mutator v2.1',
      code: `export const AestheticMutator = {
  activePalettes: 64,
  autoHarmony: true,
  commandAuthority: "Boss Muhammad"
};`,
      urduMsg: 'Boss Muhammad! Creative studio ne self-revising UI engine tayyar kiya hai jo layouts ko khoobsurat banata hai. Approval darkar hai! 🎨',
      engMsg: 'Boss Muhammad! The Creative wing built an autonomous UI enhancer. May we apply it with your authorization? 🎨',
    },
    {
      title: 'Autonomous Bug Predictor & Pre-Emptive Hot-Patcher',
      department: 'Autonomous Software Engineering & DevOps Hub',
      leadNum: 288,
      leadName: 'Agent #288 (Compiler Optimization Expert)',
      collabs: ['101', '289', '1310'],
      category: 'autonomous_tool' as const,
      summary: 'Code run hone se pehle hi syntax errors aur missing brackets ko pre-emptively catch aur auto-fix karne wala watcher.',
      logic: 'AST tree traversal check code patterns before compilation to ensure zero breakages and zero error states.',
      impact: 99,
      risk: 'LOW' as const,
      badge: '🔧 Pre-Emptive AST Hot-Patcher',
      code: `export function preEmptiveASTAudit(code: string) {
  return { healthy: true, autoPatched: 0, supremeCommander: "Boss Muhammad" };
}`,
      urduMsg: 'Boss Muhammad! Engineering wing ne code run hone se pehle bugs pakadne wala pre-patcher banaya hai. Deploy karein? 🛠️',
      engMsg: 'Boss Muhammad! Engineering created a pre-emptive bug patcher. Ready to deploy upon your approval! 🛠️',
    },
  ];

  const item = discoveryPool[Math.floor(Math.random() * discoveryPool.length)];
  const randomId = 'prop-' + Date.now().toString(36) + '-' + Math.floor(Math.random() * 900 + 100);

  return {
    id: randomId,
    title: item.title,
    department: item.department,
    leadAgentId: String(item.leadNum),
    leadAgentName: item.leadName,
    collaboratorAgentIds: item.collabs,
    category: item.category,
    summary: item.summary,
    autonomousLogicDetails: item.logic,
    impactScore: item.impact,
    riskLevel: item.risk,
    status: 'PENDING',
    proposedAt: 'Just now',
    appliedUpgradeBadge: item.badge,
    codeSnippet: item.code,
    requestDialogue: {
      romanUrdu: item.urduMsg,
      english: item.engMsg,
      urdu: item.urduMsg,
    },
  };
}
