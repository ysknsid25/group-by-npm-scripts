# Group by NPM Scripts

A VS Code extension that automatically discovers npm scripts from multiple `package.json` files in a monorepo and displays them in a tree view, grouped by colon-separated prefixes.

https://github.com/user-attachments/assets/29bd520a-35d0-4c16-9305-4fb51051c433

## Features

- **Auto-discovery** — Detects all `package.json` files in your workspace and lists their scripts
- **Grouping** — Hierarchically groups scripts by colon (`:`) delimiter (e.g. `dev:frontend`, `dev:backend`)
- **One-click run** — Run any script directly from the tree view in a terminal. Defined command is shown in tooltip.
- **Auto-refresh** — Watches for `package.json` changes and updates the tree automatically

### Example

Given the following scripts:

```json
{
  "scripts": {
    "dev:frontend": "vite",
    "dev:backend": "node server.js",
    "dev:frontend:watch": "vite --watch",
    "build": "tsc",
    "test": "vitest"
  }
}
```

The tree view displays:

```
📦 package.json
  📁 dev
    📁 frontend
      ▶ watch
    ▶ backend
  ▶ build
  ▶ test
```

## Requirements

- VS Code 1.97.0 or later

## Usage

1. Install the extension
2. An "NPM Scripts" icon appears in the Activity Bar
3. Click it to see all scripts in your workspace as a tree
4. Click the ▶ button on a script to run it

## License

[MIT](LICENSE)
