import { hashText, json } from "../_utils.js";

function numberValue(value, fallback = 0) {
  const number = Number.parseInt(value, 10);
  return Number.isFinite(number) ? number : fallback;
}

export async function onRequestGet({ env }) {
  const [views, visitors, messages, publicMessages, settingsResult] = await Promise.all([
    env.DB.prepare("SELECT COUNT(*) AS totalViews FROM page_views").first(),
    env.DB.prepare("SELECT COUNT(DISTINCT ip_hash) AS totalVisitors FROM page_views WHERE ip_hash IS NOT NULL AND ip_hash != ''").first(),
    env.DB.prepare("SELECT COUNT(*) AS totalMessages FROM messages").first(),
    env.DB.prepare("SELECT COUNT(*) AS totalPublicMessages FROM messages WHERE status = 'public' AND answer IS NOT NULL AND trim(answer) != ''").first(),
    env.DB.prepare("SELECT key, value FROM site_settings WHERE key IN ('stats.baseVisitors', 'stats.baseViews')").all(),
  ]);
  const settings = {};
  for (const row of settingsResult.results || []) settings[row.key] = row.value;
  const baseVisitors = numberValue(settings["stats.baseVisitors"]);
  const baseViews = numberValue(settings["stats.baseViews"]);

  return json({
    totalViews: (views?.totalViews || 0) + baseViews,
    totalVisitors: (visitors?.totalVisitors || 0) + baseVisitors,
    totalMessages: messages?.totalMessages || 0,
    totalPublicMessages: publicMessages?.totalPublicMessages || 0,
  });
}

export async function onRequestPost({ request, env }) {
  const body = await request.json().catch(() => ({}));
  const ip = request.headers.get("CF-Connecting-IP") || "";
  const ipHash = ip ? await hashText(ip) : null;
  await env.DB.prepare(
    "INSERT INTO page_views (path, user_agent, ip_hash) VALUES (?, ?, ?)"
  ).bind(body.path || "/", request.headers.get("User-Agent") || "", ipHash).run();
  return json({ ok: true });
}
