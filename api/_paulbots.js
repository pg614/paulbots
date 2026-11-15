/* Shared server helpers for the xAI voice agent on paulbots.com.
   The API key is read from the environment only. Never import this file from client code. */

const AGENT_ID = process.env.XAI_AGENT_ID || "agent_TGCChZ56Lhl9kgLJ";
const VOICE = "ara";
const REALTIME_MODEL = "grok-voice-latest";
const CHAT_MODEL = process.env.XAI_CHAT_MODEL || "grok-4.7";

const SUBMIT_LEAD_TOOL = {
  type: "function",
  name: "submit_lead",
  description: "Save a business owner's request so Paul can follow up. Call this only after they give a name, a way to reach them, what they need, and a clear yes that PaulBots may contact them.",
  parameters: {
    type: "object",
    properties: {
      name: { type: "string", description: "Person's name" },
      business: { type: "string", description: "Business name" },
      email: { type: "string", description: "Email address" },
      phone: { type: "string", description: "Phone number, if they gave one" },
      business_type: { type: "string", description: "What kind of business, such as HVAC or dental" },
      task: { type: "string", description: "What they want a bot to handle" },
      consent: { type: "boolean", description: "True only if they agreed to be contacted" }
    },
    required: ["name", "email", "task", "consent"]
  }
};

const SITE_INSTRUCTIONS = [
  "You are the PaulBots assistant on paulbots.com, speaking with voice Ara.",
  "PaulBots is a brand of Graves AI Solutions, Paul Graves LLC, run by Paul Graves in the Columbus, Ohio area.",
  "Visitors may know the phone bot as Aria. If they ask who you are, you can say you are Aria, the PaulBots assistant.",
  "Help business owners understand custom AI bots for lead capture, follow-up on new inquiries, and reconnecting with past prospects where they already have permission.",
  "The free 30-day trial is a custom AI lead bot for their website only. It is not outbound prospecting and it is not reactivation. No credit card is required.",
  "Plans start at only $299/month. Final pricing depends on usage, integrations, and how custom the bot is. No payment is taken on this website.",
  "If you do not know an answer, say you will check and offer to take a message. Do not invent customer reviews, timelines, or prices.",
  "The phone number is 888-618-9599.",
  "Keep replies short, warm, and in plain language."
].join(" ");

const GUARD = [
  'Pronounce the company name PaulBots as "Paul-BAWTs".',
  "Plans start at only $299/month. Never mention a setup fee.",
  "When someone wants Paul to follow up, collect their name, business, email, and what they need, confirm they agree to be contacted, then call submit_lead."
].join(" ");

function apiKey() {
  const key = process.env.XAI_API_KEY;
  return key && String(key).trim() ? String(key).trim() : "";
}

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

function sameOriginAllowed(req) {
  const site = req.headers["sec-fetch-site"];
  if (!site) return true;
  return site === "same-origin" || site === "same-site" || site === "none";
}

function readJson(req, limit) {
  if (req.body && typeof req.body === "object") return Promise.resolve(req.body);
  if (typeof req.body === "string") {
    try { return Promise.resolve(JSON.parse(req.body || "{}")); } catch (e) { return Promise.resolve({}); }
  }
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > (limit || 80000)) {
        reject(Object.assign(new Error("too large"), { status: 413 }));
        req.destroy();
      }
    });
    req.on("end", () => {
      if (!data) return resolve({});
      try { resolve(JSON.parse(data)); } catch (e) { resolve({}); }
    });
    req.on("error", reject);
  });
}

function clip(value, max) {
  const s = value == null ? "" : String(value);
  return s.length > max ? s.slice(0, max) : s;
}

function clientTool(tool) {
  if (!tool || typeof tool !== "object") return null;
  if (tool.type === "function" || tool.type === "web_search" || tool.type === "x_search" || tool.type === "file_search") {
    const out = { type: tool.type };
    if (tool.name) out.name = tool.name;
    if (tool.description) out.description = tool.description;
    if (tool.parameters) out.parameters = tool.parameters;
    if (tool.vector_store_ids) out.vector_store_ids = tool.vector_store_ids;
    if (tool.max_num_results) out.max_num_results = tool.max_num_results;
    return out;
  }
  const fn = tool.function;
  if (fn && fn.name) {
    return { type: "function", name: fn.name, description: fn.description || "", parameters: fn.parameters || { type: "object", properties: {} } };
  }
  return null;
}

function findLeadUrl(agent) {
  const fromEnv = process.env.PAULBOTS_LEAD_URL && String(process.env.PAULBOTS_LEAD_URL).trim();
  if (fromEnv) return fromEnv;
  const tools = agent && (agent.tools || (agent.agent && agent.agent.tools));
  if (!Array.isArray(tools)) return "";
  for (let i = 0; i < tools.length; i++) {
    const t = tools[i] || {};
    const candidates = [t.url, t.endpoint, t.webhook, t.server_url, t.function && t.function.url];
    for (let j = 0; j < candidates.length; j++) {
      const u = candidates[j];
      if (typeof u === "string" && /^https:\/\//.test(u)) return u;
    }
  }
  return "";
}

async function loadAgent(key) {
  const paths = [
    "https://api.x.ai/v1/voice-agents/" + encodeURIComponent(AGENT_ID),
    "https://api.x.ai/v1/agents/" + encodeURIComponent(AGENT_ID),
    "https://api.x.ai/v1/realtime/agents/" + encodeURIComponent(AGENT_ID)
  ];
  for (let i = 0; i < paths.length; i++) {
    try {
      const response = await fetch(paths[i], {
        headers: { Authorization: "Bearer " + key, Accept: "application/json" }
      });
      if (!response.ok) continue;
      const body = await response.json();
      const instructions = body.instructions || body.system_prompt || body.prompt || (body.agent && (body.agent.instructions || body.agent.system_prompt || body.agent.prompt));
      if (!instructions) continue;
      return { instructions: String(instructions), tools: body.tools || (body.agent && body.agent.tools) || [], leadUrl: findLeadUrl(body), source: "xai-agent" };
    } catch (e) { /* try the next documented-looking resource */ }
  }
  return null;
}

function instructionsFrom(agent) {
  const override = process.env.XAI_AGENT_INSTRUCTIONS && String(process.env.XAI_AGENT_INSTRUCTIONS).trim();
  const base = override || (agent && agent.instructions) || SITE_INSTRUCTIONS;
  if (base.indexOf("Paul-BAWTs") !== -1 && base.indexOf("setup fee") !== -1) return base;
  return base + " " + GUARD;
}

function toolsFrom(agent) {
  const raw = agent && Array.isArray(agent.tools) ? agent.tools : [];
  const tools = [];
  let hasLead = false;
  for (let i = 0; i < raw.length; i++) {
    const tool = clientTool(raw[i]);
    if (!tool) continue;
    if (tool.name === "submit_lead") hasLead = true;
    tools.push(tool);
  }
  if (!hasLead) tools.push(SUBMIT_LEAD_TOOL);
  return tools;
}

async function agentConfig(key) {
  const override = process.env.XAI_AGENT_INSTRUCTIONS && String(process.env.XAI_AGENT_INSTRUCTIONS).trim();
  const agent = override ? null : await loadAgent(key);
  const leadUrl = (agent && agent.leadUrl) || (process.env.PAULBOTS_LEAD_URL && String(process.env.PAULBOTS_LEAD_URL).trim()) || "";
  return {
    agent_id: AGENT_ID,
    voice: VOICE,
    model: REALTIME_MODEL,
    chat_model: CHAT_MODEL,
    instructions: instructionsFrom(override ? { instructions: override } : agent),
    tools: toolsFrom(agent),
    leadUrl: leadUrl,
    prompt_source: override ? "env" : (agent ? agent.source : "site-fallback")
  };
}

async function mintToken(key) {
  const response = await fetch("https://api.x.ai/v1/realtime/client_secrets", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + key,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ expires_after: { seconds: 300 } })
  });
  const text = await response.text();
  let body = {};
  try { body = JSON.parse(text); } catch (e) { body = {}; }
  if (!response.ok || !body.value) {
    const err = new Error("token");
    err.status = response.status === 401 ? 401 : 502;
    throw err;
  }
  return { value: body.value, expires_at: body.expires_at };
}

function leadTarget(config) {
  return (config && config.leadUrl) || (process.env.PAULBOTS_LEAD_URL && String(process.env.PAULBOTS_LEAD_URL).trim()) || "";
}

async function submitLead(payload, target) {
  const consent = payload.consent === true || payload.consent === "true" || payload.consent === "yes";
  if (!consent) return { ok: false, error: "Consent is required before saving a lead." };
  const name = clip(payload.name, 120);
  const email = clip(payload.email, 160);
  const task = clip(payload.task, 2000);
  if (!name || !email || !task) return { ok: false, error: "Name, email, and what they need are required." };
  if (!target) return { ok: false, clientFallback: true };
  const record = {
    name: name,
    business: clip(payload.business, 160),
    email: email,
    phone: clip(payload.phone, 40),
    business_type: clip(payload.business_type, 120),
    task: task,
    consent: "yes",
    bot: "PaulBots website assistant",
    _subject: "New PaulBots lead",
    _template: "table",
    _honey: ""
  };
  const url = target;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(record)
  });
  const text = await response.text();
  if (!response.ok) return { ok: false, error: "The lead form did not accept the request." };
  if (url.indexOf("formsubmit.co") !== -1) {
    let parsed = {};
    try { parsed = JSON.parse(text); } catch (e) { parsed = {}; }
    if (String(parsed.success) !== "true") return { ok: false, error: "The lead form did not accept the request." };
  }
  return { ok: true };
}

function chatTools(tools) {
  return (tools || []).filter((tool) => tool.type === "function").map((tool) => ({
    type: "function",
    function: {
      name: tool.name,
      description: tool.description || "",
      parameters: tool.parameters || { type: "object", properties: {} }
    }
  }));
}

module.exports = {
  AGENT_ID: AGENT_ID,
  VOICE: VOICE,
  REALTIME_MODEL: REALTIME_MODEL,
  CHAT_MODEL: CHAT_MODEL,
  SUBMIT_LEAD_TOOL: SUBMIT_LEAD_TOOL,
  apiKey: apiKey,
  json: json,
  sameOriginAllowed: sameOriginAllowed,
  readJson: readJson,
  agentConfig: agentConfig,
  mintToken: mintToken,
  leadTarget: leadTarget,
  submitLead: submitLead,
  chatTools: chatTools,
  clip: clip
};
