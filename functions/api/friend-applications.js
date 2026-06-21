import { json, readJson } from "../_utils.js";

function normalizeUrl(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  try {
    const url = new URL(text);
    if (!["http:", "https:"].includes(url.protocol)) return "";
    return url.toString();
  } catch {
    return "";
  }
}

export async function onRequestPost({ request, env }) {
  const body = await readJson(request);
  const title = String(body.title || "").trim().slice(0, 80);
  const description = String(body.description || "").trim().slice(0, 180);
  const url = normalizeUrl(body.url);
  const label = normalizeUrl(body.label);

  if (!title) return json({ error: "站点名称不能为空。" }, 400);
  if (!description) return json({ error: "简介不能为空。" }, 400);
  if (!url) return json({ error: "请填写有效的网站链接。" }, 400);

  await env.DB.prepare(
    "INSERT INTO content_items (type, title, description, url, label, status) VALUES ('friend', ?, ?, ?, ?, 'draft')"
  ).bind(title, description, url, label).run();

  return json({ ok: true });
}
