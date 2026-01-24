import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("create-offer", () => {
  // Sample ordinal data
  const sampleTxid = "0x0000000000000000000000000000000000000000000000000000000000000001";
  const sampleOutput = "0x76a91489abcdefabbaabbaabbaabbaabbaabbaabbaabba88ac";
  
  it("should create offer with valid parameters", () => {
    const { result } = simnet.callPublicFn(
      "ord-swap",
      "create-offer",
      [
        Cl.bufferFromHex(sampleTxid.slice(2)),
        Cl.uint(0),
        Cl.uint(1000000), // 1 STX
        Cl.bufferFromHex(sampleOutput.slice(2)),
        Cl.principal(wallet2),
      ],
      wallet1
    );
    
    expect(result).toBeOk(Cl.uint(0)); // First offer ID is 0
  });

  it("should increment offer ID for each new offer", () => {
    // Create first offer
    simnet.callPublicFn(
      "ord-swap",
      "create-offer",
      [
        Cl.bufferFromHex(sampleTxid.slice(2)),
        Cl.uint(0),
        Cl.uint(1000000),
        Cl.bufferFromHex(sampleOutput.slice(2)),
        Cl.principal(wallet2),
      ],
      wallet1
    );

    // Create second offer
    const { result } = simnet.callPublicFn(
      "ord-swap",
      "create-offer",
      [
        Cl.bufferFromHex(sampleTxid.slice(2)),
        Cl.uint(1),
        Cl.uint(2000000),
        Cl.bufferFromHex(sampleOutput.slice(2)),
        Cl.principal(wallet2),
      ],
      wallet1
    );

    expect(result).toBeOk(Cl.uint(1)); // Second offer ID is 1
  });

  it("should escrow STX from the sender", () => {
    const amount = 5000000n; // 5 STX
    const initialBalance = simnet.getAssetsMap().get("STX")?.get(wallet1) || 0n;

    simnet.callPublicFn(
      "ord-swap",
      "create-offer",
      [
        Cl.bufferFromHex(sampleTxid.slice(2)),
        Cl.uint(0),
        Cl.uint(Number(amount)),
        Cl.bufferFromHex(sampleOutput.slice(2)),
        Cl.principal(wallet2),
      ],
      wallet1
    );

    const finalBalance = simnet.getAssetsMap().get("STX")?.get(wallet1) || 0n;
    expect(finalBalance).toBe(initialBalance - amount);
  });

  it("should fail when sender has insufficient STX", () => {
    // Try to create offer for more than available balance
    const { result } = simnet.callPublicFn(
      "ord-swap",
      "create-offer",
      [
        Cl.bufferFromHex(sampleTxid.slice(2)),
        Cl.uint(0),
        Cl.uint(1000000000000000), // More than available
        Cl.bufferFromHex(sampleOutput.slice(2)),
        Cl.principal(wallet2),
      ],
      wallet1
    );

    expect(result).toBeErr(Cl.uint(1)); // STX transfer error
  });

  it("should store offer details correctly", () => {
    const txidHex = sampleTxid.slice(2);
    const outputHex = sampleOutput.slice(2);
    const amount = 3000000;
    const index = 2;

    simnet.callPublicFn(
      "ord-swap",
      "create-offer",
      [
        Cl.bufferFromHex(txidHex),
        Cl.uint(index),
        Cl.uint(amount),
        Cl.bufferFromHex(outputHex),
        Cl.principal(wallet2),
      ],
      wallet1
    );

    // Get the offer
    const { result } = simnet.callReadOnlyFn(
      "ord-swap",
      "get-offer",
      [Cl.uint(0)],
      deployer
    );

    expect(result).toBeSome(
      Cl.tuple({
        txid: Cl.bufferFromHex(txidHex),
        index: Cl.uint(index),
        amount: Cl.uint(amount),
        output: Cl.bufferFromHex(outputHex),
        sender: Cl.principal(wallet1),
        recipient: Cl.principal(wallet2),
      })
    );
  });

  it("should emit new-offer event", () => {
    const { events } = simnet.callPublicFn(
      "ord-swap",
      "create-offer",
      [
        Cl.bufferFromHex(sampleTxid.slice(2)),
        Cl.uint(0),
        Cl.uint(1000000),
        Cl.bufferFromHex(sampleOutput.slice(2)),
        Cl.principal(wallet2),
      ],
      wallet1
    );

    // Check for print event
    const printEvents = events.filter(e => e.event === "print_event");
    expect(printEvents.length).toBeGreaterThan(0);
  });
});
