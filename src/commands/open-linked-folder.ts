/**
 * Crossroads: Open linked code folder — §6.6, §11.3.
 */
import { App, Notice, TFile } from "obsidian";
import type { CrossroadsSettings } from "../types";
import { isAbsolutePath, resolveStoredPath, parentDir, toPlatformPath } from "../paths";

export async function openLinkedFolder(app: App, settings: CrossroadsSettings): Promise<void> {
  // Get the active file's frontmatter.
  const activeFile = app.workspace.getActiveFile();
  if (!activeFile || !(activeFile instanceof TFile)) {
    new Notice("No active note open.");
    return;
  }

  const cache = app.metadataCache.getFileCache(activeFile);
  const fm = cache?.frontmatter;
  if (!fm) {
    new Notice("No linked code path in this note.");
    return;
  }

  // Resolution priority per §11.3:
  // 1. workspace_path — absolute, open directly.
  // 2. source_file — if absolute, open parent dir; if relative, resolve against repo root.
  // 3. Neither → notice.

  let targetDir: string | null = null;

  if (fm.workspace_path && typeof fm.workspace_path === "string") {
    targetDir = fm.workspace_path;
  } else if (fm.source_file && typeof fm.source_file === "string") {
    const sf = fm.source_file as string;
    if (isAbsolutePath(sf)) {
      targetDir = parentDir(sf);
    } else {
      // Relative — need repo root.
      const project = fm.repo || fm.project;
      const repoRoot = getRepoRoot(settings, project);
      if (!repoRoot) {
        const settingName = project === "empusa" ? "empusaRepoPath" : "hecateRepoPath";
        new Notice(`Configure '${settingName}' in Crossroads Notes settings.`);
        return;
      }
      const resolved = resolveStoredPath(sf, repoRoot);
      if (resolved) {
        targetDir = parentDir(resolved);
      }
    }
  }

  if (!targetDir) {
    new Notice("No linked code path in this note.");
    return;
  }

  // Check if directory exists, then open.
  const platformPath = toPlatformPath(targetDir);
  try {
    const fs = require("fs") as typeof import("fs");
    const stat = await fs.promises.stat(platformPath);
    if (!stat.isDirectory()) {
      new Notice(`Linked path not found: ${platformPath}`);
      return;
    }
  } catch {
    new Notice(`Linked path not found: ${platformPath}`);
    return;
  }

  // Open in system file manager via Electron shell.
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const electron = require("electron");
    electron.shell.openPath(platformPath);
  } catch {
    new Notice(`Opened: ${platformPath}`);
  }
}

function getRepoRoot(settings: CrossroadsSettings, project: string | undefined): string | null {
  if (project === "empusa" && settings.empusaRepoPath) return settings.empusaRepoPath;
  if (project === "hecate" && settings.hecateRepoPath) return settings.hecateRepoPath;
  return null;
}
