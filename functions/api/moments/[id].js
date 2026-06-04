import { json, readJson, requireAdmin } from "../../_utils.js";

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

export async function onRequestPatch({ request, env, params }) {
  if (!(await requireAdmin(request, env))) return json({ error: "未授权。" }, 401);

  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) return json({ error: "无效的说说 ID。" }, 400);

  const body = await readJson(request);
  const authorName = normalizeAuthorName(body.authorName);
  const content = String(body.content || "").trim();
  const imageUrl = normalizeAssetPaths(body.imageUrl);
  const backgroundUrl = normalizeAssetPaths(body.backgroundUrl).split("\n")[0] || "";
  const status = normalizeStatus(body.status);

  if (!content) return json({ error: "说说内容不能为空。" }, 400);
  if (content.length > 1200) return json({ error: "说说内容请控制在 1200 字以内。" }, 400);

  const result = await env.DB.prepare(
    `UPDATE moments
     SET content = ?, image_url = ?, background_url = ?, author_name = ?, status = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  ).bind(content, imageUrl || null, backgroundUrl || null, authorName, status, id).run();

  if (!result.meta || result.meta.changes === 0) return json({ error: "没有找到这条说说。" }, 404);
  return json({ ok: true });
}

export async function onRequestDelete({ request, env, params }) {
  if (!(await requireAdmin(request, env))) return json({ error: "未授权。" }, 401);

  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) return json({ error: "无效的说说 ID。" }, 400);

  const result = await env.DB.prepare("DELETE FROM moments WHERE id = ?").bind(id).run();
  if (!result.meta || result.meta.changes === 0) return json({ error: "没有找到这条说说。" }, 404);
  return json({ ok: true });
}
