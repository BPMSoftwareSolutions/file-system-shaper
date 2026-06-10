import { cp, mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { analyzeFolder, renderTreeSketch } from "./analysis.js";
import { buildRetrievalContext, renderRetrievalContext } from "./context.js";
import { loadTargetShape, generateShapeManifest } from "./shape.js";
import { planReshape, applyReshape } from "./reshape.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../..");
const fixturesRoot = path.resolve(repoRoot, "fixtures/scenarios");
const defaultReportRoot = path.resolve(repoRoot, "evidence/reports");
const scenariosIndexPath = path.resolve(repoRoot, "fixtures/scenarios.json");

async function loadScenarioCatalog() {
  const text = await readFile(scenariosIndexPath, "utf8");
  return JSON.parse(text);
}

function normalizePaths(values) {
  return [...values].map((value) => value.split(path.sep).join("/")).sort();
}

function compareShape(actual, target) {
  const actualDirectories = normalizePaths(actual.directories ?? []);
  const actualFiles = normalizePaths(actual.files ?? []);
  const targetDirectories = normalizePaths(target.directories ?? []);
  const targetFiles = normalizePaths(target.files ?? []);

  return {
    directoriesMatch: JSON.stringify(actualDirectories) === JSON.stringify(targetDirectories),
    filesMatch: JSON.stringify(actualFiles) === JSON.stringify(targetFiles),
    actualDirectories,
    actualFiles,
    targetDirectories,
    targetFiles
  };
}

async function prepareScenarioWorkspace(scenarioId) {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "file-system-shaper-"));
  const sourceDir = path.resolve(fixturesRoot, scenarioId, "before");
  const workDir = path.join(tempRoot, "workspace");
  await cp(sourceDir, workDir, { recursive: true });
  return { tempRoot, workDir };
}

function renderScenarioReport({ scenario, beforeTree, context, plan, afterTree, validation, evidenceRoot }) {
  const lines = [];
  lines.push(`# ${scenario.id}`);
  lines.push("");
  lines.push(scenario.description);
  lines.push("");
  lines.push("## Retrieval Packet");
  lines.push("");
  lines.push("```text");
  lines.push(renderRetrievalContext(context));
  lines.push("```");
  lines.push("");
  lines.push("## Before");
  lines.push("");
  lines.push("```text");
  lines.push(beforeTree);
  lines.push("```");
  lines.push("");
  lines.push("## Plan");
  lines.push("");
  lines.push("```json");
  lines.push(JSON.stringify(plan, null, 2));
  lines.push("```");
  lines.push("");
  lines.push("## After");
  lines.push("");
  lines.push("```text");
  lines.push(afterTree);
  lines.push("```");
  lines.push("");
  lines.push("## Validation");
  lines.push("");
  lines.push(`- Shape match: ${validation.directoriesMatch && validation.filesMatch ? "PASS" : "FAIL"}`);
  lines.push(`- Directories match: ${validation.directoriesMatch}`);
  lines.push(`- Files match: ${validation.filesMatch}`);
  lines.push(`- Moved files: ${plan.moves.length}`);
  lines.push(`- Rewritten files: ${validation.rewrittenFiles}`);
  lines.push(`- Missing targets: ${plan.missingTargets.length}`);
  lines.push("");
  lines.push("## Evidence Root");
  lines.push("");
  lines.push(`- ${evidenceRoot}`);
  return lines.join("\n");
}

export async function runScenarioEvidence(scenario, options = {}) {
  const reportRoot = options.reportRoot ? path.resolve(options.reportRoot) : defaultReportRoot;
  await mkdir(reportRoot, { recursive: true });

  const { tempRoot, workDir } = await prepareScenarioWorkspace(scenario.id);
  try {
    const beforeAnalysis = await analyzeFolder(workDir);
    const context = await buildRetrievalContext(workDir);
    const targetShapePath = path.resolve(fixturesRoot, scenario.id, "target-shape.json");
    const targetShape = await loadTargetShape(targetShapePath);
    const plan = await planReshape(workDir, targetShape);
    const applied = await applyReshape(plan);
    const afterAnalysis = await analyzeFolder(workDir);
    const actualShape = await generateShapeManifest(workDir);
    const validation = {
      ...compareShape(actualShape, targetShape),
      rewrittenFiles: applied.rewritten.changedFiles
    };

    const report = renderScenarioReport({
      scenario,
      beforeTree: renderTreeSketch(beforeAnalysis),
      context,
      plan,
      afterTree: renderTreeSketch(afterAnalysis),
      validation,
      evidenceRoot: workDir
    });

    const scenarioReportDir = path.join(reportRoot, scenario.id);
    await mkdir(scenarioReportDir, { recursive: true });
    await writeFile(path.join(scenarioReportDir, "report.md"), `${report}\n`, "utf8");
    await writeFile(path.join(scenarioReportDir, "before-tree.txt"), `${renderTreeSketch(beforeAnalysis)}\n`, "utf8");
    await writeFile(path.join(scenarioReportDir, "after-tree.txt"), `${renderTreeSketch(afterAnalysis)}\n`, "utf8");
    await writeFile(path.join(scenarioReportDir, "context.txt"), `${renderRetrievalContext(context)}\n`, "utf8");
    await writeFile(path.join(scenarioReportDir, "plan.json"), `${JSON.stringify(plan, null, 2)}\n`, "utf8");
    await writeFile(path.join(scenarioReportDir, "validation.json"), `${JSON.stringify(validation, null, 2)}\n`, "utf8");

    return {
      scenario: scenario.id,
      reportPath: path.join(scenarioReportDir, "report.md"),
      validation,
      plan,
      context,
      beforeAnalysis,
      afterAnalysis
    };
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
}

export async function runEvidenceSuite(options = {}) {
  const catalog = await loadScenarioCatalog();
  const selected = options.scenarioId
    ? catalog.scenarios.filter((scenario) => scenario.id === options.scenarioId)
    : catalog.scenarios;

  const results = [];
  for (const scenario of selected) {
    results.push(await runScenarioEvidence(scenario, options));
  }
  return results;
}
