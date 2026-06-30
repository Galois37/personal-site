import { json, readJson, requireAdmin } from "../../_utils.js";

function articleUrl(id) {
  return `article.html?id=${id}`;
}

function coverLabel(cover) {
  const cleanCover = String(cover || "").trim().replace(/\\/g, "/");
  return cleanCover ? `Article|${cleanCover}` : "Article";
}

function splitCover(label) {
  const parts = String(label || "").split("|").map((part) => part.trim()).filter(Boolean);
  return parts.length > 1 ? parts.slice(1).join("|") : "";
}

async function findContentItem(env, id) {
  return env.DB.prepare(
    "SELECT id, description, label FROM content_items WHERE type = 'article' AND url = ? LIMIT 1"
  ).bind(articleUrl(id)).first();
}

export async function onRequestGet({ request, env, params }) {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) return json({ error: "无效的文章 ID。" }, 400);

  const isAdmin = await requireAdmin(request, env);
  const post = await env.DB.prepare(
    `SELECT id, title, category, content, status, created_at, updated_at
     FROM posts
     WHERE id = ?
     LIMIT 1`
  ).bind(id).first();

  if (!post) return json({ error: "没有找到这篇文章。" }, 404);
  if (!isAdmin && post.status !== "visible") return json({ error: "文章暂未公开。" }, 404);

  const item = await findContentItem(env, id);
  return json({
    item: {
      ...post,
      description: item?.description || "",
      cover: splitCover(item?.label || ""),
      contentItemId: item?.id || null,
    },
  });
}

export async function onRequestPatch({ request, env, params }) {
  if (!(await requireAdmin(request, env))) return json({ error: "未授权。" }, 401);

  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) return json({ error: "无效的文章 ID。" }, 400);

  const body = await readJson(request);
  const title = String(body.title || "").trim();
  const content = String(body.content || "").trim();
  const description = String(body.description || "").trim();
  const cover = String(body.cover || "").trim();
  const category = String(body.category || "article").trim() || "article";
  const status = String(body.status || "draft");

  if (!title || !content) return json({ error: "标题和正文不能为空。" }, 400);
  if (!["visible", "draft"].includes(status)) return json({ error: "状态无效。" }, 400);

  const result = await env.DB.prepare(
    `UPDATE posts
     SET title = ?, category = ?, content = ?, status = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  ).bind(title, category, content, status, id).run();

  if (!result.meta || result.meta.changes === 0) return json({ error: "没有找到这篇文章。" }, 404);

  const existingItem = await findContentItem(env, id);
  if (existingItem) {
    await env.DB.prepare(
      `UPDATE content_items
       SET title = ?, description = ?, label = ?, status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    ).bind(title, description, coverLabel(cover), status, existingItem.id).run();
  } else {
    await env.DB.prepare(
      "INSERT INTO content_items (type, title, description, url, label, status) VALUES ('article', ?, ?, ?, ?, ?)"
    ).bind(title, description, articleUrl(id), coverLabel(cover), status).run();
  }

  return json({ ok: true });
}

export async function onRequestDelete({ request, env, params }) {
  if (!(await requireAdmin(request, env))) return json({ error: "未授权。" }, 401);

  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) return json({ error: "无效的文章 ID。" }, 400);

  const result = await env.DB.prepare("DELETE FROM posts WHERE id = ?").bind(id).run();
  await env.DB.prepare("DELETE FROM content_items WHERE type = 'article' AND url = ?").bind(articleUrl(id)).run();

  if (!result.meta || result.meta.changes === 0) return json({ error: "没有找到这篇文章。" }, 404);
  return json({ ok: true });
}
