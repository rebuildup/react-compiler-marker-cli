# React Compiler Marker CLI

CLI tool to check React Compiler optimization status.

## Installation

```bash
cd packages/cli && npm link
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

## Requirements

- Node.js 18+

## License

MIT (c) 2026 361do_sleep
