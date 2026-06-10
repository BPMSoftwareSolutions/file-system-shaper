# python-only

A Python package reshaped from services into a domain package.

## Retrieval Packet

```text
Root: C:\Users\SIDNEY~1\AppData\Local\Temp\file-system-shaper-HesyqO\workspace

Taxonomy:
  `-- pkg/
     |-- __init__.py
     |-- main.py [2]
     `-- services/
        |-- __init__.py
        |-- helpers/
        |  |-- __init__.py
        |  `-- formatter.py
        |-- report_service.py [1]
        `-- user_service.py [1]

Signals:
  Directories: 3
  Files: 7
  Code files: 7
  Dependencies: 4
  Hot file limit: 10

Hot Files:
  pkg/services/helpers/formatter.py [in:2 out:0]
  pkg/services/report_service.py [in:1 out:1]
  pkg/services/user_service.py [in:1 out:1]
  pkg/main.py [in:0 out:2]
  pkg/__init__.py [in:0 out:0]
  pkg/services/__init__.py [in:0 out:0]
  pkg/services/helpers/__init__.py [in:0 out:0]

Agent Instructions:
  - Use the taxonomy as the canonical map of the current tree.
  - Prefer moving files over editing their contents when a target shape only changes location.
  - Recompute relative imports only for files affected by a move or rename.
  - Treat high-signal files as the main dependency hubs when deciding what must be rewritten.
```

## Before

```text
`-- pkg/
   |-- __init__.py
   |-- main.py [imports: 2]
   `-- services/
      |-- __init__.py
      |-- helpers/
      |  |-- __init__.py
      |  `-- formatter.py
      |-- report_service.py [imports: 1]
      `-- user_service.py [imports: 1]
```

## Plan

```json
{
  "root": "C:\\Users\\SIDNEY~1\\AppData\\Local\\Temp\\file-system-shaper-HesyqO\\workspace",
  "target": {
    "root": "C:\\source\\repos\\bpm\\internal\\multi-agent\\fixtures\\scenarios\\python-only",
    "directories": [
      "pkg",
      "pkg/domain",
      "pkg/domain/helpers"
    ],
    "files": [
      "pkg/__init__.py",
      "pkg/main.py",
      "pkg/domain/__init__.py",
      "pkg/domain/user_service.py",
      "pkg/domain/report_service.py",
      "pkg/domain/helpers/__init__.py",
      "pkg/domain/helpers/formatter.py"
    ],
    "moves": [
      {
        "from": "pkg/services",
        "to": "pkg/domain"
      }
    ]
  },
  "analysisBefore": {
    "root": "C:\\Users\\SIDNEY~1\\AppData\\Local\\Temp\\file-system-shaper-HesyqO\\workspace",
    "tree": [
      {
        "kind": "directory",
        "name": "pkg",
        "relPath": "pkg",
        "absPath": "C:\\Users\\SIDNEY~1\\AppData\\Local\\Temp\\file-system-shaper-HesyqO\\workspace\\pkg",
        "children": [
          {
            "kind": "file",
            "name": "__init__.py",
            "relPath": "pkg/__init__.py",
            "absPath": "C:\\Users\\SIDNEY~1\\AppData\\Local\\Temp\\file-system-shaper-HesyqO\\workspace\\pkg\\__init__.py",
            "size": 17,
            "imports": []
          },
          {
            "kind": "file",
            "name": "main.py",
            "relPath": "pkg/main.py",
            "absPath": "C:\\Users\\SIDNEY~1\\AppData\\Local\\Temp\\file-system-shaper-HesyqO\\workspace\\pkg\\main.py",
            "size": 200,
            "imports": [
              {
                "specifier": ".services.user_service",
                "target": "pkg/services/user_service.py",
                "kind": "from-import",
                "language": "python"
              },
              {
                "specifier": ".services.report_service",
                "target": "pkg/services/report_service.py",
                "kind": "from-import",
                "language": "python"
              }
            ]
          },
          {
            "kind": "directory",
            "name": "services",
            "relPath": "pkg/services",
            "absPath": "C:\\Users\\SIDNEY~1\\AppData\\Local\\Temp\\file-system-shaper-HesyqO\\workspace\\pkg\\services",
            "children": [
              {
                "kind": "file",
                "name": "__init__.py",
                "relPath": "pkg/services/__init__.py",
                "absPath": "C:\\Users\\SIDNEY~1\\AppData\\Local\\Temp\\file-system-shaper-HesyqO\\workspace\\pkg\\services\\__init__.py",
                "size": 17,
                "imports": []
              },
              {
                "kind": "directory",
                "name": "helpers",
                "relPath": "pkg/services/helpers",
                "absPath": "C:\\Users\\SIDNEY~1\\AppData\\Local\\Temp\\file-system-shaper-HesyqO\\workspace\\pkg\\services\\helpers",
                "children": [
                  {
                    "kind": "file",
                    "name": "__init__.py",
                    "relPath": "pkg/services/helpers/__init__.py",
                    "absPath": "C:\\Users\\SIDNEY~1\\AppData\\Local\\Temp\\file-system-shaper-HesyqO\\workspace\\pkg\\services\\helpers\\__init__.py",
                    "size": 17,
                    "imports": []
                  },
                  {
                    "kind": "file",
                    "name": "formatter.py",
                    "relPath": "pkg/services/helpers/formatter.py",
                    "absPath": "C:\\Users\\SIDNEY~1\\AppData\\Local\\Temp\\file-system-shaper-HesyqO\\workspace\\pkg\\services\\helpers\\formatter.py",
                    "size": 55,
                    "imports": []
                  }
                ]
              },
              {
                "kind": "file",
                "name": "report_service.py",
                "relPath": "pkg/services/report_service.py",
                "absPath": "C:\\Users\\SIDNEY~1\\AppData\\Local\\Temp\\file-system-shaper-HesyqO\\workspace\\pkg\\services\\report_service.py",
                "size": 119,
                "imports": [
                  {
                    "specifier": ".helpers.formatter",
                    "target": "pkg/services/helpers/formatter.py",
                    "kind": "from-import",
                    "language": "python"
                  }
                ]
              },
              {
                "kind": "file",
                "name": "user_service.py",
                "relPath": "pkg/services/user_service.py",
                "absPath": "C:\\Users\\SIDNEY~1\\AppData\\Local\\Temp\\file-system-shaper-HesyqO\\workspace\\pkg\\services\\user_service.py",
                "size": 106,
                "imports": [
                  {
                    "specifier": ".helpers.formatter",
                    "target": "pkg/services/helpers/formatter.py",
                    "kind": "from-import",
                    "language": "python"
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
        "from": "pkg/main.py",
        "to": "pkg/services/user_service.py",
        "specifier": ".services.user_service",
        "targetAbs": "C:\\Users\\SIDNEY~1\\AppData\\Local\\Temp\\file-system-shaper-HesyqO\\workspace\\pkg\\services\\user_service.py",
        "language": "python",
        "kind": "from-import"
      },
      {
        "from": "pkg/main.py",
        "to": "pkg/services/report_service.py",
        "specifier": ".services.report_service",
        "targetAbs": "C:\\Users\\SIDNEY~1\\AppData\\Local\\Temp\\file-system-shaper-HesyqO\\workspace\\pkg\\services\\report_service.py",
        "language": "python",
        "kind": "from-import"
      },
      {
        "from": "pkg/services/report_service.py",
        "to": "pkg/services/helpers/formatter.py",
        "specifier": ".helpers.formatter",
        "targetAbs": "C:\\Users\\SIDNEY~1\\AppData\\Local\\Temp\\file-system-shaper-HesyqO\\workspace\\pkg\\services\\helpers\\formatter.py",
        "language": "python",
        "kind": "from-import"
      },
      {
        "from": "pkg/services/user_service.py",
        "to": "pkg/services/helpers/formatter.py",
        "specifier": ".helpers.formatter",
        "targetAbs": "C:\\Users\\SIDNEY~1\\AppData\\Local\\Temp\\file-system-shaper-HesyqO\\workspace\\pkg\\services\\helpers\\formatter.py",
        "language": "python",
        "kind": "from-import"
      }
    ]
  },
  "moves": [
    {
      "from": "C:\\Users\\SIDNEY~1\\AppData\\Local\\Temp\\file-system-shaper-HesyqO\\workspace\\pkg\\services",
      "to": "C:\\Users\\SIDNEY~1\\AppData\\Local\\Temp\\file-system-shaper-HesyqO\\workspace\\pkg\\domain",
      "fromRel": "pkg/services",
      "toRel": "pkg/domain",
      "explicit": true
    }
  ],
  "missingTargets": []
}
```

## After

```text
`-- pkg/
   |-- __init__.py
   |-- domain/
   |  |-- __init__.py
   |  |-- helpers/
   |  |  |-- __init__.py
   |  |  `-- formatter.py
   |  |-- report_service.py [imports: 1]
   |  `-- user_service.py [imports: 1]
   `-- main.py [imports: 2]
```

## Validation

- Shape match: PASS
- Directories match: true
- Files match: true
- Moved files: 1
- Rewritten files: 1
- Missing targets: 0

## Evidence Root

- C:\Users\SIDNEY~1\AppData\Local\Temp\file-system-shaper-HesyqO\workspace
