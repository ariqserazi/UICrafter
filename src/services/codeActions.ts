import * as path from "path";
import * as vscode from "vscode";
import type { OutputTarget } from "../templates/types";
import { sanitizeFileName, toPascalCase } from "../utils/stringUtils";

export async function insertAtCursor(code: string): Promise<boolean> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage("Open a file before inserting UICrafter code.");
    return false;
  }

  await editor.edit((builder) => {
    for (const selection of editor.selections) {
      builder.insert(selection.active, code);
    }
  });

  vscode.window.showInformationMessage("UICrafter inserted code at the cursor.");
  return true;
}

export async function replaceSelection(code: string): Promise<boolean> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage("Open a file before replacing code with UICrafter output.");
    return false;
  }

  const selections = editor.selections.filter((selection) => !selection.isEmpty);
  if (selections.length === 0) {
    vscode.window.showErrorMessage("Select code to replace before using UICrafter Replace Selection.");
    return false;
  }

  await editor.edit((builder) => {
    for (const selection of selections) {
      builder.replace(selection, code);
    }
  });

  vscode.window.showInformationMessage("UICrafter replaced the selected code.");
  return true;
}

export async function copyGeneratedCode(code: string): Promise<boolean> {
  await vscode.env.clipboard.writeText(code);
  vscode.window.showInformationMessage("UICrafter code copied to clipboard.");
  return true;
}

export async function createComponentFile(input: {
  code: string;
  templateId: string;
  target: OutputTarget;
  defaultName: string;
}): Promise<boolean> {
  const folder = vscode.workspace.workspaceFolders?.[0];
  if (!folder) {
    vscode.window.showErrorMessage("Open a workspace folder before creating a component file.");
    return false;
  }

  const componentName = await vscode.window.showInputBox({
    title: "Create UICrafter component",
    prompt: "Component name",
    value: toPascalCase(input.defaultName),
    validateInput: (value) => (value.trim().length === 0 ? "Enter a component name." : undefined)
  });

  if (!componentName) {
    return false;
  }

  const directory = await resolveComponentDirectory(folder.uri, input.target);
  await vscode.workspace.fs.createDirectory(directory);

  const extension = extensionForTarget(input.target);
  const fileName = input.target === "html-css" ? `${sanitizeFileName(componentName)}.${extension}` : `${toPascalCase(componentName)}.${extension}`;
  const fileUri = vscode.Uri.joinPath(directory, fileName);
  const marker = markerForTarget(input.templateId, input.target);
  const nextContent = `${marker}\n${input.code}`;

  if (await exists(fileUri)) {
    const current = Buffer.from(await vscode.workspace.fs.readFile(fileUri)).toString("utf8");
    if (!current.includes("UICrafter template:")) {
      const choice = await vscode.window.showWarningMessage(
        `${fileName} already exists and was not created by UICrafter. Replace it?`,
        { modal: true },
        "Replace file"
      );
      if (choice !== "Replace file") {
        return false;
      }
    }
  }

  await vscode.workspace.fs.writeFile(fileUri, Buffer.from(nextContent, "utf8"));
  const document = await vscode.workspace.openTextDocument(fileUri);
  await vscode.window.showTextDocument(document, { preview: false });
  vscode.window.showInformationMessage(`UICrafter created ${path.basename(fileUri.fsPath)}.`);
  return true;
}

async function resolveComponentDirectory(workspaceUri: vscode.Uri, target: OutputTarget): Promise<vscode.Uri> {
  const candidates = target === "flutter" ? ["lib/widgets", "lib/components", "components"] : ["src/components", "components", "lib/widgets"];

  for (const candidate of candidates) {
    const uri = vscode.Uri.joinPath(workspaceUri, ...candidate.split("/"));
    if (await exists(uri)) {
      return uri;
    }
  }

  return target === "flutter"
    ? vscode.Uri.joinPath(workspaceUri, "lib", "widgets")
    : vscode.Uri.joinPath(workspaceUri, "components");
}

function extensionForTarget(target: OutputTarget): string {
  if (target === "react-tailwind") {
    return "tsx";
  }

  if (target === "flutter") {
    return "dart";
  }

  return "html";
}

function markerForTarget(templateId: string, target: OutputTarget): string {
  if (target === "html-css") {
    return `<!-- UICrafter template: ${templateId}\nUICrafter target: ${target} -->`;
  }

  return `// UICrafter template: ${templateId}\n// UICrafter target: ${target}`;
}

async function exists(uri: vscode.Uri): Promise<boolean> {
  try {
    await vscode.workspace.fs.stat(uri);
    return true;
  } catch {
    return false;
  }
}
