import {
  buildWorkspaceFrontmatter,
  buildReleaseFrontmatter,
  buildAdrFrontmatter,
  buildSessionFrontmatter,
  buildFindingFrontmatter,
  serializeFrontmatter,
} from "../src/frontmatter";

describe("buildWorkspaceFrontmatter", () => {
  it("produces correct type and project", () => {
    const fm = buildWorkspaceFrontmatter({
      sanitizedName: "htb-pilgrimage",
      profile: "htb",
      workspaceName: "htb-pilgrimage",
      workspacePath: "/opt/lab/workspaces/htb-pilgrimage",
      sourceFile: "/opt/lab/workspaces/htb-pilgrimage/.empusa-workspace.json",
    });
    expect(fm.type).toBe("workspace");
    expect(fm.project).toBe("empusa");
    expect(fm.profile).toBe("htb");
    expect(fm.workspace_name).toBe("htb-pilgrimage");
    expect(fm.workspace_path).toBe("/opt/lab/workspaces/htb-pilgrimage");
    expect(fm.source_file).toBe("/opt/lab/workspaces/htb-pilgrimage/.empusa-workspace.json");
    expect(fm.tags).toContain("workspace");
    expect(fm.tags).toContain("empusa");
    expect(fm.tags).toContain("htb");
  });

  it("does not include profile tag when unknown", () => {
    const fm = buildWorkspaceFrontmatter({
      sanitizedName: "test",
      profile: "unknown",
      workspaceName: "test",
      workspacePath: "/tmp/test",
      sourceFile: "/tmp/test/.empusa-workspace.json",
    });
    expect(fm.tags).not.toContain("unknown");
  });

  it("sets created and updated to same value", () => {
    const fm = buildWorkspaceFrontmatter({
      sanitizedName: "test",
      profile: "htb",
      workspaceName: "test",
      workspacePath: "/tmp/test",
      sourceFile: "/tmp/test/.empusa-workspace.json",
    });
    expect(fm.created).toBe(fm.updated);
  });

  it("id starts with ws-", () => {
    const fm = buildWorkspaceFrontmatter({
      sanitizedName: "my-ws",
      profile: "build",
      workspaceName: "my-ws",
      workspacePath: "/tmp/my-ws",
      sourceFile: "/tmp/my-ws/.empusa-workspace.json",
    });
    expect(fm.id).toMatch(/^ws-my-ws-\d{8}$/);
  });
});

describe("buildReleaseFrontmatter", () => {
  it("produces correct structure", () => {
    const fm = buildReleaseFrontmatter({
      project: "empusa",
      version: "2.2.1",
      tag: "v2.2.1",
      sourceFile: "CHANGELOG.md",
    });
    expect(fm.type).toBe("release");
    expect(fm.project).toBe("empusa");
    expect(fm.version).toBe("2.2.1");
    expect(fm.tag).toBe("v2.2.1");
    expect(fm.repo).toBe("empusa");
    expect(fm.source_file).toBe("CHANGELOG.md");
    expect(fm.tags).toEqual(["release", "empusa", "v2.2.1"]);
    expect(fm.id).toMatch(/^release-empusa-v2\.2\.1-\d{8}$/);
  });

  it("works for hecate project", () => {
    const fm = buildReleaseFrontmatter({
      project: "hecate",
      version: "0.1.0",
      tag: "v0.1.0",
      sourceFile: "CHANGELOG.md",
    });
    expect(fm.repo).toBe("hecate");
    expect(fm.tags).toContain("hecate");
  });
});

describe("buildAdrFrontmatter", () => {
  it("produces proposed status", () => {
    const fm = buildAdrFrontmatter({
      number: "001",
      slug: "canonical-event-factory",
      project: "empusa",
    });
    expect(fm.status).toBe("proposed");
    expect(fm.type).toBe("adr");
    expect(fm.tags).toEqual(["adr", "empusa"]);
  });

  it("omits project from tags when shared", () => {
    const fm = buildAdrFrontmatter({
      number: "002",
      slug: "path-normalization",
      project: "shared",
    });
    expect(fm.tags).toEqual(["adr"]);
  });
});

describe("buildSessionFrontmatter", () => {
  it("uses shared project", () => {
    const fm = buildSessionFrontmatter({
      dateStr: "2026-04-05",
      slug: "contract-stabilization",
    });
    expect(fm.project).toBe("shared");
    expect(fm.type).toBe("session");
    expect(fm.tags).toEqual(["session"]);
    expect(fm.id).toBe("session-2026-04-05-contract-stabilization");
  });
});

describe("buildFindingFrontmatter", () => {
  it("has empty severity", () => {
    const fm = buildFindingFrontmatter({
      dateStr: "2026-04-05",
      slug: "ssrf-in-api-gateway",
      project: "empusa",
    });
    expect(fm.severity).toBe("");
    expect(fm.type).toBe("finding");
    expect(fm.tags).toEqual(["finding", "empusa"]);
  });
});

describe("serializeFrontmatter", () => {
  it("produces valid YAML-like output with delimiters", () => {
    const fm = buildSessionFrontmatter({
      dateStr: "2026-04-05",
      slug: "test",
    });
    const yaml = serializeFrontmatter(fm);
    expect(yaml.startsWith("---")).toBe(true);
    expect(yaml.endsWith("---")).toBe(true);
    expect(yaml).toContain("type: session");
    expect(yaml).toContain("project: shared");
    expect(yaml).toContain("  - session");
  });

  it("quotes version in release frontmatter", () => {
    const fm = buildReleaseFrontmatter({
      project: "empusa",
      version: "2.2.1",
      tag: "v2.2.1",
      sourceFile: "CHANGELOG.md",
    });
    const yaml = serializeFrontmatter(fm);
    expect(yaml).toContain('version: "2.2.1"');
  });

  it("includes workspace-specific fields", () => {
    const fm = buildWorkspaceFrontmatter({
      sanitizedName: "test",
      profile: "htb",
      workspaceName: "test-ws",
      workspacePath: "/opt/lab/test",
      sourceFile: "/opt/lab/test/.empusa-workspace.json",
    });
    const yaml = serializeFrontmatter(fm);
    expect(yaml).toContain("profile: htb");
    expect(yaml).toContain("workspace_name: test-ws");
    expect(yaml).toContain("workspace_path: /opt/lab/test");
    expect(yaml).toContain("source_file: /opt/lab/test/.empusa-workspace.json");
  });

  it("includes finding severity as quoted empty string", () => {
    const fm = buildFindingFrontmatter({
      dateStr: "2026-04-05",
      slug: "test",
      project: "empusa",
    });
    const yaml = serializeFrontmatter(fm);
    expect(yaml).toContain('severity: ""');
  });
});
