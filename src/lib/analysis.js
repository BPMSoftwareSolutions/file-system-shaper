import { readdir, readFile, stat as statFile } from "node:fs/promises";
import path from "node:path";
import { loadDefaultFabric, getLanguageForFilePath } from "./fabric.js";
import { loadScannerRegistry, getScannerForFilePath } from "./scanner-registry.js";

function toPosix(value) {
  return value.split(path.sep).join("/");
}

export function isCodeFile(filePath, fabric) {
  return Boolean(getLanguageForFilePath(filePath, fabric));
}

function renderTree(nodes, prefix = "") {
  const lines = [];

  nodes.forEach((node, index) => {
    const isLast = index === nodes.length - 1;
    const branch = isLast ? "`-- " : "|-- ";
    const nextPrefix = prefix + (isLast ? "   " : "|  ");
    const label =
      node.kind === "directory"
        ? `${node.name}/`
        : node.imports?.length
          ? `${node.name} [imports: ${node.imports.length}]`
          : node.name;

    lines.push(`${prefix}${branch}${label}`);
    if (node.kind === "directory") {
      lines.push(...renderTree(node.children, nextPrefix));
    }
  });

  return lines;
}

async function walkFolder({ rootAbs, currentAbs, nodes, dependencyEdges, fabric, registry }) {
  const entries = await readdir(currentAbs, { withFileTypes: true });
  entries.sort((a, b) => a.name.localeCompare(b.name));

  for (const entry of entries) {
    const absPath = path.join(currentAbs, entry.name);
    const relPath = toPosix(path.relative(rootAbs, absPath));

    if (entry.isDirectory()) {
      if (fabric.ignoredDirectories.includes(entry.name)) continue;
      const node = {
        kind: "directory",
        name: entry.name,
        relPath,
        absPath,
        children: []
      };
      nodes.push(node);
      await walkFolder({ rootAbs, currentAbs: absPath, nodes: node.children, dependencyEdges, fabric, registry });
      continue;
    }

    const node = {
      kind: "file",
      name: entry.name,
      relPath,
      absPath,
      size: (await statFile(absPath)).size,
      imports: []
    };
    nodes.push(node);

    const matchedScanner = getScannerForFilePath(absPath, registry);
    if (!matchedScanner) continue;

    const source = await readFile(absPath, "utf8");
    const result = await matchedScanner.scanner.scanFile({
      source,
      filePath: absPath,
      rootAbs,
      language: matchedScanner.language,
      fabric
    });

    for (const dependency of result.dependencies ?? []) {
      const targetRel = toPosix(path.relative(rootAbs, dependency.targetAbs));
      node.imports.push({ specifier: dependency.specifier, target: targetRel, kind: dependency.kind, language: matchedScanner.language.name });
      dependencyEdges.push({
        from: relPath,
        to: targetRel,
        specifier: dependency.specifier,
        targetAbs: dependency.targetAbs,
        language: matchedScanner.language.name,
        kind: dependency.kind
      });
    }
  }
}

export async function analyzeFolder(folderPath, options = {}) {
  const fabric = options.fabric ?? (await loadDefaultFabric());
  const registry = options.registry ?? (await loadScannerRegistry());
  const rootAbs = path.resolve(folderPath);
  const tree = [];
  const dependencyEdges = [];

  await walkFolder({ rootAbs, currentAbs: rootAbs, nodes: tree, dependencyEdges, fabric, registry });

  return {
    root: rootAbs,
    tree,
    dependencies: dependencyEdges,
    fabric
  };
}

export function renderAnalysisReport(analysis) {
  const lines = [];
  lines.push(`Root: ${analysis.root}`);
  lines.push("");
  lines.push("Tree:");
  if (analysis.tree.length === 0) {
    lines.push("  (empty)");
  } else {
    lines.push(...renderTree(analysis.tree, ""));
  }
  lines.push("");
  lines.push("Dependencies:");
  if (analysis.dependencies.length === 0) {
    lines.push("  (none found)");
  } else {
    for (const edge of analysis.dependencies) {
      lines.push(`  ${edge.from} -> ${edge.to} (${edge.specifier})`);
    }
  }
  return lines.join("\n");
}
