import * as vscode from "vscode";
import { findPackageJsonFiles, PackageJsonInfo } from "./packageJsonParser";

// --- Tree node types ---

export type TreeNode = PackageNode | GroupNode | ScriptNode;

export class PackageNode extends vscode.TreeItem {
  constructor(public readonly pkg: PackageJsonInfo) {
    super(pkg.relativePath, vscode.TreeItemCollapsibleState.Expanded);
    this.iconPath = new vscode.ThemeIcon("package");
    this.contextValue = "package";
  }
}

export class GroupNode extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly children: TreeNode[],
  ) {
    super(label, vscode.TreeItemCollapsibleState.Expanded);
    this.iconPath = new vscode.ThemeIcon("folder");
    this.contextValue = "group";
  }
}

export class ScriptNode extends vscode.TreeItem {
  constructor(
    public readonly scriptName: string,
    public readonly fullScriptName: string,
    public readonly directory: string,
    public readonly scriptCommand: string,
  ) {
    super(scriptName, vscode.TreeItemCollapsibleState.None);
    this.iconPath = new vscode.ThemeIcon("play");
    this.contextValue = "script";
    this.tooltip = scriptCommand;
    this.command = {
      command: "npmScripts.run",
      title: "Run Script",
      arguments: [this],
    };
  }
}

// --- Grouping logic ---

export interface ScriptEntry {
  /** Remaining segments after prefix */
  segments: string[];
  /** Full original script name */
  fullName: string;
  /** Directory of the package.json */
  directory: string;
  /** The actual shell command */
  command: string;
}

export function buildGroupNodes(entries: ScriptEntry[]): TreeNode[] {
  // Partition: entries with no remaining segments (leaf) vs entries with segments
  const leaves: ScriptEntry[] = [];
  const groups = new Map<string, ScriptEntry[]>();

  for (const entry of entries) {
    if (entry.segments.length === 1) {
      leaves.push(entry);
    } else {
      const prefix = entry.segments[0];
      const rest: ScriptEntry = {
        segments: entry.segments.slice(1),
        fullName: entry.fullName,
        directory: entry.directory,
        command: entry.command,
      };
      if (!groups.has(prefix)) {
        groups.set(prefix, []);
      }
      groups.get(prefix)!.push(rest);
    }
  }

  const nodes: TreeNode[] = [];

  // Sort groups alphabetically, then add leaves
  const sortedGroupKeys = [...groups.keys()].sort();
  for (const key of sortedGroupKeys) {
    const children = buildGroupNodes(groups.get(key)!);
    nodes.push(new GroupNode(key, children));
  }

  // Sort leaves alphabetically
  leaves.sort((a, b) => a.segments[0].localeCompare(b.segments[0]));
  for (const leaf of leaves) {
    nodes.push(
      new ScriptNode(leaf.segments[0], leaf.fullName, leaf.directory, leaf.command),
    );
  }

  return nodes;
}

export function buildChildrenForPackage(pkg: PackageJsonInfo): TreeNode[] {
  const entries: ScriptEntry[] = Object.entries(pkg.scripts).map(([name, cmd]) => ({
    segments: name.split(":"),
    command: cmd,
    fullName: name,
    directory: pkg.directory,
  }));
  return buildGroupNodes(entries);
}

// --- TreeDataProvider ---

export class ScriptTreeProvider implements vscode.TreeDataProvider<TreeNode> {
  private _onDidChangeTreeData = new vscode.EventEmitter<
    TreeNode | undefined | void
  >();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private packageNodes: PackageNode[] = [];
  private childrenMap = new Map<TreeNode, TreeNode[]>();

  private watchers: vscode.FileSystemWatcher[] = [];

  constructor() {
    const watcher = vscode.workspace.createFileSystemWatcher(
      "**/package.json",
    );
    watcher.onDidChange(() => this.refresh());
    watcher.onDidCreate(() => this.refresh());
    watcher.onDidDelete(() => this.refresh());
    this.watchers.push(watcher);
  }

  dispose(): void {
    for (const w of this.watchers) {
      w.dispose();
    }
    this._onDidChangeTreeData.dispose();
  }

  refresh(): void {
    this.packageNodes = [];
    this.childrenMap.clear();
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: TreeNode): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: TreeNode): Promise<TreeNode[]> {
    if (!element) {
      // Root: load all package.json files
      if (this.packageNodes.length === 0) {
        const packages = await findPackageJsonFiles();
        for (const pkg of packages) {
          const node = new PackageNode(pkg);
          const children = buildChildrenForPackage(pkg);
          this.packageNodes.push(node);
          this.childrenMap.set(node, children);
          this.storeGroupChildren(children);
        }
      }
      return this.packageNodes;
    }

    return this.childrenMap.get(element) ?? [];
  }

  private storeGroupChildren(nodes: TreeNode[]): void {
    for (const node of nodes) {
      if (node instanceof GroupNode) {
        this.childrenMap.set(node, node.children);
        this.storeGroupChildren(node.children);
      }
    }
  }
}
