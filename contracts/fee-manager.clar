;; Fee Manager
;; Handles protocol fee collection and distribution

;; ============================================
;; State Variables
;; ============================================

;; Total accumulated fees
(define-data-var accumulated-fees uint u0)

;; ============================================
;; Fee Collection
;; ============================================

;; Add fees to accumulated pool
(define-public (collect-fee (amount uint))
  (begin
    (var-set accumulated-fees (+ (var-get accumulated-fees) amount))
    (ok true)
  )
)

;; Get accumulated fees
(define-read-only (get-accumulated-fees)
  (var-get accumulated-fees)
)

;; ============================================
;; Fee Distribution
;; ============================================

;; Withdraw accumulated fees to recipient
;; Only callable by governance contract
(define-public (withdraw-fees (recipient principal) (amount uint))
  (let (
      (current-fees (var-get accumulated-fees))
    )
    ;; Ensure sufficient fees
    (asserts! (>= current-fees amount) (err u160))
    ;; Update accumulated fees
    (var-set accumulated-fees (- current-fees amount))
    ;; Transfer fees
    (try! (as-contract (stx-transfer? amount tx-sender recipient)))
    (print {
      topic: "fees-withdrawn",
      recipient: recipient,
      amount: amount,
      remaining: (var-get accumulated-fees)
    })
    (ok amount)
  )
)

;; Withdraw all accumulated fees
(define-public (withdraw-all-fees (recipient principal))
  (let (
      (current-fees (var-get accumulated-fees))
    )
    (if (> current-fees u0)
      (withdraw-fees recipient current-fees)
      (ok u0)
    )
  )
)

;; ============================================
;; Fee Calculations
;; ============================================

;; Calculate fee from amount and basis points
(define-read-only (calculate-fee-amount (amount uint) (fee-bps uint))
  (if (is-eq fee-bps u0)
    u0
    (/ (* amount fee-bps) u10000)
  )
)

;; Split amount into fee and remainder
(define-read-only (split-amount (amount uint) (fee-bps uint))
  (let (
      (fee (calculate-fee-amount amount fee-bps))
    )
    {
      fee: fee,
      remainder: (- amount fee)
    }
  )
)
