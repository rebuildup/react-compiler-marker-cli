# React Compiler Marker

**Universal IDE extension that shows which React components are optimized by the [React Compiler](https://react.dev/learn/react-compiler)**. See at a glance which components get automatically memoized ✨ and which ones have issues preventing optimization 🚫

## Features

- Visual emoji markers next to React components (customizable)
- Hover tooltips with optimization details and error messages
- Preview compiled output to see what the React Compiler generates
- Generate JSON reports for a full-project compilation snapshot
- Commands to activate/deactivate markers or check individual files
- Configurable babel plugin path for custom setups

## Supported IDEs

| IDE  | Installation |
|------|--------------|
| VS Code / Cursor | [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=blazejkustra.react-compiler-marker) \| [Open VSX](https://open-vsx.org/extension/blazejkustra/react-compiler-marker) |
| WebStorm / IntelliJ IDEA | [IntelliJ marketplace](https://plugins.jetbrains.com/plugin/29540-react-compiler-marker) |
| Neovim | [Setup instructions](packages/nvim-client/README.md) |

![Showcase](images/showcase.png)

## Project Structure

This is a monorepo containing:

```
packages/
  server/           # LSP server (shared by all clients)
  cli/              # CLI tool for CI/AI integration
  vscode-client/    # VS Code extension
  intellij-client/  # WebStorm/IntelliJ plugin
  nvim-client/      # Neovim plugin
```

Each package has its own version and release cycle. See individual READMEs for documentation:

- [CLI Tool](packages/cli/README.md) - Check optimization status from command line
- [VS Code Client](packages/vscode-client/README.md)
- [IntelliJ Client](packages/intellij-client/README.md)
- [Neovim Client](packages/nvim-client/README.md)
- [LSP Server](packages/server/README.md)

## Quick Start

### VS Code / Cursor

1. Install from [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=blazejkustra.react-compiler-marker) or search "React Compiler Marker" in Extensions
3. Open a React component file - markers appear automatically

### WebStorm / IntelliJ IDEA (beta)

1. Build the plugin: `cd packages/intellij-client && ./gradlew buildPlugin`
2. Install from disk: Settings > Plugins > Install Plugin from Disk
3. Select `build/distributions/react-compiler-marker-*.zip`

### Neovim

Using [lazy.nvim](https://github.com/folke/lazy.nvim):

```lua
{
  'blazejkustra/react-compiler-marker',
  ft = { 'javascript', 'javascriptreact', 'typescript', 'typescriptreact' },
  build = './scripts/build-nvim.sh',
  opts = {},
}
```

Open a React component file - markers appear automatically.

**Requirements:** Neovim 0.9+ (0.10+ recommended for native inlay hints), Node.js, `babel-plugin-react-compiler` in your project.

See the [Neovim Client README](packages/nvim-client/README.md) for configuration options and other package managers.

### CLI

For CI integration or AI assistant usage:

```bash
# Install from source
cd packages/cli && npm link

# Check files (shows failures only by default)
rcm check src/

# Show all functions including optimized
rcm check src/ --all

# JSON output for CI
rcm check src/ --fail --json > report.json

# Compact format for AI (token-efficient)
rcm check src/ --compact
```

See the [CLI README](packages/cli/README.md) for all options.

## Configuration

All clients support these settings:

| Setting | Default | Description |
|---------|---------|-------------|
| Success Emoji | `✨` | Marker for optimized components |
| Error Emoji | `🚫` | Marker for failed components |
| Babel Plugin Path | `node_modules/babel-plugin-react-compiler` | Path to the compiler plugin |

## Commands

- **Activate Extension** - Enable markers
- **Deactivate Extension** - Disable markers
- **Check Current File** - Refresh markers in the active file
- **Preview Compiled Output** - View the compiled code
- **Generate Report** - Save a JSON report for the current workspace

## Links

- [GitHub Repository](https://github.com/blazejkustra/react-compiler-marker)
- [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=blazejkustra.react-compiler-marker)
- [Open VSX Registry](https://open-vsx.org/extension/blazejkustra/react-compiler-marker)
- [React Compiler Documentation](https://react.dev/learn/react-compiler)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

## License

MIT
