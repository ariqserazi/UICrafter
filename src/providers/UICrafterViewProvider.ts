import * as vscode from "vscode";
import {
  copyGeneratedCode,
  createComponentFile,
  insertAtCursor,
  replaceSelection
} from "../services/codeActions";
import { detectPreferredTarget } from "../services/frameworkDetection";
import { PlatformFilter, UICrafterStorage } from "../services/storage";
import { categories, outputTargetLabels, OutputTarget, TemplateCategory, TemplateConfig, TemplateSummary } from "../templates/types";
import { generateForTarget, getDefaultTarget, getTemplateById, normalizeConfig, summarizeTemplate, templates } from "../templates/registry";
import { UICrafterPreviewPanel, PreviewPanelAction, PreviewPanelState } from "./UICrafterPreviewPanel";

type ViewAction = "copy" | "insert" | "replace" | "create" | "openPreview";

interface SidebarMessage {
  type:
    | "ready"
    | "selectTemplate"
    | "updateConfig"
    | "setTarget"
    | "toggleFavorite"
    | "setCategory"
    | "setPlatformFilter"
    | "action"
    | "refresh";
  templateId?: string;
  config?: Partial<TemplateConfig>;
  target?: OutputTarget;
  category?: TemplateCategory | "All";
  platformFilter?: PlatformFilter;
  action?: ViewAction;
}

interface SidebarState {
  templates: TemplateSummary[];
  categories: Array<TemplateCategory | "All">;
  outputTargetLabels: typeof outputTargetLabels;
  selectedTemplateId: string;
  selectedTemplate: TemplateSummary;
  config: TemplateConfig;
  target: OutputTarget;
  previewHtml: string;
  generatedCode: string;
  favorites: string[];
  recents: string[];
  lastCategory: TemplateCategory | "All";
  lastPlatformFilter: PlatformFilter;
  suggestedTarget?: OutputTarget;
}

export class UICrafterViewProvider implements vscode.WebviewViewProvider {
  static readonly viewType = "uicrafter.sidebar";

  private view?: vscode.WebviewView;
  private initialized = false;
  private selectedTemplateId = templates[0].id;
  private config = templates[0].defaultConfig;
  private target: OutputTarget = templates[0].supportedTargets[0];
  private suggestedTarget?: OutputTarget;
  private lastCategory: TemplateCategory | "All" = "All";
  private lastPlatformFilter: PlatformFilter = "all";

  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly storage: UICrafterStorage
  ) {}

  async resolveWebviewView(webviewView: vscode.WebviewView): Promise<void> {
    this.view = webviewView;
    await this.ensureInitialized();

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(this.context.extensionUri, "media")]
    };

    webviewView.webview.html = this.getHtml(webviewView.webview);
    webviewView.webview.onDidReceiveMessage((message: SidebarMessage) => this.handleMessage(message));
  }

  async reveal(): Promise<void> {
    await vscode.commands.executeCommand("workbench.view.extension.uicrafter");
  }

  async refresh(): Promise<void> {
    await this.postState();
    vscode.window.showInformationMessage("UICrafter templates refreshed.");
  }

  async openPreview(): Promise<void> {
    const state = await this.getPreviewPanelState();
    UICrafterPreviewPanel.show(this.context.extensionUri, state, (action) => this.handlePreviewPanelAction(action));
  }

  async runAction(action: ViewAction | PreviewPanelAction): Promise<void> {
    await this.ensureInitialized();
    const generation = this.getCurrentGeneration();

    if (action === "copy") {
      await copyGeneratedCode(generation.generatedCode);
    } else if (action === "insert") {
      await insertAtCursor(generation.generatedCode);
    } else if (action === "replace") {
      await replaceSelection(generation.generatedCode);
    } else if (action === "create") {
      await createComponentFile({
        code: generation.generatedCode,
        templateId: generation.template.id,
        target: generation.target,
        defaultName: generation.template.name
      });
    } else if (action === "openPreview") {
      await this.openPreview();
    }
  }

  private async handlePreviewPanelAction(action: PreviewPanelAction): Promise<void> {
    await this.runAction(action);
  }

  private async handleMessage(message: SidebarMessage): Promise<void> {
    await this.ensureInitialized();

    if (message.type === "ready" || message.type === "refresh") {
      await this.postState();
      return;
    }

    if (message.type === "selectTemplate" && message.templateId) {
      const template = getTemplateById(message.templateId);
      if (template) {
        this.selectedTemplateId = template.id;
        this.config = normalizeConfig(template, this.config);
        this.target = getDefaultTarget(template, this.target ?? this.suggestedTarget);
        await this.storage.rememberTemplate(template.id);
        await this.storage.rememberConfig(this.config);
        await this.storage.rememberTarget(this.target);
      }
    }

    if (message.type === "updateConfig") {
      const template = this.getSelectedTemplate();
      this.config = normalizeConfig(template, { ...this.config, ...message.config });
      await this.storage.rememberConfig(this.config);
    }

    if (message.type === "setTarget" && message.target) {
      const template = this.getSelectedTemplate();
      if (template.supportedTargets.includes(message.target)) {
        this.target = message.target;
        await this.storage.rememberTarget(this.target);
      }
    }

    if (message.type === "toggleFavorite" && message.templateId) {
      await this.storage.toggleFavorite(message.templateId);
    }

    if (message.type === "setCategory" && message.category) {
      this.lastCategory = message.category;
      await this.storage.rememberCategory(this.lastCategory);
    }

    if (message.type === "setPlatformFilter" && message.platformFilter) {
      this.lastPlatformFilter = message.platformFilter;
      await this.storage.rememberPlatformFilter(this.lastPlatformFilter);
    }

    if (message.type === "action" && message.action) {
      await this.runAction(message.action);
    }

    await this.postState();
  }

  private async ensureInitialized(): Promise<void> {
    if (this.initialized) {
      return;
    }

    const persisted = this.storage.getState();
    this.suggestedTarget = persisted.lastTarget ?? (await detectPreferredTarget());
    const persistedTemplate = persisted.lastTemplate ? getTemplateById(persisted.lastTemplate) : undefined;
    const template = persistedTemplate ?? templates[0];

    this.selectedTemplateId = template.id;
    this.config = normalizeConfig(template, persisted.lastConfig);
    this.target = getDefaultTarget(template, this.suggestedTarget);
    this.lastCategory = persisted.lastCategory ?? "All";
    this.lastPlatformFilter = persisted.lastPlatformFilter ?? "all";
    this.initialized = true;
  }

  private async postState(): Promise<void> {
    if (!this.view) {
      return;
    }

    const state = await this.getSidebarState();
    this.view.webview.postMessage({ type: "state", state });
    UICrafterPreviewPanel.updateIfOpen(await this.getPreviewPanelState());
  }

  private async getSidebarState(): Promise<SidebarState> {
    await this.ensureInitialized();
    const generation = this.getCurrentGeneration();
    const persisted = this.storage.getState();

    return {
      templates: templates.map(summarizeTemplate),
      categories: ["All", ...categories],
      outputTargetLabels,
      selectedTemplateId: generation.template.id,
      selectedTemplate: summarizeTemplate(generation.template),
      config: this.config,
      target: generation.target,
      previewHtml: generation.previewHtml,
      generatedCode: generation.generatedCode,
      favorites: persisted.favorites,
      recents: persisted.recents,
      lastCategory: this.lastCategory,
      lastPlatformFilter: this.lastPlatformFilter,
      suggestedTarget: this.suggestedTarget
    };
  }

  private async getPreviewPanelState(): Promise<PreviewPanelState> {
    await this.ensureInitialized();
    const generation = this.getCurrentGeneration();
    return {
      template: summarizeTemplate(generation.template),
      config: this.config,
      target: generation.target,
      previewHtml: generation.previewHtml,
      generatedCode: generation.generatedCode,
      targetLabel: outputTargetLabels[generation.target]
    };
  }

  private getCurrentGeneration() {
    const template = this.getSelectedTemplate();
    const target = getDefaultTarget(template, this.target);
    const previewHtml = template.previewHtml(this.config);
    const generatedCode = generateForTarget(template, target, this.config);

    return { template, target, previewHtml, generatedCode };
  }

  private getSelectedTemplate() {
    return getTemplateById(this.selectedTemplateId) ?? templates[0];
  }

  private getHtml(webview: vscode.Webview): string {
    const nonce = getNonce();
    const mainUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, "media", "main.js"));
    const stylesUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, "media", "styles.css"));
    const resetUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, "media", "reset.css"));

    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} data:; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';" />
    <link href="${resetUri}" rel="stylesheet" />
    <link href="${stylesUri}" rel="stylesheet" />
    <title>UICrafter</title>
  </head>
  <body>
    <div id="app" class="app-shell">
      <div class="loading-state">Loading UICrafter...</div>
    </div>
    <script nonce="${nonce}" src="${mainUri}"></script>
  </body>
</html>`;
  }
}

function getNonce(): string {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i += 1) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
