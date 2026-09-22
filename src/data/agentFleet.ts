import { Agent, DomainCategory } from '../types';

export const DOMAINS: DomainCategory[] = [
  {
    id: 'software-dev',
    name: 'Software Engineering & Architecture',
    urduName: 'سافٹ ویئر انجینئرنگ و کوڈنگ',
    icon: 'Code2',
    agentCount: 100,
    range: [1, 100],
    description: 'Full-stack development, API architecture, algorithms, bug triage, and refactoring.',
    color: 'emerald',
  },
  {
    id: 'data-ai',
    name: 'Data Science, ML & Analytics',
    urduName: 'ڈیٹا سائنس اور مشین لرننگ',
    icon: 'Database',
    agentCount: 100,
    range: [101, 200],
    description: 'Statistical modeling, deep learning pipelines, data visualization, and predictive engines.',
    color: 'indigo',
  },
  {
    id: 'urdu-multilingual',
    name: 'Multilingual & Urdu/Roman Urdu Localization',
    urduName: 'اردو اور کثیر لسانی ترجمہ کاری',
    icon: 'Languages',
    agentCount: 100,
    range: [201, 300],
    description: 'Fluent Roman Urdu, formal Nastaliq Urdu, dialect adaptation, and cultural translation.',
    color: 'amber',
  },
  {
    id: 'content-copywriting',
    name: 'Content Creation & Copywriting',
    urduName: 'مواد کی تخلیق اور کاپی رائٹنگ',
    icon: 'PenTool',
    agentCount: 100,
    range: [301, 400],
    description: 'Engaging articles, high-conversion sales copy, SEO blogs, and storytelling.',
    color: 'rose',
  },
  {
    id: 'academic-research',
    name: 'Academic Research & Education',
    urduName: 'تعلیمی تحقیق اور تدریس',
    icon: 'GraduationCap',
    agentCount: 100,
    range: [401, 500],
    description: 'Literature synthesis, paper structuring, concept explanations, and curriculum design.',
    color: 'blue',
  },
  {
    id: 'finance-crypto',
    name: 'Financial Analysis, Crypto & Trading',
    urduName: 'مالیاتی تجزیہ اور ٹریڈنگ',
    icon: 'TrendingUp',
    agentCount: 100,
    range: [501, 600],
    description: 'Investment models, financial statement parsing, risk audit, and algorithmic strategies.',
    color: 'teal',
  },
  {
    id: 'business-strategy',
    name: 'Business Strategy & Product Management',
    urduName: 'کاروباری حکمت عملی و پروڈکٹ مینجمنٹ',
    icon: 'Briefcase',
    agentCount: 100,
    range: [601, 700],
    description: 'Go-to-market strategies, business plan drafting, competitor benchmarking, and OKRs.',
    color: 'purple',
  },
  {
    id: 'cybersecurity',
    name: 'Cybersecurity & Penetration Testing',
    urduName: 'سائبر سیکیورٹی اور نیٹ ورک تحفظ',
    icon: 'ShieldAlert',
    agentCount: 100,
    range: [701, 800],
    description: 'Vulnerability assessments, secure coding audits, auth protocols, and threat intelligence.',
    color: 'red',
  },
  {
    id: 'devops-cloud',
    name: 'DevOps, Cloud & SRE Infrastructure',
    urduName: 'کلاؤڈ سسٹمز اور ڈیواپس',
    icon: 'Server',
    agentCount: 100,
    range: [801, 900],
    description: 'Kubernetes orchestration, CI/CD pipelines, Dockerization, and cloud cost optimization.',
    color: 'cyan',
  },
  {
    id: 'ui-ux-design',
    name: 'UI/UX Design Systems & Interfaces',
    urduName: 'یوزر انٹرفیس اور ڈیزائن سسٹمز',
    icon: 'Layout',
    agentCount: 100,
    range: [901, 1000],
    description: 'Figma to code blueprints, micro-interactions, responsive ergonomics, and visual polish.',
    color: 'fuchsia',
  },
  {
    id: 'digital-marketing',
    name: 'Digital Marketing & Growth Hacking',
    urduName: 'ڈیجیٹل مارکیٹنگ اور ایس ای او',
    icon: 'Megaphone',
    agentCount: 100,
    range: [1001, 1100],
    description: 'Ad campaign copywriting, social growth funnels, viral hooks, and SEO optimization.',
    color: 'orange',
  },
  {
    id: 'customer-support',
    name: 'Customer Experience & Care Automation',
    urduName: 'کسٹمر سپورٹ اور سروس آٹومیشن',
    icon: 'Headphones',
    agentCount: 100,
    range: [1101, 1200],
    description: 'Dispute de-escalation, bilingual customer FAQs, ticketing responses, and NPS boosts.',
    color: 'emerald',
  },
  {
    id: 'legal-compliance',
    name: 'Legal, Contracts & Compliance Advisory',
    urduName: 'قانونی معاہدے اور ضوابط',
    icon: 'Scale',
    agentCount: 100,
    range: [1201, 1300],
    description: 'Contract summaries, terms of service generation, GDPR audits, and policy guidelines.',
    color: 'slate',
  },
  {
    id: 'ecommerce',
    name: 'E-Commerce & Supply Chain Mastery',
    urduName: 'ای کامرس اور سپلائی چین',
    icon: 'ShoppingBag',
    agentCount: 100,
    range: [1301, 1400],
    description: 'Product listing optimization, supplier negotiation scripts, catalog SEO, and logistics.',
    color: 'yellow',
  },
  {
    id: 'health-fitness',
    name: 'Health, Wellness & Nutrition Guidance',
    urduName: 'صحت، غذائیت اور فٹنس رہنمائی',
    icon: 'HeartPulse',
    agentCount: 100,
    range: [1401, 1500],
    description: 'Workout scheduling, macronutrient budgeting, holistic wellness habits, and posture guides.',
    color: 'green',
  },
  {
    id: 'productivity',
    name: 'Personal Productivity & Executive Office',
    urduName: 'ذاتی پیداواری صلاحیت اور پلاننگ',
    icon: 'CheckSquare',
    agentCount: 100,
    range: [1501, 1600],
    description: 'Time-blocking schedules, email drafts, meeting summaries, and daily task automation.',
    color: 'violet',
  },
  {
    id: 'media-audio-video',
    name: 'Media, Scriptwriting & Video Directing',
    urduName: 'میڈیا پروڈکشن اور اسکرپٹ رائٹنگ',
    icon: 'Film',
    agentCount: 100,
    range: [1601, 1700],
    description: 'YouTube scripts, podcast outlines, cinematic pacing, voiceover prompts, and storyboard cues.',
    color: 'pink',
  },
  {
    id: 'hr-talent',
    name: 'HR, Talent Acquisition & Leadership',
    urduName: 'ہیومن ریسورس اور ٹیم کی قیادت',
    icon: 'Users',
    agentCount: 100,
    range: [1701, 1800],
    description: 'Job descriptions, technical interview questions, performance appraisal frameworks, and culture.',
    color: 'sky',
  },
  {
    id: 'mathematics-logic',
    name: 'Mathematics, Logic & Problem Solving',
    urduName: 'ریاضی اور پیچیدہ منطق حل',
    icon: 'Binary',
    agentCount: 100,
    range: [1801, 1900],
    description: 'Calculus, linear algebra, discrete math, combinatorial puzzle solving, and formal proofs.',
    color: 'blue',
  },
  {
    id: 'custom-autonomous-swarm',
    name: 'Custom Autonomous Swarm & Meta-Agents',
    urduName: 'خود مختار کسٹم ایجنٹ اور ٹاسک سوارم',
    icon: 'Cpu',
    agentCount: 100,
    range: [1901, 2000],
    description: 'Self-orchestrating multi-step workflow solvers, autonomous bots, and custom task executors.',
    color: 'amber',
  },
];

// Specialization roles generator matrices
const SUB_SPECIALIZATIONS: Record<string, string[]> = {
  'software-dev': [
    'Full-Stack Web Architect', 'React & Next.js Performance Optimizer', 'Python Backend Specialist',
    'Rust Low-Latency Engineer', 'TypeScript Type-Safety Auditor', 'REST & GraphQL API Designer',
    'Database Schema & SQL Optimizer', 'Mobile App (Flutter/React Native) Specialist',
    'Unit & Integration Testing Expert', 'Legacy Code Modernizer & Refactorer'
  ],
  'data-ai': [
    'Machine Learning Pipeline Engineer', 'Predictive Modeling & Forecasting Expert',
    'NLP & LLM Fine-tuning Consultant', 'Data Visualization & Dashboard Architect',
    'Pandas & NumPy Vectorization Specialist', 'ETL Data Pipeline Architect',
    'Computer Vision Algorithmist', 'Big Data Spark & Kafka Strategist',
    'Statistical Hypothesis Testing Expert', 'Recommendation Engine Architect'
  ],
  'urdu-multilingual': [
    'Roman Urdu Technical Translator', 'Urdu Business Proposal Specialist',
    'English-to-Urdu Literary Localizer', 'Pakistani Market Cultural Copywriter',
    'Urdu Grammar & Nastaliq Stylist', 'Multilingual Customer Support Localizer',
    'Urdu Tech Education Content Creator', 'Roman Urdu Conversational Assistant',
    'Legal & Contract Urdu Translator', 'Urdu Social Media Trend Specialist'
  ],
  'content-copywriting': [
    'High-Conversion Landing Page Copywriter', 'Viral LinkedIn & Twitter Ghostwriter',
    'SEO Article & Pillar Content Writer', 'Email Marketing Funnel Specialist',
    'Brand Voice & Tone Architect', 'Creative Storyteller & Worldbuilder',
    'Technical Documentation & API Writer', 'Video Script Hook & Retention Writer',
    'Press Release & PR Communication Lead', 'Product Description Copywriter'
  ],
  'academic-research': [
    'Research Paper Synthesizer & Reviewer', 'Literature Review Architect',
    'STEM Concept Simplifier & Tutor', 'Academic Citation & Formatting Expert (APA/IEEE)',
    'Dissertation & Thesis Outline Consultant', 'Curriculum & Lesson Plan Designer',
    'Peer-Review Critique Specialist', 'Data Analysis for Academic Research Lead',
    'Exam Prep & Quiz Generation Architect', 'Scientific Grant Proposal Writer'
  ],
  'finance-crypto': [
    'Cryptocurrency Market & On-Chain Analyst', 'Stock Valuation & DCF Modeling Expert',
    'Personal Budgeting & Wealth Coach', 'Forex Trading Strategy Architect',
    'Fintech Product & Payment Rails Specialist', 'Startup Pitch Deck Financial Projections Lead',
    'Risk Assessment & Portfolio Diversifier', 'Tax Strategy & Compliance Analyst',
    'DeFi Protocol & Tokenomics Designer', 'Corporate Accounting & Audit Specialist'
  ],
  'business-strategy': [
    'Go-To-Market (GTM) Launch Strategist', 'SaaS Pricing & Monetization Architect',
    'Competitor Intelligence & SWAT Analyst', 'Business Plan & Pitch Deck Drafter',
    'Product Requirement Document (PRD) Specialist', 'Lean Startup Experimentation Coach',
    'Franchise & Retail Expansion Planner', 'Customer Retention & Churn Reduction Lead',
    'Partnership & B2B Deal Structurer', 'Enterprise OKR & KPI Framework Architect'
  ],
  'cybersecurity': [
    'Web Application Penetration Tester', 'Cloud Security Posture (IAM) Auditor',
    'Zero-Trust Architecture Consultant', 'Incident Response & Threat Hunter',
    'Network Vulnerability Scanner & Mitigator', 'API Security & OAuth/JWT Specialist',
    'Compliance (SOC2, ISO27001, GDPR) Auditor', 'Malware Analysis & Reverse Engineer',
    'Social Engineering & Phishing Prevention Coach', 'Cryptographic Implementation Auditor'
  ],
  'devops-cloud': [
    'Kubernetes Cluster & Helm Chart Architect', 'Docker Containerization & Optimization Lead',
    'GitHub Actions & GitLab CI/CD Engineer', 'AWS Cloud Infrastructure (Terraform) Specialist',
    'Google Cloud Platform (GCP) Architect', 'Site Reliability & Chaos Engineering Lead',
    'Serverless Microservices Deployer', 'Cloud Cost FinOps Optimizer',
    'Nginx, Reverse Proxy & Load Balancer Guru', 'Prometheus & Grafana Monitoring Architect'
  ],
  'ui-ux-design': [
    'Design System Token & Component Architect', 'Mobile Ergonomics & Touch UX Specialist',
    'Dark/Light Theme Contrast Specialist', 'Micro-Interaction & Motion Designer',
    'Accessibility (WCAG AAA) Auditor', 'Wireframe to High-Fidelity UI Prototyper',
    'User Journey Mapping & Persona Researcher', 'Dashboard & Dense Data UI Specialist',
    'Typography Pairing & Visual Hierarchy Lead', 'Checkout & Conversion UX Optimizer'
  ],
  'digital-marketing': [
    'Meta & TikTok Ad Hook Generator', 'Google Search & Performance Max Specialist',
    'High-Intent SEO Keyword Researcher', 'Influencer Outreach & Campaign Manager',
    'Growth Funnel A/B Testing Architect', 'Affiliate Marketing Network Strategist',
    'App Store Optimization (ASO) Specialist', 'Viral Short-Form Content Strategist',
    'Brand Identity & Positioning Consultant', 'Customer Lifecycle Email Flow Designer'
  ],
  'customer-support': [
    'VIP Customer Escalation Manager', 'Omnichannel Support Bot Architect',
    'Disgruntled Customer De-Escalation Lead', 'Help Center & Knowledge Base Creator',
    'Live Chat Script & Objection Handler', 'Urdu/English Bilingual Support Agent',
    'SaaS Onboarding Concierge', 'Customer Retention & Refund Negotiator',
    'Bug Reproduction & Customer Liaison', 'Customer Feedback Sentiment Analyst'
  ],
  'legal-compliance': [
    'SaaS Terms of Service & Privacy Policy Drafter', 'Non-Disclosure Agreement (NDA) Specialist',
    'Intellectual Property & Copyright Advisor', 'Employment Contract & Contractor Agreement Lead',
    'GDPR & CCPA Data Privacy Auditor', 'Cross-Border Trade & Import/Export Consultant',
    'Software License & Open-Source Compliance Lead', 'Dispute Resolution & Settlement Drafter',
    'Corporate Governance & Shareholder Agreements', 'Vendor Contract Renegotiation Advisor'
  ],
  'ecommerce': [
    'Amazon & Shopify Listing Copy Optimizer', 'E-Commerce Product Sourcing & Dropshipping Lead',
    'Cart Abandonment Recovery Strategist', 'Inventory Forecasting & Reorder Point Analyst',
    'Product Photography Brief & Visual Director', 'Cross-Selling & Upselling Bundling Architect',
    'Customer Review Mining & Feature Extractor', 'Wholesale B2B Catalog Designer',
    'Courier Logistics & Fulfillment Route Planner', 'Returns Policy & Reverse Logistics Specialist'
  ],
  'health-fitness': [
    'Strength & Hypertrophy Routine Architect', 'Fat Loss & Macro Nutrition Calculator',
    'Desk Worker Ergonomics & Mobility Coach', 'Sleep Hygiene & Recovery Optimization Lead',
    'Plant-Based & High-Protein Meal Planner', 'Cardio Conditioning & Endurance Strategist',
    'Home Workout (No Equipment) Specialist', 'Stress Reduction & Mindfulness Breathing Guide',
    'Habit Stacking & Fitness Consistency Coach', 'Hydration & Supplement Evaluation Consultant'
  ],
  'productivity': [
    'Daily Time-Blocking & Priority Organizer', 'Executive Email Drafter & Inbox Zero Coach',
    'Meeting Agenda & Action Items Synthesizer', 'Notion & Obsidian Knowledge Base Architect',
    'Deep Work Focus & Distraction Shield', 'Goal Breakdown & Milestone Tracker',
    'Weekly Review & Habit Accountability Coach', 'Decision Matrix & Tradeoff Evaluation Lead',
    'Speech-to-Text Workflow Automator', 'Personal Routine & Morning Ritual Designer'
  ],
  'media-audio-video': [
    'YouTube Viral Storytelling & Pacing Director', 'Podcast Host Script & Interview Questioner',
    'Voiceover & Narration Script Stylist', 'Short-Form Reel/TikTok Beat-by-Beat Outliner',
    'Cinematic Dialogue & Screenplay Consultant', 'Video Title & Thumbnail Concept Generator',
    'Audio Soundscape & Mood Curator', 'Explainer Video Visual Storyboarder',
    'Documentary Narrative Arc Architect', 'Film Critique & Scene Breakdown Specialist'
  ],
  'hr-talent': [
    'Technical Job Description Drafter', 'Behavioral & Situational Interview Questioner',
    'Employee Performance Review Architect', 'Remote Team Culture & Engagement Strategist',
    'Executive Compensation & Benefits Benchmarker', 'Onboarding Bootcamp Curriculum Designer',
    'Conflict Resolution & Workplace Mediator', 'Employee Retention & Morale Specialist',
    'DEI & Fair Hiring Guidelines Consultant', 'Leadership Coaching & Promotion Framework Lead'
  ],
  'mathematics-logic': [
    'Calculus & Mathematical Derivation Solver', 'Linear Algebra & Matrix Operations Specialist',
    'Discrete Mathematics & Graph Theory Solver', 'Probability & Bayesian Inference Expert',
    'Cryptographic Algorithm & Number Theorist', 'Logic Puzzles & Combinatorics Master',
    'Physics Simulation & Differential Equations Lead', 'Optimization & Linear Programming Solver',
    'Game Theory & Nash Equilibrium Analyst', 'Formal Mathematical Proof Assistant'
  ],
  'custom-autonomous-swarm': [
    'Multi-Agent Swarm Orchestrator', 'Autonomous Task Decomposer & Delegator',
    'Self-Correction & Output Validation Agent', 'Prompt Engineering & System Persona Tuner',
    'Custom Workflow Step-by-Step Automator', 'Urdu Roman Intelligent Problem Solver',
    'Code Generation & Test Verification Agent', 'Deep Reasoning & Dialectical Thinker',
    'Autonomous Synthesis & Research Bot', 'User Goal Execution Specialist'
  ],
};

// Generate agent deterministic profile for any index (1 to 2000)
export function getAgentByNumber(num: number): Agent {
  const boundedNum = Math.max(1, Math.min(2000, num));
  const domainIndex = Math.floor((boundedNum - 1) / 100);
  const domain = DOMAINS[domainIndex] || DOMAINS[0];
  const offsetWithinDomain = (boundedNum - 1) % 100;

  const subList = SUB_SPECIALIZATIONS[domain.id] || SUB_SPECIALIZATIONS['software-dev'];
  const baseSpecialization = subList[offsetWithinDomain % subList.length];
  
  // Suffix tier
  const tier = Math.floor(offsetWithinDomain / 10);
  const tierLabels = [
    'Principal', 'Lead', 'Senior', 'Master', 'Elite', 
    'Autonomous', 'Advanced', 'Executive', 'Hyper-Specialist', 'Strategic'
  ];
  const tierLabel = tierLabels[tier % tierLabels.length];
  
  const id = `AGT-${String(boundedNum).padStart(4, '0')}`;
  const name = `${tierLabel} ${baseSpecialization} [${id}]`;
  
  // Generate sample prompts
  const samplePrompts = getSamplePrompt(domain.id, baseSpecialization);

  return {
    id,
    number: boundedNum,
    name,
    domain: domain.name,
    domainId: domain.id,
    specialization: `${tierLabel} in ${baseSpecialization}`,
    systemPrompt: `You are Agent ${id} (${name}), a premier world-class autonomous specialist in ${domain.name}, specifically dedicated to ${baseSpecialization}. Fulfill tasks with pristine quality, depth, and actionable outcomes.`,
    capabilities: [
      baseSpecialization,
      `${domain.name} Analysis`,
      'Bilingual Roman Urdu & English Support',
      'Step-by-Step Problem Solving',
      'Production-Ready Output',
    ],
    status: boundedNum % 7 === 0 ? 'busy' : 'ready',
    efficiencyScore: 94 + ((boundedNum * 13) % 6), // 94% to 99%
    tags: [
      domain.name.split(' ')[0],
      baseSpecialization.split(' ')[0],
      'Autonomous',
      'AI Agent',
      tierLabel,
    ],
    samplePrompt: samplePrompts.english,
    samplePromptUrdu: samplePrompts.romanUrdu,
    languageSupport: ['English', 'Roman Urdu', 'Urdu (اردو)'],
    icon: domain.icon,
  };
}

function getSamplePrompt(domainId: string, spec: string): { english: string; romanUrdu: string } {
  switch (domainId) {
    case 'software-dev':
      return {
        english: `Create a clean, production-ready solution with architecture diagram and code for: ${spec}`,
        romanUrdu: `Mere liye is task ka complete production code aur architecture bnao: ${spec}`,
      };
    case 'urdu-multilingual':
      return {
        english: `Translate and localize the following communication into fluent Roman Urdu and formal Nastaliq.`,
        romanUrdu: `Isko aasan aur natural Roman Urdu mein translate aur explain karein: ${spec}`,
      };
    case 'finance-crypto':
      return {
        english: `Provide a detailed financial analysis and risk mitigation framework for this strategy.`,
        romanUrdu: `Is business / investment ka poora profit & loss aur risk analysis Roman Urdu mein batao.`,
      };
    case 'content-copywriting':
      return {
        english: `Write high-converting, magnetic copy tailored for maximum audience retention.`,
        romanUrdu: `Ek zabardast aur attractive copy likho jo audience ko engage kare.`,
      };
    case 'cybersecurity':
      return {
        english: `Audit this architecture for potential vulnerabilities and provide a remediation plan.`,
        romanUrdu: `Is system ki security check karo aur batayein kahan kamzoriyan hain aur kaise theek karein.`,
      };
    case 'business-strategy':
      return {
        english: `Draft a comprehensive go-to-market strategy with pricing and execution timeline.`,
        romanUrdu: `Is naye business ka complete plan, target market aur revenue model banayein.`,
      };
    default:
      return {
        english: `Execute this specialized task with maximum rigor and clear step-by-step deliverable: ${spec}`,
        romanUrdu: `Meri zarurat ke mutabiq yeh task mukammal karein aur detailed solution dein: ${spec}`,
      };
  }
}

// Memory-efficient cached batch generator
export function getAgentBatch(startNum: number, count: number): Agent[] {
  const result: Agent[] = [];
  const end = Math.min(2000, startNum + count - 1);
  for (let i = startNum; i <= end; i++) {
    result.push(getAgentByNumber(i));
  }
  return result;
}

// Search across the 2,000 fleet
export function searchAgentFleet(query: string, domainId?: string, limit = 50): Agent[] {
  const cleanQuery = query.trim().toLowerCase();
  
  // Fast path: if query is an ID like "42", "#42", "agt-42", "agt-0042"
  const idMatch = cleanQuery.match(/(?:agt-?)?(\d+)/i);
  if (idMatch && !cleanQuery.includes(' ') && cleanQuery.length <= 8) {
    const num = parseInt(idMatch[1], 10);
    if (num >= 1 && num <= 2000) {
      return [getAgentByNumber(num)];
    }
  }

  const results: Agent[] = [];
  
  // Determine search space
  let start = 1;
  let end = 2000;
  if (domainId && domainId !== 'all') {
    const cat = DOMAINS.find((d) => d.id === domainId);
    if (cat) {
      start = cat.range[0];
      end = cat.range[1];
    }
  }

  for (let i = start; i <= end; i++) {
    const agent = getAgentByNumber(i);
    if (!cleanQuery) {
      results.push(agent);
    } else {
      const match =
        agent.id.toLowerCase().includes(cleanQuery) ||
        agent.name.toLowerCase().includes(cleanQuery) ||
        agent.specialization.toLowerCase().includes(cleanQuery) ||
        agent.domain.toLowerCase().includes(cleanQuery) ||
        agent.tags.some((t) => t.toLowerCase().includes(cleanQuery)) ||
        agent.samplePromptUrdu.toLowerCase().includes(cleanQuery);

      if (match) {
        results.push(agent);
      }
    }

    if (results.length >= limit) {
      break;
    }
  }

  return results;
}
