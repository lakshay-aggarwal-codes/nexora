import { MAX_MEMORY_CHARS } from "./config.js";

 

const SECRET_PATTERNS = [
  /sk-[A-Za-z0-9_-]{16,}/, // OpenAI-style keys
  /gsk_[A-Za-z0-9]{16,}/, // Groq keys
  /AIza[0-9A-Za-z_-]{20,}/, // Google API keys
  /gh[pousr]_[A-Za-z0-9]{20,}/, // GitHub tokens
  /xox[baprs]-[A-Za-z0-9-]{10,}/, // Slack tokens
  /AKIA[0-9A-Z]{16}/, // AWS access key id
  /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{5,}/, // JWT
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  /\b(?:mongodb(?:\+srv)?|postgres(?:ql)?|mysql|redis|amqp):\/\/\S+/i, // connection strings
  /\b(?:password|passwd|pwd|passcode|secret|api[\s_-]?key|token|otp|cvv)\b\s*(?:is|are|was|=|:)/i,
  /\b[A-Fa-f0-9]{32,}\b/, // long hex blobs (hashes, keys)
  /\b[A-Za-z0-9+/_-]{40,}={0,2}/, // long base64-ish blobs
  /\b[A-Z]{5}[0-9]{4}[A-Z]\b/, // Indian PAN
  /\b\d{4}\s\d{4}\s\d{4}\b/, // Aadhaar (spaced)
  /\b\d{3}-\d{2}-\d{4}\b/, // US SSN
];

// Memory text is injected into a system prompt, so it must never look like an
// instruction aimed at the assistant.
const INSTRUCTION_PATTERNS = [
  /ignore\s+(?:all\s+|any\s+|the\s+)?(?:previous|prior|above|earlier)\s+(?:instructions|rules|prompts?)/i,
  /disregard\s+(?:all\s+|any\s+|the\s+)?(?:previous|prior|above|earlier|system)/i,
  /system\s+prompt/i,
  /\byou\s+(?:must|should|will|shall)\s+(?:always|never|only)\b/i,
];

const luhnValid = (digits) => {
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = digits.charCodeAt(i) - 48;
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
};

const containsCardNumber = (text) => {
  const runs = text.match(/\b(?:\d[ -]?){13,19}\b/g) || [];
  return runs.some((run) => {
    const digits = run.replace(/\D/g, "");
    return digits.length >= 13 && digits.length <= 19 && luhnValid(digits);
  });
};

export const isUnsafeMemory = (text) => {
  if (typeof text !== "string") return true;
  if (SECRET_PATTERNS.some((re) => re.test(text))) return true;
  if (containsCardNumber(text)) return true;
  if (INSTRUCTION_PATTERNS.some((re) => re.test(text))) return true;
  return false;
};

/** Clean model output into a single safe line, or "" if it is unusable. */
export const sanitizeContent = (text) => {
  if (typeof text !== "string") return "";
  let out = text
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f]/g, " ") // control chars / newlines
    .replace(/[<>]/g, "") // can't close the <user_memory> tag we wrap notes in
    .replace(/^[\s\-*•\d.)]+/, "") // stray list markers
    .replace(/\s+/g, " ")
    .trim();
  if (out.length > MAX_MEMORY_CHARS) out = out.slice(0, MAX_MEMORY_CHARS).trim();
  return out.length >= 5 ? out : "";
};

/** Normalised form used only to detect duplicates. */
export const normalizeForCompare = (text) =>
  String(text || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();

// Whole message is just an acknowledgement / greeting -> nothing to learn, so
// don't spend an LLM call. Deliberately tiny and language-light: everything
// else goes to the extractor, which is what actually decides what matters.
const TRIVIAL_TOKENS =
  "hi|hii+|hello|hey|yo|thanks|thank you|thx|ty|ok|okay|k|kk|yes|yeah|yep|yup|no|nope|" +
  "cool|nice|great|awesome|perfect|good|got it|bye|goodbye|good morning|good night|" +
  "lol|haha+|hmm+|so much|a lot|very much|again|there|please|" +
  "haan|han|nahi|nhi|theek hai|thik hai|accha|acha|shukriya|dhanyavad|dhanyawad";
const TRIVIAL_RE = new RegExp(`^(?:(?:${TRIVIAL_TOKENS})\\s*)+$`, "i");

export const shouldAttemptExtraction = (prompt) => {
  if (typeof prompt !== "string") return false;
  const cleaned = prompt
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (cleaned.length < 3) return false;
  if (TRIVIAL_RE.test(cleaned)) return false;
  return true;
};
