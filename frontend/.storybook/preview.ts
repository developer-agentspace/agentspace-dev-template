import type { Preview } from '@storybook/react';

// Pull in the project's Tailwind output so utility classes work in stories.
// Storybook uses the same Vite + Tailwind v4 pipeline as the app.
import '../src/index.css';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'app',
      values: [
        { name: 'app', value: '#f0f5fa' },
        { name: 'white', value: '#ffffff' },
        { name: 'dark', value: '#0f172a' },
      ],
    },
    // Accessibility addon — runs axe on every story and reports violations.
    // See skills/accessibility.md for the rules these checks enforce.
    a11y: {
      config: {
        rules: [
          // Color contrast can produce false positives in story isolation
          // because the background may not match the production layout.
          // Keep enabled — investigate any violations rather than disable.
        ],
      },
      // Treat violations as test failures (CI-friendly).
      manual: false,
    },
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default preview;
