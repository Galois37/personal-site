import { createUserSession, hashPassword, hashText, json, randomToken, readJson } from "../../_utils.js";

function normalizeUsername(value) {
  return String(value || "").trim().toLowerCase();
}

export async function onRequestPost({ request, env }) {
  const body = await readJson(request);
  const username = normalizeUsername(body.username);
  const displayName = String(body.displayName || body.username || "").trim();
  const password = String(body.password || "");

  if (!/^[a-z0-9_]{3,24}$/.test(username)) {
    return json({ error: "账号只能使用 3-24 位小写字母、数字或下划线。" }, 400);
  }
  if (!displayName || displayName.length > 32) return json({ error: "昵称长度需要在 1-32 位之间。" }, 400);
  if (password.length < 6 || password.length > 72) return json({ error: "密码长度需要在 6-72 位之间。" }, 400);

  const existing = await env.DB.prepare("SELECT id FROM users WHERE username = ? LIMIT 1").bind(username).first();
  if (existing) return json({ error: "这个账号已经被注册了。" }, 409);

  const existingDisplayName = await env.DB.prepare(
    "SELECT id FROM users WHERE display_name = ? COLLATE NOCASE LIMIT 1"
  ).bind(displayName).first();
  if (existingDisplayName) return json({ error: "这个昵称已经被使用了。" }, 409);

  const salt = randomToken(18);
  const passwordHash = await hashPassword(password, salt);
  const role = env.ADMIN_PASSWORD_HASH && (await hashText(password)) === env.ADMIN_PASSWORD_HASH ? "owner" : "member";

  try {
    const result = await env.DB.prepare(
      "INSERT INTO users (username, display_name, password_hash, password_salt, role) VALUES (?, ?, ?, ?, ?)"
    ).bind(username, displayName, passwordHash, salt, role).run();
    const token = await createUserSession(env, result.meta.last_row_id);
    return json({ token, user: { id: result.meta.last_row_id, username, displayName, role } });
  } catch (error) {
    if (String(error.message || "").includes("UNIQUE")) return json({ error: "这个账号已经被注册了。" }, 409);
    return json({ error: "注册失败，请稍后再试。" }, 500);
  }
}
