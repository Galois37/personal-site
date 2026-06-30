import { json, readJson, requireAdmin } from "../_utils.js";

function coverLabel(cover) {
  const cleanCover = String(cover || "").trim().replace(/\\/g, "/");
  return cleanCover ? `Article|${cleanCover}` : "Article";
}

export async function onRequestGet({ request, env }) {
  const isAdmin = await requireAdmin(request, env);
  const sql = `SELECT posts.id,
                      posts.title,
                      posts.category,
                      posts.content,
                      posts.status,
                      posts.created_at,
                      posts.updated_at,
                      COALESCE(content_items.description, '') AS description,
                      COALESCE(content_items.label, 'Article') AS label
               FROM posts
               LEFT JOIN content_items
                 ON content_items.type = 'article'
                AND content_items.url = ('article.html?id=' || posts.id)
               ${isAdmin ? "" : "WHERE posts.status = 'visible'"}
               ORDER BY posts.created_at DESC, posts.id DESC`;
  const result = await env.DB.prepare(sql).all();
  const items = (result.results || []).map((item) => {
    const parts = String(item.label || "").split("|").map((part) => part.trim()).filter(Boolean);
    return {
      ...item,
      cover: parts.length > 1 ? parts.slice(1).join("|") : "",
    };
  });
  return json({ items });
}

export async function onRequestPost({ request, env }) {
  if (!(await requireAdmin(request, env))) return json({ error: "未授权。" }, 401);

  const body = await readJson(request);
  const title = String(body.title || "").trim();
  const content = String(body.content || "").trim();
  const description = String(body.description || "").trim();
  const cover = String(body.cover || "").trim();
  const category = String(body.category || "article").trim() || "article";
  const status = String(body.status || "draft");

  if (!title || !content) return json({ error: "标题和正文不能为空。" }, 400);
  if (!["visible", "draft"].includes(status)) return json({ error: "状态无效。" }, 400);

  const postResult = await env.DB.prepare(
    "INSERT INTO posts (title, category, content, status) VALUES (?, ?, ?, ?)"
  ).bind(title, category, content, status).run();

  const postId = postResult.meta?.last_row_id;
  if (postId) {
    await env.DB.prepare(
      "INSERT INTO content_items (type, title, description, url, label, status) VALUES ('article', ?, ?, ?, ?, ?)"
    ).bind(title, description, `article.html?id=${postId}`, coverLabel(cover), status).run();
  }

  return json({ ok: true, id: postId || null });
}
