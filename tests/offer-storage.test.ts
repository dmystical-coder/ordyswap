import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("offer-storage", () => {
  describe("offer ID generation", () => {
    it("should return 0 for initial last-id", () => {
      const { result } = simnet.callReadOnlyFn(
        "offer-storage",
        "get-last-id",
        [],
        deployer
      );
      
      expect(result).toBeUint(0);
    });

    it("should generate sequential IDs", () => {
      // Generate first ID
      const { result: first } = simnet.callPublicFn(
        "offer-storage",
        "generate-next-id",
        [],
        deployer
      );
      
      expect(first).toBeOk(Cl.uint(0));
      
      // Generate second ID
      const { result: second } = simnet.callPublicFn(
        "offer-storage",
        "generate-next-id",
        [],
        deployer
      );
      
      expect(second).toBeOk(Cl.uint(1));
    });
  });

  describe("offer CRUD operations", () => {
    const sampleTxid = "0x0000000000000000000000000000000000000000000000000000000000000001";
    const sampleOutput = "0x76a91489abcdefabbaabbaabbaabbaabbaabbaabbaabba88ac";

    it("should insert offer successfully", () => {
      const { result } = simnet.callPublicFn(
        "offer-storage",
        "insert-offer",
        [
          Cl.uint(0),
          Cl.bufferFromHex(sampleTxid.slice(2)),
          Cl.uint(0),
          Cl.uint(1000000),
          Cl.bufferFromHex(sampleOutput.slice(2)),
          Cl.principal(wallet1),
          Cl.principal(wallet2),
          Cl.uint(0), // No expiry
        ],
        deployer
      );
      
      expect(result).toBeOk(Cl.bool(true));
    });

    it("should reject duplicate offer ID", () => {
      // Insert first
      simnet.callPublicFn(
        "offer-storage",
        "insert-offer",
        [
          Cl.uint(0),
          Cl.bufferFromHex(sampleTxid.slice(2)),
          Cl.uint(0),
          Cl.uint(1000000),
          Cl.bufferFromHex(sampleOutput.slice(2)),
          Cl.principal(wallet1),
          Cl.principal(wallet2),
          Cl.uint(0),
        ],
        deployer
      );
      
      // Try to insert with same ID
      const { result } = simnet.callPublicFn(
        "offer-storage",
        "insert-offer",
        [
          Cl.uint(0),
          Cl.bufferFromHex(sampleTxid.slice(2)),
          Cl.uint(1),
          Cl.uint(2000000),
          Cl.bufferFromHex(sampleOutput.slice(2)),
          Cl.principal(wallet1),
          Cl.principal(wallet2),
          Cl.uint(0),
        ],
        deployer
      );
      
      expect(result).toBeErr(Cl.uint(120)); // ERR-INVALID-OFFER
    });

    it("should return offer by ID", () => {
      simnet.callPublicFn(
        "offer-storage",
        "insert-offer",
        [
          Cl.uint(0),
          Cl.bufferFromHex(sampleTxid.slice(2)),
          Cl.uint(0),
          Cl.uint(1000000),
          Cl.bufferFromHex(sampleOutput.slice(2)),
          Cl.principal(wallet1),
          Cl.principal(wallet2),
          Cl.uint(0),
        ],
        deployer
      );
      
      const { result } = simnet.callReadOnlyFn(
        "offer-storage",
        "get-offer",
        [Cl.uint(0)],
        deployer
      );
      
      expect(result).toBeSome(Cl.tuple({
        txid: Cl.bufferFromHex(sampleTxid.slice(2)),
        index: Cl.uint(0),
        amount: Cl.uint(1000000),
        output: Cl.bufferFromHex(sampleOutput.slice(2)),
        sender: Cl.principal(wallet1),
        recipient: Cl.principal(wallet2),
        "created-at": Cl.uint(simnet.blockHeight - 1),
        "expires-at": Cl.uint(0),
      }));
    });

    it("should return none for non-existent offer", () => {
      const { result } = simnet.callReadOnlyFn(
        "offer-storage",
        "get-offer",
        [Cl.uint(999)],
        deployer
      );
      
      expect(result).toBeNone();
    });

    it("should check offer existence correctly", () => {
      simnet.callPublicFn(
        "offer-storage",
        "insert-offer",
        [
          Cl.uint(0),
          Cl.bufferFromHex(sampleTxid.slice(2)),
          Cl.uint(0),
          Cl.uint(1000000),
          Cl.bufferFromHex(sampleOutput.slice(2)),
          Cl.principal(wallet1),
          Cl.principal(wallet2),
          Cl.uint(0),
        ],
        deployer
      );
      
      const { result: exists } = simnet.callReadOnlyFn(
        "offer-storage",
        "offer-exists",
        [Cl.uint(0)],
        deployer
      );
      
      expect(exists).toBeBool(true);
      
      const { result: notExists } = simnet.callReadOnlyFn(
        "offer-storage",
        "offer-exists",
        [Cl.uint(999)],
        deployer
      );
      
      expect(notExists).toBeBool(false);
    });
  });

  describe("status management", () => {
    const sampleTxid = "0x0000000000000000000000000000000000000000000000000000000000000001";
    const sampleOutput = "0x76a91489abcdefabbaabbaabbaabbaabbaabbaabbaabba88ac";

    it("should mark offer as accepted", () => {
      // Insert offer first
      simnet.callPublicFn(
        "offer-storage",
        "insert-offer",
        [
          Cl.uint(0),
          Cl.bufferFromHex(sampleTxid.slice(2)),
          Cl.uint(0),
          Cl.uint(1000000),
          Cl.bufferFromHex(sampleOutput.slice(2)),
          Cl.principal(wallet1),
          Cl.principal(wallet2),
          Cl.uint(0),
        ],
        deployer
      );
      
      const btcTxid = "0x0000000000000000000000000000000000000000000000000000000000000002";
      
      const { result } = simnet.callPublicFn(
        "offer-storage",
        "set-offer-accepted",
        [Cl.uint(0), Cl.bufferFromHex(btcTxid.slice(2))],
        deployer
      );
      
      expect(result).toBeOk(Cl.bool(true));
      
      const { result: isAccepted } = simnet.callReadOnlyFn(
        "offer-storage",
        "is-offer-accepted",
        [Cl.uint(0)],
        deployer
      );
      
      expect(isAccepted).toBeBool(true);
    });

    it("should mark offer as cancelled with grace period", () => {
      simnet.callPublicFn(
        "offer-storage",
        "insert-offer",
        [
          Cl.uint(0),
          Cl.bufferFromHex(sampleTxid.slice(2)),
          Cl.uint(0),
          Cl.uint(1000000),
          Cl.bufferFromHex(sampleOutput.slice(2)),
          Cl.principal(wallet1),
          Cl.principal(wallet2),
          Cl.uint(0),
        ],
        deployer
      );
      
      const gracePeriod = 50;
      
      const { result } = simnet.callPublicFn(
        "offer-storage",
        "set-offer-cancelled",
        [Cl.uint(0), Cl.uint(gracePeriod)],
        deployer
      );
      
      expect(result).toBeOk(Cl.bool(true));
      
      const { result: isCancelled } = simnet.callReadOnlyFn(
        "offer-storage",
        "is-offer-cancelled",
        [Cl.uint(0)],
        deployer
      );
      
      expect(isCancelled).toBeBool(true);
    });

    it("should track grace period correctly", () => {
      simnet.callPublicFn(
        "offer-storage",
        "insert-offer",
        [
          Cl.uint(0),
          Cl.bufferFromHex(sampleTxid.slice(2)),
          Cl.uint(0),
          Cl.uint(1000000),
          Cl.bufferFromHex(sampleOutput.slice(2)),
          Cl.principal(wallet1),
          Cl.principal(wallet2),
          Cl.uint(0),
        ],
        deployer
      );
      
      simnet.callPublicFn(
        "offer-storage",
        "set-offer-cancelled",
        [Cl.uint(0), Cl.uint(50)],
        deployer
      );
      
      // Should be within grace period
      const { result: withinGrace } = simnet.callReadOnlyFn(
        "offer-storage",
        "is-within-grace-period",
        [Cl.uint(0)],
        deployer
      );
      
      expect(withinGrace).toBeBool(true);
      
      // Should not be past grace period
      const { result: notOver } = simnet.callReadOnlyFn(
        "offer-storage",
        "is-grace-period-over",
        [Cl.uint(0)],
        deployer
      );
      
      expect(notOver).toBeBool(false);
      
      // Mine blocks to pass grace period
      simnet.mineEmptyBlocks(51);
      
      // Should now be past grace period
      const { result: isOver } = simnet.callReadOnlyFn(
        "offer-storage",
        "is-grace-period-over",
        [Cl.uint(0)],
        deployer
      );
      
      expect(isOver).toBeBool(true);
    });
  });
});
