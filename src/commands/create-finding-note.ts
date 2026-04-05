/**
 * Crossroads: Create finding note — §6.5.
 */
import { App, Notice, normalizePath as obsNormalize } from "obsidian";
import type { CrossroadsSettings, ProjectScope } from "../types";
import { generateSlug } from "../slug";
import { buildFindingFrontmatter, serializeFrontmatter } from "../frontmatter";
import { findingBody } from "../templates";
import { ensureFolder, openExistingOrPreview, promptText, promptChoice } from "./helpers";

function todayDateStr(): string {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function createFindingNote(app: App, settings: CrossroadsSettings): Promise<void> {
  // Prompt for title.
  const title = await promptText(app, "Finding title", "e.g., SSRF in API gateway");
  if (!title) return;

  // Prompt for project.
  const project = await promptChoice(app, "Select project", ["empusa", "hecate", "shared"]);
  if (!project) return;

  const slug = generateSlug(title);
  if (!slug) {
    new Notice("Could not generate a valid slug from the title.");
    return;
  }

  const dateStr = todayDateStr();
  const fileName = `finding-${dateStr}-${slug}.md`;
  const folder = settings.findingsFolder;

  // Ensure folder.
  const folderOk = await ensureFolder(app, folder, settings.confirmBeforeFolderCreate);
  if (!folderOk) return;

  // Check existing.
  const fullPath = obsNormalize(`${folder}/${fileName}`);
  const existing = app.vault.getAbstractFileByPath(fullPath);
  if (existing) {
    await openExistingOrPreview(app, fullPath, true);
    return;
  }

  const fm = buildFindingFrontmatter({
    dateStr,
    slug,
    project: project as ProjectScope,
  });

  const body = findingBody({ title });
  const content = serializeFrontmatter(fm) + "\n\n" + body;

  await openExistingOrPreview(app, fullPath, false, content);
}
