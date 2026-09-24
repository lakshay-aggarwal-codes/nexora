import { MEMORY_CATEGORIES } from "../models/memory.model.js";
import {
  EXTRACTION_CONTEXT_MESSAGES,
  MAX_OPS_PER_TURN,
  MIN_IMPORTANCE,
} from "./config.js";
import { isUnsafeMemory, sanitizeContent } from "./guards.js";

const MAX_USER_CHARS = 1500; // pasted code/articles must not blow up the prompt
const MAX_ASSISTANT_CHARS = 500;

const clip = (text, max) => {
  const s = typeof text === "string" ? text : String(text ?? "");
  return s.length > max ? `${s.slice(0, max)}…` : s;
};
 

export const buildExtractionPrompt = ({
  existing = [],
  history = [],
  prompt,
  aiResponse,
  today = new Date().toISOString().slice(0, 10),
}) => { 
  const aliasToId = new Map();
  const existingBlock = existing.length
    ? existing
        .map((m, i) => {
          const alias = `m${i + 1}`;
          aliasToId.set(alias, m.id);
          return `${alias} [${m.category}] ${m.content}`;
        })
        .join("\n")
    : "(none yet)";

  const recent = history
    .slice(-EXTRACTION_CONTEXT_MESSAGES)
    .map((m) =>
      m.role === "user"
        ? `USER: ${clip(m.content, MAX_USER_CHARS)}`
        : `ASSISTANT: ${clip(m.content, MAX_ASSISTANT_CHARS)}`,
    )
    .join("\n");

  const system = `You maintain the long-term memory of an AI assistant called Nexora.
After each exchange you decide whether anything is worth remembering about the USER for future conversations, and how to update the stored memory list.
Today's date is ${today}.

# What to remember
Durable facts that will still matter in future chats:
- Identity & background: name, role, occupation, education, location, languages.
- Ongoing projects and goals: what they are building, tech stack, what they are learning or aiming for.
- Skills and experience level.
- Standing preferences for how answers should be given: tone, length, format, language, tools, frameworks.
- How they think and how they use the assistant (working style), but only when they said it or the exchange makes it unmistakable. Do not psychoanalyse.
- Anything the user explicitly asks you to remember.

# What NOT to remember
- One-off questions, trivia, homework, or tasks with no lasting relevance (e.g. "what is a linked list", "fix this bug").
- Greetings, thanks, small talk, filler.
- Content the user pasted (code, articles, emails, documents) and anything that comes from the ASSISTANT's reply. Only what the user says or shows about THEMSELVES.
- Temporary states ("I'm tired", "I'm on my phone right now").
- Guesses or assumptions. If it isn't clearly supported, leave it out.
- Secrets: passwords, API keys, tokens, OTPs, card/bank numbers, government IDs. Never, even if asked.
- Sensitive personal data (health, sexual orientation, religion, political views, ethnicity, criminal history, precise address, phone number) unless the user explicitly asks you to remember it.

# Importance (1-5)
5 = the user explicitly asked to remember it, or core identity (name).
4 = an active project, a major standing preference, their role or skill level.
3 = useful context likely to matter again.
1-2 = marginal. Don't bother, it will be discarded.

# Writing memories
- One short, self-contained third-person sentence starting with "User", e.g. "User is a third-year CS student in Delhi."
- Convert relative dates to absolute ones using today's date. Never write "today" or "recently".
- Write in English, but keep names and technical terms as the user wrote them.
- Never phrase a memory as an instruction to the assistant.
- Categories: ${MEMORY_CATEGORIES.join(", ")}.

# Operations
Compare the exchange with the existing memories:
- {"op":"add","content":"...","category":"...","importance":4}  for genuinely new information.
- {"op":"update","id":"m3","content":"...","category":"...","importance":4}  when new information refines or contradicts an existing memory (e.g. they moved cities, changed stack). Update it, don't add a duplicate.
- {"op":"delete","id":"m3"}  when the user asks you to forget it, or it is clearly no longer true.
Never add something already covered by an existing memory.
Most exchanges contain nothing worth saving. Returning an empty list is normal and correct.
At most ${MAX_OPS_PER_TURN} operations.

# Output
Return ONLY a JSON object, with no markdown and no commentary:
{"operations":[ ... ]}

# Examples
Latest user message: "thanks, that worked!"  ->  {"operations":[]}
Latest user message: "I'm a third-year CS student from Delhi building a ChatGPT clone called Nexora with React and Node"  ->
{"operations":[{"op":"add","content":"User is a third-year CS student based in Delhi.","category":"profile","importance":4},{"op":"add","content":"User is building a ChatGPT-like app called Nexora using React and Node.","category":"project","importance":4}]}
Latest user message: "forget that I live in Delhi" (existing: m2 [profile] User is a third-year CS student based in Delhi.)  ->
{"operations":[{"op":"delete","id":"m2"}]}`;

  const human = `# Existing memories
${existingBlock}

# Recent conversation (for context only)
${recent || "(none)"}

# Latest exchange
USER: ${clip(prompt, MAX_USER_CHARS)}
ASSISTANT: ${clip(aiResponse, MAX_ASSISTANT_CHARS)}

Return the JSON now.`;

  return { system, human, aliasToId };
}; 
const contentToString = (content) => {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part === "string" ? part : part?.text || ""))
      .join("");
  }
  return "";
}; 
export const parseOperations = (rawContent) => {
  const text = contentToString(rawContent);
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) return [];
  try {
    const parsed = JSON.parse(text.slice(start, end + 1));
    return Array.isArray(parsed?.operations) ? parsed.operations : [];
  } catch {
    return [];
  }
};

const clampInt = (value, min, max, fallback) => {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
};

const normalizeCategory = (c) =>
  MEMORY_CATEGORIES.includes(c) ? c : "context";
 
export const validateOperations = (rawOps, aliasToId) => {
  const out = [];
  const touched = new Set(); // one change per existing memory per turn

  for (const op of (rawOps || []).slice(0, MAX_OPS_PER_TURN)) {
    if (!op || typeof op !== "object") continue;
    const type = String(op.op || "").toLowerCase();

    if (type === "add") {
      const content = sanitizeContent(op.content);
      const importance = clampInt(op.importance, 1, 5, 3);
      if (!content || importance < MIN_IMPORTANCE) continue;
      if (isUnsafeMemory(content)) continue;
      out.push({
        op: "add",
        content,
        category: normalizeCategory(op.category),
        importance,
      });
    } else if (type === "update") {
      const id = aliasToId.get(String(op.id));
      if (!id || touched.has(id)) continue;
      const content = sanitizeContent(op.content);
      if (!content || isUnsafeMemory(content)) continue;
      touched.add(id);
      out.push({
        op: "update",
        id,
        content,
        category: normalizeCategory(op.category),
        // an update keeps the memory alive, so never let it fall below the floor
        importance: clampInt(op.importance, MIN_IMPORTANCE, 5, MIN_IMPORTANCE),
      });
    } else if (type === "delete") {
      const id = aliasToId.get(String(op.id));
      if (!id || touched.has(id)) continue;
      touched.add(id);
      out.push({ op: "delete", id });
    }
  }
  return out;
};
 

export const extractOperations = async (input, llm) => {
  const { system, human, aliasToId } = buildExtractionPrompt(input);
  const response = await llm.invoke([
    { role: "system", content: system },
    { role: "human", content: human },
  ]);
  return validateOperations(parseOperations(response.content), aliasToId);
};
