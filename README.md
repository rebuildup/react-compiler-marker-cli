# React Compiler Marker CLI

CLI tool to check React Compiler optimization status. Displays which components/functions are successfully memoized (✨) or failed (🚫).

## Installation

> **Note**: This package is not yet published to npm.

### Option 1: Build and link globally (Use `rcm` command everywhere)

```bash
# Clone and build
git clone https://github.com/rebuildup/react-compiler-marker-cli.git
cd react-compiler-marker-cli
npm install
npm run build

# Link globally - creates the `rcm` command
npm link

# Now you can use `rcm` anywhere
rcm check src/App.tsx
```

### Option 2: Use with npx directly

```bash
# Run directly from GitHub (no installation required)
npx github:rebuildup/react-compiler-marker-cli check <file>

# Or clone and run with npx
git clone https://github.com/rebuildup/react-compiler-marker-cli.git
cd react-compiler-marker-cli
npm install
npm run build
npx . check <file>
```

## Usage

```bash
# Check a single file
rcm check src/App.tsx

# Check a directory
rcm check src/components/

# Show all functions (default: failures only)
rcm check src/ --all

# Output as JSON
rcm check src/ --json

# Token-efficient compact format (for AI/LLM)
rcm check src/ --compact

# Verbose mode with error details
rcm check src/ --verbose

# Exit with code 1 if any function is not optimized (CI mode)
rcm check src/ --fail

# Read from stdin
cat src/App.tsx | rcm check --stdin
```

## Options

| Option | Description |
|--------|-------------|
| `--all, -a` | Show all functions (default: failures only) |
| `--json` | Output as JSON |
| `--compact` | Token-efficient compact format |
| `--verbose, -v` | Show full error details |
| `--fail` | Exit with code 1 if any function is not optimized |
| `--stdin` | Read from stdin |
| `--help, -h` | Show help |
| `--version` | Show version |

## Repository

https://github.com/rebuildup/react-compiler-marker-cli

## License

MIT
