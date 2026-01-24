import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;

describe("governance", () => {
  describe("pause functionality", () => {
    it("should start unpaused", () => {
      const { result } = simnet.callReadOnlyFn(
        "governance",
        "get-is-paused",
        [],
        deployer
      );
      
      expect(result).toBeBool(false);
    });

    it("should allow owner to pause", () => {
      const { result } = simnet.callPublicFn(
        "governance",
        "set-paused",
        [Cl.bool(true)],
        deployer
      );
      
      expect(result).toBeOk(Cl.bool(true));
      
      const { result: pauseStatus } = simnet.callReadOnlyFn(
        "governance",
        "get-is-paused",
        [],
        deployer
      );
      
      expect(pauseStatus).toBeBool(true);
    });

    it("should reject pause from non-owner", () => {
      const { result } = simnet.callPublicFn(
        "governance",
        "set-paused",
        [Cl.bool(true)],
        wallet1
      );
      
      expect(result).toBeErr(Cl.uint(141)); // ERR-NOT-OWNER
    });

    it("should allow owner to unpause", () => {
      // First pause
      simnet.callPublicFn(
        "governance",
        "set-paused",
        [Cl.bool(true)],
        deployer
      );
      
      // Then unpause
      const { result } = simnet.callPublicFn(
        "governance",
        "set-paused",
        [Cl.bool(false)],
        deployer
      );
      
      expect(result).toBeOk(Cl.bool(true));
    });
  });

  describe("ownership management", () => {
    it("should return deployer as initial owner", () => {
      const { result } = simnet.callReadOnlyFn(
        "governance",
        "get-owner",
        [],
        deployer
      );
      
      expect(result).toBePrincipal(deployer);
    });

    it("should allow owner to transfer ownership", () => {
      const { result } = simnet.callPublicFn(
        "governance",
        "transfer-ownership",
        [Cl.principal(wallet1)],
        deployer
      );
      
      expect(result).toBeOk(Cl.bool(true));
      
      const { result: newOwner } = simnet.callReadOnlyFn(
        "governance",
        "get-owner",
        [],
        deployer
      );
      
      expect(newOwner).toBePrincipal(wallet1);
    });

    it("should reject ownership transfer from non-owner", () => {
      const { result } = simnet.callPublicFn(
        "governance",
        "transfer-ownership",
        [Cl.principal(wallet1)],
        wallet1
      );
      
      expect(result).toBeErr(Cl.uint(141)); // ERR-NOT-OWNER
    });
  });

  describe("fee management", () => {
    it("should start with zero protocol fee", () => {
      const { result } = simnet.callReadOnlyFn(
        "governance",
        "get-protocol-fee",
        [],
        deployer
      );
      
      expect(result).toBeUint(0);
    });

    it("should allow owner to set protocol fee", () => {
      const feeBps = 100; // 1%
      
      const { result } = simnet.callPublicFn(
        "governance",
        "set-protocol-fee",
        [Cl.uint(feeBps)],
        deployer
      );
      
      expect(result).toBeOk(Cl.bool(true));
      
      const { result: fee } = simnet.callReadOnlyFn(
        "governance",
        "get-protocol-fee",
        [],
        deployer
      );
      
      expect(fee).toBeUint(feeBps);
    });

    it("should reject fee above maximum (5%)", () => {
      const { result } = simnet.callPublicFn(
        "governance",
        "set-protocol-fee",
        [Cl.uint(501)], // More than 500 bps (5%)
        deployer
      );
      
      expect(result).toBeErr(Cl.uint(160));
    });

    it("should calculate fees correctly", () => {
      const amount = 1000000; // 1 STX
      const feeBps = 100; // 1%
      
      // Set fee first
      simnet.callPublicFn(
        "governance",
        "set-protocol-fee",
        [Cl.uint(feeBps)],
        deployer
      );
      
      const { result } = simnet.callReadOnlyFn(
        "governance",
        "calculate-fee",
        [Cl.uint(amount)],
        deployer
      );
      
      // 1% of 1,000,000 = 10,000
      expect(result).toBeUint(10000);
    });

    it("should return zero fee when fee bps is zero", () => {
      const amount = 1000000;
      
      const { result } = simnet.callReadOnlyFn(
        "governance",
        "calculate-fee",
        [Cl.uint(amount)],
        deployer
      );
      
      expect(result).toBeUint(0);
    });
  });

  describe("emergency pause", () => {
    it("should allow owner to emergency pause", () => {
      const { result } = simnet.callPublicFn(
        "governance",
        "emergency-pause",
        [],
        deployer
      );
      
      expect(result).toBeOk(Cl.bool(true));
      
      const { result: pauseStatus } = simnet.callReadOnlyFn(
        "governance",
        "get-is-paused",
        [],
        deployer
      );
      
      expect(pauseStatus).toBeBool(true);
    });

    it("should reject emergency pause from non-owner", () => {
      const { result } = simnet.callPublicFn(
        "governance",
        "emergency-pause",
        [],
        wallet1
      );
      
      expect(result).toBeErr(Cl.uint(141));
    });
  });
});
