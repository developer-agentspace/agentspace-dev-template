# Accessibility Skill — WCAG 2.1 AA by Default

## Purpose
This skill defines the accessibility rules every Agent Space project must follow. The target is **WCAG 2.1 Level AA** — not AAA (aspirational), not Level A (insufficient for our enterprise customers).

Every Agent Space app serves enterprise customers, many of whom have legal accessibility requirements (ADA, EU EAA, India RPwD Act). Accessibility is not optional, and it is much cheaper to bake in from the start than to retrofit.

## The non-negotiables

If you remember nothing else from this file, remember these five rules. Everything else is a refinement.

1. **Use semantic HTML.** `<button>` for things that do something, `<a href>` for navigation, `<nav>`, `<main>`, `<section>`. Never `<div onClick>`.
2. **Every interactive element is keyboard reachable.** Tab order is logical, focus is visible, no keyboard traps.
3. **Every form input has a label** that is programmatically associated with it (`htmlFor`/`id` or wrapping `<label>`).
4. **Every image has `alt`** — descriptive for informative images, `alt=""` for decorative.
5. **Color contrast is at least 4.5:1** for body text, 3:1 for large text and UI components.

## Semantic HTML

Use the right element for the job. Don't reinvent built-ins with `div` + JavaScript.

```tsx
// BAD — div onClick is a keyboard and screen-reader trap
<div onClick={handleClick} className="bg-blue-500 px-4 py-2">Save</div>

// GOOD — real button, gets keyboard, focus, role for free
<button type="button" onClick={handleClick} className="bg-blue-500 px-4 py-2">
  Save
</button>
```

```tsx
// BAD — simulated link
<span onClick={() => navigate('/home')}>Home</span>

// GOOD — real link, works with middle-click, right-click, screen reader
<Link to="/home">Home</Link>
```

```tsx
// BAD — no landmarks, screen reader can't navigate by region
<div>
  <div>{header}</div>
  <div>{content}</div>
</div>

// GOOD — landmarks let users jump straight to main content
<>
  <header>{header}</header>
  <nav aria-label="Primary">{nav}</nav>
  <main id="main-content">{content}</main>
  <footer>{footer}</footer>
</>
```

## Keyboard navigation

Every interaction in the app must be possible with keyboard alone.

- **Tab order matches visual order.** Don't use `tabIndex` to reorder. If the visual order is wrong, fix the DOM order.
- **`tabIndex={0}`** to add an element to the tab order (rare — only for custom controls that aren't already focusable). Never `tabIndex` greater than 0.
- **`tabIndex={-1}`** to remove an element from the tab order while keeping it programmatically focusable. Use this for elements you focus from JS (modals, error messages).
- **Focus is always visible.** Tailwind's `focus:ring-2` and similar are required on every interactive element. Never `outline: none` without a replacement.
- **No keyboard traps.** Modals trap focus *inside* the modal until dismissed; everywhere else, Tab and Shift+Tab move freely.
- **Skip link.** Every page should start with a `<a href="#main-content">Skip to main content</a>` that is visually hidden until focused. Lets keyboard users skip the nav.

```tsx
// Skip link example — visually hidden until focused
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:shadow"
>
  Skip to main content
</a>
```

## Screen reader support

- **`aria-label`** for icons-only buttons or controls without visible text. Be descriptive: `aria-label="Close dialog"`, not `aria-label="Close"`.
- **`aria-labelledby`** when the label already exists somewhere else on the page — point to its `id`.
- **`aria-describedby`** for supplementary descriptions (a hint, an error message). Not a substitute for a label.
- **`aria-live`** for dynamic content the user needs to know about: form errors, toasts, status updates. Use `polite` for non-urgent, `assertive` for urgent (use sparingly).
- **`role="alert"`** for critical messages (errors that block submission). Equivalent to `aria-live="assertive"` + `role="alert"`.
- **Avoid ARIA when HTML can do the job.** First rule of ARIA: don't use ARIA. A `<button>` already has `role="button"` — adding `role="button"` is a code smell.

```tsx
// BAD — icon button with no accessible name
<button onClick={onClose}><XIcon /></button>

// GOOD — icon button with aria-label
<button onClick={onClose} aria-label="Close dialog">
  <XIcon aria-hidden="true" />
</button>
```

```tsx
// BAD — error message not announced
{error && <p className="text-red-500">{error}</p>}

// GOOD — live region announces the error when it appears
{error && (
  <p role="alert" className="text-red-500">
    {error}
  </p>
)}
```

## Color and contrast

- **Body text:** minimum **4.5:1** contrast ratio against the background.
- **Large text (≥18pt or ≥14pt bold):** minimum **3:1**.
- **UI components and graphical objects** (icons, focus rings, form borders): minimum **3:1**.
- **Color is never the only signal.** Errors are red AND have an icon AND have text. "Available" is green AND has the word "Available". Color-blind users (8% of men) must not be locked out.
- Use the **axe DevTools** browser extension to check contrast on every new screen.
- Tailwind's default palette is mostly safe for body text but **always verify** combinations like `text-gray-400` on `bg-white` (around 3.5:1, fails AA for body).

## Forms

This is where most accessibility bugs hide.

- **Every input has a `<label>`** with `htmlFor` matching the input's `id`. No exceptions.
- **Placeholder is not a label.** Placeholder disappears when the user types. It's a hint, not a label.
- **Required fields have `required` and `aria-required="true"`.**
- **Errors are programmatically associated.** Use `aria-describedby` to point the input at its error message, and use `aria-invalid="true"` when the field has an error.
- **Errors are announced.** Wrap the error in `role="alert"` so screen readers speak it as soon as it appears.
- **Submit errors focus the first invalid field** so the user can immediately fix it. Don't make them tab back up.

```tsx
// BAD — placeholder as label, no error association, no announcement
<input type="email" placeholder="Email" />
{emailError && <span className="text-red-500">{emailError}</span>}

// GOOD — label, association, announcement
<div>
  <label htmlFor="email" className="block text-sm font-medium">
    Email <span aria-hidden="true">*</span>
  </label>
  <input
    id="email"
    type="email"
    required
    aria-required="true"
    aria-invalid={!!emailError}
    aria-describedby={emailError ? 'email-error' : undefined}
    className={emailError ? 'border-red-500' : 'border-slate-300'}
  />
  {emailError && (
    <p id="email-error" role="alert" className="mt-1 text-sm text-red-600">
      {emailError}
    </p>
  )}
</div>
```

## Focus management

- **Focus visible.** Always. Use Tailwind's `focus-visible:ring-2 focus-visible:ring-brand`.
- **Modal opens** → focus moves to the first focusable element inside the modal (or the close button if there's nothing else). On close, focus returns to the element that opened it.
- **Route change** → focus moves to the new page's `<h1>` (or `<main>` element). Without this, screen reader users hear "loaded" with no idea where they are.
- **Long lists or infinite scroll** → don't steal focus when new items load. Update an `aria-live="polite"` region with the new count instead.

## Motion and animation

- **Respect `prefers-reduced-motion`.** Some users get motion sickness from non-essential animation.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- **Never autoplay video with sound.**
- **Never use animation longer than 5 seconds** without a pause control.
- **No flashing more than 3 times per second.** This is a seizure risk (WCAG 2.3.1).

## Images

- **Informative images:** `alt` describes what the image conveys, not what it looks like. `alt="Quarterly revenue chart"`, not `alt="bar chart"`.
- **Decorative images:** `alt=""` (empty, but present). The screen reader skips it.
- **SVG icons inside buttons with text:** `<svg aria-hidden="true">` so the screen reader reads the button's text only, not the icon.
- **SVG icons that are the button's only label:** wrap with a button that has `aria-label`, and `aria-hidden="true"` on the SVG (see Forms section example above).

## Common ARIA patterns

| Pattern | When to use | Key attributes |
|---|---|---|
| Tabs | Tabbed interface | `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`, `role="tabpanel"`, `aria-labelledby` |
| Dialog | Modal, alert | `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, `aria-describedby`, focus trap |
| Disclosure | Collapsible section, accordion | `<button aria-expanded aria-controls>`, content has matching `id` |
| Combobox | Autocomplete | `role="combobox"`, `aria-autocomplete`, `aria-controls`, `aria-activedescendant` |
| Menu | Right-click menu, dropdown menu | `role="menu"`, `role="menuitem"`, keyboard arrows |
| Live region | Status updates, toasts | `aria-live="polite"` or `role="alert"` |

**Strongly prefer Headless UI / Radix UI primitives** over hand-rolling these patterns. They get every detail right (focus management, keyboard handling, ARIA wiring) and have been battle-tested by thousands of teams. Hand-rolling a combobox is a six-month project.

## Testing

### Automated

- **`jest-axe`** for component-level a11y tests. Add to every component test file:

```tsx
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

it('has no accessibility violations', async () => {
  const { container } = render(<MyComponent />);
  expect(await axe(container)).toHaveNoViolations();
});
```

- **Storybook a11y addon** runs the same checks against every story. Configure in `.storybook/preview.ts` (see ticket 5.3 / Storybook setup).
- **Lighthouse CI** runs accessibility checks on every PR (see ticket 5.5 / Lighthouse setup).

### Manual

Automated tests catch ~30% of accessibility issues. The other 70% require eyes, ears, and a keyboard.

- **Tab through every page.** Can you reach every interactive element? Is the order logical? Is focus always visible?
- **Use a screen reader.** macOS: VoiceOver (`Cmd+F5`). Windows: NVDA (free download). At minimum, navigate the home page once with the screen reader on.
- **Zoom to 200%.** Does the layout still work? Are any elements cut off?
- **Check with `prefers-reduced-motion: reduce`** in DevTools.
- **axe DevTools browser extension.** Run on every new page before opening a PR.

### When to test

- **New component:** unit test with jest-axe + Storybook story checked by the a11y addon
- **New page:** manual keyboard pass + axe DevTools scan + screen reader spot-check
- **Refactor:** re-run the existing tests + axe DevTools to make sure no regressions

## PR checklist (a11y items)

These items live in `.github/pull_request_template.md` reviewer checklist. Both author and reviewer should verify:

- [ ] Every interactive element is keyboard reachable
- [ ] Tab order matches visual order
- [ ] Focus is visible (no `outline: none` without replacement)
- [ ] Every form input has a `<label>`
- [ ] Every image has `alt` (or `alt=""` if decorative)
- [ ] No `<div onClick>` — use `<button>` or `<a>`
- [ ] Color is not the only signal for state
- [ ] Color contrast is ≥ 4.5:1 for body text (axe DevTools or Lighthouse confirms)
- [ ] If new ARIA was added, it's necessary (HTML doesn't already provide it)
- [ ] Reduced-motion users get a quieter experience
- [ ] At least one screen reader test was performed for new pages

## Tools

- **axe DevTools** (browser extension) — best automated checker, runs in DevTools
- **Lighthouse** — built into Chrome DevTools, accessibility section
- **WebAIM Contrast Checker** — https://webaim.org/resources/contrastchecker/
- **VoiceOver** (macOS) — built in, `Cmd+F5` to toggle
- **NVDA** (Windows) — free, https://www.nvaccess.org/
- **Headless UI** — https://headlessui.com — accessible primitives for React
- **Radix UI** — https://www.radix-ui.com — same idea, more components

## Cross-references

- `skills/frontend.md` — UI patterns (the a11y rules apply to everything written there)
- `skills/testing.md` — `jest-axe` setup and accessibility test patterns
- `.github/pull_request_template.md` — reviewer checklist with a11y items
- `docs/runbooks/deployment-runbook.md` — Lighthouse a11y checks run as part of deploy verification (when ticket 5.5 lands)
- WCAG 2.1 quick reference — https://www.w3.org/WAI/WCAG21/quickref/
- ARIA Authoring Practices Guide — https://www.w3.org/WAI/ARIA/apg/
