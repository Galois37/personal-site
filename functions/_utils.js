export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

export async function hashText(text) {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function getBearerToken(request) {
  const header = request.headers.get("Authorization") || "";
  return header.replace(/^Bearer\s+/i, "");
}

export async function requireAdmin(request, env) {
  const token = getBearerToken(request);
  if (!token || !env.ADMIN_TOKEN_HASH) return false;
  if ((await hashText(token)) === env.ADMIN_TOKEN_HASH) return true;

  const tokenHash = await hashText(token);
  const result = await env.DB.prepare(
    `SELECT users.id
     FROM user_sessions
     JOIN users ON users.id = user_sessions.user_id
     WHERE user_sessions.token_hash = ?
       AND user_sessions.expires_at > CURRENT_TIMESTAMP
       AND users.role = 'owner'
     LIMIT 1`
  ).bind(tokenHash).first();

  return Boolean(result);
}

export function randomToken(byteLength = 32) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export async function hashPassword(password, salt) {
  return hashText(`${salt}:${password}`);
}

export async function getCurrentUser(request, env) {
  const token = getBearerToken(request);
  if (!token) return null;

  const tokenHash = await hashText(token);
  const result = await env.DB.prepare(
    `SELECT users.id, users.username, users.display_name, COALESCE(users.role, 'member') AS role
     FROM user_sessions
     JOIN users ON users.id = user_sessions.user_id
     WHERE user_sessions.token_hash = ?
       AND user_sessions.expires_at > CURRENT_TIMESTAMP
     LIMIT 1`
  ).bind(tokenHash).first();

  return result || null;
}

export async function createUserSession(env, userId) {
  const token = randomToken(36);
  const tokenHash = await hashText(token);
  await env.DB.prepare(
    "INSERT INTO user_sessions (user_id, token_hash, expires_at) VALUES (?, ?, datetime('now', '+30 days'))"
  ).bind(userId, tokenHash).run();
  return token;
}

export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}
