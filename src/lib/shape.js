import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { analyzeFolder } from "./analysis.js";
import { loadDefaultFabric } from "./fabric.js";

function collectPaths(tree, directories, files, excludeAbsPaths = new Set()) {
  for (const node of tree) {
    if (excludeAbsPaths.has(path.resolve(node.absPath))) continue;
    if (node.kind === "directory") {
      directories.push(node.relPath);
      collectPaths(node.children, directories, files, excludeAbsPaths);
      continue;
    }
    files.push(node.relPath);
  }
}

export async function generateShapeManifest(folderPath, options = {}) {
  const fabric = await loadDefaultFabric();
  const analysis = await analyzeFolder(folderPath, { fabric });
  const directories = [];
  const files = [];
  const excludeAbsPaths = new Set((options.excludePaths ?? []).map((value) => path.resolve(value)));
  collectPaths(analysis.tree, directories, files, excludeAbsPaths);

  return {
    root: ".",
    directories,
    files,
    moves: []
  };
}

export async function loadTargetShape(shapePath) {
  const text = await readFile(shapePath, "utf8");
  const parsed = JSON.parse(text);
  const shapeDir = path.dirname(path.resolve(shapePath));

  const resolveRoot = (value) => {
    if (!value) return undefined;
    return path.isAbsolute(value) ? value : path.resolve(shapeDir, value);
  };

  return {
    root: resolveRoot(parsed.root),
    directories: Array.isArray(parsed.directories) ? parsed.directories.map(String) : [],
    files: Array.isArray(parsed.files) ? parsed.files.map(String) : [],
    moves: Array.isArray(parsed.moves)
      ? parsed.moves.map((move) => ({
          from: String(move.from),
          to: String(move.to)
        }))
      : []
  };
}
