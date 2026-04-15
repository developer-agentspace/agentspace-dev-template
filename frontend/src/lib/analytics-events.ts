/**
 * Typed analytics event catalog.
 *
 * Every event the frontend tracks must be defined here. The TypeScript union
 * gives us autocomplete in `track()`, prevents typos at compile time, and
 * makes "what events do we send" answerable by reading one file.
 *
 * Naming convention:
 *   <object>_<verb_in_past_tense>
 *
 * Examples:
 *   page_viewed         (not "view_page" or "page_view")
 *   button_clicked      (not "click_button")
 *   search_performed    (not "perform_search")
 *
 * Why past tense: events describe things that have already happened by the
 * time the call site fires. "page_view" reads as a noun and is ambiguous.
 *
 * To add a new event:
 *   1. Add the name to the EVENT_NAMES tuple
 *   2. Add a matching entry to EVENT_METADATA with description and required props
 *   3. Use it from a component via track('your_event_name', { ... })
 *
 * To remove an event:
 *   - Delete the name from EVENT_NAMES, the entry from EVENT_METADATA, AND
 *     every call site (TypeScript will surface them as errors).
 *   - Do not leave dead events in this file. They mislead readers.
 */

export const EVENT_NAMES = [
  'page_viewed',
  'button_clicked',
  'search_performed',
  'filter_applied',
  'report_generated',
  'export_started',
  'export_completed',
  'form_submitted',
] as const;

export type EventName = (typeof EVENT_NAMES)[number];

/**
 * Per-event metadata. The description is the source of truth for what the
 * event means. The `requiredProps` list is enforced at the type level by
 * `EventProperties` below.
 */
interface EventSpec {
  description: string;
  requiredProps: readonly string[];
}

export const EVENT_METADATA: Record<EventName, EventSpec> = {
  page_viewed: {
    description: 'Fired when the user navigates to a new route. Use the page name from the route, not the URL path.',
    requiredProps: ['pageName'],
  },
  button_clicked: {
    description: 'Fired when the user clicks any tracked button. Use sparingly — only for load-bearing actions, not every click.',
    requiredProps: ['buttonName', 'feature'],
  },
  search_performed: {
    description: 'Fired when the user submits a search query. Track the result count, never the raw query (PII risk).',
    requiredProps: ['feature', 'resultCount'],
  },
  filter_applied: {
    description: 'Fired when the user applies a filter that changes a result set.',
    requiredProps: ['feature', 'filterName'],
  },
  report_generated: {
    description: 'Fired when a report finishes generating successfully.',
    requiredProps: ['reportType', 'rowCount'],
  },
  export_started: {
    description: 'Fired when a CSV/Excel/PDF export begins.',
    requiredProps: ['exportType', 'feature'],
  },
  export_completed: {
    description: 'Fired when an export finishes successfully. Pair with export_started for funnel analysis.',
    requiredProps: ['exportType', 'feature', 'durationMs'],
  },
  form_submitted: {
    description: 'Fired when a form passes client-side validation and is submitted to the backend.',
    requiredProps: ['formName'],
  },
};

/**
 * Properties that can be attached to ANY event. The catalog is intentionally
 * narrow — analytics works best when the same field name means the same thing
 * across every event. Add new fields here, not as ad-hoc keys.
 *
 * NEVER add PII fields. See skills/security.md for the full PII list.
 *   - Allowed: opaque IDs, feature names, counts, durations, enum-like strings
 *   - Forbidden: emails, names, phone numbers, free-text user input, full URLs with query strings
 */
export interface EventProperties {
  /** Logical feature area, e.g. 'shipping-bill-search', 'auth'. */
  feature?: string;
  /** Page name, e.g. 'dashboard', 'reports'. Not the URL. */
  pageName?: string;
  /** Button identifier from the design system or component. */
  buttonName?: string;
  /** Filter identifier when filter_applied. */
  filterName?: string;
  /** Form identifier when form_submitted. */
  formName?: string;
  /** Report type identifier when report_generated. */
  reportType?: string;
  /** Export type, e.g. 'csv', 'xlsx', 'pdf'. */
  exportType?: 'csv' | 'xlsx' | 'pdf';
  /** Number of results / rows. Useful for funnel and zero-result analysis. */
  resultCount?: number;
  /** Number of rows in a generated report. */
  rowCount?: number;
  /** Operation duration in milliseconds. */
  durationMs?: number;
  /** Free-form additional fields. PROHIBIT PII here too. */
  [key: string]: unknown;
}

/**
 * Identify-call traits. Use opaque IDs only — never email, name, phone.
 */
export interface IdentifyTraits {
  /** Plan / tier the user is on. */
  plan?: string;
  /** Role within the org. */
  role?: string;
  /** Tenant / org identifier (opaque). */
  tenantId?: string;
  /** ISO 8601 string of when the user signed up. */
  signedUpAt?: string;
  /** Free-form additional traits. PROHIBIT PII. */
  [key: string]: unknown;
}
