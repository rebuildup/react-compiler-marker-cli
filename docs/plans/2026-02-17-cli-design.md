# React Compiler Marker CLI Design

Date: 2026-02-17

## Overview

A Node.js CLI tool to check React Compiler optimization status for TypeScript/JavaScript files.

## Command

```bash
rcm check [input] [options]
```

## Input Options

- `<file>` - Single file to check
- `<directory>` - Recursively check .tsx/.jsx files in directory
- `<glob>` - Glob pattern (e.g., `src/**/*.tsx`)
- `--stdin` - Read from stdin

## Output Options

- `--json` - Output as JSON
- `--compact` - Token-efficient compact format (optimized for AI consumption)
- `--verbose` - Show full error details (reason, description, suggestions)

## Exit Codes

- `0` - Success (all optimized or `--fail` not set)
- `1` - Not optimized (`--fail` set and unoptimized functions found)
- `2` - Error (file not found, parse error, etc.)

## Output Formats

### Default Text

```
src/App.tsx
  ✓ MyComponent:10
  ✗ handleClick:25 - dependency array issue

2 passed, 1 failed
```

### Compact Text (`--compact`)

```
src/App.tsx: ✓MyComponent:10 ✗handleClick:25(dep array issue)
```

### Full JSON (`--json`)

```json
[
  {
    "file": "src/App.tsx",
    "functions": [
      { "name": "MyComponent", "line": 10, "optimized": true },
      { "name": "handleClick", "line": 25, "optimized": false, "reason": "dependency array issue" }
    ]
  }
]
```

### Compact JSON (`--json --compact`)

```json
[{"f":"src/App.tsx","ok":[{"n":"MyComponent","l":10}],"fail":[{"n":"handleClick","l":25,"e":"dep array issue"}]}]
```

## Implementation

- Location: `packages/cli/`
- Language: TypeScript (ESM)
- Dependencies: babel-plugin-react-compiler, @babel/core, @babel/parser, globby
- Entry point: `bin/cli.js`
