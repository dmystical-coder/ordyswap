# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- CONTRIBUTING.md with commit conventions and code style guidelines
- SECURITY.md with vulnerability disclosure process
- CHANGELOG.md for tracking changes
- GitHub Actions CI/CD workflows
- Comprehensive documentation structure

### Changed
- (Planned) Modular contract architecture
- (Planned) Enhanced test coverage

### Security
- (Planned) Enhanced input validation
- (Planned) Safe math operations

## [0.1.0] - 2024-XX-XX

### Added
- Initial `ord-swap.clar` contract implementation
- Basic offer creation, validation, finalization, cancellation, and refund functionality
- Integration with `clarity-bitcoin` for Bitcoin transaction verification
- 50-block cancellation grace period
- Basic Vitest test setup

### Known Issues
- Only supports Genesis ordinals (not previously transferred inscriptions)
- Minimal test coverage
- Not audited - use at own risk

---

## Version History

### Versioning Scheme

We use Semantic Versioning:
- **MAJOR**: Breaking changes to contract interface
- **MINOR**: New features, backward-compatible
- **PATCH**: Bug fixes, backward-compatible

### Pre-1.0 Notice

Until version 1.0.0, this project is in active development. Breaking changes may occur between minor versions. Always check this changelog before upgrading.

### Migration Guides

Migration guides will be provided here for breaking changes.

---

## How to Update This File

When making changes:

1. Add entries under `[Unreleased]` section
2. Use these categories:
   - `Added` - New features
   - `Changed` - Changes to existing functionality
   - `Deprecated` - Soon-to-be removed features
   - `Removed` - Removed features
   - `Fixed` - Bug fixes
   - `Security` - Vulnerability fixes

3. On release, move unreleased items to a new version section
