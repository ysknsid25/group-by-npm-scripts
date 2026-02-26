import * as vscode from "vscode";
import { ScriptTreeProvider, ScriptNode } from "./scriptTreeProvider";
import { runScript } from "./scriptRunner";

export function activate(context: vscode.ExtensionContext): void {
  const treeProvider = new ScriptTreeProvider();

  const treeView = vscode.window.createTreeView("npmScripts", {
    treeDataProvider: treeProvider,
  });

  context.subscriptions.push(
    treeView,
    treeProvider,
    vscode.commands.registerCommand("npmScripts.run", (node: ScriptNode) => {
      runScript(node);
    }),
    vscode.commands.registerCommand("npmScripts.refresh", () => {
      treeProvider.refresh();
    }),
  );
}

export function deactivate(): void {
  // nothing to clean up
}
