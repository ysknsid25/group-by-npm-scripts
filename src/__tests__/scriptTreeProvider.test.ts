import { describe, it, expect } from "vitest";
import {
  buildGroupNodes,
  buildChildrenForPackage,
  GroupNode,
  ScriptNode,
  type ScriptEntry,
} from "../scriptTreeProvider";

function makeEntry(name: string): ScriptEntry {
  return {
    segments: name.split(":"),
    fullName: name,
    directory: "/test",
    command: `run ${name}`,
  };
}

describe("buildGroupNodes", () => {
  it("should group scripts by colon-separated prefix", () => {
    const entries = [
      makeEntry("dev:frontend"),
      makeEntry("dev:backend"),
      makeEntry("build"),
    ];
    const nodes = buildGroupNodes(entries);

    expect(nodes).toHaveLength(2);
    expect(nodes[0]).toBeInstanceOf(GroupNode);
    expect((nodes[0] as GroupNode).label).toBe("dev");
    expect(nodes[1]).toBeInstanceOf(ScriptNode);
    expect((nodes[1] as ScriptNode).scriptName).toBe("build");
  });

  it("should handle recursive grouping (dev:frontend:watch)", () => {
    const entries = [
      makeEntry("dev:frontend:watch"),
      makeEntry("dev:frontend:build"),
      makeEntry("dev:backend"),
    ];
    const nodes = buildGroupNodes(entries);

    expect(nodes).toHaveLength(1);
    const devGroup = nodes[0] as GroupNode;
    expect(devGroup.label).toBe("dev");
    expect(devGroup.children).toHaveLength(2);

    const frontendGroup = devGroup.children[0] as GroupNode;
    expect(frontendGroup).toBeInstanceOf(GroupNode);
    expect(frontendGroup.label).toBe("frontend");
    expect(frontendGroup.children).toHaveLength(2);

    const backendNode = devGroup.children[1] as ScriptNode;
    expect(backendNode).toBeInstanceOf(ScriptNode);
    expect(backendNode.scriptName).toBe("backend");
  });

  it("should display scripts without colons directly", () => {
    const entries = [makeEntry("build"), makeEntry("test"), makeEntry("start")];
    const nodes = buildGroupNodes(entries);

    expect(nodes).toHaveLength(3);
    expect(nodes.every((n) => n instanceof ScriptNode)).toBe(true);
  });

  it("should sort groups and leaves alphabetically", () => {
    const entries = [
      makeEntry("test:unit"),
      makeEntry("build:prod"),
      makeEntry("zebra"),
      makeEntry("alpha"),
    ];
    const nodes = buildGroupNodes(entries);

    expect(nodes).toHaveLength(4);
    // Groups first, sorted alphabetically
    expect((nodes[0] as GroupNode).label).toBe("build");
    expect((nodes[1] as GroupNode).label).toBe("test");
    // Then leaves, sorted alphabetically
    expect((nodes[2] as ScriptNode).scriptName).toBe("alpha");
    expect((nodes[3] as ScriptNode).scriptName).toBe("zebra");
  });
});

describe("buildChildrenForPackage", () => {
  it("should build tree from package scripts", () => {
    const pkg = {
      absolutePath: "/test/package.json",
      relativePath: "package.json",
      directory: "/test",
      scripts: {
        "dev:frontend": "vite",
        "dev:backend": "node server.js",
        "build": "tsc",
      },
    };
    const nodes = buildChildrenForPackage(pkg);

    expect(nodes).toHaveLength(2);
    expect(nodes[0]).toBeInstanceOf(GroupNode);
    expect((nodes[0] as GroupNode).label).toBe("dev");
    expect(nodes[1]).toBeInstanceOf(ScriptNode);
    expect((nodes[1] as ScriptNode).scriptName).toBe("build");
  });
});
