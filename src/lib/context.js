import path from "node:path";
import { analyzeFolder } from "./analysis.js";
import { loadDefaultFabric, getLanguageForFilePath } from "./fabric.js";

function walkSummary(nodes, summary, directoryIndex, fileIndex, depth = 0, parentDir = "", fabric) {
  for (const node of nodes) {
    if (node.kind === "directory") {
      summary.directoryCount += 1;
      const dirPath = node.relPath;
      directoryIndex.push({
        path: dirPath,
        depth,
        childDirectories: node.children.filter((child) => child.kind === "directory").length,
        files: node.children.filter((child) => child.kind === "file").length
      });
      walkSummary(node.children, summary, directoryIndex, fileIndex, depth + 1, dirPath, fabric);
      continue;
    }

    summary.fileCount += 1;
    if (getLanguageForFilePath(node.absPath, fabric)) summary.codeFileCount += 1;
    const language = getLanguageForFilePath(node.absPath, fabric);
    fileIndex.push({
      path: node.relPath,
      directory: parentDir,
      imports: node.imports?.length ?? 0,
      size: node.size,
      code: Boolean(language),
      language: language?.name ?? null
    });
  }
}

function buildDependencyIndex(analysis) {
  const outbound = new Map();
  const inbound = new Map();

  for (const edge of analysis.dependencies) {
    if (!outbound.has(edge.from)) outbound.set(edge.from, []);
    outbound.get(edge.from).push(edge.to);

    if (!inbound.has(edge.to)) inbound.set(edge.to, []);
    inbound.get(edge.to).push(edge.from);
  }

  const dependencyEdges = analysis.dependencies.map((edge) => ({
    from: edge.from,
    to: edge.to,
    specifier: edge.specifier
  }));

  return { outbound, inbound, dependencyEdges };
}

function renderCompactTree(nodes, prefix = "") {
  const lines = [];

  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index];
    const isLast = index === nodes.length - 1;
    const branch = isLast ? "`-- " : "|-- ";
    const nextPrefix = prefix + (isLast ? "   " : "|  ");

    if (node.kind === "directory") {
      lines.push(`${prefix}${branch}${node.name}/`);
      lines.push(...renderCompactTree(node.children, nextPrefix));
      continue;
    }

    const imports = node.imports?.length ?? 0;
    lines.push(`${prefix}${branch}${node.name}${imports ? ` [${imports}]` : ""}`);
  }

  return lines;
}

export async function buildRetrievalContext(folderPath) {
  const fabric = await loadDefaultFabric();
  const analysis = await analyzeFolder(folderPath, { fabric });
  const summary = {
    directoryCount: 0,
    fileCount: 0,
    codeFileCount: 0,
    dependencyCount: analysis.dependencies.length,
    hotFileLimit: fabric.context.hotFileLimit
  };
  const directoryIndex = [];
  const fileIndex = [];
  walkSummary(analysis.tree, summary, directoryIndex, fileIndex, 0, "", fabric);

  const { outbound, inbound, dependencyEdges } = buildDependencyIndex(analysis);
  const highSignalFiles = fileIndex
    .filter((file) => file.code)
    .map((file) => ({
      path: file.path,
      language: file.language,
      inboundCount: inbound.get(file.path)?.length ?? 0,
      outboundCount: outbound.get(file.path)?.length ?? 0
    }))
    .sort((a, b) => {
      if (b.inboundCount !== a.inboundCount) return b.inboundCount - a.inboundCount;
      if (b.outboundCount !== a.outboundCount) return b.outboundCount - a.outboundCount;
      return a.path.localeCompare(b.path);
    })
    .slice(0, fabric.context.hotFileLimit);

  return {
    root: analysis.root,
    summary,
    taxonomy: {
      tree: renderCompactTree(analysis.tree),
      directories: directoryIndex,
      files: fileIndex
    },
    dependencyGraph: {
      edges: dependencyEdges,
      inbound: Object.fromEntries([...inbound.entries()].map(([key, value]) => [key, value])),
      outbound: Object.fromEntries([...outbound.entries()].map(([key, value]) => [key, value]))
    },
    highSignalFiles
  };
}

export function renderRetrievalContext(context) {
  const lines = [];
  lines.push(`Root: ${context.root}`);
  lines.push("");
  lines.push("Taxonomy:");
  if (context.taxonomy.tree.length === 0) {
    lines.push("  (empty)");
  } else {
    lines.push(...context.taxonomy.tree.map((line) => `  ${line}`));
  }
  lines.push("");
  lines.push("Signals:");
  lines.push(`  Directories: ${context.summary.directoryCount}`);
  lines.push(`  Files: ${context.summary.fileCount}`);
  lines.push(`  Code files: ${context.summary.codeFileCount}`);
  lines.push(`  Dependencies: ${context.summary.dependencyCount}`);
  lines.push(`  Hot file limit: ${context.summary.hotFileLimit}`);
  lines.push("");
  lines.push("Hot Files:");
  if (context.highSignalFiles.length === 0) {
    lines.push("  (none)");
  } else {
    for (const file of context.highSignalFiles) {
      lines.push(`  ${file.path} [in:${file.inboundCount} out:${file.outboundCount}]`);
    }
  }
  lines.push("");
  lines.push("Agent Instructions:");
  lines.push("  - Use the taxonomy as the canonical map of the current tree.");
  lines.push("  - Prefer moving files over editing their contents when a target shape only changes location.");
  lines.push("  - Recompute relative imports only for files affected by a move or rename.");
  lines.push("  - Treat high-signal files as the main dependency hubs when deciding what must be rewritten.");
  return lines.join("\n");
}

export function renderRetrievalPrompt(context) {
  return [
    "You are reshaping a file system to match a target shape.",
    "Use the following seeded context to minimize reasoning:",
    "",
    renderRetrievalContext(context)
  ].join("\n");
}
