# File System Shaper

An internal experiment for:

1. Walking a folder tree
2. Rendering an ASCII sketch of folders, files, and internal code dependencies
3. Capturing a target shape manifest
4. Reshaping files into the target structure
5. Rewriting relative imports after moves and renames
6. Seeding the agent with a compact retrieval context instead of a giant hard-coded prompt

## Commands

```bash
node src/cli.js analyze <folder>
node src/cli.js context <folder>
node src/cli.js evidence
node src/cli.js shape <folder> --output target-shape.json
node src/cli.js reshape <folder> --shape target-shape.json
```

The `context` command is the retrieval pack for the agent. It compresses the tree into a seeded taxonomy, a dependency graph, and a short set of instructions so the model can focus on path updates instead of re-discovering the whole repository structure.

## Architecture

- `config/fabric.json` is the data fabric. It holds the ignored directories, language registry, scan patterns, and hot-file settings.
- `src/scanners/javascript.js` and `src/scanners/python.js` are separate language modules.
- `src/lib/analysis.js` uses the fabric and scanner registry to build the tree and dependency graph.
- `src/lib/context.js` turns that graph into retrieval context for the agent.
- `src/lib/reshape.js` uses the original dependency map plus move targets to rewrite imports after a reshape.
- `fixtures/scenarios/` contains the proof fixtures and target shapes.
- `evidence/reports/` receives the generated before/after reports for each proof scenario.

## Evidence Suite

Run `node src/cli.js evidence` to execute the full proof set:

- `js-only` for a pure JavaScript directory move
- `python-only` for a pure Python package move
- `mixed-chaos` for a mixed JavaScript and Python tree with two independent subtree moves

Each report captures:

- The seeded retrieval packet
- The before ASCII sketch
- The planned move set
- The after ASCII sketch
- Validation that the final shape matches the target manifest

## Target shape format

The manifest is JSON:

```json
{
  "directories": [
    "src/core",
    "src/workers"
  ],
  "files": [
    "src/core/index.js",
    "src/workers/bee.js"
  ],
  "moves": [
    {
      "from": "src/legacy/bee.js",
      "to": "src/workers/bee.js"
    }
  ]
}
```

Notes:

- `directories` and `files` are the desired paths in the final shape.
- `moves` is optional and is the escape hatch for true renames when basename matching is not enough.
- When a file is moved, the reshaper rewrites relative imports that point to internal code files.

## Current scope

This is a focused MVP. It is intended to be a reliable foundation for a larger worker-bee style pipeline rather than a fully general refactoring engine.
