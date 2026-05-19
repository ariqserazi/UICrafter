import * as vscode from "vscode";
import type { OutputTarget } from "../templates/types";

export async function detectPreferredTarget(): Promise<OutputTarget | undefined> {
  const folder = vscode.workspace.workspaceFolders?.[0];
  if (!folder) {
    return undefined;
  }

  if (await exists(vscode.Uri.joinPath(folder.uri, "pubspec.yaml"))) {
    return "flutter";
  }

  const packageJson = vscode.Uri.joinPath(folder.uri, "package.json");
  if (await exists(packageJson)) {
    try {
      const raw = Buffer.from(await vscode.workspace.fs.readFile(packageJson)).toString("utf8");
      const parsed = JSON.parse(raw) as { dependencies?: Record<string, string>; devDependencies?: Record<string, string> };
      const dependencies = { ...parsed.dependencies, ...parsed.devDependencies };
      if (dependencies.next || dependencies.react) {
        return "react-tailwind";
      }
    } catch {
      return "react-tailwind";
    }
  }

  if (await exists(vscode.Uri.joinPath(folder.uri, "index.html"))) {
    return "html-css";
  }

  return undefined;
}

async function exists(uri: vscode.Uri): Promise<boolean> {
  try {
    await vscode.workspace.fs.stat(uri);
    return true;
  } catch {
    return false;
  }
}
