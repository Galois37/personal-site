import { getCurrentUser, json, readJson, requireAdmin } from "../_utils.js";

export async function onRequestGet({ request, env }) {
  const isAdmin = await requireAdmin(request, env);
  if (isAdmin) {
    const result = await env.DB.prepare(
      `SELECT messages.id, messages.user_id, messages.name, messages.message, messages.answer,
              messages.status, messages.created_at, messages.answered_at,
              users.username, users.display_name, COALESCE(users.role, 'member') AS role
       FROM messages
       LEFT JOIN users ON users.id = messages.user_id
       ORDER BY messages.created_at DESC
       LIMIT 100`
    ).all();
    return json({ items: result.results || [] });
  }

  const user = await getCurrentUser(request, env);
  const result = user
    ? await env.DB.prepare(
        `SELECT messages.id, messages.user_id, messages.name, messages.message, messages.answer,
                messages.status, messages.created_at, messages.answered_at,
                users.username, users.display_name, COALESCE(users.role, 'member') AS role
         FROM messages
         LEFT JOIN users ON users.id = messages.user_id
         WHERE (status = 'public' AND answer IS NOT NULL AND trim(answer) != '')
            OR messages.user_id = ?
         ORDER BY COALESCE(messages.answered_at, messages.created_at) DESC, messages.created_at DESC
         LIMIT 60`
      ).bind(user.id).all()
    : await env.DB.prepare(
        `SELECT messages.id, messages.user_id, messages.name, messages.message, messages.answer,
                messages.status, messages.created_at, messages.answered_at,
                users.username, users.display_name, COALESCE(users.role, 'member') AS role
         FROM messages
         LEFT JOIN users ON users.id = messages.user_id
         WHERE status = 'public' AND answer IS NOT NULL AND trim(answer) != ''
         ORDER BY messages.answered_at DESC, messages.created_at DESC
         LIMIT 30`
      ).all();
  return json({ items: result.results || [] });
}

export async function onRequestPost({ request, env }) {
  const user = await getCurrentUser(request, env);
  const body = await readJson(request);
  if (!body.message) return json({ error: "内容不能为空。" }, 400);
  await env.DB.prepare(
    "INSERT INTO messages (user_id, name, message, status) VALUES (?, ?, ?, 'pending')"
  ).bind(user?.id || null, user?.display_name || user?.username || "匿名用户", body.message).run();
  return json({ ok: true });
}
