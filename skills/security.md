# Security Skill — Secure-by-Default Patterns

## Purpose
This skill defines the security rules every Agent Space project must follow. It exists because Claude Code writes a lot of code automatically, and it needs explicit guardrails to avoid introducing OWASP-class bugs by accident. Read this before any feature touching authentication, API calls, user input, or secrets.

The goal is **secure by default** — the easy path should also be the safe path. If a rule here makes a feature harder to build, that is intentional friction.

## Threat model — the short version

Every Agent Space app is a customer-facing SPA backed by a REST API. The realistic threats are:

- **Stolen credentials** (auth token in localStorage, session hijacked from a logged dev console)
- **XSS** (user input rendered without escaping, HTML injected via `dangerouslySetInnerHTML`)
- **Supply chain** (a malicious npm package phoning home or skimming forms)
- **CSRF** (a hostile site causing the user's browser to make authenticated requests)
- **Leaked secrets** (`.env` committed by accident, API key embedded in client bundle)
- **PII exposure** (full names, emails, addresses showing up in logs, error reports, or analytics events)

Everything in this document maps back to one of those.

## Authentication

### Token storage
- **Bearer tokens go in memory or in `httpOnly` cookies set by the backend.** Not localStorage. Not sessionStorage.
- **Why:** localStorage is readable by any script on the page, including a compromised npm package or an XSS payload. `httpOnly` cookies are not.
- **If the backend can only return tokens in the response body** (some APIs do), keep them in a module-scoped variable inside `/lib/api.ts` and re-fetch on page reload via the refresh flow. Do not persist them.
- **Refresh tokens** must always be `httpOnly` cookies — never reachable from JS.

### Logout hygiene
- On logout, clear the in-memory token, clear the React Query cache (`queryClient.clear()`), revoke the refresh token via a backend call, and navigate to a public route.
- Do not rely on a redirect alone — a stale tab keeps the cache.

### Example

```ts
// BAD — token in localStorage, accessible to any script
localStorage.setItem('authToken', token);
const headers = { Authorization: `Bearer ${localStorage.getItem('authToken')}` };

// GOOD — module-scoped, cleared on logout
let authToken: string | null = null;
export function setAuthToken(token: string | null) { authToken = token; }
export function getAuthHeaders(): Record<string, string> {
  return authToken ? { Authorization: `Bearer ${authToken}` } : {};
}
```

## Authorization

- **The frontend never enforces authorization. The backend always does.** A hidden button is not security — it's UX. The corresponding endpoint must check the user's role.
- Use role checks in components only to **show or hide UI**, never to gate access to data the user shouldn't see.
- If a role check returns `true` in the UI but the API returns `403`, that is the **correct** behaviour and the UI must handle it gracefully (show a friendly "you don't have access" message).

## Input validation

- **Validate at the boundaries.** Forms validate on submit. API responses are typed and parsed. Anything in between can trust its inputs.
- **Use a schema validator** (e.g. Zod) for any data that crosses the network — both inbound API responses and outbound form payloads. Don't rely on TypeScript types alone — they don't exist at runtime.
- **Never trust the URL.** Query params, path params, hash fragments — all attacker-controlled. Sanitize before using.

## XSS prevention

React escapes string children by default. The dangerous patterns are:

- `dangerouslySetInnerHTML` — only use it with content from a trusted source AND after sanitizing with DOMPurify (or equivalent)
- `<a href={userInput}>` — sanitize the URL; reject anything that doesn't start with `http://`, `https://`, `mailto:`, or `/`
- `<iframe src={userInput}>` — same as above, plus add `sandbox` and `referrerPolicy="no-referrer"`
- `eval`, `Function()`, `setTimeout('...string...')` — never. ESLint should catch these.
- `window.location = userInput` — sanitize first

### Examples

```tsx
// BAD — direct injection of untrusted content
<div dangerouslySetInnerHTML={{ __html: comment.body }} />

// GOOD — sanitized
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(comment.body) }} />
```

```tsx
// BAD — javascript: URLs are executable
<a href={user.website}>Their site</a>

// GOOD — sanitize the URL
function safeHref(url: string): string | undefined {
  try {
    const parsed = new URL(url, window.location.origin);
    return ['http:', 'https:', 'mailto:'].includes(parsed.protocol) ? parsed.toString() : undefined;
  } catch {
    return undefined;
  }
}
<a href={safeHref(user.website)}>Their site</a>
```

## CSRF

If the backend uses session cookies (rather than bearer tokens in headers), CSRF protection is mandatory:

- Backend issues a CSRF token on login, returns it in the response or in a non-`httpOnly` cookie
- Frontend reads the token and includes it in the `X-CSRF-Token` header on every state-changing request (POST/PUT/PATCH/DELETE)
- Read-only requests (GET) don't need CSRF protection
- The `/lib/api.ts` wrapper attaches the header automatically — components never touch it

If the backend uses bearer tokens in headers (the more common case), CSRF is **not** a concern because cross-site requests don't carry the header. Document which model the backend uses in `[FILL_PER_PROJECT]`.

## Secrets management

- **Never commit a secret to git.** Even to a private repo. Even temporarily.
- **`.env` files are never committed.** `.env.example` is the template, with placeholder values (`API_KEY=replace-me`).
- **Vite-prefixed vars (`VITE_*`) are baked into the client bundle.** They are visible to anyone who downloads the JS. Use them only for non-secret values: API base URLs, public keys, feature flag flags. Real secrets stay server-side.
- **`.gitignore` must include:** `.env`, `.env.local`, `.env.*.local`, `*.pem`, `*.key`, `*.crt`, `secrets/`
- **If a secret is committed by accident** — it is compromised. Rotate it immediately, then `git filter-repo` to purge history (and force-push, with team coordination). Don't just delete it in a follow-up commit; the history still has it.
- See `docs/dependency-upgrades.md` for the rules on adding new dependencies (every transitive dep is a supply chain risk).

## Dependency security

- **Run `npm audit` weekly.** The Dependabot configuration in `.github/dependabot.yml` automates most of this — see `docs/dependency-upgrades.md`.
- **Never ignore a high or critical CVE** without a documented temporary workaround and a follow-up ticket to upgrade.
- **Pin dependencies** in `package.json` and commit `package-lock.json`. Reproducible builds depend on it.
- **Vet new dependencies** before adding them: last publish date, weekly downloads, maintainer reputation. Three lines of inline code beats a 50KB transitive dep tree.
- **Forbidden packages** (per `CLAUDE.md` Section 6): Axios (use native `fetch`), Redux/Zustand/MobX (React Query + Context is sufficient).

## Content Security Policy

A baseline CSP for an Agent Space SPA looks like this. Set it as an HTTP header from the hosting provider — don't rely on the `<meta>` tag.

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'wasm-unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' data:;
  connect-src 'self' https://api.example.com https://sentry.io;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
```

- `script-src 'self'` blocks inline scripts and external CDNs by default. If a third-party script is required, add its origin explicitly.
- `'unsafe-inline'` for `style-src` is currently necessary for Tailwind v4's style injection. Track this — Tailwind may emit nonces in a future version.
- `connect-src` must include every backend API origin and any monitoring/analytics endpoints (Sentry, etc.)
- `frame-ancestors 'none'` prevents the app from being embedded in another site (clickjacking protection)

## Secure API patterns

- **HTTPS only.** Never `http://` URLs in production. The `apiClient` in `/lib/api.ts` should refuse non-HTTPS in production builds.
- **No credentials in URLs.** Tokens, API keys, session IDs go in headers. `/api/users?token=abc123` is wrong because URLs land in browser history, server logs, and Referer headers.
- **No PII in logs.** Use opaque IDs (`userId: 'usr_abc'`), never `email: 'alice@example.com'`. See the logger documentation in `docs/logging.md` for the full rules.
- **Set `Cache-Control: no-store`** on responses containing user data.
- **CORS** is enforced by the backend. The frontend cannot bypass it. Don't try.

## What is PII

PII (personally identifiable information) is anything that can be tied back to a real person. **Do not log it, do not put it in error reports, do not put it in analytics events, do not put it in URLs.**

- Names (full or first name)
- Email addresses
- Phone numbers
- Physical addresses
- Government IDs (Aadhaar, SSN, passport numbers)
- Financial info (account numbers, card numbers, CVV, full IBAN)
- Health information
- Free-text user input (comments, search queries — may contain PII)
- IP addresses (depending on jurisdiction, e.g. GDPR considers them PII)
- Precise geolocation

**Use opaque IDs instead.** When debugging a specific user, look up their record by ID in the admin tool — never embed the identifying info in the log/error.

This is also covered in `docs/logging.md` (logger rules) and `frontend/src/lib/analytics.ts` (analytics scrubbing) when those exist.

## PR-time security checklist

Every PR — including Dependabot PRs — should pass this checklist before merge:

- [ ] No hardcoded secrets, tokens, or API keys (grep the diff for suspicious strings)
- [ ] No new `dangerouslySetInnerHTML` without DOMPurify
- [ ] No `eval`, `Function()`, or `setTimeout('string')`
- [ ] All user input that ends up in a URL is sanitized
- [ ] All API responses are validated against a schema (Zod or equivalent)
- [ ] No PII in `console.log`, `logger.*`, error messages, or analytics events
- [ ] `npm audit` shows no new high/critical CVEs (Dependabot will catch this on the next cycle if missed)
- [ ] No new third-party dependency without justification in the PR description (per `CLAUDE.md` Section 6)
- [ ] If the PR touches auth or sessions, it has been reviewed by Chinmay
- [ ] Tests cover the security-relevant paths (auth flows, input validation, role checks)

## Cross-references

- `CLAUDE.md` Section 6 — what NOT to do (the master rule list)
- `skills/api.md` — auth flows, fetch wrapper, error handling
- `docs/logging.md` — what to put / not put in `LogContext`
- `docs/dependency-upgrades.md` — Dependabot policy and dependency vetting
- `.github/dependabot.yml` — automated dependency scanning config
- OWASP Top 10 — https://owasp.org/Top10/
- React security cheatsheet — https://cheatsheetseries.owasp.org/cheatsheets/React_Security_Cheat_Sheet.html
