;; Offer Validation
;; Business logic for validating offers and transfers

;; ============================================
;; Input Validation
;; ============================================

;; Validate offer creation parameters
(define-read-only (validate-offer-params
    (txid (buff 32))
    (index uint)
    (amount uint)
    (output (buff 128))
    (recipient principal)
    (sender principal)
  )
  (begin
    ;; Validate txid length
    (asserts! (is-eq (len txid) u32) (err u165))
    ;; Validate output has content
    (asserts! (> (len output) u0) (err u164))
    ;; Validate amount is above minimum
    (asserts! (>= amount u1000000) (err u161))
    ;; Validate amount is below maximum
    (asserts! (<= amount u1000000000000) (err u162))
    ;; Validate recipient is not sender
    (asserts! (not (is-eq recipient sender)) (err u163))
    (ok true)
  )
)

;; ============================================
;; Transfer Validation
;; ============================================

;; Validate the Bitcoin transaction transfer proof
;; This is a read-only function that validates without state changes
(define-read-only (validate-offer-transfer
    (block { header: (buff 80), height: uint })
    (prev-blocks (list 10 (buff 80)))
    (tx (buff 1024))
    (proof { tx-index: uint, hashes: (list 12 (buff 32)), tree-depth: uint })
    (input-index uint)
    (output-index uint)
    (offer-txid (buff 32))
    (offer-index uint)
    (offer-output (buff 128))
  )
  (let (
      ;; Verify transaction was mined
      (was-mined-result (contract-call? 
        'SP1WN90HKT0E1FWCJT9JFPMC8YP7XGBGFNZGHRVZX.clarity-bitcoin
        was-tx-mined-prev? 
        block 
        prev-blocks 
        tx 
        proof
      ))
      (was-mined (unwrap! was-mined-result (err u100)))
    )
    ;; Must be mined
    (asserts! was-mined (err u100))
    
    ;; Parse the transaction
    (let (
        (parsed-tx (unwrap!
          (contract-call? 
            'SP1WN90HKT0E1FWCJT9JFPMC8YP7XGBGFNZGHRVZX.clarity-bitcoin
            parse-tx 
            tx
          )
          (err u101)
        ))
        ;; Get the input at specified index
        (input (unwrap! (element-at (get ins parsed-tx) input-index) (err u101)))
        (outpoint (get outpoint input))
        ;; Get the output at specified index
        (output (unwrap! (element-at (get outs parsed-tx) output-index) (err u101)))
      )
      ;; Validate input matches ordinal identifier
      (asserts! (is-eq (get hash outpoint) offer-txid) (err u121))
      (asserts! (is-eq (get index outpoint) offer-index) (err u121))
      ;; Validate output matches expected destination
      (asserts! (is-eq (get scriptPubKey output) offer-output) (err u121))
      
      (ok true)
    )
  )
)

;; ============================================
;; State Validation
;; ============================================

;; Validate that an offer can be finalized
(define-read-only (validate-can-finalize
    (is-accepted bool)
    (is-refunded bool)
    (cancel-height (optional uint))
  )
  (begin
    ;; Must not be already accepted
    (asserts! (not is-accepted) (err u122))
    ;; Must not be refunded
    (asserts! (not is-refunded) (err u124))
    ;; Must be within grace period if cancelled
    (match cancel-height
      height (asserts! (<= burn-block-height height) (err u123))
      true
    )
    (ok true)
  )
)

;; Validate that an offer can be cancelled
(define-read-only (validate-can-cancel
    (offer-sender principal)
    (caller principal)
    (is-accepted bool)
    (is-cancelled bool)
  )
  (begin
    ;; Must be the original sender
    (asserts! (is-eq caller offer-sender) (err u141))
    ;; Must not be already accepted
    (asserts! (not is-accepted) (err u122))
    ;; Must not be already cancelled
    (asserts! (not is-cancelled) (err u123))
    (ok true)
  )
)

;; Validate that an offer can be refunded
(define-read-only (validate-can-refund
    (is-refunded bool)
    (cancel-height (optional uint))
  )
  (begin
    ;; Must not be already refunded
    (asserts! (not is-refunded) (err u124))
    ;; Must have a cancel height (must be cancelled)
    (match cancel-height
      height (begin
        ;; Must be past grace period
        (asserts! (> burn-block-height height) (err u183))
        (ok true)
      )
      (err u120) ;; Not cancelled = can't refund
    )
  )
)

;; ============================================
;; Expiry Validation
;; ============================================

;; Check if an offer has expired
(define-read-only (is-offer-expired (expires-at uint))
  (if (is-eq expires-at u0)
    false  ;; No expiry
    (> burn-block-height expires-at)
  )
)

;; Validate offer is not expired
(define-read-only (validate-not-expired (expires-at uint))
  (if (is-offer-expired expires-at)
    (err u125)
    (ok true)
  )
)
