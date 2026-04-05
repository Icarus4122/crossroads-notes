import { parseWorkspaceJson } from "../src/workspace-json";

describe("parseWorkspaceJson", () => {
  it("parses a complete workspace JSON", () => {
    const raw = JSON.stringify({
      profile: "htb",
      name: "htb-pilgrimage",
      path: "/opt/lab/workspaces/htb-pilgrimage",
      created_at: "2026-04-05T12:30:00Z",
      templates_seeded: ["engagement.md", "target.md"],
    });
    const result = parseWorkspaceJson(raw);
    expect(result.name).toBe("htb-pilgrimage");
    expect(result.profile).toBe("htb");
    expect(result.path).toBe("/opt/lab/workspaces/htb-pilgrimage");
    expect(result.createdAt).toBe("2026-04-05T12:30:00Z");
    expect(result.templatesSeeded).toEqual(["engagement.md", "target.md"]);
  });

  it("throws on invalid JSON", () => {
    expect(() => parseWorkspaceJson("{not valid")).toThrow("not valid JSON");
  });

  it("throws on missing name field", () => {
    const raw = JSON.stringify({ profile: "htb", path: "/tmp" });
    expect(() => parseWorkspaceJson(raw)).toThrow("missing required field: name");
  });

  it("throws on empty-string name", () => {
    const raw = JSON.stringify({ name: "  " });
    expect(() => parseWorkspaceJson(raw)).toThrow("missing required field: name");
  });

  it("defaults profile to unknown when missing", () => {
    const raw = JSON.stringify({ name: "test" });
    const result = parseWorkspaceJson(raw);
    expect(result.profile).toBe("unknown");
  });

  it("defaults profile to unknown when invalid", () => {
    const raw = JSON.stringify({ name: "test", profile: "custom" });
    const result = parseWorkspaceJson(raw);
    expect(result.profile).toBe("unknown");
  });

  it("defaults path when missing", () => {
    const raw = JSON.stringify({ name: "test" });
    const result = parseWorkspaceJson(raw);
    expect(result.path).toBe("(not recorded)");
  });

  it("defaults created_at when missing", () => {
    const raw = JSON.stringify({ name: "test" });
    const result = parseWorkspaceJson(raw);
    expect(result.createdAt).toBe("(not recorded)");
  });

  it("defaults templates_seeded to empty array when missing", () => {
    const raw = JSON.stringify({ name: "test" });
    const result = parseWorkspaceJson(raw);
    expect(result.templatesSeeded).toEqual([]);
  });

  it("filters non-string entries from templates_seeded", () => {
    const raw = JSON.stringify({
      name: "test",
      templates_seeded: ["a.md", 42, null, "b.md"],
    });
    const result = parseWorkspaceJson(raw);
    expect(result.templatesSeeded).toEqual(["a.md", "b.md"]);
  });

  it("throws on array input", () => {
    expect(() => parseWorkspaceJson("[]")).toThrow("not valid JSON");
  });

  it("throws on null input", () => {
    expect(() => parseWorkspaceJson("null")).toThrow("not valid JSON");
  });

  it("trims the name field", () => {
    const raw = JSON.stringify({ name: "  test-ws  " });
    const result = parseWorkspaceJson(raw);
    expect(result.name).toBe("test-ws");
  });

  it("accepts all valid profiles", () => {
    for (const p of ["htb", "build", "research", "internal"]) {
      const raw = JSON.stringify({ name: "test", profile: p });
      const result = parseWorkspaceJson(raw);
      expect(result.profile).toBe(p);
    }
  });
});
