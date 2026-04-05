/**
 * Crossroads: Create session note — §6.4.
 */
import { App, Notice, normalizePath as obsNormalize } from "obsidian";
import type { CrossroadsSettings } from "../types";
import { generateSlug } from "../slug";
import { buildSessionFrontmatter, serializeFrontmatter } from "../frontmatter";
import { sessionBody } from "../templates";
import { ensureFolder, openExistingOrPreview, promptText } from "./helpers";

function todayDateStr(): string {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function createSessionNote(app: App, settings: CrossroadsSettings): Promise<void> {
  // Prompt for session focus.
  const focus = await promptText(app, "Session focus", "e.g., contract stabilization");
  if (!focus) return;

  const slug = generateSlug(focus);
  if (!slug) {
    new Notice("Could not generate a valid slug from the focus description.");
    return;
  }

  const dateStr = todayDateStr();
  const fileName = `session-${dateStr}-${slug}.md`;
  const folder = settings.sessionsFolder;

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

  // Build note — project defaults to "shared" per spec.
  const fm = buildSessionFrontmatter({ dateStr, slug });
  const body = sessionBody({ title: focus, dateStr });
  const content = serializeFrontmatter(fm) + "\n\n" + body;

  await openExistingOrPreview(app, fullPath, false, content);
}
