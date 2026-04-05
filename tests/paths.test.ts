import {
  normalizePath,
  isAbsolutePath,
  toStoredPath,
  resolveStoredPath,
  parentDir,
} from "../src/paths";

describe("normalizePath", () => {
  it("converts backslashes to forward slashes", () => {
    expect(normalizePath("C:\\Users\\test\\file")).toBe("C:/Users/test/file");
  });

  it("strips trailing slash", () => {
    expect(normalizePath("/opt/lab/")).toBe("/opt/lab");
  });

  it("does not strip root slash", () => {
    expect(normalizePath("/")).toBe("/");
  });

  it("handles already-normalized paths", () => {
    expect(normalizePath("/opt/lab/workspaces")).toBe("/opt/lab/workspaces");
  });

  it("handles mixed separators", () => {
    expect(normalizePath("C:\\Users/test\\file.txt")).toBe("C:/Users/test/file.txt");
  });
});

describe("isAbsolutePath", () => {
  it("detects Unix absolute paths", () => {
    expect(isAbsolutePath("/opt/lab/workspaces")).toBe(true);
  });

  it("detects Windows drive-letter paths", () => {
    expect(isAbsolutePath("C:/Users/test")).toBe(true);
  });

  it("detects lowercase drive letter", () => {
    expect(isAbsolutePath("d:/projects")).toBe(true);
  });

  it("returns false for relative paths", () => {
    expect(isAbsolutePath("CHANGELOG.md")).toBe(false);
  });

  it("returns false for dotted relative paths", () => {
    expect(isAbsolutePath("./src/main.ts")).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isAbsolutePath("")).toBe(false);
  });
});

describe("toStoredPath", () => {
  it("produces repo-relative when inside repo root", () => {
    const result = toStoredPath(
      "/home/user/projects/empusa/CHANGELOG.md",
      ["/home/user/projects/empusa"]
    );
    expect(result).toBe("CHANGELOG.md");
  });

  it("produces absolute when outside all repo roots", () => {
    const result = toStoredPath(
      "/opt/lab/workspaces/htb-pilgrimage/.empusa-workspace.json",
      ["/home/user/projects/empusa", "/home/user/projects/hecate"]
    );
    expect(result).toBe("/opt/lab/workspaces/htb-pilgrimage/.empusa-workspace.json");
  });

  it("handles empty repo roots gracefully", () => {
    const result = toStoredPath("/opt/lab/file.json", ["", ""]);
    expect(result).toBe("/opt/lab/file.json");
  });

  it("handles deeply nested repo-relative path", () => {
    const result = toStoredPath(
      "/home/user/projects/empusa/src/deep/nested/file.ts",
      ["/home/user/projects/empusa"]
    );
    expect(result).toBe("src/deep/nested/file.ts");
  });

  it("does not match partial directory names", () => {
    // /home/user/projects/empusa2 should not match /home/user/projects/empusa
    const result = toStoredPath(
      "/home/user/projects/empusa2/file.txt",
      ["/home/user/projects/empusa"]
    );
    expect(result).toBe("/home/user/projects/empusa2/file.txt");
  });

  it("normalizes backslashes in input", () => {
    const result = toStoredPath(
      "C:\\Users\\test\\empusa\\CHANGELOG.md",
      ["C:\\Users\\test\\empusa"]
    );
    expect(result).toBe("CHANGELOG.md");
  });
});

describe("resolveStoredPath", () => {
  it("returns absolute path as-is", () => {
    expect(resolveStoredPath("/opt/lab/file.json", null)).toBe("/opt/lab/file.json");
  });

  it("resolves relative path against repo root", () => {
    expect(resolveStoredPath("CHANGELOG.md", "/home/user/empusa")).toBe(
      "/home/user/empusa/CHANGELOG.md"
    );
  });

  it("returns null for relative path without repo root", () => {
    expect(resolveStoredPath("CHANGELOG.md", null)).toBeNull();
  });

  it("handles Windows absolute paths", () => {
    expect(resolveStoredPath("C:/Users/test/file.txt", null)).toBe("C:/Users/test/file.txt");
  });
});

describe("parentDir", () => {
  it("returns parent of a file path", () => {
    expect(parentDir("/opt/lab/workspaces/htb/.empusa-workspace.json")).toBe(
      "/opt/lab/workspaces/htb"
    );
  });

  it("returns parent of a directory path", () => {
    expect(parentDir("/opt/lab/workspaces/htb")).toBe("/opt/lab/workspaces");
  });

  it("handles root-level path", () => {
    expect(parentDir("/file.txt")).toBe("/file.txt");
  });
});
