import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("edge cases", () => {
  const sampleTxid = "0x0000000000000000000000000000000000000000000000000000000000000001";
  const sampleOutput = "0x76a91489abcdefabbaabbaabbaabbaabbaabbaabbaabba88ac";

  describe("offer amounts", () => {
    it("should handle minimum valid amount (1 micro-STX)", () => {
      const { result } = simnet.callPublicFn(
        "ord-swap",
        "create-offer",
        [
          Cl.bufferFromHex(sampleTxid.slice(2)),
          Cl.uint(0),
          Cl.uint(1), // Minimum amount
          Cl.bufferFromHex(sampleOutput.slice(2)),
          Cl.principal(wallet2),
        ],
        wallet1
      );
      
      expect(result).toBeOk(Cl.uint(0));
    });

    it("should handle large amounts", () => {
      const largeAmount = 100000000000000; // 100M STX in micro-STX
      
      const { result } = simnet.callPublicFn(
        "ord-swap",
        "create-offer",
        [
          Cl.bufferFromHex(sampleTxid.slice(2)),
          Cl.uint(0),
          Cl.uint(largeAmount),
          Cl.bufferFromHex(sampleOutput.slice(2)),
          Cl.principal(wallet2),
        ],
        wallet1
      );
      
      expect(result).toBeOk(Cl.uint(0));
    });
  });

  describe("offer indices", () => {
    it("should handle output index 0", () => {
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
        wallet1
      );
      
      expect(result).toBeOk(Cl.uint(0));
    });

    it("should handle high output indices", () => {
      const { result } = simnet.callPublicFn(
        "ord-swap",
        "create-offer",
        [
          Cl.bufferFromHex(sampleTxid.slice(2)),
          Cl.uint(100), // High index
          Cl.uint(1000000),
          Cl.bufferFromHex(sampleOutput.slice(2)),
          Cl.principal(wallet2),
        ],
        wallet1
      );
      
      expect(result).toBeOk(Cl.uint(0));
    });
  });

  describe("concurrent offers", () => {
    it("should allow multiple offers on same ordinal", () => {
      // First offer
      const { result: first } = simnet.callPublicFn(
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
      
      expect(first).toBeOk(Cl.uint(0));
      
      // Second offer on same ordinal
      const { result: second } = simnet.callPublicFn(
        "ord-swap",
        "create-offer",
        [
          Cl.bufferFromHex(sampleTxid.slice(2)),
          Cl.uint(0),
          Cl.uint(2000000), // Different amount
          Cl.bufferFromHex(sampleOutput.slice(2)),
          Cl.principal(wallet2),
        ],
        wallet1
      );
      
      expect(second).toBeOk(Cl.uint(1));
    });

    it("should allow different users to offer on same ordinal", () => {
      // Offer from wallet1
      const { result: first } = simnet.callPublicFn(
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
      
      expect(first).toBeOk(Cl.uint(0));
      
      // Offer from wallet2
      const { result: second } = simnet.callPublicFn(
        "ord-swap",
        "create-offer",
        [
          Cl.bufferFromHex(sampleTxid.slice(2)),
          Cl.uint(0),
          Cl.uint(1500000),
          Cl.bufferFromHex(sampleOutput.slice(2)),
          Cl.principal(wallet1),
        ],
        wallet2
      );
      
      expect(second).toBeOk(Cl.uint(1));
    });
  });

  describe("getters", () => {
    it("should return none for non-existent offer", () => {
      const { result } = simnet.callReadOnlyFn(
        "ord-swap",
        "get-offer",
        [Cl.uint(999)],
        deployer
      );
      
      expect(result).toBeNone();
    });

    it("should return none for non-existent acceptance", () => {
      const { result } = simnet.callReadOnlyFn(
        "ord-swap",
        "get-offer-accepted",
        [Cl.uint(999)],
        deployer
      );
      
      expect(result).toBeNone();
    });

    it("should return none for non-cancelled offer", () => {
      // Create an offer
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
      
      const { result } = simnet.callReadOnlyFn(
        "ord-swap",
        "get-offer-cancelled",
        [Cl.uint(0)],
        deployer
      );
      
      expect(result).toBeNone();
    });

    it("should track last-id correctly", () => {
      const { result: initialId } = simnet.callReadOnlyFn(
        "ord-swap",
        "get-last-id",
        [],
        deployer
      );
      
      // Create some offers
      for (let i = 0; i < 3; i++) {
        simnet.callPublicFn(
          "ord-swap",
          "create-offer",
          [
            Cl.bufferFromHex(sampleTxid.slice(2)),
            Cl.uint(i),
            Cl.uint(1000000),
            Cl.bufferFromHex(sampleOutput.slice(2)),
            Cl.principal(wallet2),
          ],
          wallet1
        );
      }
      
      const { result: finalId } = simnet.callReadOnlyFn(
        "ord-swap",
        "get-last-id",
        [],
        deployer
      );
      
      // Should have incremented by 3
      expect(finalId).toBeUint(Number(Cl.uint(initialId as any).value) + 3);
    });
  });

  describe("buffer edge cases", () => {
    it("should handle maximum output size", () => {
      // Create 128-byte output (maximum allowed)
      const maxOutput = "0x" + "ab".repeat(128);
      
      const { result } = simnet.callPublicFn(
        "ord-swap",
        "create-offer",
        [
          Cl.bufferFromHex(sampleTxid.slice(2)),
          Cl.uint(0),
          Cl.uint(1000000),
          Cl.bufferFromHex(maxOutput.slice(2)),
          Cl.principal(wallet2),
        ],
        wallet1
      );
      
      expect(result).toBeOk(Cl.uint(0));
    });

    it("should handle minimum output size", () => {
      // Create 1-byte output
      const minOutput = "0x00";
      
      const { result } = simnet.callPublicFn(
        "ord-swap",
        "create-offer",
        [
          Cl.bufferFromHex(sampleTxid.slice(2)),
          Cl.uint(0),
          Cl.uint(1000000),
          Cl.bufferFromHex(minOutput.slice(2)),
          Cl.principal(wallet2),
        ],
        wallet1
      );
      
      expect(result).toBeOk(Cl.uint(0));
    });
  });
});
