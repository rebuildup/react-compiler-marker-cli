# @react-compiler-marker/cli

CLI tool to check React Compiler optimization status.

## Installation

```bash
# Install from GitHub
npm install -g rebuildup/react-compiler-marker-cli

# Or clone and link locally
git clone https://github.com/rebuildup/react-compiler-marker-cli.git
cd react-compiler-marker-cli
npm install
npm link
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

## Examples

```bash
# Check directory (shows failures only)
rcm check src/

# Show all functions
rcm check src/ --all

# CI integration
rcm check src/ --fail --json > report.json

# Compact format for AI
rcm check src/ --compact

# Check single file
rcm check src/App.tsx

# Use glob pattern
rcm check "src/**/*.tsx"

# Read from stdin
cat src/App.tsx | rcm check --stdin
```

## Output

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

**JSON output (--json):**
```json
[
  {
    "file": "src/App.tsx",
    "functions": [
      {
        "name": "handleClick",
        "line": 25,
        "optimized": false,
        "reason": "dependency array issue"
      }
    ]
  }
]
```

**Compact format (--compact):**
```
src/App.tsx: ✗handleClick:25(dependency array issue)
```

## Exit Codes

| Code | Description |
|------|-------------|
| 0 | Success (all optimized or `--fail` not set) |
| 1 | Not optimized (`--fail` set and unoptimized functions found) |
| 2 | Error (file not found, parse error, etc.) |

## CI Integration

Use `--fail` to exit with code 1 when unoptimized functions are found:

```yaml
# GitHub Actions example
- name: Check React Compiler optimization
  run: rcm check src/ --fail
```

## Requirements

- Node.js 18+

## Related

- [React Compiler](https://react.dev/learn/react-compiler)
- [babel-plugin-react-compiler](https://www.npmjs.com/package/babel-plugin-react-compiler)

## License

MIT
