import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";

process.env.REDIS_URL ||= "redis://127.0.0.1:6379";
process.env.GROQ_API_KEY ||= "test-key";
process.env.GOOGLE_API_KEY ||= "test-key";

const mongoose = (await import("mongoose")).default;
const express = (await import("express")).default;
const { Memory, MemorySetting } = await import("../models/memory.model.js");
const { getModel } = await import("../config/llmModel.js");
const redis = (await import("../../../shared/redis/redis.js")).default;
 
const chatDb = { messages: {} };
const chatServer = http.createServer((req, res) => {
  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", () => {
    const json = (o) => {
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify(o));
    };
    if (req.method === "POST" && req.url === "/save-message") {
      const m = JSON.parse(body);
      (chatDb.messages[m.conversationId] ||= []).push({ role: m.role, content: m.content });
      return json({ ok: true });
    }
    if (req.method === "GET" && req.url.startsWith("/get-messages/")) {
      return json(chatDb.messages[req.url.split("/").pop()] || []);
    }
    if (req.method === "POST" && req.url === "/update-conversation") return json({ ok: true });
    res.statusCode = 404;
    json({});
  });
});
await new Promise((r) => chatServer.listen(0, r));
process.env.CHAT_SERVICE = `http://127.0.0.1:${chatServer.address().port}`;
 
const db = { memories: [], settings: [], failReads: false, tick: 0 };
const now = () => new Date(Date.now() + db.tick++);

const matches = (doc, filter) =>
  Object.entries(filter).every(([k, v]) =>
    v && typeof v === "object" && v.$in
      ? v.$in.some((x) => String(x) === String(doc[k]))
      : String(doc[k]) === String(v),
  );

class Query {
  constructor(rows, one = false) {
    this.rows = rows;
    this.one = one;
    this.spec = null;
    this.max = null;
  }
  sort(spec) { this.spec = spec; return this; }
  limit(n) { this.max = n; return this; }
  select() { return this; }
  lean() { return this; }
  then(resolve, reject) {
    if (db.failReads) return Promise.reject(new Error("mongo down")).then(resolve, reject);
    let out = [...this.rows];
    if (this.spec) {
      out.sort((a, b) => {
        for (const [k, dir] of Object.entries(this.spec)) {
          const av = a[k] instanceof Date ? a[k].getTime() : a[k];
          const bv = b[k] instanceof Date ? b[k].getTime() : b[k];
          if (av < bv) return -dir;
          if (av > bv) return dir;
        }
        return 0;
      });
    }
    if (this.max != null) out = out.slice(0, this.max);
    out = out.map((d) => ({ ...d }));
    return Promise.resolve(this.one ? out[0] ?? null : out).then(resolve, reject);
  }
}

Memory.find = (f) => new Query(db.memories.filter((d) => matches(d, f)));
Memory.countDocuments = async (f) => db.memories.filter((d) => matches(d, f)).length;
Memory.create = async (doc) => {
  await new Memory(doc).validate(); // real schema validation (throws on bad data)
  const row = { ...doc, _id: new mongoose.Types.ObjectId(), createdAt: now(), updatedAt: now() };
  db.memories.push(row);
  return row;
};
Memory.updateOne = async (f, u) => {
  const row = db.memories.find((d) => matches(d, f));
  if (!row) return { matchedCount: 0 };
  Object.assign(row, u.$set, { updatedAt: now() });
  return { matchedCount: 1 };
};
Memory.deleteOne = async (f) => {
  const i = db.memories.findIndex((d) => matches(d, f));
  if (i >= 0) db.memories.splice(i, 1);
  return { deletedCount: i >= 0 ? 1 : 0 };
};
Memory.deleteMany = async (f) => {
  const before = db.memories.length;
  db.memories = db.memories.filter((d) => !matches(d, f));
  return { deletedCount: before - db.memories.length };
};
MemorySetting.findOne = (f) => new Query(db.settings.filter((d) => matches(d, f)), true);
MemorySetting.updateOne = async (f, u, opts) => {
  const row = db.settings.find((d) => matches(d, f));
  if (row) Object.assign(row, u.$set);
  else if (opts?.upsert) db.settings.push({ ...f, ...u.$set });
  return { matchedCount: row ? 1 : 0 };
};
 
const chatCalls = []; // every message array the chat agent sent to the model
let memoryCalls = 0;
let memoryShouldThrow = false;

const groq = await getModel("chat"); // shared by router, chat agent, title
groq.invoke = async (input) => {
  if (typeof input === "string") return { content: "chat" }; // router
  if (String(input[0]?.content).includes("chat titles")) return { content: "A Title" };
  chatCalls.push(input);
  const last = input[input.length - 1].content;
  return { content: `reply to: ${last}` };
};

// Stand-in for what a competent extraction model would return.
const memoryBrain = (humanPrompt) => {
  const user = humanPrompt.split("# Latest exchange\nUSER: ")[1].split("\nASSISTANT:")[0];
  const alias = (needle) =>
    humanPrompt.match(new RegExp(`^(m\\d+) \\[\\w+\\] .*${needle}`, "m"))?.[1];
  let ops = [];
  if (/I'm Rahul/.test(user)) {
    ops = [
      { op: "add", content: "User's name is Rahul and he is a CS student in Delhi.", category: "profile", importance: 5 },
      { op: "add", content: "User is building a ChatGPT-like app called Nexora.", category: "project", importance: 4 },
      { op: "add", content: "User once drank chai.", category: "context", importance: 1 }, // must be discarded
    ];
  } else if (/moved to Mumbai/.test(user)) {
    ops = [{ op: "update", id: alias("Delhi"), content: "User's name is Rahul and he is a CS student in Mumbai.", category: "profile", importance: 5 }];
  } else if (/forget/.test(user)) {
    ops = [{ op: "delete", id: alias("Mumbai") }];
  } else if (/api key/.test(user)) {
    ops = [{ op: "add", content: "User's API key is sk-abcdefghijklmnopqrstuvwxyz123456", category: "context", importance: 5 }];
  } else if (/prefer short/.test(user)) {
    ops = [{ op: "add", content: "User prefers short answers, code first.", category: "style", importance: 4 }];
  }
  return JSON.stringify({ operations: ops });
};
const memoryLlm = await getModel("memory");
memoryLlm.invoke = async (msgs) => {
  memoryCalls++;
  if (memoryShouldThrow) throw new Error("groq 429");
  return { content: "```json\n" + memoryBrain(msgs[1].content) + "\n```" };
};
 
const router = (await import("../routes/agent.routes.js")).default;
const app = express();
app.use(express.json());
app.use("/", router);
const server = await new Promise((r) => {
  const s = app.listen(0, () => r(s));
});
const base = `http://127.0.0.1:${server.address().port}`;

const RUN = Math.random().toString(36).slice(2, 8);
const ALICE = `test-alice-${RUN}`;
const BOB = `test-bob-${RUN}`;
const conv = (n) => `test-conv-${RUN}-${n}`;

const call = (method, path, { user, body } = {}) =>
  fetch(base + path, {
    method,
    headers: { "content-type": "application/json", ...(user ? { "x-user-id": user } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
const chat = async (user, conversationId, prompt) => {
  const res = await call("POST", "/chat", { user, body: { prompt, conversationId } });
  return { res, json: await res.json() };
};
const waitFor = async (cond, ms = 3000) => {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    if (await cond()) return true;
    await new Promise((r) => setTimeout(r, 10));
  }
  return false;
};
const settle = () => new Promise((r) => setTimeout(r, 100)); // let background work finish
const systemOf = (call) => String(call[0].content);
const textOf = (call) => call.map((m) => String(m.content));
const userMems = (u) => db.memories.filter((m) => m.userId === u).map((m) => m.content);

after(async () => {
  const keys = await redis.keys(`*test-*${RUN}*`);
  if (keys.length) await redis.del(...keys);
  server.close();
  chatServer.close();
  await redis.quit();
}); 

test("1. greetings are answered but never trigger a memory LLM call", async () => {
  const { res, json } = await chat(ALICE, conv(1), "Hi");
  assert.equal(res.status, 200);
  assert.equal(json.content, "reply to: Hi");
  await settle();
  assert.equal(memoryCalls, 0);
  assert.equal(userMems(ALICE).length, 0);
});

test("2. short-term memory: the model now receives earlier messages of the same chat", async () => {
  const before = chatCalls.length;
  await chat(ALICE, conv(1), "I'm Rahul, a CS student in Delhi building Nexora");
  const sent = textOf(chatCalls[before]);
  // system, then the earlier "Hi" exchange, then the new prompt (exactly once)
  assert.deepEqual(sent.slice(1), [
    "Hi",
    "reply to: Hi",
    "I'm Rahul, a CS student in Delhi building Nexora",
  ]);
  assert.match(sent[0], /nothing saved yet/);
});

test("3. important facts are saved; low-importance ones are discarded", async () => {
  assert.ok(await waitFor(() => userMems(ALICE).length === 2), JSON.stringify(userMems(ALICE)));
  const mems = userMems(ALICE);
  assert.ok(mems.some((m) => m.includes("Rahul")));
  assert.ok(mems.some((m) => m.includes("Nexora")));
  assert.ok(!mems.some((m) => m.includes("chai")));
});

test("4. a brand-new conversation already knows the user", async () => {
  const before = chatCalls.length;
  await chat(ALICE, conv(2), "What should I build next?");
  const system = systemOf(chatCalls[before]);
  assert.match(system, /<user_memory>/);
  assert.match(system, /Rahul/);
  assert.match(system, /Delhi/);
  assert.match(system, /Nexora/);
  assert.ok(!system.includes("chai"));
  // and the new chat's history is only its own messages
  assert.deepEqual(textOf(chatCalls[before]).slice(1), ["What should I build next?"]);
});

test("5. another user never sees Alice's memories", async () => {
  const before = chatCalls.length;
  await chat(BOB, conv(3), "What should I build next?");
  const system = systemOf(chatCalls[before]);
  assert.match(system, /nothing saved yet/);
  assert.ok(!system.includes("Rahul"));
});

test("6. contradicting info UPDATES a memory (no duplicate) and the cache is refreshed", async () => {
  await chat(ALICE, conv(2), "actually I moved to Mumbai");
  assert.ok(await waitFor(() => userMems(ALICE).some((m) => m.includes("Mumbai"))));
  assert.equal(userMems(ALICE).length, 2);
  assert.ok(!userMems(ALICE).some((m) => m.includes("Delhi")));

  const before = chatCalls.length;
  await chat(ALICE, conv(4), "hello there, what's up with my project?");
  const system = systemOf(chatCalls[before]);
  assert.match(system, /Mumbai/);
  assert.ok(!system.includes("Delhi"), "stale cache: old value still injected");
});

test("7. 'forget ...' removes the memory", async () => {
  await chat(ALICE, conv(4), "please forget that I live in Mumbai");
  assert.ok(await waitFor(() => userMems(ALICE).length === 1));
  assert.ok(!userMems(ALICE)[0].includes("Mumbai"));
});

test("8. secrets are never stored, even when the model returns them", async () => {
  await chat(ALICE, conv(4), "my api key is sk-abcdefghijklmnopqrstuvwxyz123456");
  await settle();
  assert.ok(!userMems(ALICE).some((m) => m.includes("sk-")));
  assert.equal(userMems(ALICE).length, 1);
});

test("9. duplicate memories are not added twice", async () => {
  await chat(ALICE, conv(4), "I prefer short answers, code first");
  assert.ok(await waitFor(() => userMems(ALICE).length === 2));
  await chat(ALICE, conv(4), "I prefer short answers, code first");
  await settle();
  assert.equal(userMems(ALICE).length, 2);
});

test("10. cold Redis cache: current prompt is not duplicated in history", async () => {
  await redis.del(`messages-${conv(1)}`);
  const before = chatCalls.length;
  await chat(ALICE, conv(1), "and one more thing here");
  const sent = textOf(chatCalls[before]).slice(1);
  assert.equal(sent.filter((t) => t === "and one more thing here").length, 1);
  assert.ok(sent.includes("Hi")); // earlier messages were recovered from the DB
});

test("11. user can turn memory off: not injected, not learned, not deleted", async () => {
  const off = await call("PUT", "/memory-settings", { user: ALICE, body: { enabled: false } });
  assert.equal(off.status, 200);

  const calls = memoryCalls;
  const before = chatCalls.length;
  await chat(ALICE, conv(5), "I'm Rahul again, please remember me");
  const system = systemOf(chatCalls[before]);
  assert.match(system, /turned long-term memory off/);
  assert.ok(!system.includes("<user_memory>"));
  await settle();
  assert.equal(memoryCalls, calls, "must not learn while off");
  assert.equal(userMems(ALICE).length, 2, "existing memories are kept");

  await call("PUT", "/memory-settings", { user: ALICE, body: { enabled: true } });
  const b2 = chatCalls.length;
  await chat(ALICE, conv(5), "what do you know about me?");
  assert.match(systemOf(chatCalls[b2]), /<user_memory>/);
});

test("12. memory API: list, isolation, delete one, delete all, auth, validation", async () => {
  const list = await (await call("GET", "/memories", { user: ALICE })).json();
  assert.equal(list.enabled, true);
  assert.equal(list.memories.length, 2);
  assert.ok(list.memories[0].id && list.memories[0].content);

  assert.equal((await call("GET", "/memories")).status, 401); // no user header
  assert.equal((await call("DELETE", "/memories")).status, 401);

   const target = list.memories[0].id;
  assert.equal((await call("DELETE", `/memories/${target}`, { user: BOB })).status, 404);
  assert.equal(userMems(ALICE).length, 2);
  assert.equal((await call("DELETE", "/memories/not-an-id", { user: ALICE })).status, 404);

  assert.equal((await call("DELETE", `/memories/${target}`, { user: ALICE })).status, 200);
  assert.equal(userMems(ALICE).length, 1);
   const before = chatCalls.length;
  await chat(ALICE, conv(6), "hello, remind me what we are doing");
  assert.ok(!systemOf(chatCalls[before]).includes(list.memories[0].content));

  assert.equal((await call("PUT", "/memory-settings", { user: ALICE, body: { enabled: "yes" } })).status, 400);

  const all = await (await call("DELETE", "/memories", { user: ALICE })).json();
  assert.equal(all.deleted, 1);
  assert.equal(userMems(ALICE).length, 0);
});

test("13. memory failures never break the chat", async () => {
   memoryShouldThrow = true;
  const { res, json } = await chat(ALICE, conv(7), "I'm Rahul, testing a failing memory model");
  assert.equal(res.status, 200);
  assert.match(json.content, /reply to/);
  await settle();
  memoryShouldThrow = false;
  assert.equal(userMems(ALICE).length, 0);

   await redis.del(`user-memory-${ALICE}`);
  db.failReads = true;
  const before = chatCalls.length;
  const r2 = await chat(ALICE, conv(7), "still works?");
  db.failReads = false;
  assert.equal(r2.res.status, 200);
  assert.ok(!systemOf(chatCalls[before]).includes("<user_memory>"));

   const r3 = await chat(undefined, conv(8), "hello without user");
  assert.equal(r3.res.status, 200);
});
