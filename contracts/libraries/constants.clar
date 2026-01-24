;; OrdySwap Constants
;; Centralized constants for the protocol

;; ============================================
;; Error Codes
;; ============================================

;; Transaction verification errors (100-119)
(define-constant ERR-TX-NOT-MINED u100)
(define-constant ERR-INVALID-TX u101)

;; Offer errors (120-139)
(define-constant ERR-INVALID-OFFER u120)
(define-constant ERR-OFFER-MISMATCH u121)
(define-constant ERR-OFFER-ACCEPTED u122)
(define-constant ERR-OFFER-CANCELLED u123)
(define-constant ERR-OFFER-REFUNDED u124)
(define-constant ERR-OFFER-EXPIRED u125)
(define-constant ERR-OFFER-NOT-FOUND u126)

;; Authorization errors (140-159)
(define-constant ERR-UNAUTHORIZED u140)
(define-constant ERR-NOT-OWNER u141)

;; Validation errors (160-179)
(define-constant ERR-INVALID-AMOUNT u160)
(define-constant ERR-AMOUNT-TOO-LOW u161)
(define-constant ERR-AMOUNT-TOO-HIGH u162)
(define-constant ERR-INVALID-RECIPIENT u163)
(define-constant ERR-INVALID-OUTPUT u164)
(define-constant ERR-INVALID-TXID u165)

;; State errors (180-199)
(define-constant ERR-ALREADY-INITIALIZED u180)
(define-constant ERR-NOT-INITIALIZED u181)
(define-constant ERR-CONTRACT-PAUSED u182)
(define-constant ERR-GRACE-PERIOD-NOT-OVER u183)

;; ============================================
;; Protocol Parameters
;; ============================================

;; Cancellation grace period in Bitcoin blocks (50 blocks = approx 8 hours)
(define-constant CANCEL-GRACE-PERIOD u50)

;; Minimum offer amount in micro-STX (1 STX = 1,000,000 micro-STX)
(define-constant MIN-OFFER-AMOUNT u1000000)

;; Maximum offer amount in micro-STX (1,000,000 STX)
(define-constant MAX-OFFER-AMOUNT u1000000000000)

;; Maximum offer duration in blocks (10,000 blocks = approx 70 days)
(define-constant MAX-OFFER-DURATION u10000)

;; Protocol fee in basis points (0 = no fee, 100 = 1%)
(define-constant DEFAULT-PROTOCOL-FEE-BPS u0)

;; Maximum protocol fee in basis points (5%)
(define-constant MAX-PROTOCOL-FEE-BPS u500)

;; ============================================
;; Buffer Size Limits
;; ============================================

;; Maximum Bitcoin transaction size
(define-constant MAX-TX-SIZE u1024)

;; Maximum scriptPubKey size
(define-constant MAX-OUTPUT-SIZE u128)

;; Block header size (fixed)
(define-constant BLOCK-HEADER-SIZE u80)

;; Transaction ID size (fixed)
(define-constant TXID-SIZE u32)

;; ============================================
;; Offer Status Constants
;; ============================================

(define-constant STATUS-ACTIVE u0)
(define-constant STATUS-ACCEPTED u1)
(define-constant STATUS-CANCELLED u2)
(define-constant STATUS-REFUNDED u3)
(define-constant STATUS-EXPIRED u4)
