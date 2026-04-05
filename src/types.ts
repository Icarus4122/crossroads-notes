/** Note type enum — the five v1 note types. */
export type NoteType = "workspace" | "release" | "adr" | "session" | "finding";

/** Project scope enum. */
export type ProjectScope = "empusa" | "hecate" | "shared";

/** Workspace profile enum. */
export type WorkspaceProfile = "htb" | "build" | "research" | "internal" | "unknown";

/** ADR status enum. */
export type AdrStatus = "proposed" | "accepted" | "deprecated" | "superseded";

/** Universal frontmatter fields present on every generated note. */
export interface BaseFrontmatter {
  id: string;
  type: NoteType;
  project: ProjectScope;
  created: string;
  updated: string;
  tags: string[];
}

/** Workspace note frontmatter. */
export interface WorkspaceFrontmatter extends BaseFrontmatter {
  type: "workspace";
  profile: WorkspaceProfile;
  workspace_name: string;
  workspace_path: string;
  source_file: string;
}

/** Release review note frontmatter. */
export interface ReleaseFrontmatter extends BaseFrontmatter {
  type: "release";
  version: string;
  tag: string;
  repo: "empusa" | "hecate";
  source_file: string;
}

/** ADR note frontmatter. */
export interface AdrFrontmatter extends BaseFrontmatter {
  type: "adr";
  status: AdrStatus;
}

/** Session note frontmatter. */
export interface SessionFrontmatter extends BaseFrontmatter {
  type: "session";
}

/** Finding note frontmatter. */
export interface FindingFrontmatter extends BaseFrontmatter {
  type: "finding";
  severity: string;
}

/** Union of all note frontmatter types. */
export type NoteFrontmatter =
  | WorkspaceFrontmatter
  | ReleaseFrontmatter
  | AdrFrontmatter
  | SessionFrontmatter
  | FindingFrontmatter;

/** Plugin settings — matches §12 exactly. */
export interface CrossroadsSettings {
  empusaRepoPath: string;
  hecateRepoPath: string;
  workspacesFolder: string;
  releasesFolder: string;
  adrFolder: string;
  sessionsFolder: string;
  findingsFolder: string;
  confirmBeforeFolderCreate: boolean;
  gitExecutablePath: string;
}

/** Parsed .empusa-workspace.json shape. */
export interface EmpusaWorkspaceJson {
  profile?: string;
  name?: string;
  path?: string;
  created_at?: string;
  templates_seeded?: string[];
}

/** Git tag pair for release review. */
export interface TagPair {
  currentTag: string;
  previousTag: string | null;
}

/** A single git log entry (short hash + subject). */
export interface GitCommit {
  hash: string;
  subject: string;
}
