;; Bitcoin Utilities
;; Wrapper around clarity-bitcoin with enhanced error handling
;; and ordinal-specific utility functions

;; ============================================
;; External Contract Reference
;; ============================================

;; Reference to the clarity-bitcoin contract
;; This is used for Bitcoin transaction parsing and verification

;; ============================================
;; Transaction Verification
;; ============================================

;; Verify that a Bitcoin transaction was mined in a block
;; Uses the previous block chain for additional verification
(define-read-only (verify-tx-inclusion
    (block { header: (buff 80), height: uint })
    (prev-blocks (list 10 (buff 80)))
    (tx (buff 1024))
    (proof { tx-index: uint, hashes: (list 12 (buff 32)), tree-depth: uint })
  )
  (contract-call? 
    'SP1WN90HKT0E1FWCJT9JFPMC8YP7XGBGFNZGHRVZX.clarity-bitcoin
    was-tx-mined-prev? 
    block 
    prev-blocks 
    tx 
    proof
  )
)

;; Parse a raw Bitcoin transaction
(define-read-only (parse-bitcoin-tx (tx (buff 1024)))
  (contract-call? 
    'SP1WN90HKT0E1FWCJT9JFPMC8YP7XGBGFNZGHRVZX.clarity-bitcoin
    parse-tx 
    tx
  )
)

;; Get the transaction ID from a raw transaction
(define-read-only (get-tx-id (tx (buff 1024)))
  (contract-call? 
    'SP1WN90HKT0E1FWCJT9JFPMC8YP7XGBGFNZGHRVZX.clarity-bitcoin
    get-txid 
    tx
  )
)

;; ============================================
;; Ordinal Extraction Helpers
;; ============================================

;; Extract input data from a parsed transaction at a specific index
;; Returns the outpoint (txid + index) of the consumed UTXO
(define-read-only (extract-input-outpoint
    (parsed-tx {
      version: uint,
      ins: (list 8 {
        outpoint: { hash: (buff 32), index: uint },
        scriptSig: (buff 256),
        sequence: uint
      }),
      outs: (list 8 { value: uint, scriptPubKey: (buff 128) }),
      locktime: uint
    })
    (input-index uint)
  )
  (match (element-at (get ins parsed-tx) input-index)
    input (some (get outpoint input))
    none
  )
)

;; Extract output scriptPubKey from a parsed transaction
(define-read-only (extract-output-script
    (parsed-tx {
      version: uint,
      ins: (list 8 {
        outpoint: { hash: (buff 32), index: uint },
        scriptSig: (buff 256),
        sequence: uint
      }),
      outs: (list 8 { value: uint, scriptPubKey: (buff 128) }),
      locktime: uint
    })
    (output-index uint)
  )
  (match (element-at (get outs parsed-tx) output-index)
    output (some (get scriptPubKey output))
    none
  )
)

;; ============================================
;; Validation Helpers
;; ============================================

;; Validate that an input matches expected ordinal identifier
(define-read-only (validate-ordinal-input
    (outpoint { hash: (buff 32), index: uint })
    (expected-txid (buff 32))
    (expected-index uint)
  )
  (and
    (is-eq (get hash outpoint) expected-txid)
    (is-eq (get index outpoint) expected-index)
  )
)

;; Validate that an output matches expected scriptPubKey
(define-read-only (validate-output-script
    (actual-script (buff 128))
    (expected-script (buff 128))
  )
  (is-eq actual-script expected-script)
)

;; ============================================
;; Combined Verification
;; ============================================

;; Full verification: tx mined + ordinal transferred to correct address
;; Returns (ok true) if all checks pass
(define-read-only (verify-ordinal-transfer
    (block { header: (buff 80), height: uint })
    (prev-blocks (list 10 (buff 80)))
    (tx (buff 1024))
    (proof { tx-index: uint, hashes: (list 12 (buff 32)), tree-depth: uint })
    (input-index uint)
    (output-index uint)
    (expected-txid (buff 32))
    (expected-input-index uint)
    (expected-output (buff 128))
  )
  (let (
      ;; Verify transaction was mined
      (was-mined (try! (verify-tx-inclusion block prev-blocks tx proof)))
      ;; Parse the transaction
      (parsed-tx (try! (parse-bitcoin-tx tx)))
      ;; Get the input outpoint
      (input-outpoint (unwrap! (extract-input-outpoint parsed-tx input-index) (err u101)))
      ;; Get the output script
      (output-script (unwrap! (extract-output-script parsed-tx output-index) (err u101)))
    )
    ;; Validate all conditions
    (asserts! was-mined (err u100))
    (asserts! (validate-ordinal-input input-outpoint expected-txid expected-input-index) (err u121))
    (asserts! (validate-output-script output-script expected-output) (err u121))
    (ok true)
  )
)
