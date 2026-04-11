# Deployment Skill — CI/CD and Release Process

## Purpose
This skill defines how code gets from a merged PR to production for all Agent Space projects.

## Environments
- **Development:** Local dev server (`npm run dev`)
- **Staging:** Auto-deployed from `develop` branch (if applicable)
- **Production:** Deployed from `main` branch after PR approval

## Pre-Deployment Checklist
Before merging any PR:
- [ ] All tests pass
- [ ] Coverage >= 80%
- [ ] Lint passes
- [ ] TypeScript type check passes
- [ ] Build succeeds locally
- [ ] SonarQube quality gate passes
- [ ] Human reviewer approved
- [ ] No `console.log` statements
- [ ] No hardcoded URLs or secrets
- [ ] Environment variables documented in `.env.example`

## Docker Configuration
- Use multi-stage builds for smaller images.
- Base image: `node:20-alpine`
- Don't copy `node_modules` into the image. Install inside the build.
- Expose only the necessary port.
- Include a health check endpoint.

### Dockerfile Template

```dockerfile
# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS production
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["node", "dist/server.js"]
```

## GitHub Actions Pipeline
The CI pipeline runs on every push to a PR branch:
1. Install dependencies
2. Lint check
3. Type check
4. Run tests with coverage
5. Build
6. SonarQube analysis
7. Report results on the PR

## Environment Variables

> Full per-environment strategy, secret rotation process, and the variable catalog live in [`docs/environments.md`](../docs/environments.md). The bullets below are the always-on rules.

- Never commit `.env` files. Only `.env.example`, `.env.local.example`, `.env.staging.example`, `.env.production.example` are in git.
- The `frontend/scripts/check-env.mjs` script runs before `dev` and `build` and fails fast if a required variable is missing.
- In CI/CD, set variables via GitHub Secrets and the hosting provider's secret manager. Real secrets never live in any committed file.
- In Docker, pass variables at runtime, not build time. `VITE_*` variables are baked at build time, so they must be present during `npm run build` — but real secrets stay on the backend regardless.
- Adding a new required variable means updating `check-env.mjs`, `.env.example`, the per-env example files, AND `docs/environments.md` in the same PR. See the doc for the full checklist.

## Rollback
- Keep the previous deployment artifact available.
- If a deployment causes issues, revert to the previous version immediately.
- Investigate and fix in a new PR — don't hotfix production directly.

<!-- ==========================================================
     PROJECT-SPECIFIC SECTION: Fill this when starting a new project
     ========================================================== -->

## Project-Specific Configuration

- **Hosting:** [FILL_PER_PROJECT — e.g., Vercel, AWS, Azure]
- **Docker Port:** [FILL_PER_PROJECT — e.g., 3000]
- **Required Environment Variables:**

| Variable | Description | Example |
|----------|-------------|---------|
| VITE_API_BASE_URL | Backend API base URL | https://api.example.com |
| [VAR_NAME] | [Description] | [Example value] |

<!-- ==========================================================
     END OF PROJECT-SPECIFIC SECTION
     ========================================================== -->
