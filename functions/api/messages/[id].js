import { json, readJson, requireAdmin } from "../../_utils.js";

const allowedStatuses = new Set(["pending", "private", "public"]);

export async function onRequestPatch({ request, env, params }) {
  if (!(await requireAdmin(request, env))) return json({ error: "未授权。" }, 401);

  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) return json({ error: "无效的问题 ID。" }, 400);

  const body = await readJson(request);
  const answer = String(body.answer || "").trim();
  const status = String(body.status || "pending");

  if (!allowedStatuses.has(status)) return json({ error: "无效的展示状态。" }, 400);
  if ((status === "public" || status === "private") && !answer) {
    return json({ error: "展示回复前请先写回答。" }, 400);
  }

  if (status === "private") {
    const message = await env.DB.prepare("SELECT user_id FROM messages WHERE id = ? LIMIT 1").bind(id).first();
    if (!message) return json({ error: "没有找到这条提问。" }, 404);
    if (!message.user_id) return json({ error: "匿名提问没有账号归属，不能设置为私人回复。" }, 400);
  }

  const result = await env.DB.prepare(
    "UPDATE messages SET answer = ?, status = ?, answered_at = CASE WHEN ? != '' THEN COALESCE(answered_at, CURRENT_TIMESTAMP) ELSE answered_at END WHERE id = ?"
  ).bind(answer || null, status, answer, id).run();

  if (!result.meta || result.meta.changes === 0) return json({ error: "没有找到这条提问。" }, 404);
  return json({ ok: true });
}
