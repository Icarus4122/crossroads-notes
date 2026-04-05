/**
 * Slug generation and sanitization — §13.
 */

/** Generate a slug from a user-provided string. */
export function generateSlug(input: string): string {
  let slug = input.toLowerCase();
  slug = slug.replace(/\s+/g, "-");
  slug = slug.replace(/[^a-z0-9-]/g, "");
  slug = slug.replace(/-{2,}/g, "-");
  slug = slug.replace(/^-+|-+$/g, "");
  // Truncate to 60 chars at a word boundary (hyphen).
  if (slug.length > 60) {
    slug = slug.substring(0, 60);
    const lastHyphen = slug.lastIndexOf("-");
    if (lastHyphen > 0) {
      slug = slug.substring(0, lastHyphen);
    }
  }
  return slug;
}

/** Sanitize a workspace name (from .empusa-workspace.json name field). */
export function sanitizeWorkspaceName(name: string): string {
  // Empusa keeps [a-zA-Z0-9._-]. Plugin lowercases and converts dots/underscores to hyphens.
  let slug = name.toLowerCase();
  slug = slug.replace(/[._]/g, "-");
  slug = slug.replace(/[^a-z0-9-]/g, "");
  slug = slug.replace(/-{2,}/g, "-");
  slug = slug.replace(/^-+|-+$/g, "");
  return slug;
}

/**
 * Scan a list of filenames for ADR numbers and return the next number.
 * Expects filenames like `adr-001-something.md`.
 * Returns 1 if no ADR files exist.
 */
export function nextAdrNumber(filenames: string[]): number {
  const pattern = /^adr-(\d{3})-/;
  let max = 0;
  for (const f of filenames) {
    const m = f.match(pattern);
    if (m) {
      const n = parseInt(m[1], 10);
      if (n > max) max = n;
    }
  }
  return max + 1;
}

/** Zero-pad a number to 3 digits. */
export function padAdrNumber(n: number): string {
  return String(n).padStart(3, "0");
}
