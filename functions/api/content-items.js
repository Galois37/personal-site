import { json, readJson, requireAdmin } from "../_utils.js";

const allowedTypes = new Set(["note", "article", "program", "resource", "moment", "friend"]);

function defaultLabel(type) {
  if (type === "note") return "PDF";
  if (type === "resource") return "Resource";
  if (type === "moment") return "说说";
  if (type === "friend") return "友链";
  if (type === "article") return "Article";
  return "Program";
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const type = url.searchParams.get("type");
  const isAdmin = await requireAdmin(request, env);

  let sql = "SELECT id, type, title, description, url, label, status, created_at, updated_at FROM content_items";
  const binds = [];
  const conditions = [];

  if (type && allowedTypes.has(type)) {
    conditions.push("type = ?");
    binds.push(type);
  }
  if (!isAdmin) conditions.push("status = 'visible'");
  if (conditions.length) sql += ` WHERE ${conditions.join(" AND ")}`;
  sql += " ORDER BY created_at DESC, id DESC";

  const result = await env.DB.prepare(sql).bind(...binds).all();
  return json({ items: result.results || [] });
}

export async function onRequestPost({ request, env }) {
  if (!(await requireAdmin(request, env))) return json({ error: "未授权。" }, 401);
  const body = await readJson(request);
  const type = String(body.type || "");
  const title = String(body.title || "").trim();
  const description = String(body.description || "").trim();
  const url = String(body.url || "").trim();
  const label = String(body.label || "").trim();
  const status = String(body.status || "visible");

  if (!allowedTypes.has(type)) return json({ error: "类型必须是 note、resource、article、program、moment 或 friend。" }, 400);
  if (!title) return json({ error: "标题不能为空。" }, 400);
  if (!["visible", "draft"].includes(status)) return json({ error: "状态无效。" }, 400);

  await env.DB.prepare(
    "INSERT INTO content_items (type, title, description, url, label, status) VALUES (?, ?, ?, ?, ?, ?)"
  ).bind(type, title, description, url, label || defaultLabel(type), status).run();

  return json({ ok: true });
}
