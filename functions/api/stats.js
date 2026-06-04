import { hashText, json } from "../_utils.js";

export async function onRequestGet({ env }) {
  const [views, messages] = await Promise.all([
    env.DB.prepare("SELECT COUNT(*) AS totalViews FROM page_views").first(),
    env.DB.prepare("SELECT COUNT(*) AS totalMessages FROM messages").first(),
  ]);
  return json({
    totalViews: views?.totalViews || 0,
    totalMessages: messages?.totalMessages || 0,
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
