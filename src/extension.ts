import * as vscode from "vscode";
import { UICrafterViewProvider } from "./providers/UICrafterViewProvider";
import { UICrafterStorage } from "./services/storage";

export function activate(context: vscode.ExtensionContext): void {
  const storage = new UICrafterStorage(context);
  const provider = new UICrafterViewProvider(context, storage);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(UICrafterViewProvider.viewType, provider, {
      webviewOptions: { retainContextWhenHidden: true }
    }),
    vscode.commands.registerCommand("uicrafter.open", () => provider.reveal()),
    vscode.commands.registerCommand("uicrafter.openPreview", () => provider.openPreview()),
    vscode.commands.registerCommand("uicrafter.insertAtCursor", () => provider.runAction("insert")),
    vscode.commands.registerCommand("uicrafter.replaceSelection", () => provider.runAction("replace")),
    vscode.commands.registerCommand("uicrafter.createComponentFile", () => provider.runAction("create")),
    vscode.commands.registerCommand("uicrafter.copyGeneratedCode", () => provider.runAction("copy")),
    vscode.commands.registerCommand("uicrafter.refreshTemplates", () => provider.refresh())
  );
}

export function deactivate(): void {}
