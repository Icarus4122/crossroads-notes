/**
 * Frontmatter builders — pure functions, one per note type. §7.
 */
import type {
  WorkspaceFrontmatter,
  ReleaseFrontmatter,
  AdrFrontmatter,
  SessionFrontmatter,
  FindingFrontmatter,
  WorkspaceProfile,
  ProjectScope,
  AdrStatus,
  NoteFrontmatter,
} from "./types";

function isoNow(): string {
  return new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
}

function datestamp(): string {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

export function buildWorkspaceFrontmatter(opts: {
  sanitizedName: string;
  profile: WorkspaceProfile;
  workspaceName: string;
  workspacePath: string;
  sourceFile: string;
}): WorkspaceFrontmatter {
  const now = isoNow();
  const ds = datestamp();
  const tags: string[] = ["workspace", "empusa"];
  if (opts.profile !== "unknown") tags.push(opts.profile);
  return {
    id: `ws-${opts.sanitizedName}-${ds}`,
    type: "workspace",
    project: "empusa",
    created: now,
    updated: now,
    tags,
    profile: opts.profile,
    workspace_name: opts.workspaceName,
    workspace_path: opts.workspacePath,
    source_file: opts.sourceFile,
  };
}

export function buildReleaseFrontmatter(opts: {
  project: "empusa" | "hecate";
  version: string;
  tag: string;
  sourceFile: string;
}): ReleaseFrontmatter {
  const now = isoNow();
  const ds = datestamp();
  return {
    id: `release-${opts.project}-v${opts.version}-${ds}`,
    type: "release",
    project: opts.project,
    created: now,
    updated: now,
    tags: ["release", opts.project, `v${opts.version}`],
    version: opts.version,
    tag: opts.tag,
    repo: opts.project,
    source_file: opts.sourceFile,
  };
}

export function buildAdrFrontmatter(opts: {
  number: string;
  slug: string;
  project: ProjectScope;
}): AdrFrontmatter {
  const now = isoNow();
  const ds = datestamp();
  const tags: string[] = ["adr"];
  if (opts.project !== "shared") tags.push(opts.project);
  return {
    id: `adr-${opts.number}-${opts.slug}-${ds}`,
    type: "adr",
    project: opts.project,
    created: now,
    updated: now,
    tags,
    status: "proposed" as AdrStatus,
  };
}

export function buildSessionFrontmatter(opts: {
  dateStr: string;
  slug: string;
}): SessionFrontmatter {
  const now = isoNow();
  return {
    id: `session-${opts.dateStr}-${opts.slug}`,
    type: "session",
    project: "shared",
    created: now,
    updated: now,
    tags: ["session"],
  };
}

export function buildFindingFrontmatter(opts: {
  dateStr: string;
  slug: string;
  project: ProjectScope;
}): FindingFrontmatter {
  const now = isoNow();
  const tags: string[] = ["finding"];
  if (opts.project !== "shared") tags.push(opts.project);
  return {
    id: `finding-${opts.dateStr}-${opts.slug}`,
    type: "finding",
    project: opts.project,
    created: now,
    updated: now,
    tags,
    severity: "",
  };
}

/** Serialize frontmatter to a YAML string (with --- delimiters). */
export function serializeFrontmatter(fm: NoteFrontmatter): string {
  const lines: string[] = ["---"];
  lines.push(`id: ${fm.id}`);
  lines.push(`type: ${fm.type}`);
  lines.push(`project: ${fm.project}`);
  lines.push(`created: ${fm.created}`);
  lines.push(`updated: ${fm.updated}`);
  lines.push("tags:");
  for (const t of fm.tags) {
    lines.push(`  - ${t}`);
  }
  // Per-type extensions
  if (fm.type === "workspace") {
    const w = fm as WorkspaceFrontmatter;
    lines.push(`profile: ${w.profile}`);
    lines.push(`workspace_name: ${w.workspace_name}`);
    lines.push(`workspace_path: ${w.workspace_path}`);
    lines.push(`source_file: ${w.source_file}`);
  } else if (fm.type === "release") {
    const r = fm as ReleaseFrontmatter;
    lines.push(`version: "${r.version}"`);
    lines.push(`tag: ${r.tag}`);
    lines.push(`repo: ${r.repo}`);
    lines.push(`source_file: ${r.source_file}`);
  } else if (fm.type === "adr") {
    const a = fm as AdrFrontmatter;
    lines.push(`status: ${a.status}`);
  } else if (fm.type === "finding") {
    const f = fm as FindingFrontmatter;
    lines.push(`severity: "${f.severity}"`);
  }
  // session has no extensions
  lines.push("---");
  return lines.join("\n");
}
