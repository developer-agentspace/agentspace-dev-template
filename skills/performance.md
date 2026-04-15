# Performance Skill — Budgets, Patterns, and Lighthouse CI

## Purpose
This skill defines the performance rules and budgets every Agent Space project must follow. The goal is **fast on a mid-range Indian smartphone over a 4G connection**, which is the realistic worst-case for our enterprise customers' field staff. If it's fast there, it's fast everywhere.

The pillars covered here:

1. **Budgets** — what we measure and what's allowed (enforced by Lighthouse CI)
2. **Bundle size** — code splitting, lazy loading, tree shaking
3. **Images** — formats, sizing, lazy loading
4. **Fonts** — loading strategy, subsetting
5. **React** — when to memoize and when not
6. **Network** — preconnect, prefetch, caching, React Query staleTime
7. **Local profiling** — how to test locally before opening a PR

## The budgets

These live in `frontend/lighthouserc.json` and are enforced on every PR by `.github/workflows/lighthouse-ci.yml`. A PR that exceeds them will fail CI.

| Metric | Budget | Severity | Why |
|---|---|---|---|
| Performance score | ≥ 90 | error | Composite Core Web Vitals score; matches Google's "good" threshold |
| Accessibility score | ≥ 95 | error | We target WCAG 2.1 AA — see `skills/accessibility.md` |
| Largest Contentful Paint (LCP) | < 2.5s | error | Google's "good" threshold |
| Cumulative Layout Shift (CLS) | < 0.1 | error | Google's "good" threshold |
| Interaction to Next Paint (INP) | < 200ms | error | Google's "good" threshold (replaced FID in 2024) |
| Total Blocking Time (TBT) | < 300ms | error | Lab proxy for INP |
| First Contentful Paint (FCP) | < 1.8s | warn | Useful early signal but not blocking |
| Total bundle size | < 500KB | error | gzipped, all assets |
| JS bundle size | < 300KB | error | gzipped — most of the 500KB budget |
| Stylesheet size | < 50KB | warn | Tailwind purge keeps this small naturally |
| Image weight | < 200KB | warn | Per page, not per image |
| Best practices score | ≥ 95 | warn | Console errors, deprecated APIs, mixed content |

**Why "warn" for some:** stylesheets and images vary by feature. We don't want a perfectly fine landing page failing CI because the marketing team added a hero image. The warns surface in the PR comment and prompt review, but don't block merge.

**Tightening budgets:** when the team has shipped a few projects, ratchet the warnings into errors. Don't start strict — start at the current baseline and improve over time.

## Bundle size

The single biggest lever. A bloated bundle delays everything else.

### Code splitting

- **Route-level code splitting** with `React.lazy()` for every route. The login page shouldn't ship the dashboard's chart library. Vite's dynamic `import()` produces separate chunks automatically.

```tsx
import { lazy, Suspense } from 'react';

const ReportsPage = lazy(() => import('./pages/ReportsPage'));

<Suspense fallback={<LoadingSkeleton />}>
  <ReportsPage />
</Suspense>
```

- **Component-level lazy loading** for heavy components that aren't visible on first paint: charts, modals, complex forms.

### Tree shaking

- **Always import named exports**, not entire modules:
  ```ts
  // GOOD — tree-shakeable
  import { format } from 'date-fns';

  // BAD — pulls in the entire library
  import * as dateFns from 'date-fns';
  import dateFns from 'date-fns';
  ```

- **Avoid side-effect imports.** A library with `"sideEffects": false` in its `package.json` can be tree-shaken. Libraries that register globals (jQuery plugins, polyfills) cannot.

### Dependency vetting

- Check the bundle impact of any new dep on https://bundlephobia.com **before** installing.
- A 5KB diff is fine. A 50KB diff for a one-line use case is not — write the inline code.
- The `CLAUDE.md` Section 6 list bans Axios, Redux, Zustand, and MobX partly for this reason.
- See `docs/dependency-upgrades.md` for the full new-dependency vetting flow.

## Images

Images are usually the biggest single asset on a page. Get them right.

- **Use modern formats** — WebP for photos, AVIF if your hosting supports it, SVG for icons. PNG and JPEG only as fallbacks.
- **Resize before upload.** A 4000x3000 image rendered at 200x150 wastes 95% of its bytes.
- **`width` and `height` attributes** on every `<img>` to prevent layout shift (CLS):
  ```html
  <img src="logo.png" width="120" height="40" alt="Logo" />
  ```
- **`loading="lazy"`** for any image below the fold:
  ```html
  <img src="hero.webp" loading="lazy" alt="..." />
  ```
- **Responsive images** with `srcset` for hero / banner images:
  ```html
  <img
    src="hero-800.webp"
    srcset="hero-400.webp 400w, hero-800.webp 800w, hero-1200.webp 1200w"
    sizes="(max-width: 600px) 400px, (max-width: 1000px) 800px, 1200px"
    alt="..."
  />
  ```
- **Decorative SVG inline** in JSX. Other images go in `public/` or imported as a URL.

## Fonts

- **Use `font-display: swap`** in your `@font-face` rules so text is visible during font load (avoids the "invisible text flash" — FOIT).
- **Preload critical fonts** via `<link rel="preload">` in `index.html` so they fetch in parallel with the HTML.
- **Subset fonts** to the characters you actually use. A full Latin font is ~30KB; the subset for your UI is often ~10KB.
- **Self-host** instead of using Google Fonts CDN. Faster (no extra DNS lookup), CSP-friendlier, GDPR-friendlier.
- **Limit to two font families.** One sans, one display, that's it. Three is rarely needed; four is a smell.

## React performance

Start un-optimized. Profile when there's a real problem. Memoize only when the profiler says so.

### When to use memoization

- **`React.memo`** — wrap a child that renders often with the same props but is expensive to render. Verify with the React DevTools Profiler before adding.
- **`useMemo`** — when an expensive computation runs on every render and its inputs haven't changed. Sorting a 1000-item list, building a chart's tooltip data, etc.
- **`useCallback`** — when a callback is passed to a memoized child as a prop. Without `useCallback`, the child re-renders on every parent render because the callback is a new reference each time. Without a memoized child, `useCallback` does literally nothing useful.

### When NOT to memoize

- **Small components.** The overhead of `React.memo` is bigger than the cost of a re-render for trivial components.
- **Components that always receive new props.** If `<List items={filteredItems}>` gets a new array every render, `React.memo` won't help — the prop reference is different.
- **Inside `useMemo`, things that are cheap to compute.** `useMemo(() => x + y, [x, y])` is slower than just `x + y`.
- **Everywhere by default.** Premature memoization adds noise, makes refactoring harder, and slows down the dev loop.

### Render hazards to fix without measuring

These are always worth fixing, no profiler needed:

- **State updates inside render functions.** Causes infinite loops; will crash the app.
- **Expensive work in render** that doesn't depend on props or state. Move outside the component.
- **Inline object/array literals in `useEffect` deps** — `useEffect(..., [{ foo }])` creates a new object every render. Pull the dep out.
- **Calling `setState` in `useEffect` without a dep array** — runs on every render, infinite loop risk.

## Network

- **`<link rel="preconnect">`** for any third-party origin you'll fetch from on first paint (CDN, API, fonts host). Saves the DNS + TLS round trip.
  ```html
  <link rel="preconnect" href="https://api.example.com" crossorigin />
  ```
- **`<link rel="prefetch">`** for routes the user is likely to visit next. Vite's lazy chunks can be prefetched on hover or after first paint.
- **HTTP/2 or HTTP/3** at the hosting level. All modern hosts (Vercel, Netlify, CloudFront) default to this.
- **Compression.** Brotli > gzip. Both should be enabled at the hosting layer for text assets. Lighthouse will warn if compression is missing.
- **Cache headers.** Hashed asset filenames (`index-AbCdEf12.js`) can use `Cache-Control: public, max-age=31536000, immutable`. The HTML itself uses `Cache-Control: no-cache, must-revalidate` so users always get the latest entrypoint.

## React Query and caching

Set `staleTime` deliberately on every query. The default of 0 means React Query refetches on every mount, which is wasteful and slow.

- **`staleTime: 5 * 60 * 1000` (5 minutes)** — sensible default for most reads
- **`staleTime: 30 * 1000` (30 seconds)** — fast-changing dashboards
- **`staleTime: Infinity`** — for data that never changes during the session (config, enums)
- **`gcTime: 30 * 60 * 1000` (30 min)** — keep cached data around even after components unmount, so navigation back is instant

```ts
useQuery({
  queryKey: ['shipping-bills', filters],
  queryFn: () => fetchBills(filters),
  staleTime: 5 * 60 * 1000,
  gcTime: 30 * 60 * 1000,
});
```

See `skills/api.md` for the full React Query patterns.

## Local profiling

Before opening a PR for any non-trivial UI change, run Lighthouse locally. Don't wait for CI.

```bash
cd frontend
npm run build
npx serve dist        # or any other static file server
# Open http://localhost:3000 in Chrome incognito
# DevTools → Lighthouse → Mobile, Performance, Generate report
```

For Lighthouse CI specifically:

```bash
npm install -g @lhci/cli
lhci autorun         # builds, runs Lighthouse, asserts against budgets
```

The output will tell you exactly which budget you exceeded and by how much. The HTML report breaks down which assets contributed the most to LCP and INP.

### Performance debugging in DevTools

- **Performance panel** — record a 5-second interaction, look for long tasks (red blocks > 50ms) and main-thread work
- **Coverage panel** — shows unused JS and CSS. Anything > 50% unused is a code-splitting opportunity.
- **Network panel** — slow 3G throttle to simulate field conditions. Disable cache when measuring first-load.
- **React DevTools Profiler** — record a render-heavy interaction, find which components re-rendered and why

## CI integration

Lighthouse CI runs on every PR via `.github/workflows/lighthouse-ci.yml`. The workflow:

1. Builds the project
2. Runs `lhci autorun` against the static `dist/` output (no dev server needed)
3. Asserts against the budgets in `lighthouserc.json`
4. Uploads the full HTML report as a workflow artifact (downloadable from the PR's checks tab for 14 days)
5. Comments the results on the PR (when `LHCI_GITHUB_APP_TOKEN` is configured — see Lighthouse CI docs)

If the workflow fails, the report tells you exactly which metric or budget was exceeded and which assets contributed.

## Adjusting the budgets

The budgets in `lighthouserc.json` are deliberately set at Google's "good" thresholds. If a budget is consistently impossible to hit for legitimate reasons (e.g., a charting page that genuinely needs Recharts), the right move is:

1. Discuss in the team channel
2. Open an ADR documenting the deviation and the reason
3. Adjust the budget in `lighthouserc.json` in the same PR as the ADR

**Never** silently raise a budget to make a failing PR green. The budget is the project's documented contract with users; changing it should be a conscious decision, not a workaround.

## Cross-references

- `frontend/lighthouserc.json` — the budget configuration
- `.github/workflows/lighthouse-ci.yml` — the CI workflow
- `skills/frontend.md` — the broader frontend conventions
- `skills/accessibility.md` — the accessibility budgets
- `skills/api.md` — React Query patterns
- `docs/dependency-upgrades.md` — new-dep vetting that protects bundle size
- Web Vitals — https://web.dev/vitals/
- Lighthouse CI docs — https://github.com/GoogleChrome/lighthouse-ci/blob/main/docs/configuration.md
- Bundlephobia — https://bundlephobia.com
