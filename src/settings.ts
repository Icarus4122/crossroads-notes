import { App, PluginSettingTab, Setting } from "obsidian";
import type CrossroadsNotesPlugin from "./main";
import type { CrossroadsSettings } from "./types";

export const DEFAULT_SETTINGS: CrossroadsSettings = {
  empusaRepoPath: "",
  hecateRepoPath: "",
  workspacesFolder: "Workspaces",
  releasesFolder: "Releases",
  adrFolder: "ADR",
  sessionsFolder: "Sessions",
  findingsFolder: "Findings",
  confirmBeforeFolderCreate: true,
  gitExecutablePath: "git",
};

export class CrossroadsSettingTab extends PluginSettingTab {
  plugin: CrossroadsNotesPlugin;

  constructor(app: App, plugin: CrossroadsNotesPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "Crossroads Notes Settings" });

    new Setting(containerEl)
      .setName("Empusa repo path")
      .setDesc("Absolute path to the local Empusa repo root.")
      .addText((text) =>
        text
          .setPlaceholder("/path/to/empusa")
          .setValue(this.plugin.settings.empusaRepoPath)
          .onChange(async (value) => {
            this.plugin.settings.empusaRepoPath = value.trim();
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Hecate repo path")
      .setDesc("Absolute path to the local Hecate-bootstrap repo root.")
      .addText((text) =>
        text
          .setPlaceholder("/path/to/hecate-bootstrap")
          .setValue(this.plugin.settings.hecateRepoPath)
          .onChange(async (value) => {
            this.plugin.settings.hecateRepoPath = value.trim();
            await this.plugin.saveSettings();
          })
      );

    containerEl.createEl("h3", { text: "Vault Folders" });

    new Setting(containerEl)
      .setName("Workspaces folder")
      .setDesc("Vault-relative folder for workspace notes.")
      .addText((text) =>
        text
          .setValue(this.plugin.settings.workspacesFolder)
          .onChange(async (value) => {
            this.plugin.settings.workspacesFolder = value.trim();
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Releases folder")
      .setDesc("Vault-relative folder for release review notes.")
      .addText((text) =>
        text
          .setValue(this.plugin.settings.releasesFolder)
          .onChange(async (value) => {
            this.plugin.settings.releasesFolder = value.trim();
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("ADR folder")
      .setDesc("Vault-relative folder for ADR notes.")
      .addText((text) =>
        text
          .setValue(this.plugin.settings.adrFolder)
          .onChange(async (value) => {
            this.plugin.settings.adrFolder = value.trim();
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Sessions folder")
      .setDesc("Vault-relative folder for session notes.")
      .addText((text) =>
        text
          .setValue(this.plugin.settings.sessionsFolder)
          .onChange(async (value) => {
            this.plugin.settings.sessionsFolder = value.trim();
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Findings folder")
      .setDesc("Vault-relative folder for finding notes.")
      .addText((text) =>
        text
          .setValue(this.plugin.settings.findingsFolder)
          .onChange(async (value) => {
            this.plugin.settings.findingsFolder = value.trim();
            await this.plugin.saveSettings();
          })
      );

    containerEl.createEl("h3", { text: "Behavior" });

    new Setting(containerEl)
      .setName("Confirm before folder creation")
      .setDesc("Show a modal confirmation before creating missing vault folders.")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.confirmBeforeFolderCreate)
          .onChange(async (value) => {
            this.plugin.settings.confirmBeforeFolderCreate = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Git executable path")
      .setDesc("Path to the git executable. Default assumes git is on PATH.")
      .addText((text) =>
        text
          .setValue(this.plugin.settings.gitExecutablePath)
          .onChange(async (value) => {
            this.plugin.settings.gitExecutablePath = value.trim();
            await this.plugin.saveSettings();
          })
      );
  }
}
