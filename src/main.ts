import { Plugin } from "obsidian";
import type { CrossroadsSettings } from "./types";
import { DEFAULT_SETTINGS, CrossroadsSettingTab } from "./settings";
import { createWorkspaceNote } from "./commands/create-workspace-note";
import { createReleaseNote } from "./commands/create-release-note";
import { createAdrNote } from "./commands/create-adr-note";
import { createSessionNote } from "./commands/create-session-note";
import { createFindingNote } from "./commands/create-finding-note";
import { openLinkedFolder } from "./commands/open-linked-folder";

export default class CrossroadsNotesPlugin extends Plugin {
  settings: CrossroadsSettings = DEFAULT_SETTINGS;

  async onload(): Promise<void> {
    await this.loadSettings();

    this.addCommand({
      id: "create-workspace-note",
      name: "Create workspace note",
      callback: () => createWorkspaceNote(this.app, this.settings),
    });

    this.addCommand({
      id: "create-release-review-note",
      name: "Create release review note",
      callback: () => createReleaseNote(this.app, this.settings),
    });

    this.addCommand({
      id: "create-adr-note",
      name: "Create ADR note",
      callback: () => createAdrNote(this.app, this.settings),
    });

    this.addCommand({
      id: "create-session-note",
      name: "Create session note",
      callback: () => createSessionNote(this.app, this.settings),
    });

    this.addCommand({
      id: "create-finding-note",
      name: "Create finding note",
      callback: () => createFindingNote(this.app, this.settings),
    });

    this.addCommand({
      id: "open-linked-code-folder",
      name: "Open linked code folder",
      callback: () => openLinkedFolder(this.app, this.settings),
    });

    this.addSettingTab(new CrossroadsSettingTab(this.app, this));
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }
}
