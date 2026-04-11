# Deployment Skill — CI/CD and Release Process

> **Doing an actual deploy?** This file describes the *patterns*. The step-by-step procedure for a real deploy lives in [`docs/runbooks/deployment-runbook.md`](../docs/runbooks/deployment-runbook.md). Read this skill once to understand the conventions; use the runbook every time you ship.

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
- Never commit `.env` files.
- Use `.env.example` as the reference for required variables.
- In CI/CD, set variables via GitHub Secrets.
- In Docker, pass variables at runtime, not build time.

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
