# Galois37の完美算术教室

这是一个部署在 Cloudflare Pages 上的个人网站。当前使用 HTML、CSS、JavaScript 和 Cloudflare Pages Functions / D1。

项目已经预留 GitHub Actions 自动部署配置。首次设置见 `GITHUB_SETUP.md`。

## 页面结构

- `index.html`：首页，包含个人名片和社交平台入口。
- `about.html`：自我介绍，暂时也放项目经历预留区。
- `notes.html`：学习笔记页面。
- `articles.html`：文章与杂谈页面，偏随笔动态。
- `ask.html`：提问箱与讨论区页面，当前只做静态外观。
- `match.html`：成分重合度测试预留页面。
- `styles.css`：全站样式。
- `script.js`：移动端导航和提问箱预览交互。
- `assets/avatar.jpg`：首页名片头像。
- `assets/about-bg.png`：自我介绍页顶部背景图。
- `assets/notes/`：笔记页引用的 PDF 文件。
- `assets/room-notes.jpg`、`assets/room-articles.jpg`、`assets/room-ask.jpg`：首页主要空间卡片背景图。

## 本地预览

最简单的方法：直接双击打开 `index.html`。

更接近线上环境的方法：在这个文件夹里启动本地静态服务器。

```powershell
cd C:\Users\11624\Documents\Codex\2026-06-02\cloudflare-codex-cloudflare-pages-github-1\outputs\personal-site
python -m http.server 8000
```

然后在浏览器打开：

```text
http://localhost:8000
```

## 部署

当前推荐方式：

```text
修改文件或添加图片
双击 deploy.bat
GitHub Actions 自动部署到 Cloudflare Pages
```

首次使用前需要先按照 `GITHUB_SETUP.md` 创建 GitHub 仓库并配置 Cloudflare Secrets。

## 手动上传到 Cloudflare Pages Direct Upload

重新上传时，请上传 `personal-site` 文件夹里的全部文件：

```text
index.html
about.html
notes.html
articles.html
ask.html
match.html
styles.css
script.js
README.md
assets/
```

不要只上传 `index.html`，否则其他页面会打不开。

## 之后可以继续替换

- 正式自我介绍文案。
- 真实笔记和文章内容。
- 提问箱后端。
- 404 页面和 favicon。
