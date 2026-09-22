import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { CartProvider, useCart } from "../../context/CartContext";

const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>;

const prod1 = { id: "p1", name: "Classic Runner", price: 50 };
const prod2 = { id: "p2", name: "Trail Trekker", price: 80 };

describe("CartProvider Transitions & Storage Persistence", () => {
import { render, screen, waitFor, renderHook, act } from "@testing-library/react";
import { CartProvider, useCart } from "../../context/CartContext";

const shirt = { id: "prod_1", name: "Shirt", price: 25.5 };
const hat = { id: "prod_2", name: "Hat", price: 10 };
const ghost = { id: "prod_999", name: "Ghost", price: 999 };

function TestConsumer() {
  const { cartItems, itemCount, totalPrice } = useCart();
  return (
    <div>
      <span data-testid="count">{itemCount}</span>
      <span data-testid="total">{totalPrice}</span>
      <span data-testid="items-length">{cartItems.length}</span>
    </div>
  );
}

function wrapper({ children }) {
  return <CartProvider>{children}</CartProvider>;
}

function expectCartState(result, { items, count, total }) {
  expect(result.current.cartItems).toEqual(items);
  expect(result.current.itemCount).toBe(count);
  expect(result.current.totalPrice).toBe(total);
  expect(result.current.itemCount).toBeGreaterThanOrEqual(0);
  expect(result.current.totalPrice).toBeGreaterThanOrEqual(0);
}

function expectStored({ items, count, total, cleared = false }) {
  if (cleared) {
    expect(localStorage.getItem("cartItems")).toBeNull();
    expect(localStorage.getItem("itemCount")).toBeNull();
    expect(localStorage.getItem("totalPrice")).toBeNull();
    return;
  }
  expect(JSON.parse(localStorage.getItem("cartItems") || "[]")).toEqual(items);
  expect(localStorage.getItem("itemCount")).toBe(String(count));
  expect(localStorage.getItem("totalPrice")).toBe(String(total));
  expect(Number(localStorage.getItem("itemCount"))).toBeGreaterThanOrEqual(0);
  expect(Number(localStorage.getItem("totalPrice"))).toBeGreaterThanOrEqual(0);
}

describe("CartProvider hydration error handling", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("initializes with zero count and empty cart when storage is empty", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.cartItems).toEqual([]);
    expect(result.current.itemCount).toBe(0);
    expect(result.current.totalPrice).toBe(0);
  });

  it("handles adding a product and updates localStorage", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(prod1);
    });

    expect(result.current.cartItems).toEqual([prod1]);
    expect(result.current.itemCount).toBe(1);
    expect(result.current.totalPrice).toBe(50);

    expect(JSON.parse(localStorage.getItem("cartItems"))).toEqual([prod1]);
    expect(localStorage.getItem("itemCount")).toBe("1");
    expect(localStorage.getItem("totalPrice")).toBe("50");
  });

  it("handles duplicate add of the same product", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(prod1);
    });
    act(() => {
      result.current.addToCart(prod1);
    });

    expect(result.current.cartItems).toHaveLength(2);
    expect(result.current.itemCount).toBe(2);
    expect(result.current.totalPrice).toBe(100);

    expect(JSON.parse(localStorage.getItem("cartItems"))).toEqual([prod1, prod1]);
    expect(localStorage.getItem("itemCount")).toBe("2");
    expect(localStorage.getItem("totalPrice")).toBe("100");
  });

  it("removes an existing product and updates localStorage", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(prod1);
      result.current.addToCart(prod2);
    });

    expect(result.current.itemCount).toBe(2);
    expect(result.current.totalPrice).toBe(130);

    act(() => {
      result.current.removeFromCart(prod1);
    });

    expect(result.current.cartItems).toEqual([prod2]);
    expect(result.current.itemCount).toBe(1);
    expect(result.current.totalPrice).toBe(80);

    expect(JSON.parse(localStorage.getItem("cartItems"))).toEqual([prod2]);
    expect(localStorage.getItem("itemCount")).toBe("1");
    expect(localStorage.getItem("totalPrice")).toBe("80");
  });

  it("locks negative-itemCount bug: removing missing item is a no-op", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(prod1);
    });

    const nonExistent = { id: "missing-item", price: 999 };

    act(() => {
      result.current.removeFromCart(nonExistent);
    });

    // cartItems, itemCount, and totalPrice must remain unchanged
    expect(result.current.cartItems).toEqual([prod1]);
    expect(result.current.itemCount).toBe(1);
    expect(result.current.totalPrice).toBe(50);
    expect(localStorage.getItem("itemCount")).toBe("1");
    expect(localStorage.getItem("totalPrice")).toBe("50");
  });

  it("locks negative-itemCount bug: repeat remove on empty cart never goes below zero", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(prod1);
    });

    act(() => {
      result.current.removeFromCart(prod1);
    });

    expect(result.current.itemCount).toBe(0);
    expect(result.current.totalPrice).toBe(0);

    // Double remove
    act(() => {
      result.current.removeFromCart(prod1);
    });

    expect(result.current.cartItems).toEqual([]);
    expect(result.current.itemCount).toBe(0);
    expect(result.current.totalPrice).toBe(0);
    expect(Number(localStorage.getItem("itemCount"))).toBe(0);
    expect(Number(localStorage.getItem("totalPrice"))).toBe(0);
  });

  it("clears cart and removes keys from localStorage", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(prod1);
      result.current.addToCart(prod2);
    });

    act(() => {
      result.current.clearCart();
    });

    expect(result.current.cartItems).toEqual([]);
    expect(result.current.itemCount).toBe(0);
    expect(result.current.totalPrice).toBe(0);

    expect(localStorage.getItem("cartItems")).toBeNull();
    expect(localStorage.getItem("itemCount")).toBeNull();
    expect(localStorage.getItem("totalPrice")).toBeNull();
  });

  it("safely hydrates from corrupt or invalid localStorage payloads", () => {
    localStorage.setItem("cartItems", "{bad-json[");
    localStorage.setItem("itemCount", "-99");
    localStorage.setItem("totalPrice", "invalid_number");

    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.cartItems).toEqual([]);
    expect(result.current.itemCount).toBe(0);
    expect(result.current.totalPrice).toBe(0);
  });

  it("persists and restores cart across remount", () => {
    const { result, unmount } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(prod1);
      result.current.addToCart(prod2);
    });

    unmount();

    // Re-mount fresh hook
    const { result: remounted } = renderHook(() => useCart(), { wrapper });

    expect(remounted.current.cartItems).toEqual([prod1, prod2]);
    expect(remounted.current.itemCount).toBe(2);
    expect(remounted.current.totalPrice).toBe(130);
  });
});

describe("CartProvider count and total transitions", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("adds an item and persists cartItems, itemCount, and totalPrice", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(shirt);
    });

    expectCartState(result, { items: [shirt], count: 1, total: 25.5 });
    expectStored({ items: [shirt], count: 1, total: 25.5 });
  });

  it("duplicate add of the same id appends another line and increases count and total", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(shirt);
    });
    expectCartState(result, { items: [shirt], count: 1, total: 25.5 });
    expectStored({ items: [shirt], count: 1, total: 25.5 });

    act(() => {
      result.current.addToCart(shirt);
    });
    expectCartState(result, { items: [shirt, shirt], count: 2, total: 51 });
    expectStored({ items: [shirt, shirt], count: 2, total: 51 });
  });

  it("removes an existing item and updates count, total, and localStorage", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(shirt);
      result.current.addToCart(hat);
    });
    expectCartState(result, { items: [shirt, hat], count: 2, total: 35.5 });
    expectStored({ items: [shirt, hat], count: 2, total: 35.5 });

    act(() => {
      result.current.removeFromCart(shirt);
    });
    expectCartState(result, { items: [hat], count: 1, total: 10 });
    expectStored({ items: [hat], count: 1, total: 10 });
  });

  it("leaves count and total unchanged when removing an item that is not in the cart", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(shirt);
    });
    expectCartState(result, { items: [shirt], count: 1, total: 25.5 });
    expectStored({ items: [shirt], count: 1, total: 25.5 });

    act(() => {
      result.current.removeFromCart(ghost);
    });
    expectCartState(result, { items: [shirt], count: 1, total: 25.5 });
    expectStored({ items: [shirt], count: 1, total: 25.5 });
  });

  it("repeat-remove after the item is gone never produces a negative itemCount or totalPrice", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(shirt);
    });
    expectStored({ items: [shirt], count: 1, total: 25.5 });

    act(() => {
      result.current.removeFromCart(shirt);
    });
    expectCartState(result, { items: [], count: 0, total: 0 });
    expectStored({ items: [], count: 0, total: 0 });

    act(() => {
      result.current.removeFromCart(shirt);
    });
    expectCartState(result, { items: [], count: 0, total: 0 });
    expectStored({ items: [], count: 0, total: 0 });
  });

  it("double remove on an empty cart never writes a negative count or total", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.removeFromCart(shirt);
      result.current.removeFromCart(shirt);
    });

    expectCartState(result, { items: [], count: 0, total: 0 });
    const storedCount = localStorage.getItem("itemCount");
    const storedTotal = localStorage.getItem("totalPrice");
    if (storedCount !== null) {
      expect(Number(storedCount)).toBeGreaterThanOrEqual(0);
    }
    if (storedTotal !== null) {
      expect(Number(storedTotal)).toBeGreaterThanOrEqual(0);
    }
  });

  it("clearCart empties state and removes persisted cart keys", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(shirt);
      result.current.addToCart(hat);
    });
    expectStored({ items: [shirt, hat], count: 2, total: 35.5 });

    act(() => {
      result.current.clearCart();
    });
    expectCartState(result, { items: [], count: 0, total: 0 });
    expectStored({ items: [], count: 0, total: 0, cleared: true });
  });

  it("hydrates an empty cart from corrupt localStorage without throwing", async () => {
    localStorage.setItem("cartItems", "{broken");
    localStorage.setItem("itemCount", "invalid");
    localStorage.setItem("totalPrice", "NaN");

    const { result } = renderHook(() => useCart(), { wrapper });

    await waitFor(() => {
      expectCartState(result, { items: [], count: 0, total: 0 });
    });
  });

  it("persists cartItems, itemCount, and totalPrice across unmount and remount", async () => {
    const { result, unmount } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(shirt);
      result.current.addToCart(hat);
    });
    expectStored({ items: [shirt, hat], count: 2, total: 35.5 });

    unmount();

    const { result: remounted } = renderHook(() => useCart(), { wrapper });

    await waitFor(() => {
      expectCartState(remounted, { items: [shirt, hat], count: 2, total: 35.5 });
    });
    expectStored({ items: [shirt, hat], count: 2, total: 35.5 });
  });
});
