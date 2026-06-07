import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/svelte";

vi.mock("../local-api.js", () => ({
  api: {
    version: () => ({ version: "0.0.0-test", name: "面试题 App" }),
    progress: { dueReviews: () => [], stats: () => ({}) },
  },
  ready: Promise.resolve(),
}));

import NavBar from "../../components/NavBar.svelte";

describe("NavBar", () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ok: true }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  const defaultProps = { current: "home", onNavigate: () => {} };

  it("renders all tab buttons", () => {
    render(NavBar, { props: defaultProps });

    expect(screen.getByText("首页")).toBeInTheDocument();
    expect(screen.getByText("知识点")).toBeInTheDocument();
    expect(screen.getByText("题库")).toBeInTheDocument();
    expect(screen.getByText("错题")).toBeInTheDocument();
    expect(screen.getByText("进度")).toBeInTheDocument();
  });

  it("marks the active tab", () => {
    render(NavBar, { props: { ...defaultProps, current: "browse" } });

    const browseBtn = screen.getByText("题库").closest("button");
    expect(browseBtn).toHaveClass("active");

    const homeBtn = screen.getByText("首页").closest("button");
    expect(homeBtn).not.toHaveClass("active");
  });

  it("calls onNavigate when a tab is clicked", () => {
    const onNavigate = vi.fn();
    render(NavBar, { props: { ...defaultProps, onNavigate } });

    fireEvent.click(screen.getByText("题库"));
    expect(onNavigate).toHaveBeenCalledWith("browse");
  });

  it("renders version label", () => {
    render(NavBar, { props: defaultProps });
    expect(screen.getByText(/^v/)).toBeInTheDocument();
  });
});
