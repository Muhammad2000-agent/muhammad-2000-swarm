import { getAgentByNumber, DOMAINS } from './agentFleet';
import { Agent } from '../types';

export interface TelecomInfo {
  carrier: string;
  brand: string;
  country: string;
  countryCode: string;
  type: string;
  formattedInternational: string;
  formattedLocal: string;
  prefix: string;
  operatorDetails: string;
  legalVerificationMethods: string[];
  safetyAdvisory: string;
}

export interface CnicInfo {
  cnicFormatted: string;
  province: string;
  divisionCode: string;
  gender: 'Male' | 'Female';
  verificationMethod: string;
}

export interface NumberAnalysisResult {
  category: 'agent' | 'phone' | 'cnic' | 'complaint_followup' | 'general_number' | 'text_task';
  rawInput: string;
  agent?: Agent;
  telecom?: TelecomInfo;
  cnic?: CnicInfo;
  explanationMarkdown?: string;
}

// Pakistani Telecom Operator Database
const PAK_MOBILE_OPERATORS: Record<string, { brand: string; carrier: string; details: string }> = {
  // Jazz (0300 - 0309)
  '0300': { brand: 'Jazz (Mobilink)', carrier: 'Pakistan Mobile Communications Limited (PMCL)', details: "Pakistan's largest 4G cellular network with widest national coverage." },
  '0301': { brand: 'Jazz (Mobilink)', carrier: 'Pakistan Mobile Communications Limited (PMCL)', details: "Jazz GSM 4G cellular series." },
  '0302': { brand: 'Jazz (Mobilink)', carrier: 'Pakistan Mobile Communications Limited (PMCL)', details: "Jazz GSM 4G cellular series." },
  '0303': { brand: 'Jazz (Mobilink)', carrier: 'Pakistan Mobile Communications Limited (PMCL)', details: "Jazz GSM 4G cellular series." },
  '0304': { brand: 'Jazz (Mobilink)', carrier: 'Pakistan Mobile Communications Limited (PMCL)', details: "Jazz GSM 4G cellular series." },
  '0305': { brand: 'Jazz (Mobilink)', carrier: 'Pakistan Mobile Communications Limited (PMCL)', details: "Jazz GSM 4G cellular series." },
  '0306': { brand: 'Jazz (Mobilink)', carrier: 'Pakistan Mobile Communications Limited (PMCL)', details: "Jazz GSM 4G cellular series." },
  '0307': { brand: 'Jazz (Mobilink)', carrier: 'Pakistan Mobile Communications Limited (PMCL)', details: "Jazz GSM 4G cellular series." },
  '0308': { brand: 'Jazz (Mobilink)', carrier: 'Pakistan Mobile Communications Limited (PMCL)', details: "Jazz GSM 4G cellular series." },
  '0309': { brand: 'Jazz (Mobilink)', carrier: 'Pakistan Mobile Communications Limited (PMCL)', details: "Jazz GSM 4G cellular series." },

  // Zong (0310 - 0318)
  '0310': { brand: 'Zong (CMPak)', carrier: 'China Mobile Pakistan', details: "High-speed 4G data & multimedia network in Pakistan." },
  '0311': { brand: 'Zong (CMPak)', carrier: 'China Mobile Pakistan', details: "High-speed 4G data & multimedia network in Pakistan." },
  '0312': { brand: 'Zong (CMPak)', carrier: 'China Mobile Pakistan', details: "High-speed 4G data & multimedia network in Pakistan." },
  '0313': { brand: 'Zong (CMPak)', carrier: 'China Mobile Pakistan', details: "High-speed 4G data & multimedia network in Pakistan." },
  '0314': { brand: 'Zong (CMPak)', carrier: 'China Mobile Pakistan', details: "High-speed 4G data & multimedia network in Pakistan." },
  '0315': { brand: 'Zong (CMPak)', carrier: 'China Mobile Pakistan', details: "High-speed 4G data & multimedia network in Pakistan." },
  '0316': { brand: 'Zong (CMPak)', carrier: 'China Mobile Pakistan', details: "High-speed 4G data & multimedia network in Pakistan." },
  '0317': { brand: 'Zong (CMPak)', carrier: 'China Mobile Pakistan', details: "High-speed 4G data & multimedia network in Pakistan." },
  '0318': { brand: 'Zong (CMPak)', carrier: 'China Mobile Pakistan', details: "High-speed 4G data & multimedia network in Pakistan." },

  // Warid (0320 - 0325, now Jazz LTE)
  '0320': { brand: 'Warid (Jazz LTE)', carrier: 'PMCL (Formerly Warid Telecom)', details: "LTE network integrated into Jazz infrastructure." },
  '0321': { brand: 'Warid (Jazz LTE)', carrier: 'PMCL (Formerly Warid Telecom)', details: "LTE network integrated into Jazz infrastructure." },
  '0322': { brand: 'Warid (Jazz LTE)', carrier: 'PMCL (Formerly Warid Telecom)', details: "LTE network integrated into Jazz infrastructure." },
  '0323': { brand: 'Warid (Jazz LTE)', carrier: 'PMCL (Formerly Warid Telecom)', details: "LTE network integrated into Jazz infrastructure." },
  '0324': { brand: 'Warid (Jazz LTE)', carrier: 'PMCL (Formerly Warid Telecom)', details: "LTE network integrated into Jazz infrastructure." },
  '0325': { brand: 'Warid (Jazz LTE)', carrier: 'PMCL (Formerly Warid Telecom)', details: "LTE network integrated into Jazz infrastructure." },

  // Ufone (0330 - 0337)
  '0330': { brand: 'Ufone 4G', carrier: 'Pak Telecom Mobile Limited (PTCL / e&)', details: "Affiliate of Pakistan Telecommunication Company Limited (PTCL)." },
  '0331': { brand: 'Ufone 4G', carrier: 'Pak Telecom Mobile Limited (PTCL / e&)', details: "Affiliate of PTCL." },
  '0332': { brand: 'Ufone 4G', carrier: 'Pak Telecom Mobile Limited (PTCL / e&)', details: "Affiliate of PTCL." },
  '0333': { brand: 'Ufone 4G', carrier: 'Pak Telecom Mobile Limited (PTCL / e&)', details: "Affiliate of PTCL." },
  '0334': { brand: 'Ufone 4G', carrier: 'Pak Telecom Mobile Limited (PTCL / e&)', details: "Affiliate of PTCL." },
  '0335': { brand: 'Ufone 4G', carrier: 'Pak Telecom Mobile Limited (PTCL / e&)', details: "Affiliate of PTCL." },
  '0336': { brand: 'Ufone 4G', carrier: 'Pak Telecom Mobile Limited (PTCL / e&)', details: "Affiliate of PTCL." },
  '0337': { brand: 'Ufone 4G', carrier: 'Pak Telecom Mobile Limited (PTCL / e&)', details: "Affiliate of PTCL." },

  // Telenor (0340 - 0349)
  '0340': { brand: 'Telenor Pakistan', carrier: 'Telenor Pakistan (PTCL Group acquisition)', details: "Extensive nationwide cellular coverage." },
  '0341': { brand: 'Telenor Pakistan', carrier: 'Telenor Pakistan', details: "Nationwide cellular network." },
  '0342': { brand: 'Telenor Pakistan', carrier: 'Telenor Pakistan', details: "Nationwide cellular network." },
  '0343': { brand: 'Telenor Pakistan', carrier: 'Telenor Pakistan', details: "Nationwide cellular network." },
  '0344': { brand: 'Telenor Pakistan', carrier: 'Telenor Pakistan', details: "Nationwide cellular network." },
  '0345': { brand: 'Telenor Pakistan', carrier: 'Telenor Pakistan', details: "Nationwide cellular network." },
  '0346': { brand: 'Telenor Pakistan', carrier: 'Telenor Pakistan', details: "Nationwide cellular network." },
  '0347': { brand: 'Telenor Pakistan', carrier: 'Telenor Pakistan', details: "Nationwide cellular network." },
  '0348': { brand: 'Telenor Pakistan', carrier: 'Telenor Pakistan', details: "Nationwide cellular network." },
  '0349': { brand: 'Telenor Pakistan', carrier: 'Telenor Pakistan', details: "Nationwide cellular network." },

  // SCOM (0355)
  '0355': { brand: 'SCOM', carrier: 'Special Communications Organization', details: "Strategic telecom provider dedicated to Azad Jammu & Kashmir and Gilgit-Baltistan." },
};

export function parseTelecomNumber(input: string): TelecomInfo | null {
  // Normalize string
  const clean = input.replace(/[\s\-\(\)\.]/g, '');

  // Check Pakistani format: +923xx, 00923xx, 923xx, or 03xx
  let normalizedLocal = '';
  if (/^(\+92|0092|92)3\d{9}$/.test(clean)) {
    normalizedLocal = '0' + clean.replace(/^(\+92|0092|92)/, '');
  } else if (/^03\d{9}$/.test(clean)) {
    normalizedLocal = clean;
  } else if (/^3\d{9}$/.test(clean)) {
    normalizedLocal = '0' + clean;
  }

  if (normalizedLocal && normalizedLocal.length === 11) {
    const prefix = normalizedLocal.slice(0, 4);
    const op = PAK_MOBILE_OPERATORS[prefix] || {
      brand: 'Pakistani Cellular Network',
      carrier: 'PTA Regulated Carrier',
      details: 'Registered GSM Mobile Operator in Pakistan',
    };

    const formattedIntl = `+92 ${normalizedLocal.slice(1, 4)} ${normalizedLocal.slice(4, 7)} ${normalizedLocal.slice(7)}`;
    const formattedLoc = `${normalizedLocal.slice(0, 4)}-${normalizedLocal.slice(4)}`;

    return {
      carrier: op.carrier,
      brand: op.brand,
      country: 'Pakistan',
      countryCode: '+92',
      type: 'Mobile Cellular GSM (Prepaid / Postpaid)',
      formattedInternational: formattedIntl,
      formattedLocal: formattedLoc,
      prefix,
      operatorDetails: op.details,
      legalVerificationMethods: [
        'JazzCash / EasyPaisa Recipient Check: Enter the number in a digital wallet transfer screen to preview the official registered recipient name before sending funds.',
        'PTA SIM Information System: Send your CNIC number to 668 via SMS to see all active SIM counts registered under your identity.',
        'Official Franchise / Customer Service: Visit an authorized carrier center with CNIC verification for biometric ownership inquiries.',
        'MNP (Mobile Number Portability) Note: A user may have ported their number (e.g. from Telenor to Jazz), which retains the prefix while operating on the ported network.',
      ],
      safetyAdvisory: 'If receiving unsolicited harassment or fraudulent calls from this number, report immediately to PTA Helpline (0800-55055) or FIA Cyber Crime Wing (1991 / complaint.fia.gov.pk).',
    };
  }

  // Check International format
  if (/^\+?[1-9]\d{8,14}$/.test(clean)) {
    return {
      carrier: 'International Telecommunications Network',
      brand: 'Global Cellular / Fixed Line',
      country: clean.startsWith('1') ? 'United States / Canada' : clean.startsWith('44') ? 'United Kingdom' : clean.startsWith('971') ? 'United Arab Emirates' : clean.startsWith('966') ? 'Saudi Arabia' : 'International Network',
      countryCode: clean.startsWith('+') ? clean.slice(0, 3) : `+${clean.slice(0, 2)}`,
      type: 'International Direct Dial (IDD)',
      formattedInternational: `+${clean.replace(/^\+/, '')}`,
      formattedLocal: clean,
      prefix: clean.slice(0, 4),
      operatorDetails: 'International telecommunications routing number',
      legalVerificationMethods: [
        'Use verified international caller lookup services (e.g. WhatsApp profile check or verified corporate directory).',
      ],
      safetyAdvisory: 'Beware of one-ring callback scams from unfamiliar foreign numbers (Wangiri fraud). Never call back unknown international numbers without verification.',
    };
  }

  return null;
}

export function parseCnicNumber(input: string): CnicInfo | null {
  const digits = input.replace(/\D/g, '');
  if (digits.length === 13) {
    const provinceCode = digits[0];
    const provinceMap: Record<string, string> = {
      '1': 'Khyber Pakhtunkhwa (KPK)',
      '2': 'Federally Administered Tribal Areas (FATA)',
      '3': 'Punjab',
      '4': 'Sindh',
      '5': 'Balochistan',
      '6': 'Islamabad Capital Territory (ICT)',
      '7': 'Azad Jammu & Kashmir / Gilgit-Baltistan',
    };
    const province = provinceMap[provinceCode] || 'Pakistan (General/Overseas)';
    const divisionCode = digits.slice(1, 3);
    const lastDigit = parseInt(digits[12], 10);
    const gender: 'Male' | 'Female' = lastDigit % 2 === 1 ? 'Male' : 'Female';
    const cnicFormatted = `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits[12]}`;

    return {
      cnicFormatted,
      province,
      divisionCode,
      gender,
      verificationMethod: 'Send CNIC without dashes to 8500 via SMS to verify citizen electoral record with NADRA, or use the official Pak-ID NADRA mobile application.',
    };
  }
  return null;
}

export function detectNumberIntent(input: string): NumberAnalysisResult {
  const trimmed = input.trim();

  // 1. Check for complaint / question about "number diya tha / details nahi di"
  const complaintKeywords = [
    'number diya',
    'number dia',
    'details nh di',
    'detail nh di',
    'details nahi di',
    'detail nahi di',
    'details nhi di',
    'number ki details',
    'number check kro',
    'maine number diya',
    'mein ne aik number diya',
    'number provide kiya',
    'gave a number',
    'no details given',
  ];
  const isComplaint = complaintKeywords.some((kw) => trimmed.toLowerCase().includes(kw));

  if (isComplaint) {
    return {
      category: 'complaint_followup',
      rawInput: trimmed,
      explanationMarkdown: `### 🔍 Number Intelligence Support Center
Aapne bilkul theek farmaya! Agar aapne koi number enter kiya tha to 2,000 Connected Community uski **poori details** nikal sakti hai:

1. 🤖 **Agar Agent Number Tha (1 se 2000)**:
   - Jaise \`#42\` ya \`150\` ya \`500\`.
   - Ham foran us agent ka poora **Dossier**, **Specialization**, **Tools**, aur **Direct Task Execution** provide karenge.

2. 📱 **Agar Mobile / Phone Number Tha (03xx-xxxxxxx)**:
   - Jaise \`03001234567\` ya \`03123456789\`.
   - Ham foran uska **Telecom Network (Jazz, Zong, Telenor, Ufone, Warid)**, prefix validation, aur official/legal tor par recipient name verify karne ka tareeqa (JazzCash / EasyPaisa name preview / PTA 668) batayenge.

3. 🪪 **Agar CNIC Number Tha**:
   - Jaise \`42101-1234567-1\`.
   - Province, gender, administrative division code aur NADRA verification procedure.

👉 **Aap bas apna number dobara yahan chat mein likh dein** (maslan \`42\` ya \`03001234567\`), aur Community foran mukammal details screen par render kar degi!`,
    };
  }

  // 2. Check for explicit Agent Number:
  // e.g. "42", "#42", "agent 42", "AGT-0042", "agent #150", "42 ki details", "show agent 120"
  const agentMatch = trimmed.match(/^(?:agent|agt|model)?\s*#?\s*([1-9]\d{0,3})\s*(?:ki\s+details?|details?)?$/i);
  if (agentMatch) {
    const num = parseInt(agentMatch[1], 10);
    if (num >= 1 && num <= 2000) {
      const agent = getAgentByNumber(num);
      return {
        category: 'agent',
        rawInput: trimmed,
        agent,
      };
    }
  }

  // Also check if someone entered just digits 1 to 2000
  if (/^\d{1,4}$/.test(trimmed)) {
    const num = parseInt(trimmed, 10);
    if (num >= 1 && num <= 2000) {
      const agent = getAgentByNumber(num);
      return {
        category: 'agent',
        rawInput: trimmed,
        agent,
      };
    }
  }

  // 3. Check for Phone Number (Pakistani or International)
  const telecom = parseTelecomNumber(trimmed);
  if (telecom) {
    return {
      category: 'phone',
      rawInput: trimmed,
      telecom,
    };
  }

  // 4. Check for CNIC
  const cnic = parseCnicNumber(trimmed);
  if (cnic) {
    return {
      category: 'cnic',
      rawInput: trimmed,
      cnic,
    };
  }

  return {
    category: 'text_task',
    rawInput: trimmed,
  };
}
