import { describe, it, expect } from "vitest";
import { getDefaultProgress, calculateSM2, rateCard, RATINGS, QUICK_REVIEW_MAP } from "../sm2.js";

describe("getDefaultProgress", () => {
  it("returns default values", () => {
    expect(getDefaultProgress()).toEqual({
      ef: 2.5,
      interval: 0,
      repetitions: 0,
      next_review_at: null,
    });
  });
});

describe("calculateSM2", () => {
  it("sets interval to 1 on first correct answer", () => {
    const result = calculateSM2(4);
    expect(result.interval).toBe(1);
    expect(result.repetitions).toBe(1);
  });

  it("sets interval to 6 on second correct answer", () => {
    const prev = { ef: 2.5, interval: 1, repetitions: 1 };
    const result = calculateSM2(4, prev);
    expect(result.interval).toBe(6);
    expect(result.repetitions).toBe(2);
  });

  it("uses EF multiplier for third+ correct answer", () => {
    const prev = { ef: 2.5, interval: 6, repetitions: 2 };
    const result = calculateSM2(4, prev);
    expect(result.interval).toBe(15); // Math.round(6 * 2.5)
    expect(result.repetitions).toBe(3);
  });

  it("resets repetitions on quality < 3", () => {
    const prev = { ef: 2.5, interval: 15, repetitions: 5 };
    const result = calculateSM2(1, prev);
    expect(result.interval).toBe(1);
    expect(result.repetitions).toBe(0);
  });

  it("adjusts EF based on quality", () => {
    const high = calculateSM2(5, { ef: 2.5, interval: 1, repetitions: 1 });
    expect(high.ef).toBeGreaterThan(2.5);

    const low = calculateSM2(1, { ef: 2.5, interval: 1, repetitions: 1 });
    expect(low.ef).toBeLessThan(2.5);
  });

  it("floors EF at 1.3", () => {
    const result = calculateSM2(0, { ef: 1.3, interval: 1, repetitions: 1 });
    expect(result.ef).toBe(1.3);
  });

  it("uses defaults when prev is empty", () => {
    const result = calculateSM2(4, {});
    expect(result.interval).toBe(1);
    expect(result.repetitions).toBe(1);
    // quality 4 keeps EF unchanged at 2.5 (neutral)
    expect(result.ef).toBe(2.5);
    expect(result.next_review_at).toBeTruthy();
  });

  it("returns ISO date string for next_review_at", () => {
    const result = calculateSM2(4);
    expect(() => new Date(result.next_review_at)).not.toThrow();
    expect(new Date(result.next_review_at).getTime()).toBeGreaterThan(Date.now());
  });
});

describe("rateCard", () => {
  it("maps forgot (quality 1)", () => {
    const r = rateCard("forgot");
    expect(r.interval).toBe(1);
    expect(r.repetitions).toBe(0);
  });

  it("maps hard (quality 2)", () => {
    const r = rateCard("hard");
    expect(r.interval).toBe(1);
    expect(r.repetitions).toBe(0);
  });

  it("maps good (quality 4)", () => {
    const r = rateCard("good");
    expect(r.interval).toBe(1);
    expect(r.repetitions).toBe(1);
  });

  it("maps easy (quality 5)", () => {
    const r = rateCard("easy");
    expect(r.interval).toBe(1);
    expect(r.repetitions).toBe(1);
  });

  it("returns default progress for invalid rating", () => {
    const r = rateCard("invalid");
    expect(r.ef).toBe(2.5);
    expect(r.interval).toBe(0);
    expect(r.repetitions).toBe(0);
    expect(r.next_review_at).toBeNull();
  });
});

describe("RATINGS", () => {
  it("has correct labels and qualities", () => {
    expect(RATINGS.forgot.quality).toBe(1);
    expect(RATINGS.hard.quality).toBe(2);
    expect(RATINGS.good.quality).toBe(4);
    expect(RATINGS.easy.quality).toBe(5);
  });
});

describe("QUICK_REVIEW_MAP", () => {
  it("maps quick review ratings", () => {
    expect(QUICK_REVIEW_MAP).toEqual({
      forgot: "forgot",
      unsure: "hard",
      remembered: "good",
    });
  });
});
