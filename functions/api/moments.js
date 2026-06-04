import { json, readJson, requireAdmin } from "../_utils.js";

function normalizeStatus(value) {
  return value === "draft" ? "draft" : "visible";
}

function normalizeAuthorName(value) {
  const authorName = String(value || "Galois37的猫猫").trim();
  return authorName === "Galois37" ? "Galois37" : "Galois37的猫猫";
}

function normalizeAssetPaths(value) {
  return String(value || "")
    .split(/[\n,]+/)
    .map((url) => url.trim().replace(/^["']|["']$/g, "").replace(/\\/g, "/"))
    .filter(Boolean)
    .join("\n");
}

export async function onRequestGet({ request, env }) {
  const isAdmin = await requireAdmin(request, env);
  const url = new URL(request.url);
  const status = url.searchParams.get("status");

  let sql = "SELECT id, content, image_url, background_url, COALESCE(author_name, 'Galois37的猫猫') AS author_name, status, created_at, updated_at FROM moments";
  const binds = [];
  const conditions = [];

  if (!isAdmin) conditions.push("status = 'visible'");
  if (isAdmin && status && ["visible", "draft"].includes(status)) {
    conditions.push("status = ?");
    binds.push(status);
  }
  if (conditions.length) sql += ` WHERE ${conditions.join(" AND ")}`;
  sql += " ORDER BY created_at DESC, id DESC";

  const result = await env.DB.prepare(sql).bind(...binds).all();
  return json({ items: result.results || [] });
}

export async function onRequestPost({ request, env }) {
  if (!(await requireAdmin(request, env))) return json({ error: "未授权。" }, 401);

  const body = await readJson(request);
  const authorName = normalizeAuthorName(body.authorName);
  const content = String(body.content || "").trim();
  const imageUrl = normalizeAssetPaths(body.imageUrl);
  const backgroundUrl = normalizeAssetPaths(body.backgroundUrl).split("\n")[0] || "";
  const status = normalizeStatus(body.status);

  if (!content) return json({ error: "说说内容不能为空。" }, 400);
  if (content.length > 1200) return json({ error: "说说内容请控制在 1200 字以内。" }, 400);

  await env.DB.prepare(
    "INSERT INTO moments (content, image_url, background_url, author_name, status) VALUES (?, ?, ?, ?, ?)"
  ).bind(content, imageUrl || null, backgroundUrl || null, authorName, status).run();

  return json({ ok: true });
}
