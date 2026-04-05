/**
 * Crossroads: Create ADR note — §6.3.
 */
import { App, Notice, TFolder, normalizePath as obsNormalize } from "obsidian";
import type { CrossroadsSettings, ProjectScope } from "../types";
import { generateSlug, nextAdrNumber, padAdrNumber } from "../slug";
import { buildAdrFrontmatter, serializeFrontmatter } from "../frontmatter";
import { adrBody } from "../templates";
import { ensureFolder, openExistingOrPreview, promptText, promptChoice } from "./helpers";

export async function createAdrNote(app: App, settings: CrossroadsSettings): Promise<void> {
  // Step 1: Prompt for title.
  const title = await promptText(app, "ADR title", "e.g., Canonical event factory");
  if (!title) return;

  // Step 2: Prompt for project.
  const project = await promptChoice(app, "Select project", ["empusa", "hecate", "shared"]);
  if (!project) return;

  const slug = generateSlug(title);
  if (!slug) {
    new Notice("Could not generate a valid slug from the title.");
    return;
  }

  const folder = settings.adrFolder;

  // Ensure folder.
  const folderOk = await ensureFolder(app, folder, settings.confirmBeforeFolderCreate);
  if (!folderOk) return;

  // Scan for existing ADR files to determine next number.
  const normalizedFolder = obsNormalize(folder);
  const folderAbstract = app.vault.getAbstractFileByPath(normalizedFolder);
  let existingFiles: string[] = [];
  if (folderAbstract instanceof TFolder) {
    existingFiles = folderAbstract.children
      .filter((c) => c.name.endsWith(".md"))
      .map((c) => c.name);
  }

  const num = nextAdrNumber(existingFiles);
  const paddedNum = padAdrNumber(num);
  const fileName = `adr-${paddedNum}-${slug}.md`;

  // Check existing note.
  const fullPath = obsNormalize(`${folder}/${fileName}`);
  const existing = app.vault.getAbstractFileByPath(fullPath);
  if (existing) {
    await openExistingOrPreview(app, fullPath, true);
    return;
  }

  // Build note.
  const fm = buildAdrFrontmatter({
    number: paddedNum,
    slug,
    project: project as ProjectScope,
  });

  const body = adrBody({ number: paddedNum, title });
  const content = serializeFrontmatter(fm) + "\n\n" + body;

  await openExistingOrPreview(app, fullPath, false, content);
}
