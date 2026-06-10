import { extractPatternMatches } from "../lib/scan-patterns.js";
import { formatDependencySpecifier, resolveDependencyTarget } from "../lib/import-resolution.js";

export async function scanFile({ source, filePath, rootAbs, language, fabric }) {
  const matches = extractPatternMatches(source, language.patterns ?? []);
  const dependencies = [];

  for (const match of matches) {
    const targetAbs = await resolveDependencyTarget({
      fromFileAbs: filePath,
      specifier: match.specifier,
      rootAbs,
      language
    });
    if (!targetAbs) continue;
    dependencies.push({
      from: filePath,
      specifier: match.specifier,
      targetAbs,
      kind: match.kind
    });
  }

  return { dependencies };
}

export async function rewriteFile({ source, filePath, rootAbs, language, dependencies, movedTargets }) {
  const matches = extractPatternMatches(source, language.patterns ?? []);
  if (matches.length === 0) return { source, changed: false };

  const dependencyMap = new Map(dependencies.map((dependency) => [dependency.specifier, dependency]));
  let updated = source;
  let changed = false;

  for (const match of [...matches].reverse()) {
    const dependency = dependencyMap.get(match.specifier);
    if (!dependency) continue;
    const nextTargetAbs = movedTargets.get(dependency.targetAbs) ?? dependency.targetAbs;
    const nextSpecifier = formatDependencySpecifier({
      fromFileAbs: filePath,
      targetAbs: nextTargetAbs,
      originalSpecifier: dependency.specifier,
      rootAbs,
      language
    });

    if (nextSpecifier === match.specifier) continue;
    updated = `${updated.slice(0, match.start)}${match.full.replace(match.specifier, nextSpecifier)}${updated.slice(match.end)}`;
    changed = true;
  }

  return { source: updated, changed };
}

export default { scanFile, rewriteFile };
