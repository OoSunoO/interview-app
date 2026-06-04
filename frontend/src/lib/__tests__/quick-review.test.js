import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/svelte";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import QuickReview from "../../pages/QuickReview.svelte";

// ── Fixtures ──

const LIGHT_Q1 = {
  id: 1,
  category: "java_basic",
  difficulty: "easy",
  type: "short_answer",
  title: "Java是什么",
  tags: ["Java基础"],
  company: "",
  status: "new",
  wrong_count: 0,
  bookmarked: false,
};
const LIGHT_Q2 = {
  id: 2,
  category: "database",
  difficulty: "hard",
  type: "short_answer",
  title: "SQL优化",
  tags: ["SQL"],
  company: "",
  status: "new",
  wrong_count: 0,
  bookmarked: false,
};

const FULL_Q1 = {
  ...LIGHT_Q1,
  content: "请解释Java的核心特性",
  answer: "答案：Java是OOP语言\n解析：跨平台自动内存管理",
  hints: ["考虑JVM和字节码"],
  options: [],
};
const FULL_Q2 = {
  ...LIGHT_Q2,
  content: "如何优化慢查询",
  answer: "答案：加索引\n解析：减少全表扫描次数",
  hints: ["考虑B+树结构"],
  options: [],
};

// ── Mocks ──

const mockList = vi.fn();
const mockGet = vi.fn();
const mockUpdate = vi.fn();
const mockToggleBM = vi.fn();
const mockSaveSession = vi.fn();
const mockGetSession = vi.fn(() => null);
const mockClearSession = vi.fn();
const mockSaveHistory = vi.fn();
const mockGetHistory = vi.fn(() => []);
const mockClearHistory = vi.fn();
const mockCategoryLabel = vi.fn((slug) => slug);
const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();

vi.mock("../local-api.js", () => ({
  api: {
    questions: {
      list: (...a) => mockList(...a),
      get: (...a) => mockGet(...a),
    },
    progress: {
      update: (...a) => mockUpdate(...a),
      toggleBookmark: (...a) => mockToggleBM(...a),
    },
    quickReview: {
      saveSession: (...a) => mockSaveSession(...a),
      getSession: (...a) => mockGetSession(...a),
      clearSession: (...a) => mockClearSession(...a),
      saveHistory: (...a) => mockSaveHistory(...a),
      getHistory: (...a) => mockGetHistory(...a),
      clearHistory: (...a) => mockClearHistory(...a),
    },
  },
}));

vi.mock("../categories.js", () => ({
  categoryLabel: (...a) => mockCategoryLabel(...a),
}));

vi.mock("../toast.js", () => ({
  toast: { success: (...a) => mockToastSuccess(...a), error: (...a) => mockToastError(...a) },
}));

// ── Tests ──

describe("QuickReview", () => {
  const onNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockGetSession.mockReturnValue(null);
  });

  afterEach(() => {
    cleanup();
  });

  describe("empty / loading states", () => {
    it("shows completed screen when no questions match the filter", async () => {
      mockList.mockReturnValue([]);

      render(QuickReview, { props: { config: { count: 10 }, onNavigate } });

      await waitFor(() => {
        expect(screen.getByTestId("qr-summary")).toBeInTheDocument();
      });
      expect(screen.getByText("没有符合条件的题目")).toBeInTheDocument();
    });
  });

  describe("active question", () => {
    it("loads and displays the first question with title and counter", async () => {
      mockList.mockReturnValue([LIGHT_Q1, LIGHT_Q2]);
      mockGet.mockResolvedValueOnce(FULL_Q1).mockResolvedValueOnce(FULL_Q2);

      render(QuickReview, { props: { config: {}, onNavigate } });

      await waitFor(() => {
        expect(screen.getByTestId("qr-card")).toBeInTheDocument();
      });
      expect(screen.getByTestId("qr-question-title")).toHaveTextContent("Java是什么");
      expect(screen.getByTestId("qr-counter")).toHaveTextContent("0/2");
    });

    it("shows hints before answer is revealed", async () => {
      mockList.mockReturnValue([LIGHT_Q1]);
      mockGet.mockResolvedValueOnce(FULL_Q1);

      render(QuickReview, { props: { config: {}, onNavigate } });

      await waitFor(() => {
        expect(screen.getByText("考虑JVM和字节码")).toBeInTheDocument();
      });
    });
  });

  describe("answer reveal", () => {
    it("reveals answer and hides hints when button is clicked", async () => {
      mockList.mockReturnValue([LIGHT_Q1]);
      mockGet.mockResolvedValueOnce(FULL_Q1);

      render(QuickReview, { props: { config: {}, onNavigate } });

      await waitFor(() => {
        expect(screen.getByTestId("qr-reveal-btn")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId("qr-reveal-btn"));

      await waitFor(() => {
        expect(screen.getByText("参考答案")).toBeInTheDocument();
      });
      expect(screen.getByText("Java是OOP语言")).toBeInTheDocument();
      expect(screen.getByText("解析")).toBeInTheDocument();
      expect(screen.getByText("跨平台自动内存管理")).toBeInTheDocument();
    });
  });

  describe("self-rating", () => {
    it('advances to next question on "remembered" and updates progress', async () => {
      mockList.mockReturnValue([LIGHT_Q1, LIGHT_Q2]);
      mockGet.mockResolvedValueOnce(FULL_Q1).mockResolvedValueOnce(FULL_Q2);

      render(QuickReview, { props: { config: {}, onNavigate } });

      await waitFor(() => {
        expect(screen.getByTestId("qr-card")).toBeInTheDocument();
      });
      fireEvent.click(screen.getByTestId("qr-reveal-btn"));

      await waitFor(() => {
        expect(screen.getByTestId("qr-rate-remembered")).toBeInTheDocument();
      });
      fireEvent.click(screen.getByTestId("qr-rate-remembered"));

      await waitFor(() => {
        expect(screen.getByText("SQL优化")).toBeInTheDocument();
      });
      expect(screen.getByTestId("qr-counter")).toHaveTextContent("1/2");
      expect(mockUpdate).toHaveBeenCalledWith(1, expect.objectContaining({ status: "correct" }));
    });

    it('rates "forgot" as wrong progress', async () => {
      mockList.mockReturnValue([LIGHT_Q1, LIGHT_Q2]);
      mockGet.mockResolvedValueOnce(FULL_Q1).mockResolvedValueOnce(FULL_Q2);

      render(QuickReview, { props: { config: {}, onNavigate } });

      await waitFor(() => {
        expect(screen.getByTestId("qr-card")).toBeInTheDocument();
      });
      fireEvent.click(screen.getByTestId("qr-reveal-btn"));

      await waitFor(() => {
        expect(screen.getByTestId("qr-rate-forgot")).toBeInTheDocument();
      });
      fireEvent.click(screen.getByTestId("qr-rate-forgot"));

      await waitFor(() => {
        expect(screen.getByText("SQL优化")).toBeInTheDocument();
      });
      expect(mockUpdate).toHaveBeenCalledWith(1, expect.objectContaining({ status: "wrong" }));
    });

    it("shows summary after rating the last question", async () => {
      mockList.mockReturnValue([LIGHT_Q1]);
      mockGet.mockResolvedValueOnce(FULL_Q1);

      render(QuickReview, { props: { config: {}, onNavigate } });

      await waitFor(() => {
        expect(screen.getByTestId("qr-card")).toBeInTheDocument();
      });
      fireEvent.click(screen.getByTestId("qr-reveal-btn"));

      await waitFor(() => {
        expect(screen.getByTestId("qr-rate-remembered")).toBeInTheDocument();
      });
      fireEvent.click(screen.getByTestId("qr-rate-remembered"));

      await waitFor(() => {
        expect(screen.getByTestId("qr-summary")).toBeInTheDocument();
      });
      expect(screen.getByText("速记完成！")).toBeInTheDocument();
      expect(mockClearSession).toHaveBeenCalled();
      expect(mockSaveHistory).toHaveBeenCalledWith(
        expect.objectContaining({ total: 1, remembered: 1 }),
      );
    });
  });

  describe("review forgotten", () => {
    it("shows review button on summary when some questions were forgotten", async () => {
      mockList.mockReturnValue([LIGHT_Q1]);
      mockGet.mockResolvedValueOnce(FULL_Q1);

      render(QuickReview, { props: { config: {}, onNavigate } });

      await waitFor(() => {
        expect(screen.getByTestId("qr-card")).toBeInTheDocument();
      });
      fireEvent.click(screen.getByTestId("qr-reveal-btn"));
      await waitFor(() => {
        expect(screen.getByTestId("qr-rate-forgot")).toBeInTheDocument();
      });
      // Rate as forgot
      fireEvent.click(screen.getByTestId("qr-rate-forgot"));

      await waitFor(() => {
        expect(screen.getByTestId("qr-summary")).toBeInTheDocument();
      });
      expect(screen.getByText(/复习.*遗忘/)).toBeInTheDocument();
    });

    it("does not show review button when all questions were remembered", async () => {
      mockList.mockReturnValue([LIGHT_Q1]);
      mockGet.mockResolvedValueOnce(FULL_Q1);

      render(QuickReview, { props: { config: {}, onNavigate } });

      await waitFor(() => {
        expect(screen.getByTestId("qr-card")).toBeInTheDocument();
      });
      fireEvent.click(screen.getByTestId("qr-reveal-btn"));
      await waitFor(() => {
        expect(screen.getByTestId("qr-rate-remembered")).toBeInTheDocument();
      });
      fireEvent.click(screen.getByTestId("qr-rate-remembered"));

      await waitFor(() => {
        expect(screen.getByTestId("qr-summary")).toBeInTheDocument();
      });
      expect(screen.queryByText(/复习.*遗忘/)).not.toBeInTheDocument();
    });

    it("clicking review button re-enters active mode with forgotten questions only", async () => {
      mockList.mockReturnValue([LIGHT_Q1, LIGHT_Q2]);
      mockGet.mockResolvedValueOnce(FULL_Q1).mockResolvedValueOnce(FULL_Q2);

      render(QuickReview, { props: { config: {}, onNavigate } });

      await waitFor(() => {
        expect(screen.getByTestId("qr-card")).toBeInTheDocument();
      });
      // Rate Q1 as forgot
      fireEvent.click(screen.getByTestId("qr-reveal-btn"));
      await waitFor(() => {
        expect(screen.getByTestId("qr-rate-forgot")).toBeInTheDocument();
      });
      fireEvent.click(screen.getByTestId("qr-rate-forgot"));

      // Rate Q2 as remembered
      await waitFor(() => {
        expect(screen.getByText("SQL优化")).toBeInTheDocument();
      });
      fireEvent.click(screen.getByTestId("qr-reveal-btn"));
      await waitFor(() => {
        expect(screen.getByTestId("qr-rate-remembered")).toBeInTheDocument();
      });
      fireEvent.click(screen.getByTestId("qr-rate-remembered"));

      // Summary should show review button
      await waitFor(() => {
        expect(screen.getByTestId("qr-summary")).toBeInTheDocument();
      });
      const reviewBtn = screen.getByText(/复习.*遗忘/);
      expect(reviewBtn).toBeInTheDocument();

      // Click review button
      fireEvent.click(reviewBtn);

      // Should re-enter active mode with only the forgotten question (Q1)
      await waitFor(() => {
        expect(screen.getByTestId("qr-card")).toBeInTheDocument();
      });
      expect(screen.getByTestId("qr-question-title")).toHaveTextContent("Java是什么");
    });
  });

  describe("bookmark", () => {
    it("toggles bookmark and shows success toast", async () => {
      mockList.mockReturnValue([LIGHT_Q1]);
      mockGet.mockResolvedValueOnce(FULL_Q1);
      mockToggleBM.mockResolvedValue(undefined);

      render(QuickReview, { props: { config: {}, onNavigate } });

      await waitFor(() => {
        expect(screen.getByTestId("qr-card")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByLabelText("收藏"));

      expect(mockToggleBM).toHaveBeenCalledWith(1);
      await waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalled();
      });
    });

    it("handles bookmark failure gracefully", async () => {
      mockList.mockReturnValue([LIGHT_Q1]);
      mockGet.mockResolvedValueOnce(FULL_Q1);
      mockToggleBM.mockRejectedValue(new Error("network"));

      render(QuickReview, { props: { config: {}, onNavigate } });

      await waitFor(() => {
        expect(screen.getByTestId("qr-card")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByLabelText("收藏"));

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalled();
      });
    });
  });

  describe("keyboard shortcuts", () => {
    it("reveals answer with Space key", async () => {
      mockList.mockReturnValue([LIGHT_Q1]);
      mockGet.mockResolvedValueOnce(FULL_Q1);

      render(QuickReview, { props: { config: {}, onNavigate } });

      await waitFor(() => {
        expect(screen.getByTestId("qr-card")).toBeInTheDocument();
      });

      fireEvent.keyDown(window, { key: " " });

      await waitFor(() => {
        expect(screen.getByText("参考答案")).toBeInTheDocument();
      });
    });

    it("reveals answer with Enter key", async () => {
      mockList.mockReturnValue([LIGHT_Q1]);
      mockGet.mockResolvedValueOnce(FULL_Q1);

      render(QuickReview, { props: { config: {}, onNavigate } });

      await waitFor(() => {
        expect(screen.getByTestId("qr-card")).toBeInTheDocument();
      });

      fireEvent.keyDown(window, { key: "Enter" });

      await waitFor(() => {
        expect(screen.getByText("参考答案")).toBeInTheDocument();
      });
    });

    it("rates question with key 3 (remembered) and advances", async () => {
      mockList.mockReturnValue([LIGHT_Q1, LIGHT_Q2]);
      mockGet.mockResolvedValueOnce(FULL_Q1).mockResolvedValueOnce(FULL_Q2);

      render(QuickReview, { props: { config: {}, onNavigate } });

      await waitFor(() => {
        expect(screen.getByTestId("qr-card")).toBeInTheDocument();
      });
      fireEvent.click(screen.getByTestId("qr-reveal-btn"));

      await waitFor(() => {
        expect(screen.getByText("参考答案")).toBeInTheDocument();
      });

      fireEvent.keyDown(window, { key: "3" });

      await waitFor(() => {
        expect(screen.getByText("SQL优化")).toBeInTheDocument();
      });
    });
  });

  describe("session map", () => {
    it("opens and closes the session map overlay", async () => {
      mockList.mockReturnValue([LIGHT_Q1, LIGHT_Q2]);
      mockGet.mockResolvedValueOnce(FULL_Q1).mockResolvedValueOnce(FULL_Q2);

      render(QuickReview, { props: { config: {}, onNavigate } });

      await waitFor(() => {
        expect(screen.getByTestId("qr-card")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTitle("题目列表"));

      await waitFor(() => {
        expect(screen.getByTestId("qr-map-dialog")).toBeInTheDocument();
      });

      // Close via close button
      fireEvent.click(screen.getByText("关闭"));

      await waitFor(() => {
        expect(screen.queryByTestId("qr-map-dialog")).not.toBeInTheDocument();
      });
    });
  });

  describe("session resume", () => {
    it("restores a saved session when config.resume is set", async () => {
      const savedSession = {
        questionIds: [1, 2],
        currentIndex: 1,
        results: { 1: "remembered" },
        filter: { count: 20 },
        updated_at: "2026-06-04T12:00:00.000Z",
      };
      mockGetSession.mockReturnValue(savedSession);
      mockGet.mockResolvedValueOnce(FULL_Q1).mockResolvedValueOnce(FULL_Q2);

      render(QuickReview, { props: { config: { resume: true }, onNavigate } });

      await waitFor(() => {
        expect(screen.getByTestId("qr-card")).toBeInTheDocument();
      });
      // Should restore to question at index 1 (Q2)
      expect(screen.getByText("SQL优化")).toBeInTheDocument();
    });

    it("starts fresh when resume config but no saved session", async () => {
      mockGetSession.mockReturnValue(null);
      mockList.mockReturnValue([LIGHT_Q1]);
      mockGet.mockResolvedValueOnce(FULL_Q1);

      render(QuickReview, { props: { config: { resume: true }, onNavigate } });

      await waitFor(() => {
        expect(screen.getByTestId("qr-card")).toBeInTheDocument();
      });
      expect(mockList).toHaveBeenCalled();
    });
  });

  describe("history dialog", () => {
    async function completeSession(page) {
      mockList.mockReturnValue([LIGHT_Q1]);
      mockGet.mockResolvedValueOnce(FULL_Q1);
      render(QuickReview, { props: { config: {}, onNavigate } });
      await waitFor(() => expect(screen.getByTestId("qr-card")).toBeInTheDocument());
      fireEvent.click(screen.getByTestId("qr-reveal-btn"));
      await waitFor(() => expect(screen.getByTestId("qr-rate-remembered")).toBeInTheDocument());
      fireEvent.click(screen.getByTestId("qr-rate-remembered"));
      await waitFor(() => expect(screen.getByTestId("qr-summary")).toBeInTheDocument());
    }

    it("shows history button on summary page", async () => {
      await completeSession();
      expect(screen.getByText("历史记录")).toBeInTheDocument();
    });

    it("shows empty state when no history exists", async () => {
      mockGetHistory.mockReturnValue([]);
      await completeSession();
      fireEvent.click(screen.getByText("历史记录"));
      await waitFor(() => {
        expect(screen.getByText("暂无记录")).toBeInTheDocument();
      });
    });

    it("displays past session entries in the dialog", async () => {
      mockGetHistory.mockReturnValue([
        { date: new Date().toISOString(), total: 5, remembered: 3, forgot: 1, unsure: 1 },
      ]);
      await completeSession();
      fireEvent.click(screen.getByText("历史记录"));
      await waitFor(() => {
        expect(screen.getByText("5 题")).toBeInTheDocument();
      });
      expect(screen.getByText("60%")).toBeInTheDocument();
    });

    it("clear button removes all history", async () => {
      mockGetHistory.mockReturnValue([
        { date: new Date().toISOString(), total: 3, remembered: 2, forgot: 1, unsure: 0 },
      ]);
      await completeSession();
      fireEvent.click(screen.getByText("历史记录"));
      await waitFor(() => {
        expect(screen.getByText("3 题")).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText("清除历史"));
      expect(mockClearHistory).toHaveBeenCalled();
    });
  });
});
