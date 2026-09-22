import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Cart from "../../components/Cart";

describe("Cart floating button component", () => {
  it("does not render the badge when itemCount is 0", () => {
    const handleClick = vi.fn();
    render(<Cart itemCount={0} onClick={handleClick} />);

    expect(screen.queryByText("0")).toBeNull();
    expect(screen.queryByText("3")).toBeNull();
  });

  it("renders the badge displaying '3' when itemCount is 3", () => {
    const handleClick = vi.fn();
    render(<Cart itemCount={3} onClick={handleClick} />);

    const badge = screen.getByText("3");
    expect(badge).toBeInTheDocument();
    expect(badge.tagName).toBe("SPAN");
  });

  it("renders the badge for other positive counts", () => {
    const handleClick = vi.fn();
    render(<Cart itemCount={10} onClick={handleClick} />);

    expect(screen.getByText("10")).toBeInTheDocument();
  });

  it("calls onClick exactly once when the button is clicked", () => {
    const handleClick = vi.fn();
    render(<Cart itemCount={3} onClick={handleClick} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import Cart from "../../components/Cart";

describe("Cart", () => {
  it("does not render badge when itemCount is 0", () => {
    const { queryByText } = render(<Cart itemCount={0} onClick={vi.fn()} />);
    expect(queryByText("0")).toBeNull();
  });

  it("shows the correct count when itemCount > 0", () => {
    const { queryByText } = render(<Cart itemCount={3} onClick={vi.fn()} />);
    expect(queryByText("3")).not.toBeNull();
    expect(queryByText("3")).toBeInTheDocument();
  });

  it("calls onClick exactly once when clicked", () => {
    const onClick = vi.fn();
    const { getByRole } = render(<Cart itemCount={3} onClick={onClick} />);
    const button = getByRole("button");
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when itemCount is 0", () => {
    const onClick = vi.fn();
    const { getByRole } = render(<Cart itemCount={0} onClick={onClick} />);
    const button = getByRole("button");
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
