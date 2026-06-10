import path from "node:path";
import { promises as fs } from "node:fs";

function toPosix(value) {
  return value.split(path.sep).join("/");
}

async function existsAsFile(candidate) {
  try {
    const stat = await fs.stat(candidate);
    return stat.isFile();
  } catch {
    return false;
  }
}

function stripExtension(filePath) {
  const ext = path.extname(filePath);
  if (!ext) return filePath;
  return filePath.slice(0, -ext.length);
}

function pathToPythonModule(rootAbs, targetAbs) {
  const rootResolved = path.resolve(rootAbs);
  const targetResolved = path.resolve(targetAbs);
  const relative = toPosix(path.relative(rootResolved, targetResolved));
  if (!relative || relative === ".") return "";

  const noExt = stripExtension(relative);
  const normalized = noExt.replace(/\/__init__$/, "");
  return normalized.split("/").filter(Boolean).join(".");
}

function relativeToPythonModule(fromFileAbs, targetAbs) {
  const fromDir = path.dirname(fromFileAbs);
  const targetResolved = path.resolve(targetAbs);
  const relative = toPosix(path.relative(fromDir, targetResolved));
  const parts = relative.split("/").filter(Boolean);

  let upLevels = 0;
  while (parts[upLevels] === "..") upLevels += 1;
  const remainder = parts.slice(upLevels);
  const targetNoExt = stripExtension(remainder.join("/")).replace(/\/__init__$/, "");
  const prefix = ".".repeat(upLevels + 1);
  return targetNoExt ? `${prefix}${targetNoExt.split("/").join(".")}` : prefix;
}

function pythonTargetModulePath(targetAbs) {
  const resolved = path.resolve(targetAbs);
  if (path.basename(resolved) === "__init__.py") {
    return path.dirname(resolved);
  }
  return stripExtension(resolved);
}

export async function resolveDependencyTarget({ fromFileAbs, specifier, rootAbs, language }) {
  if (language.moduleStyle === "javascript") {
    if (!specifier.startsWith(".")) return null;

    const baseDir = path.dirname(fromFileAbs);
    const direct = path.resolve(baseDir, specifier);
    const candidates = [direct];

    if (!path.extname(direct)) {
      for (const ext of language.resolutionExtensions ?? []) {
        candidates.push(`${direct}${ext}`);
      }
      for (const indexFile of language.indexFiles ?? []) {
        candidates.push(path.join(direct, indexFile));
      }
    }

    for (const candidate of candidates) {
      if (await existsAsFile(candidate)) return path.resolve(candidate);
    }
    return null;
  }

  if (language.moduleStyle === "python") {
    const moduleToken = specifier.trim();
    const relative = moduleToken.startsWith(".");
    const leadingDots = (moduleToken.match(/^\.+/)?.[0].length ?? 0);
    const token = moduleToken.replace(/^\.+/, "");
    const segments = token ? token.split(".").filter(Boolean) : [];

    let baseDir = relative ? path.dirname(fromFileAbs) : path.resolve(rootAbs);
    if (relative && leadingDots > 1) {
      for (let index = 1; index < leadingDots; index += 1) {
        baseDir = path.dirname(baseDir);
      }
    }

    const relativePath = segments.join(path.sep);
    const direct = path.resolve(baseDir, relativePath);
    const candidates = [direct];

    for (const ext of language.resolutionExtensions ?? []) {
      candidates.push(`${direct}${ext}`);
    }
    for (const indexFile of language.indexFiles ?? []) {
      candidates.push(path.join(direct, indexFile));
    }

    for (const candidate of candidates) {
      if (await existsAsFile(candidate)) return path.resolve(candidate);
    }

    return null;
  }

  return null;
}

export function formatDependencySpecifier({ fromFileAbs, targetAbs, originalSpecifier, rootAbs, language }) {
  if (language.moduleStyle === "javascript") {
    const fromDir = path.dirname(fromFileAbs);
    let relative = toPosix(path.relative(fromDir, targetAbs));

    if (!relative.startsWith(".")) {
      relative = `./${relative}`;
    }

    const originalHadExtension = Boolean(path.extname(originalSpecifier));
    if (!originalHadExtension) {
      relative = stripExtension(relative);
      relative = relative.replace(/\/index$/, "");
    }

    return relative;
  }

  if (language.moduleStyle === "python") {
    const original = originalSpecifier.trim();
    const targetModulePath = pythonTargetModulePath(targetAbs);
    if (original.startsWith(".")) {
      return relativeToPythonModule(fromFileAbs, targetModulePath);
    }
    return pathToPythonModule(rootAbs, targetModulePath);
  }

  return originalSpecifier;
}
