import * as vscode from "vscode";
import * as path from "path";

export interface PackageJsonInfo {
  /** Absolute path to the package.json */
  absolutePath: string;
  /** Relative path from workspace root */
  relativePath: string;
  /** Directory containing the package.json */
  directory: string;
  /** scripts field contents */
  scripts: Record<string, string>;
}

export async function findPackageJsonFiles(): Promise<PackageJsonInfo[]> {
  const files = await vscode.workspace.findFiles(
    "**/package.json",
    "**/node_modules/**",
  );

  const results: PackageJsonInfo[] = [];

  for (const uri of files) {
    const content = await vscode.workspace.fs.readFile(uri);
    try {
      const json = JSON.parse(Buffer.from(content).toString("utf-8"));
      const scripts = json.scripts;
      if (!scripts || typeof scripts !== "object") {
        continue;
      }

      const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
      const rootPath = workspaceFolder?.uri.fsPath ?? "";
      const absolutePath = uri.fsPath;

      results.push({
        absolutePath,
        relativePath: rootPath
          ? path.relative(rootPath, absolutePath)
          : absolutePath,
        directory: path.dirname(absolutePath),
        scripts,
      });
    } catch {
      // skip invalid JSON
    }
  }

  // Sort: root package.json first, then alphabetically
  results.sort((a, b) => {
    const depthA = a.relativePath.split(path.sep).length;
    const depthB = b.relativePath.split(path.sep).length;
    if (depthA !== depthB) {
      return depthA - depthB;
    }
    return a.relativePath.localeCompare(b.relativePath);
  });

  return results;
}
