;; OrdySwap Error Handling
;; Descriptive error messages and helper functions

;; ============================================
;; Error Types with Messages
;; ============================================

;; Error tuple type for detailed error information
;; Usage: (err { code: u100, message: "TX not mined" })

;; ============================================
;; Error Throwing Helpers
;; ============================================

;; Transaction verification errors
(define-constant ERR-TX-NOT-MINED-MSG "Bitcoin transaction was not found in the specified block")
(define-constant ERR-INVALID-TX-MSG "Transaction data is malformed or cannot be parsed")

;; Offer errors
(define-constant ERR-INVALID-OFFER-MSG "Offer ID does not exist")
(define-constant ERR-OFFER-MISMATCH-MSG "Transaction does not match offer parameters")
(define-constant ERR-OFFER-ACCEPTED-MSG "Offer has already been finalized")
(define-constant ERR-OFFER-CANCELLED-MSG "Offer was cancelled and grace period expired")
(define-constant ERR-OFFER-REFUNDED-MSG "Offer has already been refunded")
(define-constant ERR-OFFER-EXPIRED-MSG "Offer has expired")

;; Authorization errors
(define-constant ERR-UNAUTHORIZED-MSG "Caller is not authorized to perform this action")
(define-constant ERR-NOT-OWNER-MSG "Caller is not the offer owner")

;; Validation errors
(define-constant ERR-INVALID-AMOUNT-MSG "Invalid offer amount")
(define-constant ERR-AMOUNT-TOO-LOW-MSG "Offer amount is below minimum")
(define-constant ERR-AMOUNT-TOO-HIGH-MSG "Offer amount exceeds maximum")
(define-constant ERR-INVALID-RECIPIENT-MSG "Invalid recipient address")

;; State errors
(define-constant ERR-CONTRACT-PAUSED-MSG "Contract is currently paused")
(define-constant ERR-GRACE-PERIOD-NOT-OVER-MSG "Cancel grace period has not ended")

;; ============================================
;; Error Creation Helpers
;; ============================================

;; Create a simple error response
(define-read-only (make-error (code uint))
  (err code)
)

;; ============================================
;; Assertion Helpers
;; ============================================

;; Assert that the caller is the offer sender
(define-read-only (is-offer-sender (offer-sender principal))
  (is-eq tx-sender offer-sender)
)

;; Assert that an amount is within valid range
(define-read-only (is-valid-amount (amount uint) (min uint) (max uint))
  (and (>= amount min) (<= amount max))
)

;; Assert that a buffer has expected length
(define-read-only (is-valid-buffer-length (buf (buff 128)) (expected-min uint))
  (>= (len buf) expected-min)
)

;; Assert that a txid is valid (32 bytes)
(define-read-only (is-valid-txid (txid (buff 32)))
  (is-eq (len txid) u32)
)

;; ============================================
;; Status Helpers
;; ============================================

;; Check if offer can be finalized
(define-read-only (can-finalize 
    (is-accepted bool)
    (is-refunded bool)
    (cancel-height (optional uint))
    (current-height uint)
  )
  (and
    (not is-accepted)
    (not is-refunded)
    (match cancel-height
      height (<= current-height height)
      true
    )
  )
)

;; Check if offer can be refunded
(define-read-only (can-refund
    (is-refunded bool)
    (cancel-height (optional uint))
    (current-height uint)
  )
  (and
    (not is-refunded)
    (match cancel-height
      height (> current-height height)
      false
    )
  )
)
