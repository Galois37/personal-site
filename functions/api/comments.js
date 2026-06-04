import { getCurrentUser, json, readJson, requireAdmin } from "../_utils.js";

export async function onRequestGet({ request, env }) {
  if (!(await requireAdmin(request, env))) return json({ error: "未授权。" }, 401);
  const result = await env.DB.prepare(
    "SELECT id, post_id, name, content, status, created_at FROM comments ORDER BY created_at DESC LIMIT 100"
  ).all();
  return json({ items: result.results || [] });
}

export async function onRequestPost({ request, env }) {
  const user = await getCurrentUser(request, env);
  const body = await readJson(request);
  if (!body.content) return json({ error: "内容不能为空。" }, 400);
  await env.DB.prepare(
    "INSERT INTO comments (post_id, name, content) VALUES (?, ?, ?)"
  ).bind(body.post_id || null, user?.display_name || user?.username || "匿名用户", body.content).run();
  return json({ ok: true });
}
