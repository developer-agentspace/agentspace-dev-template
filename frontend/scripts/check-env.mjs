#!/usr/bin/env node
/**
 * Pre-flight environment variable check.
 *
 * Run before `vite dev` and `vite build`. Fails fast with a clear error
 * message if any required variable is missing or obviously wrong.
 *
 * Usage:
 *   node scripts/check-env.mjs
 *
 * To add a new required variable:
 *   1. Add it to REQUIRED_VARS below with a description
 *   2. Add it to .env.example with a comment
 *   3. Document it in docs/environments.md
 *
 * To add a variable that's only required in production:
 *   - Add it to PRODUCTION_REQUIRED_VARS instead
 *
 * This script is intentionally written as plain ESM JavaScript (not
 * TypeScript) so it can run with `node` directly — no extra runtime
 * dependency.
 */

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

// Best-effort: load .env.local then .env so we can validate the same way
// Vite would. We don't depend on dotenv to avoid the install.
function loadDotenv(filename) {
  const path = join(projectRoot, filename);
  if (!existsSync(path)) return;
  const text = readFileSync(path, 'utf8');
  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    const value = line.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadDotenv('.env.local');
loadDotenv('.env');

const REQUIRED_VARS = [
  {
    name: 'VITE_API_BASE_URL',
    description: 'Backend REST API base URL',
    pattern: /^https?:\/\/.+/,
  },
];

const PRODUCTION_REQUIRED_VARS = [
  // Uncomment when ticket #32 (Sentry) lands:
  // { name: 'VITE_SENTRY_DSN', description: 'Sentry DSN for error tracking' },
];

const env = process.env;
const mode = env.NODE_ENV ?? env.VITE_MODE ?? 'development';
const isProduction = mode === 'production';

const errors = [];

function checkVar(spec) {
  const value = env[spec.name];
  if (value === undefined || value === '') {
    errors.push(`  ✗ ${spec.name} is required but not set — ${spec.description}`);
    return;
  }
  if (spec.pattern && !spec.pattern.test(value)) {
    errors.push(
      `  ✗ ${spec.name} = "${value}" does not match expected format (${spec.pattern}) — ${spec.description}`,
    );
  }
}

REQUIRED_VARS.forEach(checkVar);
if (isProduction) {
  PRODUCTION_REQUIRED_VARS.forEach(checkVar);
}

if (errors.length > 0) {
  process.stderr.write(`\n✗ Environment check failed (${mode} mode):\n\n`);
  errors.forEach((line) => process.stderr.write(`${line}\n`));
  process.stderr.write(
    `\nFix the missing variables in your .env.local file (copy from .env.example to start),\n` +
      `then re-run the command. See docs/environments.md for the full per-environment guide.\n\n`,
  );
  process.exit(1);
}

process.stdout.write(`✓ Environment check passed (${mode} mode)\n`);
