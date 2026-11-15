const pb = require("./_paulbots");

function sendEvent(res, payload) {
  res.write("data: " + JSON.stringify(payload) + "\n\n");
}

async function complete(key, config, messages) {
  const response = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + key,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: config.chat_model,
      stream: true,
      messages: messages,
      tools: pb.chatTools(config.tools)
    })
  });
  if (!response.ok || !response.body) {
    const err = new Error("chat");
    err.status = response.status === 401 ? 401 : 502;
    throw err;
  }
  return response;
}

async function readStream(response, onDelta) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";
  const calls = [];
  while (true) {
    const step = await reader.read();
    if (step.done) break;
    buffer += decoder.decode(step.value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if (!data || data === "[DONE]") continue;
      let event;
      try { event = JSON.parse(data); } catch (e) { continue; }
      const delta = event.choices && event.choices[0] && event.choices[0].delta;
      if (!delta) continue;
      if (delta.content) {
        text += delta.content;
        onDelta(delta.content);
      }
      const toolCalls = delta.tool_calls || [];
      for (let t = 0; t < toolCalls.length; t++) {
        const call = toolCalls[t];
        const index = call.index || 0;
        if (!calls[index]) calls[index] = { id: "", name: "", arguments: "" };
        if (call.id) calls[index].id = call.id;
        if (call.function && call.function.name) calls[index].name = call.function.name;
        if (call.function && call.function.arguments) calls[index].arguments += call.function.arguments;
      }
    }
  }
  return { text: text, calls: calls.filter(Boolean) };
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return pb.json(res, 405, { error: "Method not allowed" });
  }
  if (!pb.sameOriginAllowed(req)) return pb.json(res, 403, { error: "Forbidden" });
  const key = pb.apiKey();
  if (!key) return pb.json(res, 503, { error: "XAI_API_KEY is not set on the server." });
  let body;
  try { body = await pb.readJson(req, 60000); } catch (err) {
    return pb.json(res, err && err.status === 413 ? 413 : 400, { error: "Could not read the message." });
  }
  const incoming = Array.isArray(body.messages) ? body.messages.slice(-20) : [];
  const messages = [];
  for (let i = 0; i < incoming.length; i++) {
    const item = incoming[i] || {};
    if (item.role !== "user" && item.role !== "assistant") continue;
    const content = pb.clip(item.content, 4000);
    if (!content) continue;
    messages.push({ role: item.role, content: content });
  }
  if (!messages.length || messages[messages.length - 1].role !== "user") {
    return pb.json(res, 400, { error: "Send a message first." });
  }
  let config;
  try { config = await pb.agentConfig(key); } catch (err) {
    return pb.json(res, 502, { error: "Could not load the assistant." });
  }
  const thread = [{ role: "system", content: config.instructions }].concat(messages);
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Accel-Buffering", "no");
  try {
    for (let round = 0; round < 3; round++) {
      const response = await complete(key, config, thread);
      const turn = await readStream(response, (delta) => sendEvent(res, { delta: delta }));
      if (!turn.calls.length) break;
      thread.push({ role: "assistant", content: turn.text || "", tool_calls: turn.calls.map((call) => ({ id: call.id, type: "function", function: { name: call.name, arguments: call.arguments } })) });
      for (let c = 0; c < turn.calls.length; c++) {
        const call = turn.calls[c];
        let args = {};
        try { args = JSON.parse(call.arguments || "{}"); } catch (e) { args = {}; }
        let output;
        if (call.name === "submit_lead") output = await pb.submitLead(args, pb.leadTarget(config));
        else output = { ok: false, error: "That action is not available." };
        thread.push({ role: "tool", tool_call_id: call.id, content: JSON.stringify(output) });
      }
    }
    sendEvent(res, { done: true });
    res.end();
  } catch (err) {
    const message = err && err.status === 401 ? "xAI rejected the API key." : "The assistant could not reply.";
    sendEvent(res, { error: message });
    res.end();
  }
};
