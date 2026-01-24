# Contributing to OrdySwap

Thank you for your interest in contributing to OrdySwap! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Commit Conventions](#commit-conventions)
- [Code Style](#code-style)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

Please be respectful and constructive in all interactions. We are committed to providing a welcoming and inclusive environment for all contributors.

## Getting Started

### Prerequisites

- [Clarinet](https://docs.hiro.so/stacks/clarinet) >= 2.0.0
- [Node.js](https://nodejs.org/) >= 18.0.0
- [Git](https://git-scm.com/)

### Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/ordyswap.git
   cd ordyswap
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run tests to verify setup:
   ```bash
   npm test
   ```

## Development Workflow

### Branch Naming

Use descriptive branch names following this pattern:

```
<type>/<short-description>
```

Types:
- `feature/` - New features
- `fix/` - Bug fixes
- `refactor/` - Code refactoring
- `test/` - Adding or updating tests
- `docs/` - Documentation updates
- `chore/` - Maintenance tasks

Examples:
- `feature/segwit-support`
- `fix/cancel-offer-grace-period`
- `test/finalize-offer-coverage`

### Creating a Branch

```bash
# Ensure you're on main and up-to-date
git checkout main
git pull origin main

# Create your branch
git checkout -b feature/your-feature-name
```

## Commit Conventions

We use [Conventional Commits](https://www.conventionalcommits.org/) for clear and consistent commit history.

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation only changes |
| `style` | Changes that don't affect code meaning (formatting) |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf` | Performance improvement |
| `test` | Adding or correcting tests |
| `chore` | Changes to build process or auxiliary tools |

### Scopes

- `contract` - Clarity contract changes
- `tests` - Test files
- `sdk` - TypeScript SDK
- `docs` - Documentation
- `ci` - CI/CD configuration

### Examples

```bash
# Feature commit
git commit -m "feat(contract): add offer expiry mechanism"

# Bug fix
git commit -m "fix(contract): correct cancel grace period calculation"

# Documentation
git commit -m "docs: update README with architecture diagram"

# Test
git commit -m "test(contract): add finalize-offer edge cases"

# Breaking change
git commit -m "feat(contract)!: change offer struct to include expiry

BREAKING CHANGE: Offers now require an expiry block height parameter"
```

## Code Style

### Clarity Contracts

1. **Comments**: Use descriptive comments for all public functions
   ```clarity
   ;; Creates a new offer to buy an Ordinal inscription
   ;; @param txid - The transaction ID containing the inscription
   ;; @param index - The output index of the inscription
   ;; @param amount - The STX amount to offer
   ;; @param output - The expected scriptPubKey for transfer
   ;; @param recipient - The principal to receive STX on finalization
   (define-public (create-offer ...)
   ```

2. **Naming**:
   - Use `kebab-case` for function names: `create-offer`, `validate-transfer`
   - Use `SCREAMING_SNAKE_CASE` for constants: `ERR-INVALID-OFFER`
   - Use descriptive names: prefer `offer-id` over `id`

3. **Error Codes**: Define all errors as constants with clear names
   ```clarity
   (define-constant ERR-OFFER-NOT-FOUND (err u100))
   (define-constant ERR-UNAUTHORIZED (err u101))
   ```

4. **Line Length**: Keep lines under 100 characters when possible

5. **Function Organization**:
   - Constants first
   - Data variables and maps
   - Read-only functions
   - Public functions
   - Private functions

### TypeScript

- Use TypeScript strict mode
- Use ESLint with the project configuration
- Prefer `async/await` over raw promises
- Document public APIs with JSDoc comments

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:report

# Run specific test file
npx vitest run tests/create-offer.test.ts

# Watch mode
npm run test:watch
```

### Writing Tests

1. **Test file naming**: `<feature>.test.ts`
2. **Describe blocks**: Group related tests
3. **Clear assertions**: Make test intent obvious

```typescript
describe("create-offer", () => {
  it("should escrow STX from the sender", () => {
    // Arrange
    const amount = 1000000n;
    
    // Act
    const result = simnet.callPublicFn(
      "ord-swap",
      "create-offer",
      [...params],
      sender
    );
    
    // Assert
    expect(result.result).toBeOk();
    expect(simnet.getAssetsMap().get("STX")?.get(sender)).toBe(initialBalance - amount);
  });
});
```

### Test Coverage Requirements

- All public functions must have tests
- Error paths must be tested
- Edge cases should be covered
- Aim for >80% code coverage

## Pull Request Process

### Before Submitting

1. Ensure all tests pass: `npm test`
2. Run contract analysis: `clarinet check`
3. Update documentation if needed
4. Add tests for new functionality

### PR Title

Follow the same commit convention:
```
feat(contract): add offer expiry mechanism
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] New tests added for new functionality
- [ ] Manual testing performed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-reviewed my code
- [ ] Commented complex logic
- [ ] Updated documentation
- [ ] No new warnings
```

### Review Process

1. All PRs require at least one approval
2. Address all review comments
3. Keep PRs focused and reasonably sized
4. Squash commits before merging if needed

## Questions?

If you have questions or need help, please:
1. Check existing issues and documentation
2. Open a new issue with the `question` label
3. Join our community discussions

Thank you for contributing! 🚀
