# OrdySwap Glossary

This glossary defines key terms used throughout the OrdySwap documentation and codebase.

## Bitcoin & Ordinals

### Block Header
An 80-byte structure containing metadata about a Bitcoin block, including the previous block hash, merkle root, timestamp, difficulty target, and nonce.

### Burn Block Height
In the Stacks blockchain, this refers to the corresponding Bitcoin block height. Stacks blocks are anchored to Bitcoin blocks.

### Genesis Transaction
The Bitcoin transaction in which an Ordinal inscription was originally created. The inscription is identified by the transaction ID (txid) and output index.

### Inscription
Data embedded in a Bitcoin transaction using the Ordinals protocol. Inscriptions can contain images, text, HTML, or other data types.

### Merkle Proof
A cryptographic proof that a transaction is included in a block. It consists of sibling hashes in the merkle tree that allow reconstruction of the merkle root.

### Merkle Root
A 32-byte hash representing all transactions in a block. It's computed by repeatedly hashing pairs of transaction hashes until a single root hash remains.

### Ordinal
A numbering scheme for satoshis (smallest Bitcoin unit) based on the order they were mined. Combined with inscriptions, ordinals enable NFT-like assets on Bitcoin.

### Outpoint
A reference to a specific transaction output, consisting of a transaction ID (txid) and output index. Format: `txid:index`

### Sat (Satoshi)
The smallest unit of Bitcoin (0.00000001 BTC). Named after Bitcoin's creator, Satoshi Nakamoto.

### ScriptPubKey
The locking script in a Bitcoin transaction output. It defines the conditions required to spend the output.

### SegWit (Segregated Witness)
A Bitcoin upgrade that separates signature data from transaction data, enabling more transactions per block and fixing transaction malleability.

### Taproot
A Bitcoin upgrade enabling more complex scripts with improved privacy and efficiency. Uses Schnorr signatures and Merkleized Abstract Syntax Trees (MAST).

### TXID (Transaction ID)
A 32-byte hash uniquely identifying a Bitcoin transaction. Note: often displayed in reversed byte order on block explorers.

### UTXO (Unspent Transaction Output)
An output from a Bitcoin transaction that has not yet been spent. The set of all UTXOs represents spendable Bitcoin.

## Stacks

### Clarity
The smart contract language used on the Stacks blockchain. It's decidable (not Turing-complete), interpreted, and designed for predictability.

### Contract Principal
The address of a smart contract on Stacks. Format: `SP...principal.contract-name`

### Principal
An address on the Stacks blockchain. Can be a standard principal (user wallet) or contract principal.

### STX
The native token of the Stacks blockchain used for transaction fees, smart contract execution, and as a medium of exchange.

## OrdySwap Protocol

### Atomic Swap
An exchange of assets between two parties without requiring trust or intermediaries. Either both sides of the trade execute, or neither does.

### Cancel Grace Period
A 50-block window after an offer is cancelled during which the ordinal owner can still finalize the offer. Prevents front-running attacks.

### Escrow
The temporary holding of funds by the smart contract. STX is escrowed when an offer is created and released when finalized or refunded.

### Finalization
The process of completing a swap by providing proof that the ordinal was transferred. Upon successful verification, escrowed STX is released to the seller.

### Maker
The party who creates an offer to buy an ordinal. They escrow STX in the contract.

### Offer
A commitment to exchange STX for a specific ordinal. Contains the ordinal identifier, offer amount, and expected transfer destination.

### Recipient
The principal address that will receive STX when an offer is finalized. Typically the ordinal seller's Stacks address.

### Seller (Ordinal Owner)
The party who owns the ordinal and wishes to sell it for STX. They transfer the ordinal on Bitcoin and finalize the offer on Stacks.

### Taker
The party who accepts an offer by transferring their ordinal and providing proof.

## Technical Terms

### Big-Endian / Little-Endian
Byte ordering conventions. Big-endian: most significant byte first. Little-endian: least significant byte first. Bitcoin uses little-endian internally but displays txids in big-endian.

### Buffer (Buff)
In Clarity, a fixed-length sequence of bytes. Written as hex with `0x` prefix, e.g., `0xabcd1234`.

### Map
A key-value data structure in Clarity. Used to store offers, states, and other persistent data.

### Read-Only Function
A Clarity function that cannot modify state. Can be called without a transaction.

### Public Function
A Clarity function that can modify state. Requires a transaction with fees.

### Trait
An interface definition in Clarity that specifies function signatures a contract must implement.

## Error Codes

| Code | Name | Description |
|------|------|-------------|
| u100 | ERR_TX_NOT_MINED | Bitcoin transaction not found in specified block |
| u101 | ERR_INVALID_TX | Transaction data is malformed or unparseable |
| u102 | ERR_INVALID_OFFER | Offer ID does not exist |
| u103 | ERR_OFFER_MISMATCH | Transaction doesn't match offer parameters |
| u104 | ERR_OFFER_ACCEPTED | Offer has already been finalized |
| u105 | ERR_OFFER_CANCELLED | Offer was cancelled and grace period expired |
| u106 | ERR_OFFER_REFUNDED | Offer has already been refunded |

## See Also

- [Architecture Documentation](./ARCHITECTURE.md)
- [API Reference](./API.md)
- [Ordinals Documentation](https://docs.ordinals.com/)
- [Stacks Documentation](https://docs.stacks.co/)
- [Clarity Language Reference](https://docs.stacks.co/clarity/language-overview)
