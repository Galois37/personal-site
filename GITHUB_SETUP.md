# GitHub 托管与自动部署设置

当前 Cloudflare Pages 项目 `personal-site` 是 Direct Upload 项目。Cloudflare 官方说明：Direct Upload 项目不能直接切换成 Git Integration。为了保留现有域名、D1 数据库和 Pages 项目，本仓库采用：

```text
GitHub 托管代码和图片
GitHub Actions 自动运行 Wrangler
部署到现有 Cloudflare Pages 项目 personal-site
```

## 1. 创建 GitHub 仓库

在 GitHub 创建一个空仓库，例如：

```text
https://github.com/Galois37/personal-site
```

不要勾选自动创建 README，因为本地已经有文件。

## 2. 首次推送

在本文件所在目录打开终端：

```powershell
cd C:\Users\11624\Documents\Codex\2026-06-02\cloudflare-codex-cloudflare-pages-github-1\outputs\personal-site
git init
git branch -M main
git remote add origin https://github.com/Galois37/personal-site.git
git add .
git commit -m "Initial site"
git push -u origin main
```

如果 GitHub 要求登录，按浏览器提示完成登录即可。

## 3. 配置 GitHub Secrets

进入 GitHub 仓库：

```text
Settings -> Secrets and variables -> Actions -> New repository secret
```

添加两个 secret：

```text
CLOUDFLARE_ACCOUNT_ID
868ef9c9e2a6279240373e1d38dc507e
```

```text
CLOUDFLARE_API_TOKEN
你的 Cloudflare API Token
```

Cloudflare API Token 建议使用自定义 Token，至少允许编辑 Cloudflare Pages。创建位置：

```text
Cloudflare Dashboard -> My Profile -> API Tokens -> Create Token
```

## 4. 以后如何一键部署图片

把图片放进：

```text
assets/
```

例如：

```text
assets/moment-04.jpg
```

然后双击：

```text
deploy.bat
```

脚本会自动：

```text
git add .
git commit
git push
```

GitHub 收到 push 后，会自动执行 `.github/workflows/deploy.yml`，并部署到 Cloudflare Pages。

## 5. 说说里如何引用图片

部署完成后，在控制台的说说图片输入框里填写：

```text
assets/moment-04.jpg
```

多张图片每行一张。
