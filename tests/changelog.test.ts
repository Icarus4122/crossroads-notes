import { extractChangelogSection } from "../src/changelog";

const SAMPLE_CHANGELOG = `# Changelog

All notable changes to this project will be documented in this file.

## [2.2.1] - 2026-04-05

### Added
- **\`make_event()\` factory** — New canonical constructor in \`events.py\`

### Changed
- Confined canonicalization to \`bus.emit_legacy()\`

## [2.2.0] - 2026-03-15

### Added
- Initial workspace support

## [2.1.0] - 2026-02-01

### Fixed
- Various bug fixes
`;

describe("extractChangelogSection", () => {
  it("extracts the correct version section", () => {
    const result = extractChangelogSection(SAMPLE_CHANGELOG, "2.2.1");
    expect(result).toContain("## [2.2.1]");
    expect(result).toContain("make_event()");
    expect(result).toContain("bus.emit_legacy()");
    expect(result).not.toContain("## [2.2.0]");
  });

  it("extracts a middle version", () => {
    const result = extractChangelogSection(SAMPLE_CHANGELOG, "2.2.0");
    expect(result).toContain("## [2.2.0]");
    expect(result).toContain("Initial workspace support");
    expect(result).not.toContain("## [2.1.0]");
    expect(result).not.toContain("## [2.2.1]");
  });

  it("extracts the last version section (to EOF)", () => {
    const result = extractChangelogSection(SAMPLE_CHANGELOG, "2.1.0");
    expect(result).toContain("## [2.1.0]");
    expect(result).toContain("Various bug fixes");
  });

  it("returns fallback when version not found", () => {
    const result = extractChangelogSection(SAMPLE_CHANGELOG, "9.9.9");
    expect(result).toContain("No entry for version `9.9.9` found");
  });

  it("returns raw excerpt when no version headings at all", () => {
    const noHeadings = "# Changelog\n\nSome random text\nMore text\n";
    const result = extractChangelogSection(noHeadings, "1.0.0");
    expect(result).toContain("No version headings found");
    expect(result).toContain("Some random text");
  });

  it("handles empty content", () => {
    const result = extractChangelogSection("", "1.0.0");
    expect(result).toContain("No version headings found");
  });

  it("handles version with date suffix", () => {
    const cl = "## [1.0.0] - 2026-01-01\n\n### Added\n- Something\n";
    const result = extractChangelogSection(cl, "1.0.0");
    expect(result).toContain("## [1.0.0]");
    expect(result).toContain("Something");
  });
});
