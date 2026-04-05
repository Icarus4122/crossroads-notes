/**
 * Shared helpers for command modules — folder creation, preview, collision.
 */
import { App, Notice, Modal, TFile, normalizePath as obsNormalize } from "obsidian";

/**
 * Ensure a vault-relative folder exists.
 * If missing and confirmBeforeFolderCreate is true, ask the user.
 * Returns true if the folder exists (or was created). False if aborted.
 */
export async function ensureFolder(
  app: App,
  folderPath: string,
  confirmFirst: boolean
): Promise<boolean> {
  const normalized = obsNormalize(folderPath);
  const existing = app.vault.getAbstractFileByPath(normalized);
  if (existing) return true;

  if (confirmFirst) {
    const confirmed = await confirmFolderCreate(app, normalized);
    if (!confirmed) {
      new Notice(`Folder creation declined. Command aborted.`);
      return false;
    }
  }

  try {
    await app.vault.createFolder(normalized);
  } catch {
    // Folder may have been created by a race or already exists at a deeper check.
    const recheckExisting = app.vault.getAbstractFileByPath(normalized);
    if (!recheckExisting) {
      new Notice(`Failed to create folder: ${normalized}`);
      return false;
    }
  }
  return true;
}

/** Show a modal confirmation for folder creation. Returns true if user confirms. */
function confirmFolderCreate(app: App, folderPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    const modal = new ConfirmModal(
      app,
      `Folder '${folderPath}' does not exist. Create it?`,
      resolve
    );
    modal.open();
  });
}

class ConfirmModal extends Modal {
  private message: string;
  private resolve: (val: boolean) => void;
  private resolved = false;

  constructor(app: App, message: string, resolve: (val: boolean) => void) {
    super(app);
    this.message = message;
    this.resolve = resolve;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.createEl("p", { text: this.message });
    const btnContainer = contentEl.createDiv({ cls: "modal-button-container" });

    btnContainer.createEl("button", { text: "Yes", cls: "mod-cta" }).addEventListener("click", () => {
      this.resolved = true;
      this.resolve(true);
      this.close();
    });

    btnContainer.createEl("button", { text: "No" }).addEventListener("click", () => {
      this.resolved = true;
      this.resolve(false);
      this.close();
    });
  }

  onClose(): void {
    if (!this.resolved) {
      this.resolve(false);
    }
  }
}

/**
 * If `isExisting` is true, open the existing note and show a notice.
 * Otherwise, preview the content in a modal. The file is only written when the
 * user explicitly confirms via "Create note".
 *
 * Why a modal instead of an unsaved editor buffer:
 * Obsidian's MarkdownView is file-backed — there is no supported API for
 * opening a markdown editor with pre-filled content for a path that does not
 * yet exist on disk.  To satisfy the v1 trust rule (no write before review),
 * we show a read-only source preview in a modal and gate creation behind an
 * explicit confirmation button.
 */
export async function openExistingOrPreview(
  app: App,
  vaultPath: string,
  isExisting: boolean,
  content?: string
): Promise<void> {
  if (isExisting) {
    const file = app.vault.getAbstractFileByPath(vaultPath);
    if (file instanceof TFile) {
      await app.workspace.getLeaf(false).openFile(file);
      new Notice("Note already exists — opened for editing.");
    }
    return;
  }

  if (content !== undefined) {
    const confirmed = await previewNote(app, vaultPath, content);
    if (!confirmed) {
      new Notice("Note creation cancelled.");
      return;
    }
    const file = await app.vault.create(vaultPath, content);
    await app.workspace.getLeaf(false).openFile(file);
  }
}

/** Show a read-only source preview modal. Returns true if user confirms creation. */
function previewNote(app: App, vaultPath: string, content: string): Promise<boolean> {
  return new Promise((resolve) => {
    const modal = new NotePreviewModal(app, vaultPath, content, resolve);
    modal.open();
  });
}

class NotePreviewModal extends Modal {
  private vaultPath: string;
  private content: string;
  private resolve: (val: boolean) => void;
  private resolved = false;

  constructor(app: App, vaultPath: string, content: string, resolve: (val: boolean) => void) {
    super(app);
    this.vaultPath = vaultPath;
    this.content = content;
    this.resolve = resolve;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.addClass("crossroads-preview-modal");
    contentEl.createEl("h4", { text: this.vaultPath });

    const pre = contentEl.createEl("pre", { cls: "crossroads-preview-source" });
    pre.createEl("code", { text: this.content });

    const btnContainer = contentEl.createDiv({ cls: "modal-button-container" });
    btnContainer.createEl("button", { text: "Create note", cls: "mod-cta" })
      .addEventListener("click", () => {
        this.resolved = true;
        this.resolve(true);
        this.close();
      });
    btnContainer.createEl("button", { text: "Cancel" })
      .addEventListener("click", () => {
        this.resolved = true;
        this.resolve(false);
        this.close();
      });
  }

  onClose(): void {
    if (!this.resolved) this.resolve(false);
  }
}

/** Prompt the user with a dropdown-style suggestion modal. Returns chosen value or null. */
export async function promptChoice(
  app: App,
  title: string,
  choices: string[]
): Promise<string | null> {
  return new Promise((resolve) => {
    const modal = new ChoiceModal(app, title, choices, resolve);
    modal.open();
  });
}

class ChoiceModal extends Modal {
  private title: string;
  private choices: string[];
  private resolve: (val: string | null) => void;
  private resolved = false;

  constructor(app: App, title: string, choices: string[], resolve: (val: string | null) => void) {
    super(app);
    this.title = title;
    this.choices = choices;
    this.resolve = resolve;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.createEl("h3", { text: this.title });
    const btnContainer = contentEl.createDiv({ cls: "modal-button-container" });
    for (const choice of this.choices) {
      btnContainer.createEl("button", { text: choice, cls: "mod-cta" }).addEventListener("click", () => {
        this.resolved = true;
        this.resolve(choice);
        this.close();
      });
    }
  }

  onClose(): void {
    if (!this.resolved) this.resolve(null);
  }
}

/** Prompt for text input. Returns entered string or null if cancelled. */
export async function promptText(
  app: App,
  title: string,
  placeholder: string
): Promise<string | null> {
  return new Promise((resolve) => {
    const modal = new TextInputModal(app, title, placeholder, resolve);
    modal.open();
  });
}

class TextInputModal extends Modal {
  private title: string;
  private placeholder: string;
  private resolve: (val: string | null) => void;
  private resolved = false;

  constructor(app: App, title: string, placeholder: string, resolve: (val: string | null) => void) {
    super(app);
    this.title = title;
    this.placeholder = placeholder;
    this.resolve = resolve;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.createEl("h3", { text: this.title });
    const input = contentEl.createEl("input", {
      type: "text",
      placeholder: this.placeholder,
    });
    input.style.width = "100%";
    input.style.marginBottom = "1em";

    const btnContainer = contentEl.createDiv({ cls: "modal-button-container" });
    btnContainer.createEl("button", { text: "OK", cls: "mod-cta" }).addEventListener("click", () => {
      const val = input.value.trim();
      if (val) {
        this.resolved = true;
        this.resolve(val);
        this.close();
      }
    });
    btnContainer.createEl("button", { text: "Cancel" }).addEventListener("click", () => {
      this.resolved = true;
      this.resolve(null);
      this.close();
    });

    // Submit on enter
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const val = input.value.trim();
        if (val) {
          this.resolved = true;
          this.resolve(val);
          this.close();
        }
      }
    });

    // Focus the input
    setTimeout(() => input.focus(), 50);
  }

  onClose(): void {
    if (!this.resolved) this.resolve(null);
  }
}
