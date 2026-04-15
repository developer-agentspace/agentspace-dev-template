# Environment Management

This document covers how environment variables and secrets are managed across local, staging, and production for any project cloned from `agentspace-dev-template`. Read it once before configuring a new environment, then reference it when adding a new env var.

For the security policy on what can and can't be exposed in client bundles, see [`skills/security.md`](../skills/security.md). For the secrets policy specifically, this document is the canonical reference.

## The three environments

| Environment | Where it runs | Source of vars | Bundle exposure |
|---|---|---|---|
| **local** | A developer's laptop, `npm run dev` | `frontend/.env.local` (gitignored) | Same as production — anything `VITE_*` is in the JS bundle |
| **staging** | Hosting provider's staging deployment, auto-deployed from `develop` if used | Hosting provider secret manager | Same |
| **production** | Hosting provider's production deployment, deployed from `main` | Hosting provider secret manager | Same |

The most important rule: **`VITE_*`-prefixed variables are baked into the client JavaScript bundle at build time**. Anyone who downloads the JS can read them. They are public. Use `VITE_*` only for non-secret values: API base URLs, public DSNs (Sentry), public write keys (some analytics providers), and feature flag flags.

**Real secrets** (database credentials, server-side API keys, signing keys) **never go in `VITE_*` variables.** They live on the backend and are accessed via authenticated API calls.

## Local development setup

When you clone the repo for the first time:

```bash
cd frontend
cp .env.example .env.local
# Open .env.local in your editor and fill in any blank values your local
# backend needs.
```

`.env.local` is gitignored. Vite reads it automatically when you run `npm run dev`. The `check-env` script (see below) runs first and fails fast if anything required is missing.

### Why `.env.local` and not `.env`?

Because Vite's load order is `.env.local` > `.env`. We commit `.env.example` (the template) and `.gitignore` everything else. `.env.local` is the conventional place for per-developer overrides — your colleague's `.env.local` doesn't have to look like yours.

## Staging and production setup

Real staging and production secrets are **not** stored in any file in the repo. They live in the hosting provider's secret manager:

- **Vercel:** Project Settings → Environment Variables, scoped to "Preview" or "Production"
- **Netlify:** Site Settings → Environment Variables
- **AWS Amplify:** Environment Variables in the app settings
- **Cloud Run / GKE:** Cloud Secret Manager + Workload Identity
- **Self-hosted:** systemd `EnvironmentFile=` or a sealed-secrets manifest

The repo contains `frontend/.env.staging.example` and `frontend/.env.production.example` as **templates** — flat lists of every variable that environment needs. When you set up a new staging or production environment, copy that list into the secret manager so you don't miss any variables.

## The `check-env` script

`frontend/scripts/check-env.mjs` runs before `npm run dev` and `npm run build`. It validates that every required environment variable is:

1. Set
2. Non-empty
3. Matching its expected format (URLs are checked for `https?://` prefix)

If any check fails, the script prints a clear error and exits non-zero, blocking the dev server or the build. The error tells you exactly which variable is missing and why it's needed.

### Adding a new required variable

When you add a new `VITE_*` variable to the codebase:

1. **Add it to `frontend/scripts/check-env.mjs`** in the `REQUIRED_VARS` array (or `PRODUCTION_REQUIRED_VARS` if it's only required in production):

   ```js
   {
     name: 'VITE_FEATURE_X_ENDPOINT',
     description: 'Endpoint for feature X — see docs/environments.md',
     pattern: /^https?:\/\/.+/,
   }
   ```

2. **Add it to `frontend/.env.example`** with a comment explaining what it's for and an example value (NOT a real secret).

3. **Add it to `frontend/.env.staging.example` and `.env.production.example`** so future environment setups don't miss it.

4. **Document it in this file** (next section) under the appropriate category.

5. **Set it in every existing environment** (your local `.env.local`, the staging secret manager, the production secret manager) **before** merging the PR. A PR that adds a required variable but doesn't set it in production will break the deploy.

## Variable catalog

This is the source of truth for what every variable does. Keep it in sync with `.env.example`.

### Required (all environments)

| Variable | Purpose | Example |
|---|---|---|
| `VITE_API_BASE_URL` | Backend REST API base URL. The `apiClient` in `frontend/src/lib/api.ts` prepends this to every request. | `https://api.example.com/api` |

### Optional (added per ticket)

| Variable | Purpose | Required when |
|---|---|---|
| `VITE_SENTRY_DSN` | Sentry DSN for client error reporting. Public — designed to be exposed in bundles. | Ticket #32 (Sentry) merged |
| `VITE_SENTRY_ENVIRONMENT` | Tag added to all Sentry events. Defaults to `import.meta.env.MODE` if unset. | Ticket #32 merged |
| `VITE_ANALYTICS_WRITE_KEY` | Public write key for the analytics provider. Leave blank to use the no-op implementation. | Ticket #40 (analytics) merged |
| `VITE_FLAG_<NAME>` | Per-flag override for the feature flag system. See `frontend/src/lib/flags-config.ts`. | Per flag |

## Secret rotation

Secrets need to be rotated regularly. The cadence depends on the secret type:

| Secret type | Rotation cadence | Triggered by |
|---|---|---|
| Backend API tokens | Every 90 days | Calendar reminder + cron alert |
| Sentry auth tokens | Every 180 days | Calendar reminder |
| Analytics write keys | Every 180 days | Calendar reminder |
| Anything that has been exposed | Immediately | Incident |

### Rotation process

1. **Generate the new secret** in the upstream service (Sentry dashboard, analytics provider, etc.).
2. **Add the new secret to the staging environment** in the secret manager. Do not delete the old one yet.
3. **Trigger a staging deploy** so the new secret is in use.
4. **Verify staging works** with the new secret (smoke test the affected feature).
5. **Repeat steps 2-4 for production.**
6. **Wait 24 hours** to make sure no old code paths are still using the old secret.
7. **Revoke the old secret** in the upstream service.

Document the rotation in the team channel: which secret, when, who did it. This is your audit trail.

## What NEVER to commit

This list is enforced by `.gitignore` (see [`skills/security.md`](../skills/security.md) for the full pattern list):

- `.env`
- `.env.local`
- `.env.development`, `.env.staging`, `.env.production` (real values — only `.example` files are committed)
- `.env.*.local`
- `*.pem`, `*.key`, `*.crt`, `*.p12`
- `secrets/`
- Any file containing the literal string of a real API key, token, password, or DSN

If a secret is committed by accident:

1. **Treat it as compromised immediately.** It's now in git history, on every clone, in any forks, and possibly in GitHub's caches.
2. **Rotate the secret right now** in the upstream service.
3. **Purge from history** with `git filter-repo` (NOT `git rm` — that doesn't touch history).
4. **Force-push** the cleaned history (with team coordination — everyone needs to re-clone).
5. **Document the incident** in the team channel and (if SEV1/2) follow the incident response runbook.

## Anti-patterns

These all happen. Don't do them.

- **Hardcoding a URL in a component** instead of reading from an env var. ESLint catches some of these, but not all.
- **Committing a `.env.local` "just for now"** because you're tired and want to push. Always temporary, never reverted, eventually rotated under emergency conditions.
- **Reading a secret from `import.meta.env` and assuming it's safe** because it doesn't have `VITE_` prefix. It's not — Vite excludes non-prefixed vars at build time, but if you ever rename it, the secret leaks.
- **Putting backend credentials in the frontend** because "the backend will handle it." The frontend should never know the database password.
- **Storing secrets in `localStorage`** to persist them across sessions. Use `httpOnly` cookies set by the backend, or don't persist them.
- **Reusing the same secret across environments.** A leaked staging secret should not give an attacker production access.

## Cross-references

- `frontend/.env.example` — template for local dev
- `frontend/.env.local.example` — example overrides
- `frontend/.env.staging.example` — staging template
- `frontend/.env.production.example` — production template
- `frontend/scripts/check-env.mjs` — pre-flight validator
- `skills/security.md` — broader security policy
- `docs/runbooks/deployment-runbook.md` — references this doc for env setup
- `CLAUDE.md` Section 6 — the one-line "no .env files committed" rule
