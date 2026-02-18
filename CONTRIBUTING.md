# Contributing

Thank you for your interest in contributing to React Compiler Marker CLI!

## Setup

```bash
# Clone the repository
git clone https://github.com/rebuildup/react-compiler-marker-cli.git
cd react-compiler-marker-cli

# Install dependencies
npm install

# Build the project
npm run build
```

## Development

```bash
# Watch mode for development
npm run dev

# Run tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Project Structure

```
react-compiler-marker-cli/
├── src/
│   ├── cli.ts       # CLI entry point, argument parsing, output formatting
│   ├── checker.ts   # Core: runs babel-plugin-react-compiler
│   ├── cli.test.ts  # CLI format function tests
│   └── checker.test.ts # Checker function tests
├── bin/
│   └── cli.js       # Compiled CLI entry point
├── out/             # Compiled TypeScript output (generated)
├── vitest.config.ts # Vitest configuration
├── tsconfig.json    # TypeScript configuration
└── package.json
```

## Running Tests Locally

Before submitting a PR, please:

1. Ensure all tests pass: `npm test`
2. Build the project: `npm run build`
3. Test the CLI manually: `node bin/cli.js --help`

## Submitting Changes

1. Fork the repository
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add some feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

## Code Style

- Use TypeScript for all new code
- Follow existing code style
- Add tests for new features
- Update documentation as needed

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
