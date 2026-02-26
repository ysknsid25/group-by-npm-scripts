export enum TreeItemCollapsibleState {
  None = 0,
  Collapsed = 1,
  Expanded = 2,
}

export class TreeItem {
  label: string;
  collapsibleState: TreeItemCollapsibleState;
  iconPath?: unknown;
  contextValue?: string;
  tooltip?: string;
  command?: unknown;

  constructor(label: string, collapsibleState: TreeItemCollapsibleState = TreeItemCollapsibleState.None) {
    this.label = label;
    this.collapsibleState = collapsibleState;
  }
}

export class ThemeIcon {
  constructor(public readonly id: string) {}
}

export class EventEmitter {
  event = () => {};
  fire() {}
  dispose() {}
}

export const workspace = {
  createFileSystemWatcher: () => ({
    onDidChange: () => {},
    onDidCreate: () => {},
    onDidDelete: () => {},
    dispose: () => {},
  }),
  findFiles: async () => [],
  getWorkspaceFolder: () => undefined,
};

export const Uri = {
  file: (path: string) => ({ fsPath: path }),
};
