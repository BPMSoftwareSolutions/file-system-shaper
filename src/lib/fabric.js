import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultFabricPath = path.resolve(__dirname, "../../config/fabric.json");

let cachedFabric;

export async function loadFabric(fabricPath = defaultFabricPath) {
  if (!fabricPath || fabricPath === defaultFabricPath) {
    if (cachedFabric) return cachedFabric;
  }

  const text = await readFile(fabricPath, "utf8");
  const parsed = JSON.parse(text);
  const fabricDir = path.dirname(path.resolve(fabricPath));

  const languages = (parsed.languages ?? []).map((language) => ({
    ...language,
    scanner: path.resolve(fabricDir, language.scanner)
  }));

  const fabric = {
    ignoredDirectories: Array.isArray(parsed.ignoredDirectories) ? parsed.ignoredDirectories.map(String) : [".git", "node_modules"],
    context: {
      hotFileLimit: Number(parsed.context?.hotFileLimit ?? 10)
    },
    languages
  };

  if (fabricPath === defaultFabricPath) {
    cachedFabric = fabric;
  }

  return fabric;
}

export async function loadDefaultFabric() {
  return loadFabric(defaultFabricPath);
}

export function getLanguageForFilePath(filePath, fabric) {
  const extension = path.extname(filePath).toLowerCase();
  return fabric.languages.find((language) => language.extensions.map((value) => value.toLowerCase()).includes(extension)) ?? null;
}

export function getScannerByLanguageName(languageName, fabric) {
  return fabric.languages.find((language) => language.name === languageName) ?? null;
}
