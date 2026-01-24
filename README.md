# OrdySwap

> **Trustless atomic swaps between Bitcoin Ordinal inscriptions and Stacks (STX)**

[![Test](https://github.com/YOUR_USERNAME/ordyswap/actions/workflows/test.yml/badge.svg)](https://github.com/YOUR_USERNAME/ordyswap/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

OrdySwap enables peer-to-peer trading of Ordinal inscriptions without intermediaries. Sellers transfer ordinals on Bitcoin, provide cryptographic proof of the transfer, and receive STX directly from the smart contract.

## ⚠️ Disclaimer

**This software is provided for educational purposes and has NOT been audited. Use at your own risk.**

Currently supports **Genesis Ordinals only** (inscriptions that have not been previously transferred).

## How It Works

```
┌─────────────┐                      ┌─────────────┐                      ┌─────────────┐
│   Buyer     │                      │  OrdySwap   │                      │   Seller    │
│  (Maker)    │                      │  Contract   │                      │  (Taker)    │
└──────┬──────┘                      └──────┬──────┘                      └──────┬──────┘
       │                                    │                                    │
       │ 1. create-offer (escrow STX)       │                                    │
       │───────────────────────────────────>│                                    │
       │                                    │                                    │
       │                                    │  2. View offer, verify terms       │
       │                                    │<───────────────────────────────────│
       │                                    │                                    │
       │                                    │  3. Send ordinal (Bitcoin TX)      │
       │                                    │<═══════════════════════════════════│
       │                                    │                                    │
       │                                    │  4. finalize-offer (Merkle proof)  │
       │                                    │<───────────────────────────────────│
       │                                    │                                    │
       │                                    │  5. STX released to seller         │
       │                                    │───────────────────────────────────>│
       │                                    │                                    │
```

1. **Buyer creates offer**: Specifies the ordinal (txid:index), price in STX, and escrows funds
2. **Seller reviews offer**: Verifies the terms and destination address
3. **Seller transfers ordinal**: Sends the inscription to buyer's Bitcoin address
4. **Seller finalizes**: Submits Merkle proof of the Bitcoin transaction
5. **Contract verifies & pays**: Validates proof and releases STX to seller

## Quick Start

### Prerequisites

- [Clarinet](https://docs.hiro.so/stacks/clarinet) >= 2.0.0
- [Node.js](https://nodejs.org/) >= 18.0.0

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/ordyswap.git
cd ordyswap

# Install dependencies
npm install

# Run tests
npm test
```

### Using Clarinet Console

```bash
# Start the Clarinet console
clarinet console

# Create an offer (example)
(contract-call? .ord-swap create-offer
  0x<ordinal-txid-32-bytes>
  u0                         ;; output index
  u1000000                   ;; 1 STX (in micro-STX)
  0x<expected-output-script>
  'ST1RECIPIENT...
)
```

## Contract Functions

### Public Functions

| Function | Description |
|----------|-------------|
| `create-offer` | Create a new offer, escrow STX |
| `finalize-offer` | Complete swap with Bitcoin transaction proof |
| `cancel-offer` | Cancel offer (starts 50-block grace period) |
| `refund-cancelled-offer` | Reclaim STX after grace period |

### Read-Only Functions

| Function | Description |
|----------|-------------|
| `get-offer` | Get offer details by ID |
| `get-offer-accepted` | Check if offer was finalized |
| `get-offer-cancelled` | Get cancellation block height |
| `get-offer-refunded` | Check if offer was refunded |
| `get-last-id` | Get the latest offer ID |
| `validate-offer-transfer` | Validate a transfer proof (without executing) |

## Architecture

The protocol uses a simple state machine:

```
CREATED ──────────────────> FINALIZED
    │                           ▲
    │                           │
    └──> CANCELLED ─────────────┘
              │           (within grace period)
              │
              └──> REFUNDED
                  (after grace period)
```

For detailed architecture documentation, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Security Considerations

- **50-block grace period**: After cancellation, sellers have ~50 Bitcoin blocks (~8 hours) to finalize
- **Genesis ordinals only**: This version doesn't track inscription transfers
- **External dependency**: Relies on `clarity-bitcoin` for Bitcoin verification

See [SECURITY.md](SECURITY.md) for full security policy and known limitations.

## Development

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:report

# Watch mode
npm run test:watch
```

### Contract Analysis

```bash
# Check contract syntax and semantics
clarinet check

# Interactive console
clarinet console
```

### Project Structure

```
ordyswap/
├── contracts/
│   └── ord-swap.clar      # Main contract
├── tests/
│   └── ord-swap.test.ts   # Contract tests
├── docs/
│   ├── ARCHITECTURE.md    # Technical design
│   └── GLOSSARY.md        # Term definitions
├── .github/
│   └── workflows/         # CI/CD
├── CONTRIBUTING.md        # Contribution guide
├── SECURITY.md           # Security policy
└── CHANGELOG.md          # Version history
```

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for:

- Commit conventions
- Code style guidelines
- Pull request process

## Roadmap

- [ ] Support for non-Genesis ordinals
- [ ] SegWit/Taproot transaction support
- [ ] Offer expiry mechanism
- [ ] TypeScript SDK
- [ ] Frontend integration examples
- [ ] External security audit

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Mechanism](https://github.com/mechanismHQ/ordyswap) - Original ordyswap implementation
- [Hiro](https://github.com/hirosystems) - clarity-bitcoin library and Clarinet tooling
- [Ordinals Protocol](https://docs.ordinals.com/) - Bitcoin inscription standard

---

**⚡ Built on Stacks | 🔗 Secured by Bitcoin**
