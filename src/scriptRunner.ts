import * as vscode from "vscode";
import { ScriptNode } from "./scriptTreeProvider";

export function runScript(node: ScriptNode): void {
  const terminal = vscode.window.createTerminal({
    name: `npm: ${node.fullScriptName}`,
    cwd: node.directory,
  });
  terminal.show();
  terminal.sendText(`npm run ${node.fullScriptName}`);
}
