import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;
const wallet3 = accounts.get("wallet_3")!;

describe("cancel-offer", () => {
  const sampleTxid = "0x0000000000000000000000000000000000000000000000000000000000000001";
  const sampleOutput = "0x76a91489abcdefabbaabbaabbaabbaabbaabbaabbaabba88ac";

  // Helper to create an offer
  function createOffer(sender: string = wallet1): number {
    const { result } = simnet.callPublicFn(
      "ord-swap",
      "create-offer",
      [
        Cl.bufferFromHex(sampleTxid.slice(2)),
        Cl.uint(0),
        Cl.uint(1000000),
        Cl.bufferFromHex(sampleOutput.slice(2)),
        Cl.principal(wallet2),
      ],
      sender
    );
    // Extract offer ID from result
    return 0; // Simplified - in real test would parse result
  }

  it("should allow sender to cancel their offer", () => {
    createOffer(wallet1);

    const { result } = simnet.callPublicFn(
      "ord-swap",
      "cancel-offer",
      [Cl.uint(0)],
      wallet1
    );

    expect(result).toBeOk(Cl.bool(true));
  });

  it("should reject cancellation from non-sender", () => {
    createOffer(wallet1);

    // Try to cancel from different wallet
    const { result } = simnet.callPublicFn(
      "ord-swap",
      "cancel-offer",
      [Cl.uint(0)],
      wallet3
    );

    expect(result).toBeErr(Cl.uint(102)); // ERR_INVALID_OFFER
  });

  it("should set cancel height with 50-block grace period", () => {
    createOffer(wallet1);
    
    const blockHeightBefore = simnet.blockHeight;
    
    simnet.callPublicFn(
      "ord-swap",
      "cancel-offer",
      [Cl.uint(0)],
      wallet1
    );

    // Check that cancel height is set
    const { result } = simnet.callReadOnlyFn(
      "ord-swap",
      "get-offer-cancelled",
      [Cl.uint(0)],
      deployer
    );

    // Cancel height should be current block + 50
    expect(result).toBeSome(Cl.uint(blockHeightBefore + 50));
  });

  it("should reject cancellation of non-existent offer", () => {
    const { result } = simnet.callPublicFn(
      "ord-swap",
      "cancel-offer",
      [Cl.uint(999)], // Non-existent offer
      wallet1
    );

    expect(result).toBeErr(Cl.uint(102)); // ERR_INVALID_OFFER
  });

  it("should reject double cancellation", () => {
    createOffer(wallet1);

    // First cancellation
    simnet.callPublicFn(
      "ord-swap",
      "cancel-offer",
      [Cl.uint(0)],
      wallet1
    );

    // Second cancellation attempt
    const { result } = simnet.callPublicFn(
      "ord-swap",
      "cancel-offer",
      [Cl.uint(0)],
      wallet1
    );

    expect(result).toBeErr(Cl.uint(102)); // ERR_INVALID_OFFER - already cancelled
  });

  it("should emit offer-cancelled event", () => {
    createOffer(wallet1);

    const { events } = simnet.callPublicFn(
      "ord-swap",
      "cancel-offer",
      [Cl.uint(0)],
      wallet1
    );

    const printEvents = events.filter(e => e.event === "print_event");
    expect(printEvents.length).toBeGreaterThan(0);
  });
});
