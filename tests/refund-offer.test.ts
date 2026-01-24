import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("refund-cancelled-offer", () => {
  const sampleTxid = "0x0000000000000000000000000000000000000000000000000000000000000001";
  const sampleOutput = "0x76a91489abcdefabbaabbaabbaabbaabbaabbaabbaabba88ac";
  const offerAmount = 5000000; // 5 STX

  // Helper to create and cancel an offer
  function createAndCancelOffer(): number {
    // Create offer
    simnet.callPublicFn(
      "ord-swap",
      "create-offer",
      [
        Cl.bufferFromHex(sampleTxid.slice(2)),
        Cl.uint(0),
        Cl.uint(offerAmount),
        Cl.bufferFromHex(sampleOutput.slice(2)),
        Cl.principal(wallet2),
      ],
      wallet1
    );

    // Cancel offer
    simnet.callPublicFn(
      "ord-swap",
      "cancel-offer",
      [Cl.uint(0)],
      wallet1
    );

    return 0;
  }

  it("should not allow refund before grace period ends", () => {
    createAndCancelOffer();

    // Try to refund immediately (grace period is 50 blocks)
    const { result } = simnet.callPublicFn(
      "ord-swap",
      "refund-cancelled-offer",
      [Cl.uint(0)],
      wallet1
    );

    expect(result).toBeErr(Cl.uint(102)); // ERR_INVALID_OFFER
  });

  it("should refund STX after grace period", () => {
    createAndCancelOffer();
    
    const balanceBeforeRefund = simnet.getAssetsMap().get("STX")?.get(wallet1) || 0n;

    // Mine 51 blocks to pass grace period
    simnet.mineEmptyBlocks(51);

    const { result } = simnet.callPublicFn(
      "ord-swap",
      "refund-cancelled-offer",
      [Cl.uint(0)],
      wallet1
    );

    expect(result).toBeOk(Cl.uint(0));

    // Check balance increased
    const balanceAfterRefund = simnet.getAssetsMap().get("STX")?.get(wallet1) || 0n;
    expect(balanceAfterRefund).toBe(balanceBeforeRefund + BigInt(offerAmount));
  });

  it("should prevent double refund", () => {
    createAndCancelOffer();

    // Pass grace period
    simnet.mineEmptyBlocks(51);

    // First refund
    simnet.callPublicFn(
      "ord-swap",
      "refund-cancelled-offer",
      [Cl.uint(0)],
      wallet1
    );

    // Second refund attempt
    const { result } = simnet.callPublicFn(
      "ord-swap",
      "refund-cancelled-offer",
      [Cl.uint(0)],
      wallet1
    );

    expect(result).toBeErr(Cl.uint(106)); // ERR_OFFER_REFUNDED
  });

  it("should only refund cancelled offers", () => {
    // Create offer but don't cancel
    simnet.callPublicFn(
      "ord-swap",
      "create-offer",
      [
        Cl.bufferFromHex(sampleTxid.slice(2)),
        Cl.uint(0),
        Cl.uint(offerAmount),
        Cl.bufferFromHex(sampleOutput.slice(2)),
        Cl.principal(wallet2),
      ],
      wallet1
    );

    // Try to refund non-cancelled offer
    const { result } = simnet.callPublicFn(
      "ord-swap",
      "refund-cancelled-offer",
      [Cl.uint(0)],
      wallet1
    );

    expect(result).toBeErr(Cl.uint(102)); // ERR_INVALID_OFFER
  });

  it("should emit offer-refunded event", () => {
    createAndCancelOffer();
    simnet.mineEmptyBlocks(51);

    const { events } = simnet.callPublicFn(
      "ord-swap",
      "refund-cancelled-offer",
      [Cl.uint(0)],
      wallet1
    );

    const printEvents = events.filter(e => e.event === "print_event");
    expect(printEvents.length).toBeGreaterThan(0);
  });

  it("should mark offer as refunded", () => {
    createAndCancelOffer();
    simnet.mineEmptyBlocks(51);

    simnet.callPublicFn(
      "ord-swap",
      "refund-cancelled-offer",
      [Cl.uint(0)],
      wallet1
    );

    const { result } = simnet.callReadOnlyFn(
      "ord-swap",
      "get-offer-refunded",
      [Cl.uint(0)],
      deployer
    );

    expect(result).toBeSome(Cl.bool(true));
  });
});
