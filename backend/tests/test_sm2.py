"""Direct unit tests for the SM-2 spaced repetition algorithm.

Tests the pure function sm2_next() from routes.progress without any
database or API infrastructure.
"""
import pytest

from routes.progress import sm2_next


class TestSM2Next:
    """SM-2 algorithm: quality 0-5, returns (ef, reps, interval_days)."""

    # ── Quality < 3 (failed review) ──

    def test_quality_0_resets_reps_and_interval(self):
        """Quality 0 (complete blackout) → ef decreases, reps=0, interval=1."""
        ef, reps, interval_days = sm2_next(0, 2.5, 5, 10)
        assert reps == 0
        assert interval_days == 1
        assert ef < 2.0

    def test_quality_1_resets(self):
        """Quality 1 → ef decreases, reps=0, interval=1."""
        ef, reps, interval_days = sm2_next(1, 2.5, 3, 6)
        assert reps == 0
        assert interval_days == 1
        assert ef < 2.5

    def test_quality_2_resets(self):
        """Quality 2 → ef decreases, reps=0, interval=1."""
        ef, reps, interval_days = sm2_next(2, 2.5, 10, 30)
        assert reps == 0
        assert interval_days == 1
        assert ef < 2.5

    # ── Minimum easiness ──

    def test_ef_never_below_1_3(self):
        """Even with quality 0, ef should floor at 1.3."""
        ef, _, _ = sm2_next(0, 2.5, 0, 0)
        assert ef >= 1.3

        ef, _, _ = sm2_next(0, 1.3, 0, 0)
        assert ef == 1.3

    def test_low_ef_floors_at_1_3(self):
        """Starting with ef=1.3 and low quality should not drop below 1.3."""
        ef, _, _ = sm2_next(0, 1.3, 0, 0)
        assert ef == 1.3

    # ── Quality >= 3 (passed review) ──

    def test_quality_3_first_review(self):
        """Quality 3 (barely passed), first review → interval=1, reps=1."""
        ef, reps, interval_days = sm2_next(3, 2.5, 0, 0)
        assert reps == 1
        assert interval_days == 1
        assert ef < 2.5  # borderline pass slightly decreases ef

    def test_quality_4_first_review(self):
        """Quality 4 (passed with hesitation), first review → interval=1."""
        ef, reps, interval_days = sm2_next(4, 2.5, 0, 0)
        assert reps == 1
        assert interval_days == 1
        assert ef == 2.5  # quality 4 leaves ef unchanged

    def test_quality_5_first_review(self):
        """Quality 5 (perfect), first review → interval=1."""
        ef, reps, interval_days = sm2_next(5, 2.5, 0, 0)
        assert reps == 1
        assert interval_days == 1
        assert ef > 2.5  # perfect increases ef

    # ── Interval progression ──

    def test_second_review_interval_6(self):
        """Second consecutive pass → interval=6, reps=2."""
        ef, reps, interval_days = sm2_next(4, 2.5, 1, 1)
        assert reps == 2
        assert interval_days == 6

    def test_third_review_uses_ef_multiplier(self):
        """Third consecutive pass → interval=round(prev_interval * ef)."""
        ef, reps, interval_days = sm2_next(4, 2.5, 2, 6)
        assert reps == 3
        assert interval_days == round(6 * 2.5)  # = 15

    def test_interval_with_high_ef(self):
        """Higher ef → longer intervals on subsequent reviews.
        Quality 5 increases ef from 3.0 to 3.1, then interval = round(30 * 3.1)."""
        ef, reps, interval_days = sm2_next(5, 3.0, 3, 30)
        assert reps == 4
        assert interval_days == round(30 * 3.1)  # = 93

    def test_interval_with_low_ef(self):
        """Lower ef → shorter intervals."""
        ef, reps, interval_days = sm2_next(4, 1.5, 3, 30)
        assert reps == 4
        assert interval_days == round(30 * 1.5)  # = 45

    # ── Ef calculation precision ──

    def test_ef_calculation(self):
        """Verify specific ef values for known quality inputs."""
        ef, _, _ = sm2_next(5, 2.5, 0, 0)
        assert ef == pytest.approx(2.6)

        ef, _, _ = sm2_next(3, 2.5, 0, 0)
        assert ef == pytest.approx(2.36)

        ef, _, _ = sm2_next(0, 2.5, 0, 0)
        assert ef == pytest.approx(1.7)

    # ── Edge cases ──

    def test_interval_never_zero(self):
        """Even with interval=0 input, output should be at least 1."""
        _, _, interval_days = sm2_next(4, 2.5, 0, 0)
        assert interval_days >= 1

    def test_high_repetitions_still_work(self):
        """SM-2 should handle very high repetition counts."""
        ef, reps, interval_days = sm2_next(4, 2.5, 100, 365)
        assert reps == 101
        assert interval_days > 365

    def test_quality_3_after_failure_resets_chain(self):
        """After a reset (reps=0), quality >= 3 starts interval chain fresh."""
        ef, reps, interval_days = sm2_next(4, 2.0, 0, 0)
        assert reps == 1
        assert interval_days == 1
