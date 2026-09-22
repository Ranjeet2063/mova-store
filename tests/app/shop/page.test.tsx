/* eslint-disable @next/next/no-img-element */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

const { mockListProducts, mockUseCart } = vi.hoisted(() => ({
  mockListProducts: vi.fn(),
  mockUseCart: vi.fn(),
}));

vi.mock("../../../lib/products", () => ({
  listProducts: () => mockListProducts(),
}));

vi.mock("../../../context/CartContext", () => ({
  useCart: () => mockUseCart(),
}));

vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: any) => (
    <img src={typeof src === "string" ? src : "/placeholder.png"} alt={alt} {...props} />
  ),
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

vi.mock("../../../components/Cart", () => ({
  default: ({ itemCount }: { itemCount: number }) => (
    <div data-testid="cart-badge">Cart ({itemCount})</div>
  ),
}));

vi.mock("../../../components/Modal", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("../../../components/Toast", () => ({
  default: () => null,
}));

import Products from "../../../app/shop/page";

describe("Shop Products Grid - Loading, Empty, and Error States", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCart.mockReturnValue({
      itemCount: 0,
      cartItems: [],
      addToCart: vi.fn(),
      removeFromCart: vi.fn(),
      totalPrice: 0,
    });
  });

  it("renders ProductGridSkeleton while listProducts is pending", () => {
    // Return an unresolved promise to keep pending state
    mockListProducts.mockReturnValue(new Promise(() => {}));

    render(<Products />);

    expect(screen.getByTestId("products-loading")).toBeInTheDocument();
    expect(screen.queryByTestId("products-empty")).not.toBeInTheDocument();
  });

  it("renders 'No products yet' empty state when listProducts resolves with empty array", async () => {
  it("renders explicit empty state when listProducts resolves with empty array", async () => {
    mockListProducts.mockResolvedValue([]);

    render(<Products />);

    await waitFor(() => {
      expect(screen.queryByTestId("products-loading")).not.toBeInTheDocument();
    });

    expect(screen.getByTestId("products-empty")).toBeInTheDocument();
    expect(screen.getByText("No products yet")).toBeInTheDocument();
  });

  it("renders error message when listProducts promise is rejected", async () => {
    mockListProducts.mockRejectedValue(new Error("Failed to load products from database"));
  it("renders error message and removes skeleton when listProducts rejects", async () => {
    mockListProducts.mockRejectedValue(new Error("Network connection error"));

    render(<Products />);

    await waitFor(() => {
      expect(screen.queryByTestId("products-loading")).not.toBeInTheDocument();
    });

    expect(screen.getByText("Failed to load products from database")).toBeInTheDocument();
    expect(screen.queryByTestId("products-empty")).not.toBeInTheDocument();
  });

  it("renders product cards grid when listProducts resolves with products", async () => {
    const mockProducts = [
      { id: "p1", name: "Alpha Running Shoe", price: 120, img: "/img1.jpg" },
      { id: "p2", name: "Beta Trail Runner", price: 140, img: "/img2.jpg" },
    expect(screen.getByText("Network connection error")).toBeInTheDocument();
    expect(screen.queryByTestId("products-empty")).not.toBeInTheDocument();
  });

  it("renders products grid when listProducts resolves with products", async () => {
    const mockProducts = [
      { id: "shoe-1", name: "Nike Air Zoom", price: 120, img: "https://example.com/shoe1.png" },
      { id: "shoe-2", name: "Adidas Ultraboost", price: 150, img: "https://example.com/shoe2.png" },
    ];
    mockListProducts.mockResolvedValue(mockProducts);

    render(<Products />);

    await waitFor(() => {
      expect(screen.queryByTestId("products-loading")).not.toBeInTheDocument();
    });

    expect(screen.getByText("Alpha Running Shoe")).toBeInTheDocument();
    expect(screen.getByText("$120")).toBeInTheDocument();
    expect(screen.getByText("Beta Trail Runner")).toBeInTheDocument();
    expect(screen.getByText("$140")).toBeInTheDocument();
    expect(screen.getByText("Nike Air Zoom")).toBeInTheDocument();
    expect(screen.getByText("$120")).toBeInTheDocument();
    expect(screen.getByText("Adidas Ultraboost")).toBeInTheDocument();
    expect(screen.getByText("$150")).toBeInTheDocument();
    expect(screen.queryByTestId("products-empty")).not.toBeInTheDocument();
  });
});
