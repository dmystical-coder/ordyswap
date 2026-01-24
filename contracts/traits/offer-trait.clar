;; OrdySwap Offer Trait
;; Defines the interface for offer management

(define-trait offer-trait
  (
    ;; Create a new offer to purchase an ordinal
    (create-offer ((buff 32) uint uint (buff 128) principal) (response uint uint))
    
    ;; Cancel an existing offer
    (cancel-offer (uint) (response bool uint))
    
    ;; Refund a cancelled offer after grace period
    (refund-cancelled-offer (uint) (response uint uint))
  )
)
