import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { subscribe, toast } from "../toast.js";

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("toast", () => {
  it("info emits add event with correct variant", () => {
    const fn = vi.fn();
    const unsub = subscribe(fn);
    toast.info("hello");
    expect(fn).toHaveBeenCalledWith(
      expect.objectContaining({ type: "add", message: "hello", variant: "info" }),
    );
    unsub();
  });

  it("success emits add event", () => {
    const fn = vi.fn();
    const unsub = subscribe(fn);
    toast.success("ok");
    expect(fn).toHaveBeenCalledWith(expect.objectContaining({ type: "add", variant: "success" }));
    unsub();
  });

  it("error emits add event", () => {
    const fn = vi.fn();
    const unsub = subscribe(fn);
    toast.error("fail");
    expect(fn).toHaveBeenCalledWith(expect.objectContaining({ type: "add", variant: "error" }));
    unsub();
  });

  it("dismiss emits dismiss event", () => {
    const fn = vi.fn();
    const unsub = subscribe(fn);
    toast.dismiss(42);
    expect(fn).toHaveBeenCalledWith({ type: "dismiss", id: 42 });
    unsub();
  });

  it("assigns incrementing ids", () => {
    const fn = vi.fn();
    const unsub = subscribe(fn);
    const id1 = fn.mock.calls.length;
    toast.info("a");
    const id2 = fn.mock.calls.length;
    toast.info("b");
    // Each call gets a unique id, second > first
    expect(fn.mock.calls[0][0].id).toBeLessThan(fn.mock.calls[1][0].id);
    unsub();
  });
});

describe("subscribe", () => {
  it("unsubscribe removes listener", () => {
    const fn = vi.fn();
    const unsub = subscribe(fn);
    unsub();
    toast.info("hello");
    expect(fn).not.toHaveBeenCalled();
  });

  it("supports multiple listeners", () => {
    const fn1 = vi.fn();
    const fn2 = vi.fn();
    const u1 = subscribe(fn1);
    const u2 = subscribe(fn2);
    toast.info("hi");
    expect(fn1).toHaveBeenCalled();
    expect(fn2).toHaveBeenCalled();
    u1();
    u2();
  });
});

describe("scheduleDismiss", () => {
  it("auto-dismisses after timeout", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const unsub = subscribe(fn);
    toast.info("auto");
    expect(fn).toHaveBeenCalledWith(expect.objectContaining({ type: "add" }));
    fn.mockClear();
    vi.advanceTimersByTime(2500);
    expect(fn).toHaveBeenCalledWith(expect.objectContaining({ type: "dismiss" }));
    vi.useRealTimers();
    unsub();
  });
});
