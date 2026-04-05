/**
 * Changelog parser — §9.6.
 *
 * Extracts the section matching a specific version from a Keep a Changelog
 * formatted CHANGELOG.md.
 */

/** Heading pattern: `## [<version>]` optionally followed by ` - <date>` etc. */
const VERSION_HEADING = /^## \[([^\]]+)\]/;

/**
 * Extract the changelog section for a given version.
 *
 * Returns the matched block (heading + body) as a string.
 * Returns specific fallback messages when the version is not found.
 */
export function extractChangelogSection(
  changelogContent: string,
  version: string
): string {
  const lines = changelogContent.split("\n");

  // Check if any version headings exist at all.
  const headingIndices: { index: number; version: string }[] = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(VERSION_HEADING);
    if (m) {
      headingIndices.push({ index: i, version: m[1] });
    }
  }

  if (headingIndices.length === 0) {
    // No version headings at all — return raw excerpt.
    const excerpt = lines.slice(0, 50).join("\n");
    return `_No version headings found — raw excerpt shown._\n\n${excerpt}`;
  }

  // Find the heading matching the requested version.
  const match = headingIndices.find((h) => h.version === version);
  if (!match) {
    return `_(No entry for version \`${version}\` found in CHANGELOG.md)_`;
  }

  // Find the end of this section (next ## [ heading or EOF).
  const nextHeading = headingIndices.find((h) => h.index > match.index);
  const endIndex = nextHeading ? nextHeading.index : lines.length;

  // Capture from the matched heading through the end of the section.
  const section = lines.slice(match.index, endIndex).join("\n").trimEnd();
  return section;
}
