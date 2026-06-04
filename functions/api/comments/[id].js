import { json, requireAdmin } from "../../_utils.js";

export async function onRequestDelete({ request, env, params }) {
  if (!(await requireAdmin(request, env))) return json({ error: "未授权。" }, 401);
  await env.DB.prepare("UPDATE comments SET status = 'deleted' WHERE id = ?").bind(params.id).run();
  return json({ ok: true });
}
