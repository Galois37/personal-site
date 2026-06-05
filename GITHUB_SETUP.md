# GitHub 托管与自动部署设置

当前 Cloudflare Pages 项目 `personal-site` 是 Direct Upload 项目。Cloudflare 官方说明：Direct Upload 项目不能直接切换成 Git Integration。为了保留现有域名、D1 数据库和 Pages 项目，本仓库采用：

```text
GitHub 托管代码和图片
GitHub Actions 自动运行 Wrangler
部署到现有 Cloudflare Pages 项目 personal-site
```

## 1. 当前状态

仓库已经创建：

```text
https://github.com/Galois37/personal-site
```

GitHub Actions 已经配置为部署到现有 Cloudflare Pages 项目：

```text
personal-site
```

## 2. 以后如何一键部署图片

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
读取本机 GitHub 登录凭据
把当前网站目录上传到 GitHub
触发 GitHub Actions
部署到 Cloudflare Pages
```

## 3. 说说里如何引用图片

部署完成后，在控制台的说说图片输入框里填写：

```text
assets/moment-04.jpg
```

多张图片每行一张。

## 4. 如果要手动查看部署

GitHub Actions 页面：

```text
https://github.com/Galois37/personal-site/actions
```

线上地址：

```text
https://personal-site-8d0.pages.dev
https://galois37.top
```

## 5. 控制台一键部署

控制台的“一键部署”按钮用于触发 GitHub Actions 重新部署当前仓库版本。它适合在已经把文件推到 GitHub 后，手动重跑一次线上发布。

注意：这个按钮不能直接读取你电脑里的新 PDF 或图片。如果你更新了本地静态文件，仍然需要先运行：

```text
deploy.bat
```

然后再用控制台按钮重跑部署。

要启用控制台按钮，需要在 Cloudflare Pages 的环境变量中添加：

```text
GITHUB_DEPLOY_TOKEN
```

这个 token 需要有触发 GitHub Actions workflow 的权限。可选环境变量：

```text
GITHUB_DEPLOY_OWNER=Galois37
GITHUB_DEPLOY_REPO=personal-site
GITHUB_DEPLOY_WORKFLOW=deploy.yml
GITHUB_DEPLOY_BRANCH=main
```

## 6. PDF 更新失败排查

更新笔记 PDF 后，推荐直接运行根目录的：

```text
deploy.bat
```

新版部署脚本会先把文件推到 GitHub，然后等待 GitHub Actions 和 Cloudflare Pages 的部署结果。

如果脚本或 GitHub Actions 日志里出现：

```text
Authentication error
Invalid access token
```

这说明 PDF 文件本身没有问题，而是 GitHub 仓库 Secret 里的 `CLOUDFLARE_API_TOKEN` 已失效或权限不够。处理方式：

```text
1. 在 Cloudflare 创建新的 API Token
2. 给它 Cloudflare Pages 部署所需权限
3. 到 GitHub 仓库 Settings -> Secrets and variables -> Actions
4. 替换同名 Secret: CLOUDFLARE_API_TOKEN
5. 重新运行失败的 GitHub Actions，或再次运行 deploy.bat
```

当前 workflow 会固定使用 `wrangler@4.98.0`，避免每次部署自动拉最新版 Wrangler 带来额外变化。
