/**
 * Git CLI wrapper — §9.3, §9.4, §9.5.
 *
 * Uses child_process.execFile exclusively. Never writes to the repo.
 */
import { execFile } from "child_process";
import type { TagPair, GitCommit } from "./types";

const EXEC_TIMEOUT = 10_000;

function exec(
  gitPath: string,
  args: string[],
  cwd: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(gitPath, args, { cwd, timeout: EXEC_TIMEOUT }, (err, stdout, stderr) => {
      if (err) {
        reject(new Error(stderr.trim() || err.message));
      } else {
        resolve(stdout.trim());
      }
    });
  });
}

/** List all tags sorted by version descending. Returns empty array if none. */
export async function listTags(gitPath: string, cwd: string): Promise<string[]> {
  const out = await exec(gitPath, ["tag", "--list", "--sort=-v:refname"], cwd);
  if (!out) return [];
  return out.split("\n").filter((t) => t.length > 0);
}

/** Derive the tag pair for the most recent release. */
export function deriveTagPair(tags: string[]): TagPair | null {
  if (tags.length === 0) return null;
  return {
    currentTag: tags[0],
    previousTag: tags.length > 1 ? tags[1] : null,
  };
}

/** Extract version string by stripping leading 'v'. */
export function versionFromTag(tag: string): string {
  return tag.startsWith("v") ? tag.slice(1) : tag;
}

/**
 * Build the git-log arguments for the commit range.
 *
 * If a previous tag exists: `<prev>..<current> --oneline`
 * If no previous tag (first release): `<current> --oneline -50`
 */
export function buildLogArgs(pair: TagPair): string[] {
  if (pair.previousTag) {
    return ["log", `${pair.previousTag}..${pair.currentTag}`, "--oneline"];
  }
  return ["log", pair.currentTag, "--oneline", "-50"];
}

/** Run git log and parse oneline output into GitCommit[]. */
export async function getCommits(
  gitPath: string,
  cwd: string,
  pair: TagPair
): Promise<GitCommit[]> {
  const args = buildLogArgs(pair);
  const out = await exec(gitPath, args, cwd);
  if (!out) return [];
  return parseOnelineLog(out);
}

/** Parse `--oneline` output. Each line: `<hash> <subject>`. */
export function parseOnelineLog(output: string): GitCommit[] {
  return output
    .split("\n")
    .filter((l) => l.length > 0)
    .map((line) => {
      const spaceIdx = line.indexOf(" ");
      if (spaceIdx === -1) return { hash: line, subject: "" };
      return { hash: line.substring(0, spaceIdx), subject: line.substring(spaceIdx + 1) };
    });
}
