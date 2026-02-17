# @react-compiler-marker/cli

CLI tool to check React Compiler optimization status.

## Installation

```bash
# From source (local)
cd packages/cli && npm link

# From npm (when published)
npm install -g @react-compiler-marker/cli
```

## Usage

```bash
rcm check [input] [options]
```

### Input

| Input | Description |
|-------|-------------|
| `<file>` | Single file to check |
| `<directory>` | Recursively check `.tsx`/`.jsx`/`.ts`/`.js` files |
| `<glob>` | Glob pattern (e.g., `"src/**/*.tsx"`) |
| `--stdin` | Read from stdin |

### Options

| Option | Description |
|--------|-------------|
| `--all, -a` | Show all functions (default: failures only) |
| `--json` | Output as JSON |
| `--compact` | Token-efficient compact format |
| `--verbose` | Show full error details |
| `--fail` | Exit with code 1 if any function is not optimized |
| `--help, -h` | Show help |
| `--version` | Show version |

### Exit Codes

| Code | Description |
|------|-------------|
| 0 | Success (all optimized or `--fail` not set) |
| 1 | Not optimized (`--fail` set and unoptimized functions found) |
| 2 | Error (file not found, parse error, etc.) |

## Examples

### Basic Usage

```bash
# Check a single file (shows failures only)
rcm check src/App.tsx

# Check a directory
rcm check src/

# Check with glob pattern
rcm check "src/**/*.tsx"

# Show all functions (including optimized)
rcm check src/ --all

# Read from stdin
cat src/App.tsx | rcm check --stdin
```

### Output Formats

**Default (failures only):**
```
src/App.tsx
  ✗ handleClick:25 - dependency array issue

0 passed, 1 failed
```

**With --all:**
```
src/App.tsx
  ✓ Counter:4
  ✗ handleClick:25 - dependency array issue

1 passed, 1 failed
```

**Compact (--compact):**
```
src/App.tsx: ✗handleClick:25(dependency array issue)
0 passed, 1 failed
```

**JSON (--json):**
```json
[
  {
    "file": "src/App.tsx",
    "functions": [
      { "name": "handleClick", "line": 25, "optimized": false, "reason": "dependency array issue" }
    ]
  }
]
```

**Compact JSON (--json --compact):**
```json
[{"f":"src/App.tsx","fail":[{"n":"handleClick","l":25,"e":"dependency array issue"}]}]
```

### CI Integration

```bash
# Fail the build if any component is not optimized
rcm check src/ --fail

# Generate JSON report
rcm check src/ --fail --json > report.json
```

### AI Assistant Usage

The compact format is optimized for token efficiency:

```bash
rcm check src/ --compact
```

## Requirements

- Node.js 18+
- `babel-plugin-react-compiler` (bundled)

## License

MIT (c) 2026 361do_sleep
