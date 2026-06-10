#!/usr/bin/env node

import { writeFile } from "node:fs/promises";
import path from "node:path";
import { analyzeFolder, renderAnalysisReport } from "./lib/analysis.js";
import { buildRetrievalContext, renderRetrievalContext, renderRetrievalPrompt } from "./lib/context.js";
import { runEvidenceSuite } from "./lib/evidence.js";
import { loadTargetShape, generateShapeManifest } from "./lib/shape.js";
import { planReshape, applyReshape } from "./lib/reshape.js";

function printUsage() {
  process.stdout.write(`
file-system-shaper

Usage:
  file-system-shaper analyze <folder> [--json]
  file-system-shaper context <folder> [--json|--prompt]
  file-system-shaper evidence [--scenario <id>] [--output <dir>] [--json]
  file-system-shaper shape <folder> --output <shape.json>
  file-system-shaper reshape <folder> --shape <shape.json> [--dry-run]

Commands:
  analyze   Walk a folder and print an ASCII sketch plus dependency summary.
  context   Build the retrieval pack used to seed the agent context.
  evidence  Run the proof fixtures and write before/after reports.
  shape     Emit a target-shape manifest from the current tree.
  reshape   Move files and rewrite internal imports to match a target shape.
`);
}

function parseArgs(argv) {
  const args = [...argv];
  const command = args.shift();
  const options = {};
  const positionals = [];

  while (args.length > 0) {
    const value = args.shift();
    if (!value) break;
    if (value.startsWith("--")) {
      const key = value.slice(2);
      const next = args[0];
      if (next && !next.startsWith("--")) {
        options[key] = args.shift();
      } else {
        options[key] = true;
      }
    } else {
      positionals.push(value);
    }
  }

  return { command, positionals, options };
}

async function main() {
  const { command, positionals, options } = parseArgs(process.argv.slice(2));

  if (!command || command === "--help" || command === "-h") {
    printUsage();
    return;
  }

  if (command === "analyze") {
    const folder = positionals[0];
    if (!folder) throw new Error("analyze requires a folder path");
    const result = await analyzeFolder(folder);
    if (options.json) {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      return;
    }
    process.stdout.write(`${renderAnalysisReport(result)}\n`);
    return;
  }

  if (command === "context") {
    const folder = positionals[0];
    if (!folder) throw new Error("context requires a folder path");
    const context = await buildRetrievalContext(folder);
    if (options.json) {
      process.stdout.write(`${JSON.stringify(context, null, 2)}\n`);
      return;
    }
    if (options.prompt) {
      process.stdout.write(`${renderRetrievalPrompt(context)}\n`);
      return;
    }
    process.stdout.write(`${renderRetrievalContext(context)}\n`);
    return;
  }

  if (command === "evidence") {
    const scenarioId = options.scenario;
    const output = options.output;
    const results = await runEvidenceSuite({
      scenarioId,
      reportRoot: output
    });
    if (options.json) {
      process.stdout.write(`${JSON.stringify(results, null, 2)}\n`);
      return;
    }
    for (const result of results) {
      process.stdout.write(`${result.scenario}: ${result.validation.directoriesMatch && result.validation.filesMatch ? "PASS" : "FAIL"} -> ${result.reportPath}\n`);
    }
    return;
  }

  if (command === "shape") {
    const folder = positionals[0];
    const output = options.output;
    if (!folder) throw new Error("shape requires a folder path");
    if (!output) throw new Error("shape requires --output <shape.json>");
    const manifest = await generateShapeManifest(folder, { excludePaths: [path.resolve(output)] });
    await writeFile(output, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
    process.stdout.write(`Wrote target shape to ${path.resolve(output)}\n`);
    return;
  }

  if (command === "reshape") {
    const folder = positionals[0];
    const shapePath = options.shape;
    if (!folder) throw new Error("reshape requires a folder path");
    if (!shapePath) throw new Error("reshape requires --shape <shape.json>");

    const shape = await loadTargetShape(shapePath);
    const plan = await planReshape(folder, shape);

    if (options["dry-run"]) {
      process.stdout.write(`${JSON.stringify(plan, null, 2)}\n`);
      return;
    }

    const result = await applyReshape(plan);
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }

  printUsage();
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack || error.message : String(error)}\n`);
  process.exitCode = 1;
});
