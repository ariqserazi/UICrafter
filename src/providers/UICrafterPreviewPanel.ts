import * as vscode from "vscode";
import type { OutputTarget, TemplateConfig, TemplateSummary } from "../templates/types";

export interface PreviewPanelState {
  template: TemplateSummary;
  config: TemplateConfig;
  target: OutputTarget;
  previewHtml: string;
  generatedCode: string;
  targetLabel: string;
}

export type PreviewPanelAction = "copy" | "insert" | "replace" | "create";

export class UICrafterPreviewPanel {
  private static currentPanel: UICrafterPreviewPanel | undefined;
  private readonly disposables: vscode.Disposable[] = [];

  private constructor(
    private readonly panel: vscode.WebviewPanel,
    private readonly extensionUri: vscode.Uri,
    private readonly onAction: (action: PreviewPanelAction) => Promise<void>
  ) {
    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
    this.panel.webview.onDidReceiveMessage(
      async (message: { type: PreviewPanelAction }) => {
        if (["copy", "insert", "replace", "create"].includes(message.type)) {
          await this.onAction(message.type);
        }
      },
      null,
      this.disposables
    );
  }

  static show(extensionUri: vscode.Uri, state: PreviewPanelState, onAction: (action: PreviewPanelAction) => Promise<void>): void {
    if (UICrafterPreviewPanel.currentPanel) {
      UICrafterPreviewPanel.currentPanel.panel.reveal(vscode.ViewColumn.Beside);
      UICrafterPreviewPanel.currentPanel.update(state);
      return;
    }

    const panel = vscode.window.createWebviewPanel("uicrafter.preview", "UICrafter Preview", vscode.ViewColumn.Beside, {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(extensionUri, "media")]
    });

    UICrafterPreviewPanel.currentPanel = new UICrafterPreviewPanel(panel, extensionUri, onAction);
    UICrafterPreviewPanel.currentPanel.update(state);
  }

  static updateIfOpen(state: PreviewPanelState): void {
    UICrafterPreviewPanel.currentPanel?.update(state);
  }

  private update(state: PreviewPanelState): void {
    this.panel.title = `UICrafter: ${state.template.name}`;
    this.panel.webview.html = this.getHtml(state);
  }

  private getHtml(state: PreviewPanelState): string {
    const nonce = getNonce();
    const stylesUri = this.panel.webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, "media", "styles.css"));
    const resetUri = this.panel.webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, "media", "reset.css"));
    const escapedCode = escapeHtml(state.generatedCode);

    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${this.panel.webview.cspSource} data:; style-src ${this.panel.webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';" />
    <link href="${resetUri}" rel="stylesheet" />
    <link href="${stylesUri}" rel="stylesheet" />
    <title>UICrafter Preview</title>
  </head>
  <body class="full-preview-body">
    <main class="preview-panel">
      <header class="preview-panel__header">
        <div>
          <p class="eyebrow">${state.targetLabel}</p>
          <h1>${escapeHtml(state.template.name)}</h1>
          <p>${escapeHtml(state.template.description)}</p>
        </div>
        <div class="preview-panel__actions">
          <button data-action="copy">Copy</button>
          <button data-action="insert">Insert</button>
          <button data-action="replace">Replace</button>
          <button data-action="create" class="primary">Create file</button>
        </div>
      </header>
      <section class="preview-panel__toolbar" aria-label="Preview display">
        <div class="preview-panel__tabs">
          <button class="is-active" data-tab="preview">Preview</button>
          <button data-tab="code">Generated code</button>
        </div>
        <div class="preview-panel__tabs">
          <button class="is-active" data-device="desktop">Desktop</button>
          <button data-device="mobile">Mobile</button>
        </div>
      </section>
      <section class="preview-panel__grid" id="preview-grid">
        <div class="preview-stage browser-frame" id="preview-stage">
          <div class="browser-frame__bar"><span></span><span></span><span></span></div>
          <div class="preview-stage__content">${state.previewHtml}</div>
        </div>
        <div class="code-panel">
          <div class="code-panel__header"><strong>Generated code</strong><span>${state.targetLabel}</span></div>
          <pre><code>${escapedCode}</code></pre>
        </div>
      </section>
    </main>
    <script nonce="${nonce}">
      const vscode = acquireVsCodeApi();
      document.querySelectorAll('[data-action]').forEach((button) => {
        button.addEventListener('click', () => vscode.postMessage({ type: button.dataset.action }));
      });
      const stage = document.getElementById('preview-stage');
      document.querySelectorAll('[data-device]').forEach((button) => {
        button.addEventListener('click', () => {
          document.querySelectorAll('[data-device]').forEach((item) => item.classList.remove('is-active'));
          button.classList.add('is-active');
          stage.classList.toggle('phone-frame', button.dataset.device === 'mobile');
          stage.classList.toggle('browser-frame', button.dataset.device !== 'mobile');
        });
      });
      const grid = document.getElementById('preview-grid');
      document.querySelectorAll('[data-tab]').forEach((button) => {
        button.addEventListener('click', () => {
          document.querySelectorAll('[data-tab]').forEach((item) => item.classList.remove('is-active'));
          button.classList.add('is-active');
          grid.classList.toggle('show-code-only', button.dataset.tab === 'code');
        });
      });
    </script>
  </body>
</html>`;
  }

  private dispose(): void {
    UICrafterPreviewPanel.currentPanel = undefined;
    while (this.disposables.length) {
      this.disposables.pop()?.dispose();
    }
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getNonce(): string {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i += 1) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
