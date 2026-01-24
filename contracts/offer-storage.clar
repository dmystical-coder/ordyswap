;; Offer Storage
;; Data layer for offer management
;; Separates storage from business logic

;; ============================================
;; Data Maps
;; ============================================

;; Main offer storage
(define-map offers-map
  uint  ;; offer-id
  {
    txid: (buff 32),        ;; Genesis transaction ID of the ordinal
    index: uint,            ;; Output index in the genesis transaction
    amount: uint,           ;; STX amount offered (micro-STX)
    output: (buff 128),     ;; Expected scriptPubKey for transfer verification
    sender: principal,      ;; Maker's address (buyer)
    recipient: principal,   ;; Seller's address (receives STX)
    created-at: uint,       ;; Block height when created
    expires-at: uint        ;; Block height when offer expires (0 = no expiry)
  }
)

;; Tracks accepted (finalized) offers
(define-map offers-accepted-map
  uint  ;; offer-id
  {
    accepted-at: uint,      ;; Block height when accepted
    btc-txid: (buff 32)     ;; Bitcoin transaction ID that finalized the offer
  }
)

;; Tracks cancelled offers with grace period end block
(define-map offers-cancelled-map
  uint  ;; offer-id
  uint  ;; Block height when grace period ends
)

;; Tracks refunded offers
(define-map offers-refunded-map
  uint  ;; offer-id
  uint  ;; Block height when refunded
)

;; ============================================
;; Data Variables
;; ============================================

;; Auto-incrementing offer ID
(define-data-var last-id-var uint u0)

;; ============================================
;; ID Management
;; ============================================

;; Generate the next offer ID
(define-public (generate-next-id)
  (let ((current-id (var-get last-id-var)))
    (var-set last-id-var (+ current-id u1))
    (ok current-id)
  )
)

;; Get the last used offer ID
(define-read-only (get-last-id)
  (var-get last-id-var)
)

;; ============================================
;; Offer CRUD Operations
;; ============================================

;; Insert a new offer
(define-public (insert-offer
    (id uint)
    (txid (buff 32))
    (index uint)
    (amount uint)
    (output (buff 128))
    (sender principal)
    (recipient principal)
    (expires-at uint)
  )
  (begin
    (asserts! (map-insert offers-map id {
      txid: txid,
      index: index,
      amount: amount,
      output: output,
      sender: sender,
      recipient: recipient,
      created-at: burn-block-height,
      expires-at: expires-at
    }) (err u120))
    (ok true)
  )
)

;; Get offer by ID
(define-read-only (get-offer (id uint))
  (map-get? offers-map id)
)

;; Check if offer exists
(define-read-only (offer-exists (id uint))
  (is-some (map-get? offers-map id))
)

;; ============================================
;; Status Management
;; ============================================

;; Mark offer as accepted
(define-public (set-offer-accepted (id uint) (btc-txid (buff 32)))
  (begin
    (asserts! (map-insert offers-accepted-map id {
      accepted-at: burn-block-height,
      btc-txid: btc-txid
    }) (err u122))
    (ok true)
  )
)

;; Get offer accepted status
(define-read-only (get-offer-accepted (id uint))
  (map-get? offers-accepted-map id)
)

;; Check if offer is accepted
(define-read-only (is-offer-accepted (id uint))
  (is-some (map-get? offers-accepted-map id))
)

;; Mark offer as cancelled
(define-public (set-offer-cancelled (id uint) (grace-period uint))
  (begin
    (asserts! (map-insert offers-cancelled-map id (+ burn-block-height grace-period)) (err u123))
    (ok true)
  )
)

;; Get offer cancel height
(define-read-only (get-offer-cancelled (id uint))
  (map-get? offers-cancelled-map id)
)

;; Check if offer is cancelled
(define-read-only (is-offer-cancelled (id uint))
  (is-some (map-get? offers-cancelled-map id))
)

;; Check if offer is past grace period
(define-read-only (is-grace-period-over (id uint))
  (match (map-get? offers-cancelled-map id)
    grace-end (> burn-block-height grace-end)
    false
  )
)

;; Check if still within grace period (can still finalize)
(define-read-only (is-within-grace-period (id uint))
  (match (map-get? offers-cancelled-map id)
    grace-end (<= burn-block-height grace-end)
    true  ;; Not cancelled = always within "grace period"
  )
)

;; Mark offer as refunded
(define-public (set-offer-refunded (id uint))
  (begin
    (asserts! (map-insert offers-refunded-map id burn-block-height) (err u124))
    (ok true)
  )
)

;; Get offer refund status
(define-read-only (get-offer-refunded (id uint))
  (map-get? offers-refunded-map id)
)

;; Check if offer is refunded
(define-read-only (is-offer-refunded (id uint))
  (is-some (map-get? offers-refunded-map id))
)

;; ============================================
;; Composite Status Checks
;; ============================================

;; Get comprehensive offer status
;; Returns: 0=active, 1=accepted, 2=cancelled, 3=refunded, 4=expired
(define-read-only (get-offer-status (id uint))
  (let (
      (offer (map-get? offers-map id))
    )
    (match offer
      o (if (is-offer-refunded id)
          u3  ;; Refunded
          (if (is-offer-accepted id)
            u1  ;; Accepted
            (if (is-grace-period-over id)
              u2  ;; Cancelled (grace period over)
              (if (and (> (get expires-at o) u0) (> burn-block-height (get expires-at o)))
                u4  ;; Expired
                u0  ;; Active
              )
            )
          )
        )
      u126  ;; Not found error code
    )
  )
)

;; Check if offer can be finalized
(define-read-only (can-finalize-offer (id uint))
  (and
    (offer-exists id)
    (not (is-offer-accepted id))
    (not (is-offer-refunded id))
    (is-within-grace-period id)
  )
)

;; Check if offer can be refunded
(define-read-only (can-refund-offer (id uint))
  (and
    (offer-exists id)
    (not (is-offer-accepted id))
    (not (is-offer-refunded id))
    (is-grace-period-over id)
  )
)
