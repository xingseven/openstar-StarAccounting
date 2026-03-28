"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Loader2,
  RefreshCw,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ThemeNotice } from "@/components/shared/theme-primitives";

type Insight = {
  type: "info" | "warning" | "success";
  title: string;
  description: string;
};

type Suggestion = {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
};

type AnalysisResult = {
  summary: string;
  insights: Insight[];
  suggestions: Suggestion[];
  stats: {
    totalExpense: number;
    totalIncome: number;
    avgDaily: number;
    transactionCount: number;
    topCategory: string;
    topCategoryPercent: number;
    expenseChangePercent: number;
  };
};

type TransactionItem = {
  id: string;
  amount: number;
  category: string;
  platform: string;
  date: string;
  merchant?: string;
  description?: string;
};

type BudgetItem = {
  category: string;
  limit: number;
  spent: number;
  period?: string;
};

interface AIAnalysisCardProps {
  transactions: TransactionItem[];
  budgets: BudgetItem[];
  className?: string;
  compact?: boolean;
}

function useTypingEffect(text: string, speed = 30, startDelay = 0) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!text) {
      const resetTimeout = window.setTimeout(() => {
        setDisplayedText("");
        setIsTyping(false);
      }, 0);

      return () => window.clearTimeout(resetTimeout);
    }

    let interval: number | undefined;
    const delayTimeout = window.setTimeout(() => {
      setDisplayedText("");
      setIsTyping(true);

      let currentIndex = 0;
      interval = window.setInterval(() => {
        if (currentIndex <= text.length) {
          setDisplayedText(text.slice(0, currentIndex));
          currentIndex += 1;
        } else {
          if (interval !== undefined) {
            window.clearInterval(interval);
          }
          setIsTyping(false);
        }
      }, speed);
    }, startDelay);

    return () => {
      if (interval !== undefined) {
        window.clearInterval(interval);
      }
      window.clearTimeout(delayTimeout);
    };
  }, [text, speed, startDelay]);

  return { displayedText, isTyping };
}

function SkeletonLoader() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 animate-pulse rounded-xl bg-gradient-to-br from-blue-200 to-blue-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
          <div className="h-3 w-40 animate-pulse rounded bg-gray-100" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-xl bg-gray-100 p-3"
            style={{ animationDelay: `${i * 100}ms`, animationDuration: "800ms" }}
          >
            <div className="mb-2 h-2 w-12 rounded bg-gray-200" />
            <div className="h-5 w-16 rounded bg-gray-200" />
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-gradient-to-r from-blue-50 to-blue-50 p-4">
        <div className="mb-3 flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
          <div className="h-3 w-20 animate-pulse rounded bg-gray-300" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full animate-pulse rounded bg-gray-200" />
          <div className="h-3 w-4/5 animate-pulse rounded bg-gray-200" />
          <div className="h-3 w-3/5 animate-pulse rounded bg-gray-200" />
        </div>
      </div>

      <div className="space-y-2">
        <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
        {[1, 2].map((i) => (
          <div
            key={i}
            className="flex items-start gap-2 rounded-lg bg-gray-100 p-3 animate-pulse"
            style={{ animationDelay: `${i * 150}ms`, animationDuration: "700ms" }}
          >
            <div className="h-4 w-4 rounded-full bg-gray-200" />
            <div className="flex-1 space-y-1">
              <div className="h-3 w-24 rounded bg-gray-200" />
              <div className="h-2 w-40 rounded bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalysisShell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm ${className}`}>{children}</div>;
}

export function AIAnalysisCard({ transactions, budgets, className = "", compact = false }: AIAnalysisCardProps) {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [typingPhase, setTypingPhase] = useState<"summary" | "insights" | "suggestions" | "done">("summary");
  const [visibleInsights, setVisibleInsights] = useState(0);
  const [visibleSuggestions, setVisibleSuggestions] = useState(0);

  const { displayedText: summaryText, isTyping: isSummaryTyping } = useTypingEffect(analysis?.summary || "", 15, 0);

  useEffect(() => {
    if (!isSummaryTyping && analysis?.summary && typingPhase === "summary") {
      setTypingPhase("insights");
    }
  }, [analysis?.summary, isSummaryTyping, typingPhase]);

  useEffect(() => {
    if (typingPhase === "insights" && analysis?.insights) {
      if (visibleInsights < analysis.insights.length) {
        const timer = setTimeout(() => setVisibleInsights((prev) => prev + 1), 150);
        return () => clearTimeout(timer);
      }
      setTypingPhase("suggestions");
    }
  }, [analysis?.insights, typingPhase, visibleInsights]);

  useEffect(() => {
    if (typingPhase === "suggestions" && analysis?.suggestions) {
      if (visibleSuggestions < analysis.suggestions.length) {
        const timer = setTimeout(() => setVisibleSuggestions((prev) => prev + 1), 150);
        return () => clearTimeout(timer);
      }
      setTypingPhase("done");
    }
  }, [analysis?.suggestions, typingPhase, visibleSuggestions]);

  useEffect(() => {
    if (analysis) {
      setTypingPhase("summary");
      setVisibleInsights(0);
      setVisibleSuggestions(0);
    }
  }, [analysis]);

  async function runAnalysis() {
    setLoading(true);
    setError(null);
    setAnalysis(null);
    setHasAnalyzed(true);

    try {
      const result = await apiFetch<AnalysisResult>("/api/ai/analyze-consumption", {
        method: "POST",
        body: JSON.stringify({
          transactions: transactions.map((t) => ({
            id: t.id,
            amount: t.amount,
            category: t.category,
            platform: t.platform,
            date: t.date,
            merchant: t.merchant,
            description: t.description,
          })),
          budgets: budgets.map((b) => ({
            category: b.category,
            limit: b.limit,
            spent: b.spent,
            period: b.period,
          })),
        }),
      });

      setAnalysis(result);
    } catch (e) {
      console.error("AI Analysis Error:", e);
      setError(e instanceof Error ? e.message : "分析失败，请重试");
    } finally {
      setLoading(false);
    }
  }

  function handleAnalyze() {
    if (compact) setDialogOpen(true);
    void runAnalysis();
  }

  function handleCompactOpen() {
    setDialogOpen(true);
    if (!analysis && !error && !loading) {
      void runAnalysis();
    }
  }

  function getInsightIcon(type: Insight["type"]) {
    switch (type) {
      case "warning":
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case "success":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      default:
        return <Sparkles className="h-4 w-4 text-blue-500" />;
    }
  }

  function getPriorityColor(priority: Suggestion["priority"]) {
    switch (priority) {
      case "high":
        return "border-red-200 bg-red-50 text-red-700";
      case "medium":
        return "border-amber-200 bg-amber-50 text-amber-700";
      default:
        return "border-blue-200 bg-blue-50 text-blue-700";
    }
  }

  function renderInitialCard(extraClassName = "") {
    return (
      <AnalysisShell className={extraClassName}>
        <div className="p-4 md:p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-500">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">AI 智能分析</h3>
              <p className="text-sm text-gray-500">基于您的消费数据，AI 将提供个性化洞察</p>
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={transactions.length === 0}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-500 px-4 py-3 font-medium text-white transition-all hover:from-blue-600 hover:to-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            开始 AI 分析
          </button>

          {transactions.length === 0 ? <p className="mt-2 text-center text-sm text-gray-400">暂无交易数据</p> : null}
        </div>
      </AnalysisShell>
    );
  }

  function renderLoadingCard(extraClassName = "") {
    return (
      <AnalysisShell className={extraClassName}>
        <div className="p-4 md:p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-500">
              <Loader2 className="h-5 w-5 animate-spin text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">AI 智能分析</h3>
              <p className="text-sm text-gray-500">正在分析您的消费数据...</p>
            </div>
          </div>

          <SkeletonLoader />
        </div>
      </AnalysisShell>
    );
  }

  function renderErrorCard(extraClassName = "") {
    return (
      <AnalysisShell className={extraClassName}>
        <div className="space-y-4 p-4 md:p-6">
          <ThemeNotice tone="red" title="AI 智能分析" description={error ?? ""} />
          <Button onClick={handleAnalyze} variant="outline" className="h-11 w-full rounded-xl">
            <RefreshCw className="h-4 w-4" />
            重试
          </Button>
        </div>
      </AnalysisShell>
    );
  }

  function renderAnalysisCard(extraClassName = "") {
    if (!analysis) return null;

    const showExpandedContent = compact || expanded;

    return (
      <AnalysisShell className={extraClassName}>
        <div className="p-4 md:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-500">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">AI 智能分析</h3>
                <p className="text-xs text-gray-500">基于 {transactions.length} 笔交易</p>
              </div>
            </div>
            <button
              onClick={handleAnalyze}
              className="rounded-lg p-2 transition-colors hover:bg-gray-100"
              title="重新分析"
            >
              <RefreshCw className="h-4 w-4 text-gray-400" />
            </button>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-xl bg-gray-50 p-3">
              <p className="mb-1 text-xs text-gray-500">总支出</p>
              <p className="text-lg font-bold text-gray-900">¥{analysis.stats.totalExpense.toFixed(2)}</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <p className="mb-1 text-xs text-gray-500">日均消费</p>
              <p className="text-lg font-bold text-gray-900">¥{analysis.stats.avgDaily.toFixed(2)}</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <p className="mb-1 text-xs text-gray-500">主要类别</p>
              <p className="truncate text-lg font-bold text-gray-900">{analysis.stats.topCategory}</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <p className="mb-1 text-xs text-gray-500">占比</p>
              <p className="text-lg font-bold text-gray-900">{analysis.stats.topCategoryPercent}%</p>
            </div>
          </div>

          <div className="mb-4 min-h-[60px] rounded-xl bg-gradient-to-r from-blue-50 to-blue-50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-500" />
              <span className="text-xs font-medium text-blue-600">消费总结</span>
              {isSummaryTyping ? <Loader2 className="h-3 w-3 animate-spin text-blue-400" /> : null}
            </div>
            <p className="text-sm text-gray-700">
              {summaryText}
              {isSummaryTyping ? <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-blue-400" /> : null}
            </p>
          </div>

          {!compact ? (
            <button
              onClick={() => setExpanded((prev) => !prev)}
              className="flex w-full items-center justify-center gap-1 py-2 text-sm text-gray-500 transition-colors hover:text-gray-700"
            >
              {expanded ? (
                <>
                  <span>收起详情</span>
                  <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  <span>查看更多</span>
                  <ChevronDown className="h-4 w-4" />
                </>
              )}
            </button>
          ) : null}

          {showExpandedContent ? (
            <div className="space-y-4 border-t border-gray-100 pt-4">
              {analysis.insights.length > 0 ? (
                <div>
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Sparkles className="h-4 w-4 text-blue-500" />
                    关键洞察
                    {typingPhase === "insights" && visibleInsights < analysis.insights.length ? (
                      <Loader2 className="ml-auto h-3 w-3 animate-spin text-blue-400" />
                    ) : null}
                  </h4>
                  <div className="space-y-2">
                    {analysis.insights.slice(0, visibleInsights).map((insight, idx) => (
                      <div
                        key={idx}
                        className="animate-in slide-in-from-left-2 flex items-start gap-2 rounded-lg bg-gray-50 p-3 duration-300"
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        {getInsightIcon(insight.type)}
                        <div>
                          <p className="text-sm font-medium text-gray-800">{insight.title}</p>
                          <p className="mt-0.5 text-xs text-gray-500">{insight.description}</p>
                        </div>
                      </div>
                    ))}
                    {typingPhase === "insights"
                      ? analysis.insights.slice(visibleInsights).map((_, idx) => (
                          <div key={`insight-skeleton-${idx}`} className="flex animate-pulse items-start gap-2 rounded-lg bg-gray-50 p-3">
                            <div className="h-4 w-4 rounded-full bg-gray-200" />
                            <div className="flex-1 space-y-1">
                              <div className="h-3 w-24 rounded bg-gray-200" />
                              <div className="h-2 w-40 rounded bg-gray-100" />
                            </div>
                          </div>
                        ))
                      : null}
                  </div>
                </div>
              ) : null}

              {analysis.suggestions.length > 0 ? (
                <div>
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Lightbulb className="h-4 w-4 text-amber-500" />
                    优化建议
                    {typingPhase === "suggestions" && visibleSuggestions < analysis.suggestions.length ? (
                      <Loader2 className="ml-auto h-3 w-3 animate-spin text-amber-400" />
                    ) : null}
                  </h4>
                  <div className="space-y-2">
                    {analysis.suggestions.slice(0, visibleSuggestions).map((suggestion, idx) => (
                      <div
                        key={idx}
                        className={`animate-in slide-in-from-left-2 rounded-lg border p-3 duration-300 ${getPriorityColor(suggestion.priority)}`}
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        <p className="text-sm font-medium">{suggestion.title}</p>
                        <p className="mt-0.5 text-xs opacity-80">{suggestion.description}</p>
                      </div>
                    ))}
                    {typingPhase === "suggestions"
                      ? analysis.suggestions.slice(visibleSuggestions).map((_, idx) => (
                          <div key={`suggestion-skeleton-${idx}`} className="animate-pulse rounded-lg border border-gray-200 bg-gray-50 p-3">
                            <div className="mb-1 h-3 w-32 rounded bg-gray-200" />
                            <div className="h-2 w-48 rounded bg-gray-100" />
                          </div>
                        ))
                      : null}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </AnalysisShell>
    );
  }

  function renderPanel(extraClassName = "") {
    if (loading) return renderLoadingCard(extraClassName);
    if (error) return renderErrorCard(extraClassName);
    if (!hasAnalyzed) return renderInitialCard(extraClassName);
    return renderAnalysisCard(extraClassName);
  }

  if (compact) {
    return (
      <>
        <button
          onClick={handleCompactOpen}
          disabled={transactions.length === 0}
          className={`flex h-10 w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-[18px] bg-blue-600 px-3 text-[13px] font-medium leading-none text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:gap-2 sm:px-4 sm:text-sm ${className}`}
        >
          {loading && dialogOpen ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" /> : <Sparkles className="h-4 w-4 shrink-0" />}
          <span className="whitespace-nowrap">AI 智能分析</span>
        </button>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="gap-0 border-0 bg-transparent px-2 pb-2 pt-10 shadow-none sm:max-w-[960px] sm:px-0 sm:pb-0 sm:pt-0 sm:shadow-none">
            <div className="max-h-[82vh] overflow-y-auto">
              {renderPanel("w-full sm:shadow-[0_28px_70px_rgba(15,23,42,0.16)]")}
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return renderPanel(className);
}
