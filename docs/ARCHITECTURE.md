# OrdySwap Architecture

This document describes the architecture and design of the OrdySwap protocol.

## Overview

OrdySwap enables trustless peer-to-peer atomic swaps between Bitcoin Ordinal inscriptions and Stacks (STX) tokens. The protocol uses Bitcoin transaction inclusion proofs (Merkle proofs) to verify ordinal transfers without requiring a trusted intermediary.

## High-Level Flow

```
┌─────────────┐                     ┌─────────────────┐                     ┌─────────────────┐
│   Maker     │                     │  OrdySwap       │                     │  Ordinal Owner  │
│  (Buyer)    │                     │  Contract       │                     │    (Seller)     │
└──────┬──────┘                     └────────┬────────┘                     └────────┬────────┘
       │                                     │                                       │
       │ 1. create-offer(ordinal, amount)    │                                       │
       │────────────────────────────────────>│                                       │
       │         (STX escrowed)              │                                       │
       │                                     │                                       │
       │                                     │   2. Monitor for offer                │
       │                                     │<──────────────────────────────────────│
       │                                     │                                       │
       │                                     │   3. Send ordinal on Bitcoin          │
       │                                     │<═══════════════════════════════════════│
       │                                     │      (BTC transaction)                │
       │                                     │                                       │
       │                                     │   4. finalize-offer(proof)            │
       │                                     │<──────────────────────────────────────│
       │                                     │        (with Merkle proof)            │
       │                                     │                                       │
       │                                     │   5. Verify TX inclusion              │
       │                                     │────┐                                  │
       │                                     │    │ validate-offer-transfer          │
       │                                     │<───┘                                  │
       │                                     │                                       │
       │                                     │   6. STX transferred                  │
       │                                     │──────────────────────────────────────>│
       │                                     │                                       │
```

## Core Components

### 1. Offer Management

The contract maintains a mapping of offers with the following structure:

```clarity
(define-map offers-map
  uint  ;; offer-id
  {
    txid: (buff 32),        ;; Genesis transaction ID of the ordinal
    index: uint,            ;; Output index in the genesis transaction
    amount: uint,           ;; STX amount offered
    output: (buff 128),     ;; Expected scriptPubKey for transfer verification
    sender: principal,      ;; Maker's address (buyer)
    recipient: principal,   ;; Seller's address (receives STX)
  }
)
```

### 2. State Tracking

Three boolean maps track offer lifecycle:

| Map | Purpose |
|-----|---------|
| `offers-accepted-map` | Tracks finalized offers |
| `offers-cancelled-map` | Tracks cancelled offers with cancel block height |
| `offers-refunded-map` | Tracks refunded offers |

### 3. Bitcoin Verification

The contract integrates with the `clarity-bitcoin` contract for:

- **Transaction Parsing**: `parse-tx` extracts inputs/outputs from raw Bitcoin transactions
- **Merkle Proof Verification**: `was-tx-mined-prev?` verifies transaction inclusion in a block
- **TXID Computation**: `get-txid` computes transaction IDs

## State Machine

```
                    ┌────────────────┐
                    │    CREATED     │
                    └───────┬────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
            ▼               ▼               │
    ┌───────────────┐ ┌───────────────┐     │
    │  CANCELLED    │ │  FINALIZED    │     │
    └───────┬───────┘ └───────────────┘     │
            │                               │
            │ (after 50 blocks)             │
            ▼                               │
    ┌───────────────┐                       │
    │   REFUNDED    │                       │
    └───────────────┘                       │

Transitions:
- CREATED → FINALIZED: Valid Merkle proof provided
- CREATED → CANCELLED: Sender cancels (50-block grace period starts)
- CANCELLED → FINALIZED: Valid proof within grace period
- CANCELLED → REFUNDED: After grace period expires
```

## Security Model

### Trust Assumptions

1. **Bitcoin Consensus**: We trust Bitcoin's proof-of-work consensus
2. **Stacks-Bitcoin Bridge**: We trust the block header data available in Stacks
3. **clarity-bitcoin Contract**: We trust the correctness of the Bitcoin verification library

### Attack Mitigations

| Attack Vector | Mitigation |
|---------------|------------|
| Front-running cancellation | 50-block grace period allows seller to finalize |
| Double-spend ordinal | Merkle proof verification ensures TX is mined |
| Fake Merkle proofs | Cryptographic verification against block headers |
| Re-use of proofs | Accepted offers tracked, preventing double claims |

## Contract Dependencies

```
┌─────────────────┐
│    ord-swap     │
└────────┬────────┘
         │
         │ contract-call?
         ▼
┌─────────────────────────────────────────────────────┐
│  SP1WN90HKT0E1FWCJT9JFPMC8YP7XGBGFNZGHRVZX         │
│  .clarity-bitcoin                                   │
│                                                     │
│  - was-tx-mined-prev?                              │
│  - parse-tx                                         │
│  - get-txid                                         │
└─────────────────────────────────────────────────────┘
```

## Data Flow: Finalize Offer

```
1. User submits:
   - Block header (80 bytes)
   - Previous block headers (for verification)
   - Raw Bitcoin transaction (up to 1024 bytes)
   - Merkle proof (hashes + tree depth + index)
   - Input/output indices
   - Offer ID

2. Validation:
   ├── Verify block header matches burn-chain
   ├── Verify previous blocks chain together
   ├── Verify TX merkle root in block header
   ├── Parse transaction
   ├── Extract input at specified index
   ├── Verify input.txid matches offer.txid
   ├── Verify input.index matches offer.index
   ├── Extract output at specified index
   ├── Verify output.scriptPubKey matches offer.output
   ├── Check offer not already accepted
   ├── Check offer not refunded
   └── Check not cancelled (or within grace period)

3. Execution:
   ├── Mark offer as accepted
   ├── Transfer STX to recipient
   └── Emit finalization event
```

## Ordinal Identification

An ordinal inscription is uniquely identified by its **genesis transaction ID** and **output index**. This is the transaction where the inscription was created.

> ⚠️ **Important**: This implementation only supports Genesis ordinals. If an ordinal has been transferred, its current location (txid:index) differs from its genesis location.

## Gas Considerations

| Operation | Approximate Cost |
|-----------|------------------|
| create-offer | ~2,000 - 3,000 µSTX |
| finalize-offer | ~15,000 - 25,000 µSTX |
| cancel-offer | ~1,500 - 2,000 µSTX |
| refund-cancelled-offer | ~2,000 - 3,000 µSTX |

The `finalize-offer` operation is most expensive due to Merkle proof verification.

## Future Enhancements

1. **Non-Genesis Ordinal Support**: Track inscription transfers
2. **SegWit/Taproot Support**: Parse witness data in transactions  
3. **Offer Expiry**: Automatic offer expiration
4. **Batch Operations**: Create/cancel multiple offers
5. **Fee Mechanism**: Optional protocol fees
6. **Governance**: Upgradeable components

## References

- [Ordinals Protocol](https://docs.ordinals.com/)
- [Stacks Documentation](https://docs.stacks.co/)
- [clarity-bitcoin Contract](https://github.com/hirosystems/clarity-bitcoin)
- [Bitcoin Transaction Format](https://developer.bitcoin.org/reference/transactions.html)
