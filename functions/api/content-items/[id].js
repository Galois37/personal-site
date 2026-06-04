import { json, readJson, requireAdmin } from "../../_utils.js";

const allowedTypes = new Set(["note", "article", "program", "resource", "moment", "friend"]);
const allowedStatuses = new Set(["visible", "draft"]);

function defaultLabel(type) {
  if (type === "note") return "PDF";
  if (type === "resource") return "Resource";
  if (type === "moment") return "说说";
  if (type === "friend") return "友链";
  if (type === "article") return "Article";
  return "Program";
}

export async function onRequestPatch({ request, env, params }) {
  if (!(await requireAdmin(request, env))) return json({ error: "未授权。" }, 401);

  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) return json({ error: "无效的内容 ID。" }, 400);

  const body = await readJson(request);
  const type = String(body.type || "");
  const title = String(body.title || "").trim();
  const description = String(body.description || "").trim();
  const url = String(body.url || "").trim();
  const label = String(body.label || "").trim();
  const status = String(body.status || "visible");

  if (!allowedTypes.has(type)) return json({ error: "类型必须是 note、resource、article、program、moment 或 friend。" }, 400);
  if (!title) return json({ error: "标题不能为空。" }, 400);
  if (!allowedStatuses.has(status)) return json({ error: "状态无效。" }, 400);

  const result = await env.DB.prepare(
    `UPDATE content_items
     SET type = ?, title = ?, description = ?, url = ?, label = ?, status = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  ).bind(type, title, description, url, label || defaultLabel(type), status, id).run();

  if (!result.meta || result.meta.changes === 0) return json({ error: "没有找到这条内容。" }, 404);
  return json({ ok: true });
}

export async function onRequestDelete({ request, env, params }) {
  if (!(await requireAdmin(request, env))) return json({ error: "未授权。" }, 401);

  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) return json({ error: "无效的内容 ID。" }, 400);

  const result = await env.DB.prepare("DELETE FROM content_items WHERE id = ?").bind(id).run();
  if (!result.meta || result.meta.changes === 0) return json({ error: "没有找到这条内容。" }, 404);
  return json({ ok: true });
}
