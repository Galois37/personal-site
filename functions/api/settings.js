import { json, readJson, requireAdmin } from "../_utils.js";

export async function onRequestGet({ env }) {
  const result = await env.DB.prepare("SELECT key, value FROM site_settings").all();
  const settings = {};
  for (const row of result.results || []) settings[row.key] = row.value;
  return json({ settings });
}

export async function onRequestPost({ request, env }) {
  if (!(await requireAdmin(request, env))) return json({ error: "未授权。" }, 401);
  const body = await readJson(request);
  const settings = body.settings || {};

  const entries = Object.entries(settings)
    .filter(([key]) => /^[a-zA-Z0-9_.-]{1,80}$/.test(key))
    .map(([key, value]) => [key, String(value ?? "")]);

  for (const [key, value] of entries) {
    await env.DB.prepare(
      `INSERT INTO site_settings (key, value, updated_at)
       VALUES (?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`
    ).bind(key, value).run();
  }

  return json({ ok: true, count: entries.length });
}
