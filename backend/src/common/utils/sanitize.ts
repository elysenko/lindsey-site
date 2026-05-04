import sanitizeHtml from 'sanitize-html';

/**
 * Strip every tag/attribute from a piece of free-text input.
 *
 * Visitor-submitted content (consultation form, brand brief, lead notes that
 * originate from visitors) is rendered both in the public-facing thank-you
 * page and the admin dashboard. We never want to round-trip HTML, even if it
 * "looks safe" — admins paste these values into emails and proposals, so any
 * surviving markup is a foot-gun. `sanitize-html` with empty allowlists is
 * the deliberate strict mode: keep the text, drop the tags.
 */
export function sanitizeText(input: string | null | undefined): string | null {
  if (input == null) return null;
  const trimmed = String(input).trim();
  if (trimmed === '') return null;
  return sanitizeHtml(trimmed, {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: 'discard',
  });
}

/**
 * Apply `sanitizeText` to every string value in a flat object — useful for
 * inbound DTOs where a small number of fields are free-text. Non-string
 * values pass through unchanged.
 */
export function sanitizeObject<T extends Record<string, unknown>>(input: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input)) {
    if (typeof v === 'string') {
      out[k] = sanitizeText(v);
    } else {
      out[k] = v;
    }
  }
  return out as T;
}
