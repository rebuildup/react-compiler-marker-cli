# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

React Compiler Marker is a monorepo providing IDE tooling to visualize React Compiler optimization status. It displays inlay hints showing which components/functions are successfully memoized (✨) or failed (🚫).

## Architecture

```
packages/
├── cli/           # Standalone CLI tool (@react-compiler-marker/cli)
│   └── src/
│       ├── cli.ts       # Entry point, argument parsing, output formatting
│       └── checker.ts   # Core: runs babel-plugin-react-compiler and collects results
├── server/        # Language Server Protocol server (@react-compiler-marker/server)
│   └── src/
│       ├── server.ts           # LSP connection, inlay hints, commands
│       ├── checkReactCompiler.ts # Core compilation logic with caching
│       ├── inlayHints.ts       # Converts results to LSP inlay hints
│       └── cache.ts            # LRU cache for compilation results
├── vscode-client/ # VS Code extension (react-compiler-marker)
├── intellij-client/ # IntelliJ plugin (Kotlin)
└── nvim-client/   # Neovim plugin (Lua)
```

**Core Logic**: Both CLI and Server use `babel-plugin-react-compiler` with a custom logger to capture `CompileSuccess`/`CompileError` events. The logger intercepts compiler events to determine which functions were optimized.

## Common Commands

```bash
# Root-level
npm run typecheck          # Type check all packages
npm run lint               # Lint all packages
npm run prettier           # Check formatting
npm run prettier:write     # Fix formatting

# Build (per package)
cd packages/cli && npm run build      # tsc -b
cd packages/server && npm run build   # tsc -b
cd packages/vscode-client && npm run compile  # esbuild + typecheck + lint

# CLI usage (after npm link)
rcm check src/                      # Check directory (failures only)
rcm check src/ --all                # Show all functions
rcm check src/ --fail --json        # CI mode: exit 1 on failures
rcm check src/ --compact            # Token-efficient format for AI

# Install CLI globally
cd packages/cli && npm link
```

## Key Implementation Details

### Compiler Event Handling
The `babel-plugin-react-compiler` accepts a `logger` option with `logEvent()` callback. Events include:
- `CompileSuccess`: Function was memoized
- `CompileError`/`CompileDiagnostic`/`PipelineError`: Function failed with reason

### Language Detection
- `.js`, `.jsx`, `.mjs` → Flow parser
- `.ts`, `.tsx` → TypeScript parser

### Server Caching
- Plugin instance cached at module level
- Compilation results cached in LRU (100 entries)
- Content hash + filename as cache key

### LSP Communication
- VS Code: Node IPC (default)
- Other editors (Neovim, IntelliJ): stdio (`--stdio` flag)

## Dependencies

- `babel-plugin-react-compiler`: The actual React Compiler plugin
- `vscode-languageserver`: LSP implementation
- `vscode-languageclient`: VS Code client library

## Release

```bash
# VS Code Marketplace
cd packages/vscode-client && npm run publish:vscode

# Open VSX Registry
cd packages/vscode-client && npm run publish:ovsx
```
