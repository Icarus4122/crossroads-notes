/**
 * Crossroads: Create release review note — §6.2, §9.
 */
import { App, Notice, normalizePath as obsNormalize } from "obsidian";
import type { CrossroadsSettings } from "../types";
import { listTags, deriveTagPair, versionFromTag, getCommits } from "../git";
import { extractChangelogSection } from "../changelog";
import { buildReleaseFrontmatter, serializeFrontmatter } from "../frontmatter";
import { releaseReviewBody } from "../templates";
import { ensureFolder, openExistingOrPreview, promptChoice } from "./helpers";

export async function createReleaseNote(app: App, settings: CrossroadsSettings): Promise<void> {
  // Step 1: Prompt for project.
  const project = await promptChoice(app, "Select project", ["empusa", "hecate"]);
  if (!project) return;

  // Step 2: Look up the configured repo root.
  const repoRoot =
    project === "empusa" ? settings.empusaRepoPath : settings.hecateRepoPath;
  if (!repoRoot) {
    new Notice(
      `Configure '${project === "empusa" ? "empusaRepoPath" : "hecateRepoPath"}' in Crossroads Notes settings.`
    );
    return;
  }

  // Step 3: Get tags.
  let tags: string[];
  try {
    tags = await listTags(settings.gitExecutablePath, repoRoot);
  } catch (e: unknown) {
    new Notice(`git not found. Cannot create release review note.`);
    return;
  }

  if (tags.length === 0) {
    new Notice(`No tags found in ${project}. Cannot create a release review note.`);
    return;
  }

  const pair = deriveTagPair(tags);
  if (!pair) return; // shouldn't happen given tags.length > 0

  const version = versionFromTag(pair.currentTag);
  const fileName = `release-${project}-v${version}.md`;
  const folder = settings.releasesFolder;

  // Ensure folder exists.
  const folderOk = await ensureFolder(app, folder, settings.confirmBeforeFolderCreate);
  if (!folderOk) return;

  // Check existing note.
  const fullPath = obsNormalize(`${folder}/${fileName}`);
  const existing = app.vault.getAbstractFileByPath(fullPath);
  if (existing) {
    await openExistingOrPreview(app, fullPath, true);
    return;
  }

  // Step 4: Get commits.
  let commits;
  try {
    commits = await getCommits(settings.gitExecutablePath, repoRoot, pair);
  } catch (e: unknown) {
    new Notice(`Git error: ${(e as Error).message}`);
    return;
  }

  // Step 5: Read changelog.
  let changelogSection: string;
  try {
    const fs = require("fs") as typeof import("fs");
    const changelogPath = require("path").join(repoRoot, "CHANGELOG.md");
    const content = await fs.promises.readFile(changelogPath, "utf-8");
    changelogSection = extractChangelogSection(content, version);
  } catch {
    new Notice("No CHANGELOG.md found.");
    changelogSection = "_(No changelog found)_";
  }

  // Step 6: Build note.
  const fm = buildReleaseFrontmatter({
    project: project as "empusa" | "hecate",
    version,
    tag: pair.currentTag,
    sourceFile: "CHANGELOG.md",
  });

  const body = releaseReviewBody({
    project,
    version,
    changelogSection,
    commits,
    firstRelease: pair.previousTag === null,
    currentTag: pair.currentTag,
  });

  const content = serializeFrontmatter(fm) + "\n\n" + body;
  await openExistingOrPreview(app, fullPath, false, content);
}
