# Handoff Context

Last updated: 2026-06-28

This file is the short working context for maintaining the personal site from a fresh Codex thread. Read this before changing code. Avoid reopening or depending on the long 2026-06-02 thread unless a detail is missing.

## Project

- Site name: Galois37 personal site / "Galois37の完美算术教室".
- Local site root: `C:\Users\11624\Documents\Codex\2026-06-02\cloudflare-codex-cloudflare-pages-github-1\outputs\personal-site`
- Old Codex task root: `C:\Users\11624\Documents\Codex\2026-06-02\cloudflare-codex-cloudflare-pages-github-1`
- GitHub repo: `https://github.com/Galois37/personal-site`
- Cloudflare Pages project: `personal-site`
- Public URLs recorded in docs: `https://personal-site-8d0.pages.dev` and `https://galois37.top`
- Stack: static HTML/CSS/JavaScript plus Cloudflare Pages Functions and D1.

## Current Shape

- Main pages: `index.html`, `about.html`, `notes.html`, `articles.html`, `ask.html`, `match.html`, `archive.html`, `moments.html`, `friends.html`, `music.html`, `admin.html`.
- Main frontend files: `styles.css`, `script.js`, `admin.js`.
- API files live under `functions/api/`; shared helpers live in `functions/_utils.js`.
- D1 schema is in `schema.sql`.
- Static assets live under `assets/`, including notes PDFs, content covers, room images, moments images, avatar images, and local music files.
- Deployment is via `deploy.bat`, which calls `tools/api-deploy.ps1`.
- GitHub Actions workflow is `.github/workflows/deploy.yml`; it deploys with `wrangler@4.98.0`.

## Important Existing Features

- Responsive personal site with anime-inspired visual style.
- Frontend pages for notes, articles/projects, ask/discussion, match placeholder, archive, moments, friends, and music.
- Admin console supports site copy/settings, content management, moments, comments/messages, friends, and deployment trigger features.
- Notes/articles/projects use visual content cards with optional covers.
- Archive uses timeline-style content cards and ignores removed resource entries.
- The old `resources.html` page was intentionally removed; resource-type backend compatibility may remain for old data.
- Moments page was simplified into a masonry-style feed.
- Friends page supports editable friend-link application flow; wording was fixed from "一件发送" to "一键发送".
- Local static fallback logic exists so pages can render default content when local APIs are unavailable.

## Security Notes

- Do not commit real secrets, passwords, API tokens, or Cloudflare credentials.
- `.gitignore` already ignores `.env`, `.env.*`, `.dev.vars`, `.wrangler/`, `node_modules/`, and logs.
- `wrangler.toml` contains project configuration and D1 database ID, but should not contain secret values.
- Required Cloudflare/GitHub secrets are referenced by name only: `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`, `GITHUB_DEPLOY_TOKEN`, `ADMIN_PASSWORD_HASH`, `ADMIN_SESSION_TOKEN`, `ADMIN_TOKEN_HASH`.
- Sensitive local file spotted outside the repo: `work/admin-password.txt` under the old task root. Treat it as local-only and do not print or commit its content.
- Admin and user tokens are stored in browser `localStorage`; this is acceptable for the current personal-site scope but should be revisited before handling sensitive user data.

## Current Maintenance Risk

- The Git repository has only the initial commit, while many later changes are still uncommitted.
- Large files have accumulated, especially in `assets/music/` and `assets/notes/`.
- `styles.css`, `script.js`, and `admin.js` are large and should be refactored carefully in small steps.
- Old Codex thread is very long and includes large screenshot/image payloads; use this file plus the project files as the source of truth instead.

## Operating Rules For Future Work

1. Before editing, run `tools\snapshot.ps1` or otherwise confirm a safe rollback point.
2. Before and after editing, run `tools\maintenance-check.ps1`.
3. Keep changes small and grouped by one feature or fix.
4. Do not deploy unless the user explicitly asks.
5. Do not commit unless the user explicitly asks.
6. When changing shared frontend behavior, check both desktop and mobile layouts.
7. When changing API behavior, check related frontend calls and D1 schema assumptions.
8. Update `CHANGELOG.md` when a maintenance-level change is completed.

## Useful Commands

```powershell
cd C:\Users\11624\Documents\Codex\2026-06-02\cloudflare-codex-cloudflare-pages-github-1\outputs\personal-site
tools\maintenance-check.ps1
tools\snapshot.ps1 -Label before-some-change
deploy.bat
git status --short
```
