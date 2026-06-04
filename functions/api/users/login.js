import { createUserSession, hashPassword, json, readJson } from "../../_utils.js";

function normalizeUsername(value) {
  return String(value || "").trim().toLowerCase();
}

export async function onRequestPost({ request, env }) {
  const body = await readJson(request);
  const username = normalizeUsername(body.username);
  const password = String(body.password || "");

  if (!username || !password) return json({ error: "请输入账号和密码。" }, 400);

  const user = await env.DB.prepare(
    "SELECT id, username, display_name, password_hash, password_salt, COALESCE(role, 'member') AS role FROM users WHERE username = ? LIMIT 1"
  ).bind(username).first();

  if (!user) return json({ error: "账号或密码错误。" }, 401);

  const passwordHash = await hashPassword(password, user.password_salt);
  if (passwordHash !== user.password_hash) return json({ error: "账号或密码错误。" }, 401);

  const token = await createUserSession(env, user.id);
  return json({ token, user: { id: user.id, username: user.username, displayName: user.display_name, role: user.role } });
}
