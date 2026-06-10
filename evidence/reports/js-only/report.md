# js-only

A JavaScript-only tree with a directory move and relative import rewrites.

## Retrieval Packet

```text
Root: C:\Users\SIDNEY~1\AppData\Local\Temp\file-system-shaper-VociH9\workspace

Taxonomy:
  `-- src/
     |-- app.js [2]
     `-- lib/
        |-- format.js
        |-- index.js [2]
        `-- math.js

Signals:
  Directories: 2
  Files: 4
  Code files: 4
  Dependencies: 4
  Hot file limit: 10

Hot Files:
  src/lib/index.js [in:2 out:2]
  src/lib/format.js [in:1 out:0]
  src/lib/math.js [in:1 out:0]
  src/app.js [in:0 out:2]

Agent Instructions:
  - Use the taxonomy as the canonical map of the current tree.
  - Prefer moving files over editing their contents when a target shape only changes location.
  - Recompute relative imports only for files affected by a move or rename.
  - Treat high-signal files as the main dependency hubs when deciding what must be rewritten.
```

## Before

```text
`-- src/
   |-- app.js [imports: 2]
   `-- lib/
      |-- format.js
      |-- index.js [imports: 2]
      `-- math.js
```

## Plan

```json
{
  "root": "C:\\Users\\SIDNEY~1\\AppData\\Local\\Temp\\file-system-shaper-VociH9\\workspace",
  "target": {
    "root": "C:\\source\\repos\\bpm\\internal\\multi-agent\\fixtures\\scenarios\\js-only",
    "directories": [
      "src",
      "src/core"
    ],
    "files": [
      "src/app.js",
      "src/core/index.js",
      "src/core/format.js",
      "src/core/math.js"
    ],
    "moves": [
      {
        "from": "src/lib",
        "to": "src/core"
      }
    ]
  },
  "analysisBefore": {
    "root": "C:\\Users\\SIDNEY~1\\AppData\\Local\\Temp\\file-system-shaper-VociH9\\workspace",
    "tree": [
      {
        "kind": "directory",
        "name": "src",
        "relPath": "src",
        "absPath": "C:\\Users\\SIDNEY~1\\AppData\\Local\\Temp\\file-system-shaper-VociH9\\workspace\\src",
        "children": [
          {
            "kind": "file",
            "name": "app.js",
            "relPath": "src/app.js",
            "absPath": "C:\\Users\\SIDNEY~1\\AppData\\Local\\Temp\\file-system-shaper-VociH9\\workspace\\src\\app.js",
            "size": 152,
            "imports": [
              {
                "specifier": "./lib/index.js",
                "target": "src/lib/index.js",
                "kind": "import-from",
                "language": "javascript"
              },
              {
                "specifier": "./lib/index.js",
                "target": "src/lib/index.js",
                "kind": "import-from",
                "language": "javascript"
              }
            ]
          },
          {
            "kind": "directory",
            "name": "lib",
            "relPath": "src/lib",
            "absPath": "C:\\Users\\SIDNEY~1\\AppData\\Local\\Temp\\file-system-shaper-VociH9\\workspace\\src\\lib",
            "children": [
              {
                "kind": "file",
                "name": "format.js",
                "relPath": "src/lib/format.js",
                "absPath": "C:\\Users\\SIDNEY~1\\AppData\\Local\\Temp\\file-system-shaper-VociH9\\workspace\\src\\lib\\format.js",
                "size": 62,
                "imports": []
              },
              {
                "kind": "file",
                "name": "index.js",
                "relPath": "src/lib/index.js",
                "absPath": "C:\\Users\\SIDNEY~1\\AppData\\Local\\Temp\\file-system-shaper-VociH9\\workspace\\src\\lib\\index.js",
                "size": 81,
                "imports": [
                  {
                    "specifier": "./format.js",
                    "target": "src/lib/format.js",
                    "kind": "export-from",
                    "language": "javascript"
                  },
                  {
                    "specifier": "./math.js",
                    "target": "src/lib/math.js",
                    "kind": "export-from",
                    "language": "javascript"
                  }
                ]
              },
              {
                "kind": "file",
                "name": "math.js",
                "relPath": "src/lib/math.js",
                "absPath": "C:\\Users\\SIDNEY~1\\AppData\\Local\\Temp\\file-system-shaper-VociH9\\workspace\\src\\lib\\math.js",
                "size": 52,
                "imports": []
              }
            ]
          }
        ]
      }
    ],
    "dependencies": [
      {
        "from": "src/app.js",
        "to": "src/lib/index.js",
        "specifier": "./lib/index.js",
        "targetAbs": "C:\\Users\\SIDNEY~1\\AppData\\Local\\Temp\\file-system-shaper-VociH9\\workspace\\src\\lib\\index.js",
        "language": "javascript",
        "kind": "import-from"
      },
      {
        "from": "src/app.js",
        "to": "src/lib/index.js",
        "specifier": "./lib/index.js",
        "targetAbs": "C:\\Users\\SIDNEY~1\\AppData\\Local\\Temp\\file-system-shaper-VociH9\\workspace\\src\\lib\\index.js",
        "language": "javascript",
        "kind": "import-from"
      },
      {
        "from": "src/lib/index.js",
        "to": "src/lib/format.js",
        "specifier": "./format.js",
        "targetAbs": "C:\\Users\\SIDNEY~1\\AppData\\Local\\Temp\\file-system-shaper-VociH9\\workspace\\src\\lib\\format.js",
        "language": "javascript",
        "kind": "export-from"
      },
      {
        "from": "src/lib/index.js",
        "to": "src/lib/math.js",
        "specifier": "./math.js",
        "targetAbs": "C:\\Users\\SIDNEY~1\\AppData\\Local\\Temp\\file-system-shaper-VociH9\\workspace\\src\\lib\\math.js",
        "language": "javascript",
        "kind": "export-from"
      }
    ]
  },
  "moves": [
    {
      "from": "C:\\Users\\SIDNEY~1\\AppData\\Local\\Temp\\file-system-shaper-VociH9\\workspace\\src\\lib",
      "to": "C:\\Users\\SIDNEY~1\\AppData\\Local\\Temp\\file-system-shaper-VociH9\\workspace\\src\\core",
      "fromRel": "src/lib",
      "toRel": "src/core",
      "explicit": true
    }
  ],
  "missingTargets": []
}
```

## After

```text
`-- src/
   |-- app.js [imports: 2]
   `-- core/
      |-- format.js
      |-- index.js [imports: 2]
      `-- math.js
```

## Validation

- Shape match: PASS
- Directories match: true
- Files match: true
- Moved files: 1
- Rewritten files: 1
- Missing targets: 0

## Evidence Root

- C:\Users\SIDNEY~1\AppData\Local\Temp\file-system-shaper-VociH9\workspace
