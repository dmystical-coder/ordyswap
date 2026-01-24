;; Bitcoin Verification Trait
;; Defines the interface for Bitcoin transaction verification

(define-trait bitcoin-verification-trait
  (
    ;; Verify that a transaction was mined in a Bitcoin block
    (verify-tx-mined
      (
        (buff 80)
        uint
        (buff 1024)
        uint
        (list 12 (buff 32))
        uint
      )
      (response bool uint)
    )
    
    ;; Get transaction ID from raw transaction
    (get-transaction-id ((buff 1024)) (buff 32))
  )
)
