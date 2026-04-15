/**
 * Commitlint config — enforces Conventional Commits format.
 *
 * Format: {type}({scope}): {subject}
 *
 * Allowed types: feat, fix, docs, style, refactor, test, chore, perf, ci
 * See skills/git-workflow.md for the full convention.
 *
 * The commit-msg hook in .husky/commit-msg runs this via commitlint.
 */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Max 72 chars for subject line (matches git-workflow.md)
    'header-max-length': [2, 'always', 72],
    // Require a type
    'type-empty': [2, 'never'],
    // Require a subject
    'subject-empty': [2, 'never'],
    // Allowed types — matches skills/git-workflow.md
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore', 'perf', 'ci'],
    ],
  },
};
