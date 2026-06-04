import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/svelte";
import Pagination from "../../components/Pagination.svelte";

afterEach(() => {
  cleanup();
});

function renderPagination(props = {}) {
  return render(Pagination, { props: { page: 1, totalPages: 5, onPageChange: vi.fn(), ...props } });
}

describe("Pagination", () => {
  it("renders prev, page numbers, and next buttons", () => {
    const { container } = renderPagination();
    expect(container.querySelector(".prev")).toBeTruthy();
    expect(container.querySelector(".next")).toBeTruthy();
    // 5 pages = 5 number buttons + ellipsis shouldn't appear for <=7 total
    const nums = container.querySelectorAll(".page-num");
    expect(nums.length).toBe(5);
  });

  it("disables prev on first page", () => {
    const { container } = renderPagination({ page: 1 });
    expect(container.querySelector(".prev")).toHaveProperty("disabled", true);
    expect(container.querySelector(".next")).toHaveProperty("disabled", false);
  });

  it("disables next on last page", () => {
    const { container } = renderPagination({ page: 5, totalPages: 5 });
    expect(container.querySelector(".next")).toHaveProperty("disabled", true);
    expect(container.querySelector(".prev")).toHaveProperty("disabled", false);
  });

  it("marks current page as active", () => {
    const { container } = renderPagination({ page: 3, totalPages: 5 });
    const active = container.querySelector(".page-num.active");
    expect(active).toBeTruthy();
    expect(active.textContent).toBe("3");
  });

  it("calls onPageChange when clicking a page number", async () => {
    const fn = vi.fn();
    const { container } = renderPagination({ page: 1, totalPages: 5, onPageChange: fn });
    const page2 = container.querySelector(".page-num:nth-child(2)");
    await fireEvent.click(page2);
    expect(fn).toHaveBeenCalledWith(2);
  });

  it("calls onPageChange when clicking next", async () => {
    const fn = vi.fn();
    const { container } = renderPagination({ page: 2, totalPages: 5, onPageChange: fn });
    await fireEvent.click(container.querySelector(".next"));
    expect(fn).toHaveBeenCalledWith(3);
  });

  it("calls onPageChange when clicking prev", async () => {
    const fn = vi.fn();
    const { container } = renderPagination({ page: 3, totalPages: 5, onPageChange: fn });
    await fireEvent.click(container.querySelector(".prev"));
    expect(fn).toHaveBeenCalledWith(2);
  });

  it("shows ellipsis for many pages", () => {
    const { container } = renderPagination({ page: 10, totalPages: 50 });
    const ellipses = container.querySelectorAll(".ellipsis");
    expect(ellipses.length).toBe(2); // left and right
  });

  it("does not show ellipsis for few pages", () => {
    const { container } = renderPagination({ page: 3, totalPages: 7 });
    expect(container.querySelectorAll(".ellipsis").length).toBe(0);
    expect(container.querySelectorAll(".page-num").length).toBe(7);
  });
});
