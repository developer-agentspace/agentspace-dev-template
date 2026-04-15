/**
 * Card — generic content container with consistent padding, rounded corners,
 * and a subtle shadow. Use it instead of <div className="bg-white rounded ..."> at
 * call sites so the visual treatment stays consistent across the app.
 */

import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  /** Optional title rendered as <h3> at the top of the card. */
  title?: string;
  /** Optional sub-text rendered under the title in muted colour. */
  subtitle?: string;
  /** Pass through extra Tailwind classes for one-off layout tweaks. */
  className?: string;
}

export function Card({ children, title, subtitle, className = '' }: CardProps) {
  return (
    <section className={`bg-white rounded-2xl p-6 shadow-sm ${className}`}>
      {(title || subtitle) && (
        <header className="mb-4">
          {title && <h3 className="text-base font-semibold text-slate-800">{title}</h3>}
          {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
        </header>
      )}
      {children}
    </section>
  );
}
