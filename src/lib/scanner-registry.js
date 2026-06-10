import { pathToFileURL } from "node:url";
import { loadDefaultFabric } from "./fabric.js";

let cachedRegistry;

export async function loadScannerRegistry() {
  if (cachedRegistry) return cachedRegistry;

  const fabric = await loadDefaultFabric();
  const entries = [];

  for (const language of fabric.languages) {
    const module = await import(pathToFileURL(language.scanner).href);
    entries.push({
      language,
      scanner: module.default ?? module
    });
  }

  cachedRegistry = { fabric, entries };
  return cachedRegistry;
}

export function getScannerForFilePath(filePath, registry) {
  const lower = filePath.toLowerCase();
  return (
    registry.entries.find(({ language }) =>
      language.extensions.some((extension) => lower.endsWith(extension.toLowerCase()))
    ) ?? null
  );
}
