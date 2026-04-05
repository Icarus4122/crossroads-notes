import { generateSlug, sanitizeWorkspaceName, nextAdrNumber, padAdrNumber } from "../src/slug";

describe("generateSlug", () => {
  it("lowercases and replaces spaces with hyphens", () => {
    expect(generateSlug("Contract Stabilization")).toBe("contract-stabilization");
  });

  it("strips non-alphanumeric-non-hyphen characters", () => {
    expect(generateSlug("SSRF in API gateway!@#")).toBe("ssrf-in-api-gateway");
  });

  it("collapses consecutive hyphens", () => {
    expect(generateSlug("foo---bar")).toBe("foo-bar");
  });

  it("trims leading and trailing hyphens", () => {
    expect(generateSlug("--hello-world--")).toBe("hello-world");
  });

  it("truncates at 60 chars on a word boundary", () => {
    const long = "a-very-long-slug-that-exceeds-sixty-characters-and-needs-to-be-truncated-at-a-boundary";
    const result = generateSlug(long);
    expect(result.length).toBeLessThanOrEqual(60);
    expect(result).not.toMatch(/-$/);
  });

  it("returns empty string for empty input", () => {
    expect(generateSlug("")).toBe("");
  });

  it("returns empty string for all-special-characters input", () => {
    expect(generateSlug("!!!@@@")).toBe("");
  });

  it("handles single character", () => {
    expect(generateSlug("X")).toBe("x");
  });

  it("handles numbers", () => {
    expect(generateSlug("release 2.2.1")).toBe("release-221");
  });

  it("handles unicode by stripping", () => {
    expect(generateSlug("café latte")).toBe("caf-latte");
  });
});

describe("sanitizeWorkspaceName", () => {
  it("lowercases and converts dots/underscores to hyphens", () => {
    expect(sanitizeWorkspaceName("HTB_Pilgrimage.v2")).toBe("htb-pilgrimage-v2");
  });

  it("handles names that are already clean", () => {
    expect(sanitizeWorkspaceName("htb-pilgrimage")).toBe("htb-pilgrimage");
  });

  it("strips special characters", () => {
    expect(sanitizeWorkspaceName("test@name#1")).toBe("testname1");
  });
});

describe("nextAdrNumber", () => {
  it("returns 1 for empty array", () => {
    expect(nextAdrNumber([])).toBe(1);
  });

  it("returns max + 1", () => {
    expect(nextAdrNumber(["adr-001-foo.md", "adr-003-bar.md"])).toBe(4);
  });

  it("ignores non-ADR files", () => {
    expect(nextAdrNumber(["readme.md", "adr-002-baz.md", "notes.md"])).toBe(3);
  });

  it("handles single file", () => {
    expect(nextAdrNumber(["adr-010-something.md"])).toBe(11);
  });
});

describe("padAdrNumber", () => {
  it("pads single digit", () => {
    expect(padAdrNumber(1)).toBe("001");
  });

  it("pads double digit", () => {
    expect(padAdrNumber(42)).toBe("042");
  });

  it("does not pad triple digit", () => {
    expect(padAdrNumber(999)).toBe("999");
  });
});
