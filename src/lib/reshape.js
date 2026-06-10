import { mkdir, rename, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { analyzeFolder } from "./analysis.js";
import { loadDefaultFabric } from "./fabric.js";
import { loadScannerRegistry, getScannerForFilePath } from "./scanner-registry.js";

function normalize(value) {
  return path.normalize(value).split(path.sep).join("/").replace(/^\.\//, "");
}

function isUnderSource(rel, source) {
  const normalizedRel = normalize(rel);
  const normalizedSource = normalize(source);
  return normalizedRel === normalizedSource || normalizedRel.startsWith(`${normalizedSource}/`);
}

function groupDependenciesBySource(dependencies) {
  const map = new Map();
  for (const dependency of dependencies) {
    const source = dependency.from;
    if (!map.has(source)) map.set(source, []);
    map.get(source).push(dependency);
  }
  return map;
}

async function collectExistingNodes(rootAbs, fabric, registry) {
  const analysis = await analyzeFolder(rootAbs, { fabric, registry });
  const flattened = [];

  const visit = (nodes) => {
    for (const node of nodes) {
      flattened.push(node);
      if (node.kind === "directory") visit(node.children);
    }
  };
  visit(analysis.tree);

  return { analysis, flattened };
}

export async function planReshape(folderPath, targetShape) {
  const fabric = await loadDefaultFabric();
  const registry = await loadScannerRegistry();
  const rootAbs = path.resolve(folderPath);
  const { analysis, flattened } = await collectExistingNodes(rootAbs, fabric, registry);

  const targetDirectories = targetShape.directories.map((value) => normalize(value));
  const targetFiles = targetShape.files.map((value) => normalize(value));
  const targetMoves = targetShape.moves.map((move) => ({
    from: normalize(move.from),
    to: normalize(move.to)
  }));
  const targetPaths = [...targetDirectories, ...targetFiles];

  const claimedTargets = new Set();
  const moves = [];
  const moveSources = new Set();

  for (const move of targetMoves) {
    const fromAbs = path.resolve(rootAbs, move.from);
    const toAbs = path.resolve(rootAbs, move.to);
    moves.push({ from: fromAbs, to: toAbs, fromRel: move.from, toRel: move.to, explicit: true });
    claimedTargets.add(move.to);
    moveSources.add(move.from);
  }

  for (const node of flattened) {
    if (node.kind !== "directory") continue;
    const rel = normalize(node.relPath);
    if (rel === "." || rel === "") continue;
    if ([...moveSources].some((source) => isUnderSource(rel, source))) continue;
    if (targetPaths.includes(rel)) {
      claimedTargets.add(rel);
      continue;
    }
    const basename = path.basename(rel);
    const sameBase = targetPaths.filter((candidate) => path.basename(candidate) === basename);
    const available = sameBase.filter((candidate) => !claimedTargets.has(normalize(candidate)));
    if (available.length !== 1) continue;
    const nextTarget = normalize(available[0]);
    if (nextTarget === rel) {
      claimedTargets.add(nextTarget);
      continue;
    }
    moves.push({
      from: node.absPath,
      to: path.resolve(rootAbs, nextTarget),
      fromRel: rel,
      toRel: nextTarget,
      explicit: false
    });
    claimedTargets.add(nextTarget);
    moveSources.add(rel);
  }

  for (const node of flattened) {
    if (node.kind !== "file") continue;
    const rel = normalize(node.relPath);
    if ([...moveSources].some((source) => isUnderSource(rel, source))) continue;
    if (moves.some((move) => isUnderSource(rel, move.fromRel))) continue;
    if (targetPaths.includes(rel)) {
      claimedTargets.add(rel);
      continue;
    }
    const basename = path.basename(rel);
    const sameBase = targetPaths.filter((candidate) => path.basename(candidate) === basename);
    const available = sameBase.filter((candidate) => !claimedTargets.has(normalize(candidate)));
    if (available.length !== 1) continue;
    const nextTarget = normalize(available[0]);
    if (nextTarget === rel) {
      claimedTargets.add(nextTarget);
      continue;
    }
    moves.push({
      from: node.absPath,
      to: path.resolve(rootAbs, nextTarget),
      fromRel: rel,
      toRel: nextTarget,
      explicit: false
    });
    claimedTargets.add(nextTarget);
    moveSources.add(rel);
  }

  for (const move of moves) {
    const fromRel = normalize(move.fromRel);
    const toRel = normalize(move.toRel);
    for (const node of flattened) {
      const nodeRel = normalize(node.relPath);
      if (nodeRel !== fromRel && !nodeRel.startsWith(`${fromRel}/`)) continue;
      const suffix = nodeRel === fromRel ? "" : nodeRel.slice(fromRel.length + 1);
      const mapped = suffix ? normalize(path.posix.join(toRel, suffix)) : toRel;
      if (targetPaths.includes(mapped)) {
        claimedTargets.add(mapped);
      }
    }
  }

  const missingTargets = targetPaths.filter((target) => !claimedTargets.has(target));
  const analysisBefore = {
    root: analysis.root,
    tree: analysis.tree,
    dependencies: analysis.dependencies
  };

  return {
    root: rootAbs,
    target: {
      root: targetShape.root ? path.resolve(targetShape.root) : rootAbs,
      directories: targetShape.directories,
      files: targetShape.files,
      moves: targetShape.moves
    },
    analysisBefore,
    moves,
    missingTargets
  };
}

async function ensureParentDir(filePath) {
  await mkdir(path.dirname(filePath), { recursive: true });
}

async function executeMoves(moves) {
  let moved = 0;
  for (const move of moves) {
    if (normalize(move.from) === normalize(move.to)) continue;
    await ensureParentDir(move.to);
    await rename(move.from, move.to);
    moved += 1;
  }
  return moved;
}

async function rewriteImportsAfterMove(plan, fabric, registry) {
  const currentAnalysis = await analyzeFolder(plan.root, { fabric, registry });
  const dependencyBySource = groupDependenciesBySource(plan.analysisBefore.dependencies);
  const movedTargets = new Map();
  const currentToOriginalSource = new Map();
  const originalNodes = [];

  const flattenOriginal = (nodes) => {
    for (const node of nodes) {
      originalNodes.push(node);
      if (node.kind === "directory") flattenOriginal(node.children);
    }
  };
  flattenOriginal(plan.analysisBefore.tree);

  for (const move of plan.moves) {
    const fromRel = normalize(move.fromRel);
    const toRel = normalize(move.toRel);
    for (const node of originalNodes) {
      const nodeRel = normalize(node.relPath);
      if (nodeRel !== fromRel && !nodeRel.startsWith(`${fromRel}/`)) continue;
      const suffix = nodeRel === fromRel ? "" : nodeRel.slice(fromRel.length + 1);
      const currentRel = suffix ? normalize(path.posix.join(toRel, suffix)) : toRel;
      movedTargets.set(path.resolve(plan.root, nodeRel), path.resolve(plan.root, currentRel));
      currentToOriginalSource.set(path.resolve(plan.root, currentRel), node.relPath);
    }
  }

  let changedFiles = 0;
  const visit = async (nodes) => {
    for (const node of nodes) {
      if (node.kind === "directory") {
        await visit(node.children);
        continue;
      }

      const scannerEntry = getScannerForFilePath(node.absPath, registry);
      if (!scannerEntry) continue;

      const source = await readFile(node.absPath, "utf8");
      const originalRel = currentToOriginalSource.get(path.resolve(node.absPath)) ?? node.relPath;
      const dependencies = dependencyBySource.get(originalRel) ?? [];
      const result = await scannerEntry.scanner.rewriteFile({
        source,
        filePath: node.absPath,
        rootAbs: plan.root,
        language: scannerEntry.language,
        dependencies,
        movedTargets,
        fabric
      });

      if (!result.changed) continue;
      await writeFile(node.absPath, result.source, "utf8");
      changedFiles += 1;
    }
  };

  await visit(currentAnalysis.tree);
  return { changedFiles };
}

export async function applyReshape(plan) {
  const fabric = await loadDefaultFabric();
  const registry = await loadScannerRegistry();
  const moved = await executeMoves(plan.moves);
  const rewritten = await rewriteImportsAfterMove(plan, fabric, registry);
  return {
    root: plan.root,
    moved,
    rewritten,
    missingTargets: plan.missingTargets
  };
}
