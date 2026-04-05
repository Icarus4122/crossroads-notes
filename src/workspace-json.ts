/**
 * .empusa-workspace.json reader and validator — §8.
 */
import type { EmpusaWorkspaceJson, WorkspaceProfile } from "./types";

export interface ParsedWorkspace {
  name: string;
  profile: WorkspaceProfile;
  path: string;
  createdAt: string;
  templatesSeeded: string[];
}

const VALID_PROFILES = new Set<string>(["htb", "build", "research", "internal"]);

/**
 * Parse raw JSON content into a validated workspace object.
 *
 * @throws Error if JSON is invalid or `name` is missing.
 * @returns ParsedWorkspace with defaults applied for optional fields.
 */
export function parseWorkspaceJson(raw: string): ParsedWorkspace {
  let data: EmpusaWorkspaceJson;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error("Failed to parse: not valid JSON.");
  }

  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    throw new Error("Failed to parse: not valid JSON.");
  }

  if (!data.name || typeof data.name !== "string" || data.name.trim() === "") {
    throw new Error("Workspace file missing required field: name.");
  }

  const profile: WorkspaceProfile =
    typeof data.profile === "string" && VALID_PROFILES.has(data.profile)
      ? (data.profile as WorkspaceProfile)
      : "unknown";

  const path = typeof data.path === "string" ? data.path : "(not recorded)";
  const createdAt = typeof data.created_at === "string" ? data.created_at : "(not recorded)";
  const templatesSeeded = Array.isArray(data.templates_seeded)
    ? data.templates_seeded.filter((t): t is string => typeof t === "string")
    : [];

  return {
    name: data.name.trim(),
    profile,
    path,
    createdAt,
    templatesSeeded,
  };
}
