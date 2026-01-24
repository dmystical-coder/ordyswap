# Development Setup Guide

This guide walks you through setting up a local development environment for OrdySwap.

## Prerequisites

### Required Software

| Software | Minimum Version | Installation |
|----------|-----------------|--------------|
| Clarinet | 2.0.0 | [Install Clarinet](https://docs.hiro.so/stacks/clarinet-js-sdk/installation) |
| Node.js | 18.0.0 | [Install Node.js](https://nodejs.org/) |
| Git | 2.0.0 | [Install Git](https://git-scm.com/) |

### Recommended Tools

- **VS Code** with the [Clarity extension](https://marketplace.visualstudio.com/items?itemName=HiroSystems.clarity-lsp)
- **Bitcoin Core** (for generating test transactions)
- **Stacks Wallet** for testing on testnet

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/ordyswap.git
cd ordyswap
```

### 2. Install Node.js Dependencies

```bash
npm install
```

### 3. Verify Clarinet Installation

```bash
clarinet --version
# Should output: clarinet-cli 2.x.x
```

### 4. Download Contract Dependencies

```bash
# This fetches the clarity-bitcoin contract
clarinet check
```

This creates the `.cache/requirements/` directory with external dependencies.

### 5. Run Tests

```bash
npm test
```

You should see all tests passing.

## Project Structure

```
ordyswap/
├── .cache/                    # Cached dependencies (gitignored)
│   └── requirements/          # External contracts
├── .github/                   # GitHub configuration
│   └── workflows/             # CI/CD pipelines
├── contracts/                 # Clarity smart contracts
│   └── ord-swap.clar         # Main contract
├── deployments/               # Deployment plans
│   └── default.simnet-plan.yaml
├── docs/                      # Documentation
├── settings/                  # Clarinet settings
├── tests/                     # Test files
│   └── ord-swap.test.ts
├── Clarinet.toml             # Clarinet configuration
├── package.json              # Node.js configuration
├── tsconfig.json             # TypeScript configuration
└── vitest.config.js          # Test runner configuration
```

## Development Workflow

### Running the Clarinet Console

The console provides an interactive REPL for testing contracts:

```bash
clarinet console
```

Example commands:
```clarity
;; Get the current offer count
(contract-call? .ord-swap get-last-id)

;; Check deployer's STX balance  
::get_assets_maps
```

### Running Tests

```bash
# Run all tests once
npm test

# Run with watch mode (re-run on file changes)
npm run test:watch

# Run with coverage report
npm run test:report
```

### Contract Analysis

```bash
# Check syntax and semantic errors
clarinet check

# Check with strict warnings
clarinet check --fail-on-warnings
```

### Generating Deployment Plans

```bash
# Generate simnet deployment plan
clarinet deployments generate --simnet

# Generate testnet deployment plan
clarinet deployments generate --testnet
```

## Configuration Files

### Clarinet.toml

Main Clarinet configuration:

```toml
[project]
name = "ordyswap"

[[project.requirements]]
contract_id = "SP1WN90HKT0E1FWCJT9JFPMC8YP7XGBGFNZGHRVZX.clarity-bitcoin"

[contracts.ord-swap]
path = "contracts/ord-swap.clar"
clarity_version = 4
epoch = "latest"
```

### vitest.config.js

Test runner configuration with Clarinet integration.

## Common Tasks

### Adding a New Contract

1. Create the contract file:
   ```bash
   touch contracts/my-contract.clar
   ```

2. Register in `Clarinet.toml`:
   ```toml
   [contracts.my-contract]
   path = "contracts/my-contract.clar"
   clarity_version = 4
   epoch = "latest"
   ```

3. Run check:
   ```bash
   clarinet check
   ```

### Adding External Dependencies

1. Add to `Clarinet.toml`:
   ```toml
   [[project.requirements]]
   contract_id = "SP...contract-principal"
   ```

2. Fetch the dependency:
   ```bash
   clarinet check
   ```

### Writing Tests

Create test files in `tests/` with the `.test.ts` extension:

```typescript
import { describe, expect, it } from "vitest";

describe("my-contract", () => {
  it("should do something", () => {
    const result = simnet.callPublicFn(
      "my-contract",
      "my-function",
      [/* args */],
      sender
    );
    expect(result.result).toBeOk();
  });
});
```

## Troubleshooting

### "Cannot find module" Error

```bash
# Clean install dependencies
rm -rf node_modules
npm install
```

### Clarinet Cache Issues

```bash
# Clear Clarinet cache
rm -rf .cache
clarinet check
```

### Tests Failing on First Run

Ensure dependencies are downloaded:
```bash
clarinet check
npm test
```

### Contract Not Found

Verify the contract is registered in `Clarinet.toml` and the path is correct.

## IDE Setup

### VS Code

1. Install the [Clarity extension](https://marketplace.visualstudio.com/items?itemName=HiroSystems.clarity-lsp)
2. Open the project folder
3. The extension auto-detects `Clarinet.toml`

Recommended settings (`.vscode/settings.json`):
```json
{
  "editor.formatOnSave": true,
  "clarity.analysis.checkChecker.enabled": true
}
```

## Next Steps

- Read the [Architecture Documentation](./ARCHITECTURE.md)
- Review the [Glossary](./GLOSSARY.md) for terminology
- Check [CONTRIBUTING.md](../CONTRIBUTING.md) before submitting PRs

## Getting Help

- Check existing [issues](https://github.com/YOUR_USERNAME/ordyswap/issues)
- Read the [Clarinet documentation](https://docs.hiro.so/stacks/clarinet)
- Review the [Clarity language reference](https://docs.stacks.co/clarity/language-overview)
