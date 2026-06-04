import { json, requireAdmin } from "../_utils.js";

export async function onRequestPost({ request, env }) {
  if (!(await requireAdmin(request, env))) return json({ error: "未授权。" }, 401);

  const token = env.GITHUB_DEPLOY_TOKEN;
  const owner = env.GITHUB_DEPLOY_OWNER || "Galois37";
  const repo = env.GITHUB_DEPLOY_REPO || "personal-site";
  const workflow = env.GITHUB_DEPLOY_WORKFLOW || "deploy.yml";
  const branch = env.GITHUB_DEPLOY_BRANCH || "main";

  if (!token) {
    return json({
      error: "一键部署尚未配置：请在 Cloudflare Pages 环境变量里添加 GITHUB_DEPLOY_TOKEN。"
    }, 501);
  }

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflow}/dispatches`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "Galois37-Site-Admin"
      },
      body: JSON.stringify({ ref: branch })
    }
  );

  if (!response.ok) {
    const detail = await response.text();
    return json({
      error: `GitHub Actions 触发失败：${response.status} ${detail.slice(0, 180)}`
    }, 502);
  }

  return json({
    ok: true,
    actionsUrl: `https://github.com/${owner}/${repo}/actions`
  });
}
