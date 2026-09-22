import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("Stellar token registry in lib/stellar/config.ts", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it("defaultToken() returns SUPPORTED_TOKENS[0] and both USDC and XLM declare 7 decimals", async () => {
    const config = await import("../../../lib/stellar/config");

    expect(config.defaultToken()).toBe(config.SUPPORTED_TOKENS[0]);
    expect(config.defaultToken().symbol).toBe("USDC");
    expect(config.defaultToken().decimals).toBe(7);

    const xlmToken = config.SUPPORTED_TOKENS.find((t) => t.symbol === "XLM");
    expect(xlmToken).toBeDefined();
    expect(xlmToken?.decimals).toBe(7);
    expect(xlmToken?.isNative).toBe(true);
  });

  it("tokenForContract resolves known contract ids correctly", async () => {
    const config = await import("../../../lib/stellar/config");

    const usdc = config.tokenForContract(config.USDC_CONTRACT_ID);
    expect(usdc).toBeDefined();
    expect(usdc?.symbol).toBe("USDC");

    const xlm = config.tokenForContract(config.NATIVE_ASSET_CONTRACT_ID);
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("lib/stellar/config — default behavior", () => {
  it("defaultToken returns USDC as the first supported token", async () => {
    const mod = await import("../../lib/stellar/config");
    expect(mod.defaultToken()).toBe(mod.SUPPORTED_TOKENS[0]);
    expect(mod.defaultToken().symbol).toBe("USDC");
  });

  it("tokenForContract resolves known contract IDs", async () => {
    const mod = await import("../../lib/stellar/config");
    const usdc = mod.tokenForContract(mod.SUPPORTED_TOKENS[0].contractId);
    expect(usdc).toBeDefined();
    expect(usdc?.symbol).toBe("USDC");

    const xlm = mod.tokenForContract(mod.SUPPORTED_TOKENS[1].contractId);
    expect(xlm).toBeDefined();
    expect(xlm?.symbol).toBe("XLM");
  });

  it("tokenForContract returns undefined for an unknown contract id", async () => {
    const config = await import("../../../lib/stellar/config");

    const unknown = config.tokenForContract("CUNKNOWN1234567890ABCDEFGH");
    expect(unknown).toBeUndefined();
  });

  it("updates registry when NEXT_PUBLIC_USDC_CONTRACT_ID env var is overridden", async () => {
    const customUsdcId = "CCUSTOMUSDC1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ12";
    vi.stubEnv("NEXT_PUBLIC_USDC_CONTRACT_ID", customUsdcId);
    vi.resetModules();

    const config = await import("../../../lib/stellar/config");

    expect(config.USDC_CONTRACT_ID).toBe(customUsdcId);
    expect(config.defaultToken().contractId).toBe(customUsdcId);
    expect(config.tokenForContract(customUsdcId)?.symbol).toBe("USDC");
  });

  it("updates registry when NEXT_PUBLIC_NATIVE_ASSET_CONTRACT_ID env var is overridden", async () => {
    const customNativeId = "CCUSTOMNATIVE1234567890ABCDEFGHIJKLMNOPQRSTUVWXY";
    vi.stubEnv("NEXT_PUBLIC_NATIVE_ASSET_CONTRACT_ID", customNativeId);
    vi.resetModules();

    const config = await import("../../../lib/stellar/config");

    expect(config.NATIVE_ASSET_CONTRACT_ID).toBe(customNativeId);
    const xlmToken = config.tokenForContract(customNativeId);
    expect(xlmToken).toBeDefined();
    expect(xlmToken?.symbol).toBe("XLM");
    expect(xlmToken?.isNative).toBe(true);
  });

  it("configures mainnet contracts and RPC defaults when NEXT_PUBLIC_STELLAR_NETWORK is mainnet", async () => {
    vi.stubEnv("NEXT_PUBLIC_STELLAR_NETWORK", "mainnet");
    vi.resetModules();

    const config = await import("../../../lib/stellar/config");

    expect(config.IS_MAINNET).toBe(true);
    expect(config.NATIVE_ASSET_CONTRACT_ID).toBe(config.MAINNET_NATIVE_ASSET_CONTRACT_ID);
    expect(config.RPC_URL).toBe("https://soroban-rpc.stellar.org");
  it("tokenForContract returns undefined for unknown contract id", async () => {
    const mod = await import("../../lib/stellar/config");
    expect(mod.tokenForContract("CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC")).toBeUndefined();
  });

  it("XLM entry is marked as native", async () => {
    const mod = await import("../../lib/stellar/config");
    const xlm = mod.SUPPORTED_TOKENS.find((t) => t.symbol === "XLM");
    expect(xlm).toBeDefined();
    expect(xlm!.isNative).toBe(true);
  });

  it("USDC and XLM both declare 7 decimals", async () => {
    const mod = await import("../../lib/stellar/config");
    expect(mod.SUPPORTED_TOKENS[0].decimals).toBe(7);
    expect(mod.SUPPORTED_TOKENS[1].decimals).toBe(7);
  });
});

describe("lib/stellar/config — env overrides", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("overriding NEXT_PUBLIC_USDC_CONTRACT_ID changes defaultToken symbol", async () => {
    vi.stubEnv("NEXT_PUBLIC_USDC_CONTRACT_ID", "CUSTOM_USDC_CONTRACT_123");
    vi.stubEnv("NEXT_PUBLIC_STELLAR_NETWORK", "testnet");

    const mod = await import("../../lib/stellar/config");
    const defaultTok = mod.defaultToken();
    expect(defaultTok.contractId).toBe("CUSTOM_USDC_CONTRACT_123");
    expect(defaultTok.symbol).toBe("USDC");
  });

  it("overriding NEXT_PUBLIC_NATIVE_ASSET_CONTRACT_ID changes XLM contract id", async () => {
    vi.stubEnv("NEXT_PUBLIC_NATIVE_ASSET_CONTRACT_ID", "CUSTOM_NATIVE_CONTRACT_456");
    vi.stubEnv("NEXT_PUBLIC_STELLAR_NETWORK", "testnet");

    const mod = await import("../../lib/stellar/config");
    const xlm = mod.SUPPORTED_TOKENS.find((t) => t.symbol === "XLM");
    expect(xlm).toBeDefined();
    expect(xlm!.contractId).toBe("CUSTOM_NATIVE_CONTRACT_456");
  });

  it("env override does not affect already-imported modules", async () => {
    const mod1 = await import("../../lib/stellar/config");
    const originalUsdc = mod1.defaultToken().contractId;

    vi.stubEnv("NEXT_PUBLIC_USDC_CONTRACT_ID", "ANOTHER_CUSTOM_ID");
    const mod2 = await import("../../lib/stellar/config");
    expect(mod2.defaultToken().contractId).toBe("ANOTHER_CUSTOM_ID");
    expect(mod2.defaultToken().contractId).not.toBe(originalUsdc);
  });
});
