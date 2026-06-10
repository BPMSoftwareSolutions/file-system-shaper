# mixed-chaos

A mixed JavaScript and Python repo with two independent subtree moves.

## Retrieval Packet

```text
Root: C:\Users\SIDNEY~1\AppData\Local\Temp\file-system-shaper-9aOyoH\workspace

Taxonomy:
  |-- service/
  |  `-- app/
  |     |-- __init__.py
  |     |-- legacy/
  |     |  |-- __init__.py
  |     |  |-- pipeline.py [1]
  |     |  `-- steps/
  |     |     |-- __init__.py
  |     |     `-- collector.py
  |     `-- main.py [2]
  `-- web/
     `-- src/
        |-- index.js [2]
        `-- legacy/
           |-- api.js [1]
           |-- codec.js
           `-- widgets/
              |-- chart.js
              |-- index.js [2]
              `-- table.js

Signals:
  Directories: 8
  Files: 12
  Code files: 12
  Dependencies: 8
  Hot file limit: 10

Hot Files:
  service/app/legacy/steps/collector.py [in:2 out:0]
  web/src/legacy/widgets/index.js [in:1 out:2]
  service/app/legacy/pipeline.py [in:1 out:1]
  web/src/legacy/api.js [in:1 out:1]
  web/src/legacy/codec.js [in:1 out:0]
  web/src/legacy/widgets/chart.js [in:1 out:0]
  web/src/legacy/widgets/table.js [in:1 out:0]
  service/app/main.py [in:0 out:2]
  web/src/index.js [in:0 out:2]
  service/app/__init__.py [in:0 out:0]

Agent Instructions:
  - Use the taxonomy as the canonical map of the current tree.
  - Prefer moving files over editing their contents when a target shape only changes location.
  - Recompute relative imports only for files affected by a move or rename.
  - Treat high-signal files as the main dependency hubs when deciding what must be rewritten.
```

## Before

```text
|-- service/
|  `-- app/
|     |-- __init__.py
|     |-- legacy/
|     |  |-- __init__.py
|     |  |-- pipeline.py [imports: 1]
|     |  `-- steps/
|     |     |-- __init__.py
|     |     `-- collector.py
|     `-- main.py [imports: 2]
`-- web/
   `-- src/
      |-- index.js [imports: 2]
      `-- legacy/
         |-- api.js [imports: 1]
         |-- codec.js
         `-- widgets/
            |-- chart.js
            |-- index.js [imports: 2]
            `-- table.js
```

## Plan

```json
{
  "root": "C:\\Users\\SIDNEY~1\\AppData\\Local\\Temp\\file-system-shaper-9aOyoH\\workspace",
  "target": {
    "root": "C:\\source\\repos\\bpm\\internal\\multi-agent\\fixtures\\scenarios\\mixed-chaos",
    "directories": [
      "web",
      "web/src",
      "web/src/core",
      "web/src/core/widgets",
      "service",
      "service/app",
      "service/app/domain",
      "service/app/domain/steps"
    ],
    "files": [
      "web/src/index.js",
      "web/src/core/api.js",
      "web/src/core/codec.js",
      "web/src/core/widgets/index.js",
      "web/src/core/widgets/chart.js",
      "web/src/core/widgets/table.js",
      "service/app/__init__.py",
      "service/app/main.py",
      "service/app/domain/__init__.py",
      "service/app/domain/pipeline.py",
      "service/app/domain/steps/__init__.py",
      "service/app/domain/steps/collector.py"
    ],
    "moves": [
      {
        "from": "web/src/legacy",
        "to": "web/src/core"
      },
      {
        "from": "service/app/legacy",
        "to": "service/app/domain"
      }
    ]
  },
  "analysisBefore": {
    "root": "C:\\Users\\SIDNEY~1\\AppData\\Local\\Temp\\file-system-shaper-9aOyoH\\workspace",
    "tree": [
      {
        "kind": "directory",
        "name": "service",
        "relPath": "service",
        "absPath": "C:\\Users\\SIDNEY~1\\AppData\\Local\\Temp\\file-system-shaper-9aOyoH\\workspace\\service",
        "children": [
          {
            "kind": "directory",
            "name": "app",
            "relPath": "service/app",
            "absPath": "C:\\Users\\SIDNEY~1\\AppData\\Local\\Temp\\file-system-shaper-9aOyoH\\workspace\\service\\app",
            "children": [
              {
                "kind": "file",
                "name": "__init__.py",
                "relPath": "service/app/__init__.py",
                "absPath": "C:\\Users\\SIDNEY~1\\AppData\\Local\\Temp\\file-system-shaper-9aOyoH\\workspace\\service\\app\\__init__.py",
                "size": 17,
                "imports": []
              },
              {
                "kind": "directory",
                "name": "legacy",
                "relPath": "service/app/legacy",
                "absPath": "C:\\Users\\SIDNEY~1\\AppData\\Local\\Temp\\file-system-shaper-9aOyoH\\workspace\\service\\app\\legacy",
                "children": [
                  {
                    "kind": "file",
                    "name": "__init__.py",
                    "relPath": "service/app/legacy/__init__.py",
                    "absPath": "C:\\Users\\SIDNEY~1\\AppData\\Local\\Temp\\file-system-shaper-9aOyoH\\workspace\\service\\app\\legacy\\__init__.py",
                    "size": 17,
                    "imports": []
                  },
                  {
                    "kind": "file",
                    "name": "pipeline.py",
                    "relPath": "service/app/legacy/pipeline.py",
                    "absPath": "C:\\Users\\SIDNEY~1\\AppData\\Local\\Temp\\file-system-shaper-9aOyoH\\workspace\\service\\app\\legacy\\pipeline.py",
                    "size": 110,
                    "imports": [
                      {
                        "specifier": ".steps.collector",
                        "target": "service/app/legacy/steps/collector.py",
                        "kind": "from-import",
                        "language": "python"
                      }
                    ]
                  },
                  {
                    "kind": "directory",
                    "name": "steps",
                    "relPath": "service/app/legacy/steps",
                    "absPath": "C:\\Users\\SIDNEY~1\\AppData\\Local\\Temp\\file-system-shaper-9aOyoH\\workspace\\service\\app\\legacy\\steps",
                    "children": [
                      {
                        "kind": "file",
                        "name": "__init__.py",
                        "relPath": "service/app/legacy/steps/__init__.py",
                        "absPath": "C:\\Users\\SIDNEY~1\\AppData\\Local\\Temp\\file-system-shaper-9aOyoH\\workspace\\service\\app\\legacy\\steps\\__init__.py",
                        "size": 17,
                        "imports": []
                      },
                      {
                        "kind": "file",
                        "name": "collector.py",
                        "relPath": "service/app/legacy/steps/collector.py",
                        "absPath": "C:\\Users\\SIDNEY~1\\AppData\\Local\\Temp\\file-system-shaper-9aOyoH\\workspace\\service\\app\\legacy\\steps\\collector.py",
                        "size": 53,
                        "imports": []
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "file",
                "name": "main.py",
                "relPath": "service/app/main.py",
                "absPath": "C:\\Users\\SIDNEY~1\\AppData\\Local\\Temp\\file-system-shaper-9aOyoH\\workspace\\service\\app\\main.py",
                "size": 135,
                "imports": [
                  {
                    "specifier": ".legacy.pipeline",
                    "target": "service/app/legacy/pipeline.py",
                    "kind": "from-import",
                    "language": "python"
                  },
                  {
                    "specifier": ".legacy.steps.collector",
                    "target": "service/app/legacy/steps/collector.py",
                    "kind": "from-import",
                    "language": "python"
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "kind": "directory",
        "name": "web",
        "relPath": "web",
        "absPath": "C:\\Users\\SIDNEY~1\\AppData\\Local\\Temp\\file-system-shaper-9aOyoH\\workspace\\web",
        "children": [
          {
            "kind": "directory",
            "name": "src",
            "relPath": "web/src",
            "absPath": "C:\\Users\\SIDNEY~1\\AppData\\Local\\Temp\\file-system-shaper-9aOyoH\\workspace\\web\\src",
            "children": [
              {
                "kind": "file",
                "name": "index.js",
                "relPath": "web/src/index.js",
                "absPath": "C:\\Users\\SIDNEY~1\\AppData\\Local\\Temp\\file-system-shaper-9aOyoH\\workspace\\web\\src\\index.js",
                "size": 159,
                "imports": [
                  {
                    "specifier": "./legacy/api.js",
                    "target": "web/src/legacy/api.js",
                    "kind": "import-from",
                    "language": "javascript"
                  },
                  {
                    "specifier": "./legacy/widgets/index.js",
                    "target": "web/src/legacy/widgets/index.js",
                    "kind": "import-from",
                    "language": "javascript"
                  }
                ]
              },
              {
                "kind": "directory",
                "name": "legacy",
                "relPath": "web/src/legacy",
                "absPath": "C:\\Users\\SIDNEY~1\\AppData\\Local\\Temp\\file-system-shaper-9aOyoH\\workspace\\web\\src\\legacy",
                "children": [
                  {
                    "kind": "file",
                    "name": "api.js",
                    "relPath": "web/src/legacy/api.js",
                    "absPath": "C:\\Users\\SIDNEY~1\\AppData\\Local\\Temp\\file-system-shaper-9aOyoH\\workspace\\web\\src\\legacy\\api.js",
                    "size": 118,
                    "imports": [
                      {
                        "specifier": "./codec.js",
                        "target": "web/src/legacy/codec.js",
                        "kind": "import-from",
                        "language": "javascript"
                      }
                    ]
                  },
                  {
                    "kind": "file",
                    "name": "codec.js",
                    "relPath": "web/src/legacy/codec.js",
                    "absPath": "C:\\Users\\SIDNEY~1\\AppData\\Local\\Temp\\file-system-shaper-9aOyoH\\workspace\\web\\src\\legacy\\codec.js",
                    "size": 77,
                    "imports": []
                  },
                  {
                    "kind": "directory",
                    "name": "widgets",
                    "relPath": "web/src/legacy/widgets",
                    "absPath": "C:\\Users\\SIDNEY~1\\AppData\\Local\\Temp\\file-system-shaper-9aOyoH\\workspace\\web\\src\\legacy\\widgets",
                    "children": [
                      {
                        "kind": "file",
                        "name": "chart.js",
                        "relPath": "web/src/legacy/widgets/chart.js",
                        "absPath": "C:\\Users\\SIDNEY~1\\AppData\\Local\\Temp\\file-system-shaper-9aOyoH\\workspace\\web\\src\\legacy\\widgets\\chart.js",
                        "size": 52,
                        "imports": []
                      },
                      {
                        "kind": "file",
                        "name": "index.js",
                        "relPath": "web/src/legacy/widgets/index.js",
                        "absPath": "C:\\Users\\SIDNEY~1\\AppData\\Local\\Temp\\file-system-shaper-9aOyoH\\workspace\\web\\src\\legacy\\widgets\\index.js",
                        "size": 84,
                        "imports": [
                          {
                            "specifier": "./chart.js",
                            "target": "web/src/legacy/widgets/chart.js",
                            "kind": "export-from",
                            "language": "javascript"
                          },
                          {
                            "specifier": "./table.js",
                            "target": "web/src/legacy/widgets/table.js",
                            "kind": "export-from",
                            "language": "javascript"
                          }
                        ]
                      },
                      {
                        "kind": "file",
                        "name": "table.js",
                        "relPath": "web/src/legacy/widgets/table.js",
                        "absPath": "C:\\Users\\SIDNEY~1\\AppData\\Local\\Temp\\file-system-shaper-9aOyoH\\workspace\\web\\src\\legacy\\widgets\\table.js",
                        "size": 52,
                        "imports": []
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ],
    "dependencies": [
      {
        "from": "service/app/legacy/pipeline.py",
        "to": "service/app/legacy/steps/collector.py",
        "specifier": ".steps.collector",
        "targetAbs": "C:\\Users\\SIDNEY~1\\AppData\\Local\\Temp\\file-system-shaper-9aOyoH\\workspace\\service\\app\\legacy\\steps\\collector.py",
        "language": "python",
        "kind": "from-import"
      },
      {
        "from": "service/app/main.py",
        "to": "service/app/legacy/pipeline.py",
        "specifier": ".legacy.pipeline",
        "targetAbs": "C:\\Users\\SIDNEY~1\\AppData\\Local\\Temp\\file-system-shaper-9aOyoH\\workspace\\service\\app\\legacy\\pipeline.py",
        "language": "python",
        "kind": "from-import"
      },
      {
        "from": "service/app/main.py",
        "to": "service/app/legacy/steps/collector.py",
        "specifier": ".legacy.steps.collector",
        "targetAbs": "C:\\Users\\SIDNEY~1\\AppData\\Local\\Temp\\file-system-shaper-9aOyoH\\workspace\\service\\app\\legacy\\steps\\collector.py",
        "language": "python",
        "kind": "from-import"
      },
      {
        "from": "web/src/index.js",
        "to": "web/src/legacy/api.js",
        "specifier": "./legacy/api.js",
        "targetAbs": "C:\\Users\\SIDNEY~1\\AppData\\Local\\Temp\\file-system-shaper-9aOyoH\\workspace\\web\\src\\legacy\\api.js",
        "language": "javascript",
        "kind": "import-from"
      },
      {
        "from": "web/src/index.js",
        "to": "web/src/legacy/widgets/index.js",
        "specifier": "./legacy/widgets/index.js",
        "targetAbs": "C:\\Users\\SIDNEY~1\\AppData\\Local\\Temp\\file-system-shaper-9aOyoH\\workspace\\web\\src\\legacy\\widgets\\index.js",
        "language": "javascript",
        "kind": "import-from"
      },
      {
        "from": "web/src/legacy/api.js",
        "to": "web/src/legacy/codec.js",
        "specifier": "./codec.js",
        "targetAbs": "C:\\Users\\SIDNEY~1\\AppData\\Local\\Temp\\file-system-shaper-9aOyoH\\workspace\\web\\src\\legacy\\codec.js",
        "language": "javascript",
        "kind": "import-from"
      },
      {
        "from": "web/src/legacy/widgets/index.js",
        "to": "web/src/legacy/widgets/chart.js",
        "specifier": "./chart.js",
        "targetAbs": "C:\\Users\\SIDNEY~1\\AppData\\Local\\Temp\\file-system-shaper-9aOyoH\\workspace\\web\\src\\legacy\\widgets\\chart.js",
        "language": "javascript",
        "kind": "export-from"
      },
      {
        "from": "web/src/legacy/widgets/index.js",
        "to": "web/src/legacy/widgets/table.js",
        "specifier": "./table.js",
        "targetAbs": "C:\\Users\\SIDNEY~1\\AppData\\Local\\Temp\\file-system-shaper-9aOyoH\\workspace\\web\\src\\legacy\\widgets\\table.js",
        "language": "javascript",
        "kind": "export-from"
      }
    ]
  },
  "moves": [
    {
      "from": "C:\\Users\\SIDNEY~1\\AppData\\Local\\Temp\\file-system-shaper-9aOyoH\\workspace\\web\\src\\legacy",
      "to": "C:\\Users\\SIDNEY~1\\AppData\\Local\\Temp\\file-system-shaper-9aOyoH\\workspace\\web\\src\\core",
      "fromRel": "web/src/legacy",
      "toRel": "web/src/core",
      "explicit": true
    },
    {
      "from": "C:\\Users\\SIDNEY~1\\AppData\\Local\\Temp\\file-system-shaper-9aOyoH\\workspace\\service\\app\\legacy",
      "to": "C:\\Users\\SIDNEY~1\\AppData\\Local\\Temp\\file-system-shaper-9aOyoH\\workspace\\service\\app\\domain",
      "fromRel": "service/app/legacy",
      "toRel": "service/app/domain",
      "explicit": true
    }
  ],
  "missingTargets": []
}
```

## After

```text
|-- service/
|  `-- app/
|     |-- __init__.py
|     |-- domain/
|     |  |-- __init__.py
|     |  |-- pipeline.py [imports: 1]
|     |  `-- steps/
|     |     |-- __init__.py
|     |     `-- collector.py
|     `-- main.py [imports: 2]
`-- web/
   `-- src/
      |-- core/
      |  |-- api.js [imports: 1]
      |  |-- codec.js
      |  `-- widgets/
      |     |-- chart.js
      |     |-- index.js [imports: 2]
      |     `-- table.js
      `-- index.js [imports: 2]
```

## Validation

- Shape match: PASS
- Directories match: true
- Files match: true
- Moved files: 2
- Rewritten files: 2
- Missing targets: 0

## Evidence Root

- C:\Users\SIDNEY~1\AppData\Local\Temp\file-system-shaper-9aOyoH\workspace
