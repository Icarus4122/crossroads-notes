/**
 * Body template builders — pure functions, one per note type. §6.
 *
 * Each returns the Markdown body content (without frontmatter).
 */
import type { GitCommit } from "./types";

export function workspaceBody(opts: {
  name: string;
  profile: string;
  path: string;
  createdAt: string;
  templatesSeeded: string[];
}): string {
  const tpl = opts.templatesSeeded.length > 0 ? opts.templatesSeeded.join(", ") : "None";
  return `# Workspace: ${opts.name}

## Metadata
<!-- generated:start — safe to regenerate -->
| Field | Value |
|---|---|
| Profile | ${opts.profile} |
| Name | ${opts.name} |
| Path | \`${opts.path}\` |
| Created | ${opts.createdAt} |
| Templates seeded | ${tpl} |
<!-- generated:end -->

## Objectives

_What is the goal of this workspace?_

## Notes

## Findings

## References
`;
}

export function releaseReviewBody(opts: {
  project: string;
  version: string;
  changelogSection: string;
  commits: GitCommit[];
  firstRelease: boolean;
  currentTag: string;
}): string {
  let commitTable: string;
  if (opts.commits.length === 0) {
    commitTable = "_(No commits found)_";
  } else {
    const rows = opts.commits.map((c) => `| ${c.hash} | ${c.subject} |`).join("\n");
    commitTable = `| Hash | Subject |\n|---|---|\n${rows}`;
    if (opts.firstRelease) {
      commitTable += `\n\n_First release — showing up to 50 commits reachable from \`${opts.currentTag}\`._`;
    }
  }

  return `# Release Review: ${opts.project} v${opts.version}

## Changelog Entry
<!-- generated:start — safe to regenerate -->
${opts.changelogSection}
<!-- generated:end -->

## Commits in This Release
<!-- generated:start — safe to regenerate -->
${commitTable}
<!-- generated:end -->

## Assessment

_Does this release meet the stated goals?_

## Issues Found

## Sign-off

- [ ] Changelog complete
- [ ] Tests passing
- [ ] Tag applied
- [ ] No regressions observed
`;
}

export function adrBody(opts: { number: string; title: string }): string {
  return `# ADR-${opts.number}: ${opts.title}

## Status

Proposed

## Context

_What is the issue motivating this decision?_

## Decision

_What is the change being proposed or applied?_

## Consequences

_What becomes easier or harder as a result?_

## References
`;
}

export function sessionBody(opts: { title: string; dateStr: string }): string {
  return `# Session: ${opts.title} — ${opts.dateStr}

## Goal

_What are you trying to accomplish?_

## Work Log

## Decisions Made

## Open Questions

## Next Steps
`;
}

export function findingBody(opts: { title: string }): string {
  return `# Finding: ${opts.title}

## Summary

_One-paragraph description._

## Evidence

## Impact

## Reproduction Steps

## Remediation

## References
`;
}
