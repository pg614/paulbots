const pb = require("./_paulbots");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return pb.json(res, 405, { error: "Method not allowed" });
  }
  if (!pb.sameOriginAllowed(req)) return pb.json(res, 403, { error: "Forbidden" });
  const key = pb.apiKey();
  if (!key) return pb.json(res, 503, { error: "XAI_API_KEY is not set on the server." });
  try {
    const [token, config] = await Promise.all([pb.mintToken(key), pb.agentConfig(key)]);
    return pb.json(res, 200, {
      token: token.value,
      expires_at: token.expires_at,
      ws_url: "wss://api.x.ai/v1/realtime?model=" + encodeURIComponent(config.model),
      voice: config.voice,
      agent_id: config.agent_id,
      instructions: config.instructions,
      tools: config.tools,
      prompt_source: config.prompt_source,
      text_mode: true
    });
  } catch (err) {
    const status = err && err.status === 401 ? 401 : 502;
    return pb.json(res, status, { error: status === 401 ? "xAI rejected the API key." : "Could not start a voice session." });
  }
};
