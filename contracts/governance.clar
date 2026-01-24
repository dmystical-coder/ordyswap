;; Governance
;; Admin and governance functions for the protocol

;; ============================================
;; State Variables
;; ============================================

;; Contract owner (deployer by default)
(define-data-var contract-owner principal tx-sender)

;; Protocol pause state
(define-data-var is-paused bool false)

;; Protocol fee in basis points (100 bps = 1%)
(define-data-var protocol-fee-bps uint u0)

;; Fee recipient
(define-data-var fee-recipient principal tx-sender)

;; ============================================
;; Authorization Helpers
;; ============================================

;; Check if caller is the owner
(define-read-only (is-owner)
  (is-eq tx-sender (var-get contract-owner))
)

;; Require caller to be owner
(define-private (require-owner)
  (asserts! (is-owner) (err u141))
  (ok true)
)

;; ============================================
;; Pause Management
;; ============================================

;; Get pause status
(define-read-only (get-is-paused)
  (var-get is-paused)
)

;; Set pause status (owner only)
(define-public (set-paused (paused bool))
  (begin
    (try! (require-owner))
    (var-set is-paused paused)
    (print {
      topic: "pause-status-changed",
      paused: paused,
      by: tx-sender
    })
    (ok true)
  )
)

;; Require contract is not paused
(define-read-only (require-not-paused)
  (if (var-get is-paused)
    (err u182)
    (ok true)
  )
)

;; ============================================
;; Ownership Management
;; ============================================

;; Get current owner
(define-read-only (get-owner)
  (var-get contract-owner)
)

;; Transfer ownership (owner only)
(define-public (transfer-ownership (new-owner principal))
  (begin
    (try! (require-owner))
    (asserts! (not (is-eq new-owner (var-get contract-owner))) (err u140))
    (var-set contract-owner new-owner)
    (print {
      topic: "ownership-transferred",
      previous-owner: tx-sender,
      new-owner: new-owner
    })
    (ok true)
  )
)

;; ============================================
;; Fee Management
;; ============================================

;; Get current protocol fee
(define-read-only (get-protocol-fee)
  (var-get protocol-fee-bps)
)

;; Set protocol fee (owner only)
;; Max fee is 500 basis points (5%)
(define-public (set-protocol-fee (fee-bps uint))
  (begin
    (try! (require-owner))
    (asserts! (<= fee-bps u500) (err u160))
    (var-set protocol-fee-bps fee-bps)
    (print {
      topic: "protocol-fee-updated",
      fee-bps: fee-bps,
      by: tx-sender
    })
    (ok true)
  )
)

;; Get fee recipient
(define-read-only (get-fee-recipient)
  (var-get fee-recipient)
)

;; Set fee recipient (owner only)
(define-public (set-fee-recipient (recipient principal))
  (begin
    (try! (require-owner))
    (var-set fee-recipient recipient)
    (print {
      topic: "fee-recipient-updated",
      recipient: recipient,
      by: tx-sender
    })
    (ok true)
  )
)

;; ============================================
;; Fee Calculation
;; ============================================

;; Calculate fee amount from total
(define-read-only (calculate-fee (amount uint))
  (let (
      (fee-bps (var-get protocol-fee-bps))
    )
    (if (is-eq fee-bps u0)
      u0
      (/ (* amount fee-bps) u10000)
    )
  )
)

;; Calculate amount after fee
(define-read-only (calculate-amount-after-fee (amount uint))
  (- amount (calculate-fee amount))
)

;; ============================================
;; Emergency Functions
;; ============================================

;; Emergency pause - stops all operations
(define-public (emergency-pause)
  (begin
    (try! (require-owner))
    (var-set is-paused true)
    (print {
      topic: "emergency-pause",
      by: tx-sender,
      block: burn-block-height
    })
    (ok true)
  )
)
