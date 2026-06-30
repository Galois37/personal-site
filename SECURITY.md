# Security Notes

Last updated: 2026-06-28

## Keep Out Of Git

- Real passwords.
- Cloudflare API tokens.
- GitHub personal access tokens.
- Admin session tokens.
- `.env`, `.env.*`, `.dev.vars`, `.wrangler/`, logs, and local credential files.

## Expected Secret Locations

- GitHub Actions Secrets:
  - `CLOUDFLARE_ACCOUNT_ID`
  - `CLOUDFLARE_API_TOKEN`
- Cloudflare Pages environment variables / secrets:
  - `ADMIN_PASSWORD_HASH`
  - `ADMIN_SESSION_TOKEN`
  - `ADMIN_TOKEN_HASH`
  - `GITHUB_DEPLOY_TOKEN` if the admin console deploy button is enabled

## Local-Only Sensitive Files

The old task folder contains local working files outside the site repository. In particular, treat this as sensitive local-only material:

```text
C:\Users\11624\Documents\Codex\2026-06-02\cloudflare-codex-cloudflare-pages-github-1\work\admin-password.txt
```

Do not print its content in chat and do not copy it into the site repository.

## Current Known Tradeoffs

- Browser tokens are stored in `localStorage`. This is convenient for the current personal-site workflow, but it is not ideal for high-security applications.
- Password hashing currently uses project helper code suitable for this small site. If the site later handles sensitive user data, revisit password/session design.
- Public assets are public. Do not put private PDFs, images, or audio files under `assets/`.
