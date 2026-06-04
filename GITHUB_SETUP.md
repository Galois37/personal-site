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
