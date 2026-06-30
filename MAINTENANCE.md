# Maintenance Guide

Last updated: 2026-06-28

This guide explains how to maintain this personal site without relying on the long original Codex conversation.

## Daily Workflow

1. Work from the site root:

```powershell
cd C:\Users\11624\Documents\Codex\2026-06-02\cloudflare-codex-cloudflare-pages-github-1\outputs\personal-site
```

2. Read `HANDOFF_CONTEXT.md` before asking Codex to change the site.
3. Create a local snapshot before meaningful edits:

```powershell
tools\snapshot.ps1 -Label before-change-name
```

4. Run the maintenance check:

```powershell
tools\maintenance-check.ps1
```

5. Make one focused change.
6. Run the maintenance check again.
7. If the change is stable, update `CHANGELOG.md`.
8. Deploy only when you intentionally want to publish:

```powershell
deploy.bat
```

## What GitHub Already Gives You

- Version history: commits let you compare and roll back code.
- Off-computer backup: the repository keeps a remote copy of the site.
- Deployment automation: GitHub Actions deploys to Cloudflare Pages.
- Secret storage: deployment credentials should live in GitHub Secrets, not in files.
- Action logs: failed deploys can be inspected from the GitHub Actions page.

At the moment, many site changes are still uncommitted. GitHub can only protect changes that have been committed and pushed.

## Local Tools Added Here

- `tools\maintenance-check.ps1`: checks Git state, required files, JavaScript syntax, and possible secret references.
- `tools\snapshot.ps1`: creates a timestamped zip backup in the old task-level `backups` folder.
- `HANDOFF_CONTEXT.md`: compact model-readable context for future maintenance threads.
- `CHANGELOG.md`: human-readable change history.

## Deployment Model

The current Cloudflare Pages project started as Direct Upload. The documented approach is:

```text
local files -> GitHub repo -> GitHub Actions -> Wrangler -> existing Cloudflare Pages project
```

Use `deploy.bat` for normal publishing. It calls `tools\api-deploy.ps1`, which pushes files and waits for GitHub Actions unless told otherwise.

## Safety Rules

- Never paste or print real tokens/passwords in chat.
- Never commit `.env`, `.dev.vars`, `.wrangler/`, logs, or local password files.
- Treat the old task file `work/admin-password.txt` as local-only.
- Keep deployment credentials in GitHub Secrets or Cloudflare environment variables.
- Do not put private user data into frontend JavaScript, HTML, CSS, or public assets.

## Refactoring Rules

- Refactor `script.js`, `admin.js`, and `styles.css` in small slices.
- Prefer extracting repeated helpers only after identifying real duplication.
- Keep existing page class names and data attributes unless changing all callers.
- For UI work, verify desktop and mobile layouts.
- For API work, verify frontend callers and D1 schema compatibility.

## Large Asset Rules

- Put normal images under `assets/` or a purpose-specific subfolder.
- Put content cover images under `assets/content-covers/`.
- Keep PDFs under `assets/notes/`.
- Avoid saving large images as data URLs in D1 or source files for long-term use.
- Consider moving large audio files out of Git if the repository becomes slow to clone or deploy.

## Rollback Options

- If the change has not been committed, restore from a snapshot zip made by `tools\snapshot.ps1`.
- If the change has been committed, use Git history to inspect or revert.
- If a deployment fails, check GitHub Actions logs first; `GITHUB_SETUP.md` has Cloudflare token troubleshooting notes.

## When Asking Codex To Work

Good maintenance prompt:

```text
Read HANDOFF_CONTEXT.md and MAINTENANCE.md first. Then change only the friends page wording. Do not deploy or commit.
```

For visual changes, include which pages to check and whether mobile matters. For deployment changes, say explicitly whether deployment is allowed.
