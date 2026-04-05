/**
 * Crossroads: Create workspace note — §6.1, §8.
 */
import { App, Notice, normalizePath as obsNormalize } from "obsidian";
import type { CrossroadsSettings } from "../types";
import { parseWorkspaceJson } from "../workspace-json";
import { sanitizeWorkspaceName } from "../slug";
import { buildWorkspaceFrontmatter, serializeFrontmatter } from "../frontmatter";
import { workspaceBody } from "../templates";
import { normalizePath, toStoredPath } from "../paths";
import { ensureFolder, openExistingOrPreview } from "./helpers";

export async function createWorkspaceNote(app: App, settings: CrossroadsSettings): Promise<void> {
  // Step 1: File-open dialog — user selects the .empusa-workspace.json file.
  const files = await selectJsonFile();
  if (!files || files.length === 0) return; // user cancelled

  const filePath = files[0];
  let raw: string;
  try {
    raw = await readNativeFile(filePath);
  } catch (e: unknown) {
    new Notice(`Failed to read file: ${(e as Error).message}`);
    return;
  }

  // Step 2: Parse and validate.
  let parsed;
  try {
    parsed = parseWorkspaceJson(raw);
  } catch (e: unknown) {
    new Notice((e as Error).message);
    return;
  }

  // Step 3: Build paths.
  const sanitizedName = sanitizeWorkspaceName(parsed.name);
  const fileName = `ws-${sanitizedName}.md`;
  const folder = settings.workspacesFolder;

  // Ensure folder exists.
  const folderOk = await ensureFolder(app, folder, settings.confirmBeforeFolderCreate);
  if (!folderOk) return;

  // Check for existing note.
  const fullPath = obsNormalize(`${folder}/${fileName}`);
  const existing = app.vault.getAbstractFileByPath(fullPath);
  if (existing) {
    await openExistingOrPreview(app, fullPath, true);
    return;
  }

  // Step 4: Compute source_file — absolute because workspace JSONs live outside repo tree.
  const normalizedFilePath = normalizePath(filePath);
  const repoRoots = [settings.empusaRepoPath, settings.hecateRepoPath];
  const sourceFile = toStoredPath(normalizedFilePath, repoRoots);

  // Step 5: Build frontmatter and body.
  const fm = buildWorkspaceFrontmatter({
    sanitizedName,
    profile: parsed.profile,
    workspaceName: parsed.name,
    workspacePath: parsed.path,
    sourceFile,
  });

  const body = workspaceBody({
    name: parsed.name,
    profile: parsed.profile,
    path: parsed.path,
    createdAt: parsed.createdAt,
    templatesSeeded: parsed.templatesSeeded,
  });

  const content = serializeFrontmatter(fm) + "\n\n" + body;

  // Step 6: Preview and confirm before writing.
  await openExistingOrPreview(app, fullPath, false, content);
}

/** Use the Electron/browser file input to select a JSON file. */
function selectJsonFile(): Promise<string[] | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.style.display = "none";
    input.addEventListener("change", () => {
      if (input.files && input.files.length > 0) {
        const paths: string[] = [];
        for (let i = 0; i < input.files.length; i++) {
          // Electron File objects have a `path` property.
          const f = input.files[i] as File & { path?: string };
          paths.push(f.path ?? f.name);
        }
        resolve(paths);
      } else {
        resolve(null);
      }
      input.remove();
    });
    input.addEventListener("cancel", () => {
      resolve(null);
      input.remove();
    });
    document.body.appendChild(input);
    input.click();
  });
}

/** Read a file from the native filesystem (outside the vault). */
function readNativeFile(filePath: string): Promise<string> {
  // In Electron, we can use Node's fs.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fs = require("fs") as typeof import("fs");
  return fs.promises.readFile(filePath, "utf-8");
}
