import { hashText, json, readJson } from "../../_utils.js";

export async function onRequestPost({ request, env }) {
  const body = await readJson(request);
  if (!body.password || !env.ADMIN_PASSWORD_HASH) {
    return json({ error: "登录配置未完成。" }, 500);
  }

  const passwordHash = await hashText(body.password);
  if (passwordHash !== env.ADMIN_PASSWORD_HASH) {
    return json({ error: "密码错误。" }, 401);
  }

  if (!env.ADMIN_SESSION_TOKEN) {
    return json({ error: "ADMIN_SESSION_TOKEN 未配置。" }, 500);
  }

  return json({ token: env.ADMIN_SESSION_TOKEN });
}
