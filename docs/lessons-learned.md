# Lessons Learned — End-to-End Validation

## What We Built
A DateRangeFilter component with tests, built through the full 4-layer workflow.

## What Worked

1. **Skills loaded automatically.** Claude followed frontend.md rules (named exports, typed props, Tailwind, functional component) without being told.
2. **Pre-commit hook caught a real bug.** ESLint flagged an impure `Date.now()` call inside the component render. The commit was blocked until fixed. This is exactly what the quality gate is supposed to do.
3. **TypeScript type check passed.** The `tsc --noEmit` step in the pre-commit hook confirmed no type errors.
4. **Test structure followed testing.md.** Tests used React Testing Library, tested behavior not implementation, used `vi.fn()` for mocks.
5. **Branch and PR workflow worked.** One feature, one branch, one PR. Commit messages followed the convention.

## What Needed Fixing During Validation

1. **lint-staged config path issue.** ESLint is installed inside `/frontend` but lint-staged runs from the repo root. Had to wrap commands in `bash -c 'cd frontend && npx eslint --fix'`. This is now fixed in the template.
2. **Prettier not installed at root.** The original lint-staged config had a Prettier rule for JSON/MD files but Prettier wasn't installed at the root level. Removed the rule since it's not needed for the template.

## Recommendations

1. **The template is ready for real project use.** The workflow works as designed.
2. **lint-staged config should be tested after any changes** to ensure paths resolve correctly.
3. **New developers should run a test commit** early in onboarding to verify the pre-commit hook works on their machine.
4. **Python is required** for the code-review-graph CLI. Add this to prerequisites in the onboarding guide.
