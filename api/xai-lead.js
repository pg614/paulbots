const pb = require("./_paulbots");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return pb.json(res, 405, { error: "Method not allowed" });
  }
  if (!pb.sameOriginAllowed(req)) return pb.json(res, 403, { error: "Forbidden" });
  try {
    const body = await pb.readJson(req, 20000);
    const key = pb.apiKey();
    const config = key ? await pb.agentConfig(key) : null;
    const result = await pb.submitLead(body || {}, pb.leadTarget(config));
    return pb.json(res, result.ok ? 200 : 400, result);
  } catch (err) {
    const status = err && err.status === 413 ? 413 : 500;
    return pb.json(res, status, { ok: false, error: status === 413 ? "That message is too large." : "Could not save the request." });
  }
};
