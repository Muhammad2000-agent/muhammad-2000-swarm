// Voice Assistant and Audio Controller for Muhammad 2000 AI

export type VoiceIntent =
  | { type: 'NEW_CHAT'; label: string }
  | { type: 'CLEAR_CHAT'; label: string }
  | { type: 'NAV_CHAT'; label: string }
  | { type: 'NAV_WORKSPACE'; label: string }
  | { type: 'NAV_DIRECTORY'; label: string }
  | { type: 'OPEN_DISPATCHER'; label: string }
  | { type: 'OPEN_SWARM'; label: string }
  | { type: 'OPEN_HISTORY'; label: string }
  | { type: 'SET_MODE_DARK'; label: string }
  | { type: 'SET_MODE_LIGHT'; label: string }
  | { type: 'TOGGLE_THEME'; label: string }
  | { type: 'SET_LANG_URDU'; label: string }
  | { type: 'SET_LANG_ROMAN'; label: string }
  | { type: 'SET_LANG_ENGLISH'; label: string }
  | { type: 'SEARCH_AGENTS'; query: string; label: string }
  | { type: 'STOP_AUDIO'; label: string }
  | { type: 'READ_ANSWER'; label: string }
  | { type: 'CREATOR_QUESTION'; prompt: string; label: string }
  | { type: 'PROMPT_EXECUTE'; prompt: string; label: string };

// Pleasant Web Audio Chime without external MP3 files
export function playVoiceFeedbackSound(type: 'start' | 'success' | 'command' | 'stop') {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'start') {
      // Soft upward double chime
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'command') {
      // Crisp high confirmation bell
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.08); // A5
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'success') {
      // Harmonic major chord beep
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else {
      // Soft downward release
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.18);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    }
  } catch (err) {
    // Ignore audio context autoplay limitations safely
  }
}

// Extract natural conversational speech from AI responses (stripping code blocks, markdown symbols, and EMOJIS)
export function sanitizeTextForSpeech(rawText: string): string {
  if (!rawText) return '';

  // Check if code was provided
  const hasCode = /```[\s\S]*?```/.test(rawText);

  // Remove code blocks entirely so voice doesn't read brackets and semicolons
  let text = rawText.replace(/```[\s\S]*?```/g, ' [Source code generated] ');

  // Strip all emojis, pictographs, symbols, dingbats, and variation selectors so SpeechSynthesis NEVER reads emoji names!
  const emojiRegex =
    /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2B50}\u{2B55}\u{200D}\u{FE0F}\u{FE0E}\u{00A9}\u{00AE}\u{2122}\u{23E9}-\u{23EC}\u{23F0}\u{23F3}]/gu;
  text = text.replace(emojiRegex, ' ');

  // Strip text smileys and symbols like :) :D :-) <3 etc.
  text = text.replace(/[:;=8]['-]?[)D(\]/\\OpP]/g, ' ').replace(/<3/g, ' ');

  // Remove markdown headers, bold, italics, links, images
  text = text
    .replace(/^#+\s+/gm, '') // headings
    .replace(/\!\[.*?\]\(.*?\)/g, '') // images
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // link texts
    .replace(/[*_~`]/g, '') // formatting
    .replace(/[-*]\s+/gm, '') // bullet dashes
    .replace(/\n\s*\n/g, '. ') // double newlines to pause
    .replace(/\s+/g, ' ')
    .trim();

  // If text is super long, keep the introductory and explanatory first ~400 characters plus conclusion
  if (text.length > 550) {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    let condensed = '';
    for (const s of sentences) {
      if ((condensed + s).length <= 480) {
        condensed += ' ' + s;
      } else {
        break;
      }
    }
    if (condensed.trim()) {
      text = condensed.trim();
      if (hasCode) {
        text += ' Mukammal source code chat mein mojood hai.';
      }
    }
  }

  return text;
}

// Comprehensive Roman Urdu to Devanagari transliteration mapping for native Hindi/Urdu TTS engines
const ROMAN_URDU_DICT: Record<string, string> = {
  'assalam-o-alaikum': 'अस्सलाम वालेकुम',
  'assalamoalaikum': 'अस्सलाम वालेकुम',
  'assalam': 'अस्सलाम',
  'alaikum': 'वालेकुम',
  'salaam': 'सलाम',
  'aapka': 'आपका',
  'aapki': 'आपकी',
  'aapke': 'आपके',
  'aap': 'आप',
  'kaam': 'काम',
  'kam': 'कम',
  'kar': 'कर',
  'karein': 'करें',
  'kare': 'करे',
  'karo': 'करो',
  'karna': 'करना',
  'karti': 'करती',
  'karta': 'करता',
  'karte': 'करते',
  'kiya': 'किया',
  'kiye': 'किए',
  'hai': 'है',
  'hain': 'हैं',
  'ho': 'हो',
  'hoon': 'हूँ',
  'hun': 'हूँ',
  'tha': 'था',
  'thi': 'थी',
  'the': 'थे',
  'mukammal': 'मुकम्मल',
  'tayyar': 'तैयार',
  'ready': 'रेडी',
  'bohat': 'बहुत',
  'bahut': 'बहुत',
  'acha': 'अच्छा',
  'achi': 'अच्छी',
  'ache': 'अच्छे',
  'shukriya': 'शुक्रिया',
  'mehrbani': 'मेहरबानी',
  'theek': 'ठीक',
  'thik': 'ठीक',
  'sahi': 'सही',
  'bilkul': 'बिल्कुल',
  'zaroor': 'ज़रूर',
  'zarurat': 'ज़रूरत',
  'zaroorat': 'ज़रूरत',
  'chahiye': 'चाहिए',
  'chahta': 'चाहता',
  'chahti': 'चाहती',
  'fikr': 'फिक्र',
  'fikar': 'फिक्र',
  'mat': 'मत',
  'na': 'ना',
  'nahi': 'नहीं',
  'nahin': 'नहीं',
  'main': 'मैं',
  'mein': 'में',
  'hum': 'हम',
  'hamara': 'हमारा',
  'hamari': 'हमारी',
  'hamare': 'हमारे',
  'yeh': 'यह',
  'ye': 'यह',
  'woh': 'वह',
  'wo': 'वह',
  'kya': 'क्या',
  'kyun': 'क्यों',
  'kaise': 'कैसे',
  'kahan': 'कहाँ',
  'kab': 'कब',
  'kaun': 'कौन',
  'banao': 'बनाओ',
  'bana': 'बना',
  'banayein': 'बनाएं',
  'banaya': 'बनाया',
  'muhammad': 'मोहम्मद',
  'ai': 'ए आई',
  'agents': 'एजेंट्स',
  'agent': 'एजेंट',
  'code': 'कोड',
  'project': 'प्रोजेक्ट',
  'file': 'फाइल',
  'files': 'फाइल्स',
  'zip': 'ज़िप',
  'download': 'डाउनलोड',
  'click': 'क्लिक',
  'dekhein': 'देखें',
  'batayein': 'बताएं',
  'bol': 'बोल',
  'rahi': 'رہی',
  'raha': 'रहा',
  'suno': 'सुनो',
  'sunayein': 'सुनाएं',
  'sawal': 'सवाल',
  'jawab': 'जवाब',
  'help': 'मदद',
  'madad': 'मदद',
  'hazir': 'हाज़िर',
  'koshish': 'कोशिश',
  'samajh': 'समझ',
  'aasan': 'आसान',
  'mushkil': 'मुश्किल',
  'behtareen': 'बेहतरीन',
  'shandar': 'शानदार',
  'khush': 'खुश',
  'aao': 'आओ',
  'chaliye': 'चलिए',
  'mil': 'मिल',
  'shuru': 'शुरू',
};

// Convert Roman Urdu text to Devanagari for native Hindi/Urdu TTS engines
export function romanUrduToDevanagari(text: string): string {
  if (!text) return '';
  return text
    .split(/(\s+|[.,!?:;]+)/)
    .map((token) => {
      const clean = token.toLowerCase().trim();
      if (!clean) return token;
      if (ROMAN_URDU_DICT[clean]) {
        return ROMAN_URDU_DICT[clean];
      }
      return token;
    })
    .join('');
}

// Phonetic smoother for English voices reading Roman Urdu
export function phoneticizeRomanUrduForEnglishVoice(text: string): string {
  if (!text) return '';
  let out = text;
  // Common Roman Urdu phonetic replacements to prevent English TTS butchering
  out = out.replace(/assalam-o-alaikum/gi, 'Assalaam Alaikum');
  out = out.replace(/assalamoalaikum/gi, 'Assalaam Alaikum');
  out = out.replace(/\bshukriya\b/gi, 'shook-ree-ya');
  out = out.replace(/\bmukammal\b/gi, 'mookammal');
  out = out.replace(/\bbohat\b/gi, 'bahut');
  out = out.replace(/\btheek\b/gi, 'theek');
  out = out.replace(/\bchahiye\b/gi, 'chaahiye');
  out = out.replace(/\bchahta\b/gi, 'chahta');
  out = out.replace(/\bchahti\b/gi, 'chahti');
  out = out.replace(/\bzaroor\b/gi, 'zarroor');
  out = out.replace(/\bfikr\b/gi, 'fikar');
  out = out.replace(/\bkarein\b/gi, 'karain');
  out = out.replace(/\bhain\b/gi, 'haen');
  out = out.replace(/\bhoon\b/gi, 'hoon');
  out = out.replace(/\bbehtareen\b/gi, 'behtarreen');
  out = out.replace(/\bbilkul\b/gi, 'bilkool');
  out = out.replace(/-/g, ' '); // remove hyphens which cause spelling out
  return out;
}

// Active neural audio element reference
let activeNeuralAudio: HTMLAudioElement | null = null;
let cloudTtsCooldownUntil = 0;

// Fallback browser speech synthesis
export function speakWithBrowserSynthesis(
  cleanText: string,
  options?: {
    lang?: 'roman-urdu' | 'urdu' | 'english';
    onStart?: () => void;
    onEnd?: () => void;
    onError?: () => void;
  }
) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  window.speechSynthesis.cancel();
  const voices = window.speechSynthesis.getVoices();
  const lang = options?.lang || 'roman-urdu';

  const femaleKeywords = [
    'female',
    'swara',
    'heera',
    'kalpana',
    'veena',
    'zira',
    'samantha',
    'victoria',
    'karen',
    'tessa',
    'moira',
    'fiona',
    'sangeeta',
    'priya',
    'neerja',
    'shruti',
    'leila',
    'ayesha',
    'noor',
    'fatima',
    'woman',
    'girl',
  ];

  const findFemaleVoice = (candidates: SpeechSynthesisVoice[]) => {
    return (
      candidates.find((v) =>
        femaleKeywords.some((k) => v.name.toLowerCase().includes(k))
      ) || candidates[0]
    );
  };

  let chosenVoice: SpeechSynthesisVoice | null = null;
  let targetLang = 'en-US';
  let spokenText = cleanText;

  if (lang === 'urdu') {
    const urduVoices = voices.filter((v) => v.lang.startsWith('ur') || v.lang.includes('pk'));
    const hindiVoices = voices.filter((v) => v.lang.startsWith('hi'));
    chosenVoice = urduVoices.length > 0
      ? findFemaleVoice(urduVoices)
      : hindiVoices.length > 0
      ? findFemaleVoice(hindiVoices)
      : null;
    targetLang = urduVoices.length > 0 ? 'ur-PK' : 'hi-IN';
    spokenText = cleanText;
  } else if (lang === 'roman-urdu') {
    const hiVoices = voices.filter((v) => v.lang.startsWith('hi') || v.lang.includes('IN') && (v.name.toLowerCase().includes('hindi') || v.name.toLowerCase().includes('swara') || v.name.toLowerCase().includes('kalpana') || v.name.toLowerCase().includes('heera')));
    const enInVoices = voices.filter((v) => (v.lang === 'en-IN' || v.lang.startsWith('en_IN') || v.name.toLowerCase().includes('india') || v.name.toLowerCase().includes('neerja') || v.name.toLowerCase().includes('priya')));
    const enVoices = voices.filter((v) => v.lang.startsWith('en'));

    const matchedHi = hiVoices.length > 0 ? findFemaleVoice(hiVoices) : null;
    const matchedEnIn = enInVoices.length > 0 ? findFemaleVoice(enInVoices) : null;
    const matchedEn = enVoices.length > 0 ? findFemaleVoice(enVoices) : null;

    if (matchedHi) {
      chosenVoice = matchedHi;
      targetLang = 'hi-IN';
      spokenText = romanUrduToDevanagari(cleanText);
    } else if (matchedEnIn) {
      chosenVoice = matchedEnIn;
      targetLang = 'en-IN';
      spokenText = phoneticizeRomanUrduForEnglishVoice(cleanText);
    } else {
      chosenVoice = matchedEn || voices.find((v) => femaleKeywords.some((k) => v.name.toLowerCase().includes(k))) || voices[0] || null;
      targetLang = 'en-US';
      spokenText = phoneticizeRomanUrduForEnglishVoice(cleanText);
    }
  } else {
    const enVoices = voices.filter((v) => v.lang.startsWith('en'));
    chosenVoice = findFemaleVoice(enVoices) || voices.find((v) => femaleKeywords.some((k) => v.name.toLowerCase().includes(k))) || voices[0] || null;
    targetLang = 'en-US';
    spokenText = cleanText;
  }

  const utterance = new SpeechSynthesisUtterance(spokenText);
  if (chosenVoice) utterance.voice = chosenVoice;
  utterance.lang = targetLang;
  utterance.rate = lang === 'roman-urdu' ? 0.94 : 1.0;
  utterance.pitch = 1.08;

  utterance.onstart = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ai-speaking-start'));
    }
    options?.onStart?.();
  };

  utterance.onend = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ai-speaking-end'));
    }
    options?.onEnd?.();
  };

  utterance.onerror = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ai-speaking-end'));
    }
    options?.onError?.();
    options?.onEnd?.();
  };

  window.speechSynthesis.speak(utterance);
}

// Speak aloud using Studio-Grade Neural TTS with warm, authentic human tone (falls back to browser TTS)
export function speakAloud(
  text: string,
  options?: {
    lang?: 'roman-urdu' | 'urdu' | 'english';
    onStart?: () => void;
    onEnd?: () => void;
    onError?: () => void;
  }
) {
  stopSpeaking();
  const clean = sanitizeTextForSpeech(text);
  if (!clean.trim()) return;

  const lang = options?.lang || 'roman-urdu';

  // If cloud TTS is in cooldown, immediately speak with browser synthesis smoothly
  if (Date.now() < cloudTtsCooldownUntil) {
    speakWithBrowserSynthesis(clean, options);
    return;
  }

  // Request studio-grade neural voice synthesis via backend API
  fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: clean, language: lang }),
  })
    .then((res) => {
      if (!res.ok) throw new Error('Neural TTS request failed');
      return res.json();
    })
    .then((data) => {
      if (data.success && data.audioBase64) {
        const audio = new Audio(`data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`);
        activeNeuralAudio = audio;

        audio.onplay = () => {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('ai-speaking-start'));
          }
          options?.onStart?.();
        };

        audio.onended = () => {
          activeNeuralAudio = null;
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('ai-speaking-end'));
          }
          options?.onEnd?.();
        };

        audio.onerror = () => {
          activeNeuralAudio = null;
          speakWithBrowserSynthesis(clean, options);
        };

        audio.play().catch(() => {
          // If autoplay policy or codec failed, fallback to browser synthesis
          speakWithBrowserSynthesis(clean, options);
        });
      } else {
        if (data.fallback) {
          cloudTtsCooldownUntil = Date.now() + 10 * 60 * 1000;
        }
        speakWithBrowserSynthesis(clean, options);
      }
    })
    .catch((_err) => {
      // Offline, network or quota error fallback
      cloudTtsCooldownUntil = Date.now() + 5 * 60 * 1000;
      speakWithBrowserSynthesis(clean, options);
    });
}

export function stopSpeaking() {
  if (activeNeuralAudio) {
    try {
      activeNeuralAudio.pause();
      activeNeuralAudio.currentTime = 0;
    } catch {}
    activeNeuralAudio = null;
  }

  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
    window.dispatchEvent(new CustomEvent('ai-speaking-end'));
  }
}

// Parse spoken voice string into intentional app actions or execution prompts
export function parseVoiceCommand(transcript: string, _preferredLang?: string): VoiceIntent {
  const clean = transcript.trim().toLowerCase();

  // 1. Stop audio / Khamosh
  if (
    /^(stop|chup|ruk jao|khamosh|mute|quiet|stop speaking|band karo)$/i.test(clean) ||
    clean.includes('ruk jao') ||
    clean.includes('khamosh ho jao') ||
    clean.includes('stop audio')
  ) {
    return { type: 'STOP_AUDIO', label: 'Audio Stopped' };
  }

  // 2. Creator Question (Absolute priority: Muhammad created you)
  if (
    clean.includes('kisne banaya') ||
    clean.includes('kis ne banaya') ||
    clean.includes('kisne bnaya') ||
    clean.includes('who made you') ||
    clean.includes('who created you') ||
    clean.includes('who is your creator') ||
    clean.includes('creator kon') ||
    clean.includes('developer kon') ||
    clean.includes('aapko kisne banaya') ||
    clean.includes('tmhee kisne')
  ) {
    return {
      type: 'CREATOR_QUESTION',
      prompt: transcript,
      label: 'Creator Query: Mujhe Muhammad ne banaya hai',
    };
  }

  // 3. New Chat
  if (
    clean === 'new chat' ||
    clean === 'naya chat' ||
    clean.includes('naya chat') ||
    clean.includes('nayi chat') ||
    clean.includes('new chat shuru') ||
    clean.includes('start new chat') ||
    clean.includes('reset chat') ||
    clean.includes('نیا چیٹ')
  ) {
    return { type: 'NEW_CHAT', label: 'New Chat Session Started' };
  }

  // 4. Clear Chat
  if (
    clean === 'clear chat' ||
    clean.includes('clear chat') ||
    clean.includes('chat saaf karo') ||
    clean.includes('delete chat') ||
    clean.includes('chat clear karo')
  ) {
    return { type: 'CLEAR_CHAT', label: 'Chat Cleared' };
  }

  // 5. Read aloud / Sunao
  if (
    clean.includes('jawab parho') ||
    clean.includes('parh kar sunao') ||
    clean.includes('speak answer') ||
    clean.includes('read answer') ||
    clean.includes('sunao') ||
    clean.includes('parho')
  ) {
    return { type: 'READ_ANSWER', label: 'Reading Latest Response' };
  }

  // 6. Navigation: Chat
  if (
    clean === 'open chat' ||
    clean === 'chat kholo' ||
    clean.includes('go to chat') ||
    clean.includes('chat par jao') ||
    clean.includes('open ai chat') ||
    clean.includes('چیٹ کھولو')
  ) {
    return { type: 'NAV_CHAT', label: 'Switched to AI Chat View' };
  }

  // 7. Navigation: Workspace / Tasks
  if (
    clean === 'open workspace' ||
    clean === 'workspace kholo' ||
    clean.includes('tasks kholo') ||
    clean.includes('tasks par jao') ||
    clean.includes('zip workspace') ||
    clean.includes('open tasks') ||
    clean.includes('ورک اسپیس کھولو')
  ) {
    return { type: 'NAV_WORKSPACE', label: 'Switched to Tasks & ZIP Workspace' };
  }

  // 8. Navigation: Directory / 2000 Agents
  if (
    clean === 'open directory' ||
    clean === 'directory kholo' ||
    clean.includes('agents dikhao') ||
    clean.includes('agents ki list') ||
    clean.includes('2000 agents') ||
    clean.includes('show agents') ||
    clean.includes('browse agents') ||
    clean.includes('ایجنٹس دکھاؤ')
  ) {
    return { type: 'NAV_DIRECTORY', label: 'Switched to 2,000 AI Agent Fleet' };
  }

  // 9. Auto Dispatcher / Match Agent
  if (
    clean.includes('auto dispatcher') ||
    clean.includes('agent dhoondo') ||
    clean.includes('match agent') ||
    clean.includes('smart dispatcher') ||
    clean.includes('dispatcher kholo') ||
    clean.includes('آٹو ڈسپیچر')
  ) {
    return { type: 'OPEN_DISPATCHER', label: 'Auto-Dispatcher Opened' };
  }

  // 10. Swarm Modal
  if (
    clean.includes('swarm kholo') ||
    clean.includes('open swarm') ||
    clean.includes('launch swarm') ||
    clean.includes('agents swarm') ||
    clean.includes('سوارم کھولو')
  ) {
    return { type: 'OPEN_SWARM', label: 'Swarm Modal Opened' };
  }

  // 11. History Modal
  if (
    clean.includes('history kholo') ||
    clean.includes('open history') ||
    clean.includes('purane tasks') ||
    clean.includes('task history') ||
    clean.includes('show history')
  ) {
    return { type: 'OPEN_HISTORY', label: 'Task History Opened' };
  }

  // 12. Dark Mode
  if (
    clean.includes('dark mode') ||
    clean.includes('raat ka mode') ||
    clean.includes('dark theme') ||
    clean.includes('night mode')
  ) {
    return { type: 'SET_MODE_DARK', label: 'Dark Mode Activated' };
  }

  // 13. Light Mode
  if (
    clean.includes('light mode') ||
    clean.includes('din ka mode') ||
    clean.includes('light theme') ||
    clean.includes('day mode')
  ) {
    return { type: 'SET_MODE_LIGHT', label: 'Light Mode Activated' };
  }

  // 14. Theme Toggle / Change
  if (
    clean.includes('theme badlo') ||
    clean.includes('change theme') ||
    clean.includes('next theme') ||
    clean.includes('rang badlo') ||
    clean.includes('switch theme')
  ) {
    return { type: 'TOGGLE_THEME', label: 'Theme Changed' };
  }

  // 15. Language switch
  if (clean.includes('urdu mein') || clean.includes('urdu zaban') || clean.includes('switch to urdu')) {
    return { type: 'SET_LANG_URDU', label: 'Language set to Urdu (اردو)' };
  }
  if (clean.includes('roman urdu') || clean.includes('roman zaban')) {
    return { type: 'SET_LANG_ROMAN', label: 'Language set to Roman Urdu' };
  }
  if (clean.includes('english mein') || clean.includes('switch to english') || clean.includes('in english')) {
    return { type: 'SET_LANG_ENGLISH', label: 'Language set to English' };
  }

  // 16. Search Agents Command: e.g. "search python", "search agent python", "react agent dhoondo"
  const searchMatch = clean.match(/(?:search agent|search for|search|dhoondo)\s+([a-z0-9#\s\-_]+)/i);
  if (searchMatch && searchMatch[1] && searchMatch[1].trim().length > 1) {
    const q = searchMatch[1].replace(/agent|karo|bhai/gi, '').trim();
    if (q) {
      return { type: 'SEARCH_AGENTS', query: q, label: `Searching agents: "${q}"` };
    }
  }

  // 17. Default: Any custom task, question, or request to execute! ("Kuch bhi bol kar kahein aur yeh karein")
  return {
    type: 'PROMPT_EXECUTE',
    prompt: transcript,
    label: `Executing Voice Request: "${transcript.slice(0, 40)}${transcript.length > 40 ? '...' : ''}"`,
  };
}
