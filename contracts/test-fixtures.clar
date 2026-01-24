;; Test Fixtures
;; Sample Bitcoin block headers and transaction data for testing

;; Sample Bitcoin block header (80 bytes)
;; This is a mock header for testing purposes
(define-constant SAMPLE-BLOCK-HEADER 
  0x0100000000000000000000000000000000000000000000000000000000000000000000003ba3edfd7a7b12b27ac72c3e67768f617fc81bc3888a51323a9fb8aa4b1e5e4a29ab5f49ffff001d1dac2b7c
)

;; Sample block height
(define-constant SAMPLE-BLOCK-HEIGHT u100)

;; Sample Bitcoin transaction (simplified)
;; This is a mock transaction for testing purposes
(define-constant SAMPLE-TX
  0x01000000010000000000000000000000000000000000000000000000000000000000000001000000006a47304402203f32a4c60b0d3c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c022012345678901234567890123456789012345678901234567890123456789012340121030000000000000000000000000000000000000000000000000000000000000000ffffffff0100e1f505000000001976a91489abcdefabbaabbaabbaabbaabbaabbaabbaabba88ac00000000
)

;; Sample Merkle proof hashes
(define-constant SAMPLE-MERKLE-HASHES
  (list
    0x0000000000000000000000000000000000000000000000000000000000000001
    0x0000000000000000000000000000000000000000000000000000000000000002
    0x0000000000000000000000000000000000000000000000000000000000000003
  )
)

;; Sample ordinal genesis transaction ID
(define-constant SAMPLE-ORDINAL-TXID
  0x0000000000000000000000000000000000000000000000000000000000000001
)

;; Sample recipient scriptPubKey (P2PKH)
(define-constant SAMPLE-P2PKH-OUTPUT
  0x76a91489abcdefabbaabbaabbaabbaabbaabbaabbaabba88ac
)

;; Sample recipient scriptPubKey (P2SH)
(define-constant SAMPLE-P2SH-OUTPUT
  0xa91489abcdefabbaabbaabbaabbaabbaabbaabbaabba87
)

;; Sample recipient scriptPubKey (P2WPKH - SegWit)
(define-constant SAMPLE-P2WPKH-OUTPUT
  0x001489abcdefabbaabbaabbaabbaabbaabbaabbaabba
)

;; Helper to get sample block data
(define-read-only (get-sample-block)
  {
    header: SAMPLE-BLOCK-HEADER,
    height: SAMPLE-BLOCK-HEIGHT
  }
)

;; Helper to get sample proof data
(define-read-only (get-sample-proof)
  {
    tx-index: u0,
    hashes: SAMPLE-MERKLE-HASHES,
    tree-depth: u3
  }
)
