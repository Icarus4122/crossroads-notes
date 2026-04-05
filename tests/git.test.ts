import { deriveTagPair, versionFromTag, buildLogArgs, parseOnelineLog } from "../src/git";

describe("deriveTagPair", () => {
  it("returns null for empty tag list", () => {
    expect(deriveTagPair([])).toBeNull();
  });

  it("returns current tag with no previous when only one tag", () => {
    const pair = deriveTagPair(["v2.2.1"]);
    expect(pair).toEqual({ currentTag: "v2.2.1", previousTag: null });
  });

  it("returns current and previous for two tags", () => {
    const pair = deriveTagPair(["v2.2.1", "v2.2.0"]);
    expect(pair).toEqual({ currentTag: "v2.2.1", previousTag: "v2.2.0" });
  });

  it("returns first two from a longer list", () => {
    const pair = deriveTagPair(["v3.0.0", "v2.2.1", "v2.2.0", "v1.0.0"]);
    expect(pair).toEqual({ currentTag: "v3.0.0", previousTag: "v2.2.1" });
  });
});

describe("versionFromTag", () => {
  it("strips leading v", () => {
    expect(versionFromTag("v2.2.1")).toBe("2.2.1");
  });

  it("returns as-is if no v prefix", () => {
    expect(versionFromTag("2.2.1")).toBe("2.2.1");
  });

  it("handles v0.1.0", () => {
    expect(versionFromTag("v0.1.0")).toBe("0.1.0");
  });
});

describe("buildLogArgs", () => {
  it("builds tag-to-tag range when previous tag exists", () => {
    const args = buildLogArgs({ currentTag: "v2.2.1", previousTag: "v2.2.0" });
    expect(args).toEqual(["log", "v2.2.0..v2.2.1", "--oneline"]);
  });

  it("builds first-release fallback when no previous tag", () => {
    const args = buildLogArgs({ currentTag: "v2.2.1", previousTag: null });
    expect(args).toEqual(["log", "v2.2.1", "--oneline", "-50"]);
  });
});

describe("parseOnelineLog", () => {
  it("parses standard oneline output", () => {
    const output = "56a9dba chore(release): bump version to 2.2.1\n49dc64f test(contract): pin contracts";
    const commits = parseOnelineLog(output);
    expect(commits).toEqual([
      { hash: "56a9dba", subject: "chore(release): bump version to 2.2.1" },
      { hash: "49dc64f", subject: "test(contract): pin contracts" },
    ]);
  });

  it("handles empty output", () => {
    expect(parseOnelineLog("")).toEqual([]);
  });

  it("handles hash-only lines", () => {
    const commits = parseOnelineLog("abc1234");
    expect(commits).toEqual([{ hash: "abc1234", subject: "" }]);
  });

  it("handles trailing newlines", () => {
    const output = "abc1234 subject\n\n";
    const commits = parseOnelineLog(output);
    expect(commits).toHaveLength(1);
    expect(commits[0].hash).toBe("abc1234");
  });
});
