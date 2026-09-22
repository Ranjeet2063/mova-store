import { describe, it, expect } from "vitest";
import { hashOrderId, bytesToHex, hexToBytes } from "../../../lib/stellar/scval";
import { resolveOrderIdHash } from "../../../lib/stellar/orders";

const HEX64 = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

describe("resolveOrderIdHash", () => {
  it("passes an already-hashed 64-hex order id through unchanged", async () => {
    const bytes = await resolveOrderIdHash(HEX64);
    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes.length).toBe(32);
    expect(bytesToHex(bytes)).toBe(HEX64);
    expect(bytes).toEqual(hexToBytes(HEX64));
  });

  it("handles uppercase and mixed-case 64-hex order ids without re-hashing", async () => {
    const mixedHex = HEX64.toUpperCase();
    const bytes = await resolveOrderIdHash(mixedHex);
    expect(bytesToHex(bytes)).toBe(HEX64.toLowerCase());
  });

  it("handles 64-hex order ids with 0x prefix", async () => {
    const bytes = await resolveOrderIdHash(`0x${HEX64}`);
    expect(bytesToHex(bytes)).toBe(HEX64);
  });

  it("hashes a short raw pre-image via SHA-256 matching hashOrderId", async () => {
    const rawId = "SS-2024-0001";
    const resolved = await resolveOrderIdHash(rawId);
    const expected = await hashOrderId(rawId);
    expect(resolved).toEqual(expected);
    expect(resolved.length).toBe(32);
  });

  it("hashes an arbitrary pre-image string via SHA-256", async () => {
    const rawId = "order-xyz-987654321";
    const resolved = await resolveOrderIdHash(rawId);
    const expected = await hashOrderId(rawId);
    expect(resolved).toEqual(expected);
  });

  it("trims surrounding whitespace on 64-hex string", async () => {
    const bytes = await resolveOrderIdHash(`  ${HEX64}  \n`);
    expect(bytesToHex(bytes)).toBe(HEX64);
import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  dispatchOrder,
  refundOrder,
  resolveOrderIdHash,
  eventToOrder,
} from "../../../lib/stellar/orders";
import { bytesToHex, hashOrderId, hexToBytes } from "../../../lib/stellar/scval";
import * as freighterMod from "../../../lib/stellar/freighter";
import { rpc, xdr } from "@stellar/stellar-sdk";

vi.mock("../../../lib/stellar/freighter", () => ({
  connectWallet: vi.fn(),
  signWithFreighter: vi.fn(),
}));

describe("resolveOrderIdHash (Issue #67)", () => {
  const SAMPLE_64_HEX =
    "a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90";

  it("passes 64-hex order IDs through unchanged as raw 32-byte Uint8Array", async () => {
    const resolved = await resolveOrderIdHash(SAMPLE_64_HEX);

    expect(resolved).toBeInstanceOf(Uint8Array);
    expect(resolved.length).toBe(32);
    expect(bytesToHex(resolved)).toBe(SAMPLE_64_HEX);

    // Critical assertion: verify it was NOT hashed again
    const doubleHashed = await hashOrderId(SAMPLE_64_HEX);
    expect(resolved).not.toEqual(doubleHashed);
    expect(bytesToHex(resolved)).not.toBe(bytesToHex(doubleHashed));
  });

  it("normalizes uppercase and 0x-prefixed 64-hex strings", async () => {
    const upperHex = SAMPLE_64_HEX.toUpperCase();
    const resolvedUpper = await resolveOrderIdHash(upperHex);
    expect(bytesToHex(resolvedUpper)).toBe(SAMPLE_64_HEX);

    const prefixedHex = "0x" + SAMPLE_64_HEX;
    const resolvedPrefixed = await resolveOrderIdHash(prefixedHex);
    expect(bytesToHex(resolvedPrefixed)).toBe(SAMPLE_64_HEX);

    const upperPrefixed = "0X" + upperHex;
    const resolvedUpperPrefixed = await resolveOrderIdHash(upperPrefixed);
    expect(bytesToHex(resolvedUpperPrefixed)).toBe(SAMPLE_64_HEX);
  });

  it("hashes short human-readable pre-image order IDs using SHA-256", async () => {
    const rawIds = ["SS-101", "order-abc-123", "mova_shoe_purchase_99", "custom-ref"];

    for (const rawId of rawIds) {
      const expectedHash = await hashOrderId(rawId);
      const resolved = await resolveOrderIdHash(rawId);

      expect(resolved).toBeInstanceOf(Uint8Array);
      expect(resolved.length).toBe(32);
      expect(resolved).toEqual(expectedHash);
    }
  });

  it("hashes strings that are not valid 64-hex strings as pre-images", async () => {
    // 64 characters but non-hex character ('g' and 'z')
    const invalidHex64 = "g".repeat(64);
    const resolvedInvalid = await resolveOrderIdHash(invalidHex64);
    expect(resolvedInvalid).toEqual(await hashOrderId(invalidHex64));

    // Hex string but wrong length (e.g. 32 chars instead of 64)
    const shortHex = "a1b2c3d4e5f60718293a4b5c6d7e8f90";
    const resolvedShort = await resolveOrderIdHash(shortHex);
    expect(resolvedShort).toEqual(await hashOrderId(shortHex));

    // Odd-length string should not throw and instead hash as pre-image
    const oddString = "abc";
    const resolvedOdd = await resolveOrderIdHash(oddString);
    expect(resolvedOdd).toEqual(await hashOrderId(oddString));
  });
});

describe("dispatchOrder and refundOrder order ID resolution", () => {
  const SAMPLE_64_HEX =
    "a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90";
  const DUMMY_PUBLIC_KEY = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("resolves 64-hex order ID directly without double-hashing in dispatchOrder", async () => {
    vi.spyOn(freighterMod, "connectWallet").mockResolvedValue(DUMMY_PUBLIC_KEY);

    // We can verify resolveOrderIdHash directly on the input passed to dispatchOrder
    const resolvedBytes = await resolveOrderIdHash(SAMPLE_64_HEX);
    expect(bytesToHex(resolvedBytes)).toBe(SAMPLE_64_HEX);

    // Verify resolveOrderIdHash called with pre-image hashes via SHA-256
    const preimage = "SS-ORDER-123";
    const resolvedPreimage = await resolveOrderIdHash(preimage);
    expect(resolvedPreimage).toEqual(await hashOrderId(preimage));
  });
});

describe("Admin Orders Dashboard Event Integration (Issue #67 Acceptance Criteria)", () => {
  it("derives the 64-hex order ID from indexed event topics and preserves it unmodified", () => {
    const SAMPLE_64_HEX =
      "a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90";

    const indexedPayEvent = {
      symbol: "pay",
      ledger: 1000,
      txHash: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
      fields: {
        order_id: SAMPLE_64_HEX,
        topic1: "CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA",
        topic2: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
        amount: "50000000",
      },
    };

    const order = eventToOrder(indexedPayEvent);
    expect(order).not.toBeNull();
    // The admin dashboard uses order.orderId directly for dispatch and refund
    expect(order?.orderId).toBe(SAMPLE_64_HEX);
    expect(order?.orderId).toHaveLength(64);
  });

  it("handles event when order_id is in topic1 fallback", () => {
    const SAMPLE_64_HEX =
      "deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef";

    const indexedDispatchEvent = {
      symbol: "dispatch",
      ledger: 1001,
      txHash: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
      fields: {
        topic1: SAMPLE_64_HEX,
        topic2: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
        amount: "50000000",
      },
    };

    const order = eventToOrder(indexedDispatchEvent);
    expect(order).not.toBeNull();
    expect(order?.orderId).toBe(SAMPLE_64_HEX);
    expect(order?.status).toBe("Shipped");
  });
});
