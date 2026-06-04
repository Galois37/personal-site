import { json, readJson, requireAdmin } from "../_utils.js";

export async function onRequestGet({ env }) {
  const result = await env.DB.prepare(
    "SELECT id, title, category, content, status, created_at, updated_at FROM posts ORDER BY created_at DESC"
  ).all();
  return json({ items: result.results || [] });
}

export async function onRequestPost({ request, env }) {
  if (!(await requireAdmin(request, env))) return json({ error: "未授权。" }, 401);
  const body = await readJson(request);
  if (!body.title || !body.content) return json({ error: "标题和内容不能为空。" }, 400);

  await env.DB.prepare(
    "INSERT INTO posts (title, category, content, status) VALUES (?, ?, ?, ?)"
  ).bind(body.title, body.category || "article", body.content, body.status || "draft").run();

  return json({ ok: true });
}
