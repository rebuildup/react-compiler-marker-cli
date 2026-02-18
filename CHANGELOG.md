# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2025-02-18

### Added
- Initial release as standalone CLI package
- Check React Compiler optimization status for files/directories
- Support for multiple output formats (text, JSON, compact)
- Stdin support for piping files
- Exit code support for CI integration
- `--all` flag to show all functions
- `--fail` flag for CI workflows
- `--verbose` flag for detailed error information
- `--compact` flag for token-efficient output

### Changed
- Migrated from monorepo structure to standalone package
- Simplified installation: `npm install -g @react-compiler-marker/cli`
