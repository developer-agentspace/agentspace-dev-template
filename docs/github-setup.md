# GitHub Repo, Project, and Board Setup Guide

Follow this guide when starting a new product. Completes in under 1 hour.

## 1. Create the Repo

Option A (template): Click "Use this template" on the agentspace-dev-template repo on GitHub.

Option B (manual):
```bash
gh repo create developer-agentspace/[PROJECT_NAME] --private
git clone [TEMPLATE_URL] [PROJECT_NAME]
cd [PROJECT_NAME]
git remote set-url origin git@github.com:developer-agentspace/[PROJECT_NAME].git
git push -u origin main
```

## 2. Fill in Variable Sections

Search the repo for `[PROJECT_NAME]` and `PROJECT-SPECIFIC SECTION`. Fill in every placeholder in:
- `CLAUDE.md` (Section 1: Project Context, Section 2: Stack Overrides, Section 8: Endpoints)
- `skills/api.md` (Project Endpoints table)
- `skills/database.md` (Project Schema)
- `skills/deployment.md` (Hosting, port, env vars)
- `docs/power-apps-api.md` (All sections)
- `docs/database-schema.md` (All sections)

## 3. Create a GitHub Project Board

1. Go to the repo on GitHub
2. Click "Projects" tab, then "New project"
3. Choose "Board" layout
4. Create columns: **Todo**, **In Progress**, **In Review**, **Done**
5. Link the project to the repo

## 4. Create Standard Labels

```bash
gh label create "P0" --color "B60205" --repo developer-agentspace/[PROJECT_NAME]
gh label create "P1" --color "FF9F1C" --repo developer-agentspace/[PROJECT_NAME]
gh label create "P2" --color "FEF3C7" --repo developer-agentspace/[PROJECT_NAME]
gh label create "frontend" --color "1D76DB" --repo developer-agentspace/[PROJECT_NAME]
gh label create "backend" --color "0E8A16" --repo developer-agentspace/[PROJECT_NAME]
gh label create "testing" --color "FBCA04" --repo developer-agentspace/[PROJECT_NAME]
gh label create "needs-review" --color "C5DEF5" --repo developer-agentspace/[PROJECT_NAME]
gh label create "blocked" --color "D93F0B" --repo developer-agentspace/[PROJECT_NAME]
```

## 5. Configure Branch Protection

Go to repo Settings > Branches > Add rule for `main`:
- [x] Require a pull request before merging
- [x] Require at least 1 approval
- [x] Require status checks to pass (select CI pipeline)
- [x] Do not allow bypassing the above settings

## 6. Add GitHub Secrets

Go to repo Settings > Secrets and variables > Actions:
- `SONAR_TOKEN` — from SonarCloud project setup

## 7. Add Team Members

Go to repo Settings > Collaborators:
- Add developers with "Write" access
- Add reviewers with "Maintain" access
- Add PMs with "Triage" access

## 8. Verify Everything

- [ ] Repo cloned and running locally
- [ ] Variable sections filled in CLAUDE.md and skill files
- [ ] Project board created with correct columns
- [ ] Labels created
- [ ] Branch protection enabled on main
- [ ] CI pipeline runs on a test PR
- [ ] SonarQube token configured
- [ ] Team members added with correct permissions
