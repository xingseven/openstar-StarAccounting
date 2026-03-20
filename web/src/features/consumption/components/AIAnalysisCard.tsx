"use client";

import { useState, useEffect, useRef } from "react";
import { apiFetch } from "@/lib/api";
import { Sparkles, TrendingUp, TrendingDown, AlertCircle, Lightbulb, ChevronDown, ChevronUp, RefreshCw, Loader2, BarChart3 } from "lucide-react";

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
}

// 打字机效果 Hook
function useTypingEffect(text: string, speed: number = 30, startDelay: number = 0) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!text) {
      setDisplayedText("");
      return;
    }

    setDisplayedText("");
    setIsTyping(true);

    const delayTimeout = setTimeout(() => {
      let currentIndex = 0;
      const interval = setInterval(() => {
        if (currentIndex <= text.length) {
          setDisplayedText(text.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(interval);
          setIsTyping(false);
        }
      }, speed);

      return () => clearInterval(interval);
    }, startDelay);

    return () => clearTimeout(delayTimeout);
  }, [text, speed, startDelay]);

  return { displayedText, isTyping };
}

// 骨架屏动画组件 - 优化动画节奏
function SkeletonLoader() {
  return (
    <div className="space-y-4">
      {/* Header skeleton */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-200 to-blue-200 animate-pulse" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
          <div className="h-3 bg-gray-100 rounded animate-pulse w-40" />
        </div>
      </div>

      {/* Stats skeleton - 错开动画延迟 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-gray-100 rounded-xl p-3 animate-pulse"
            style={{ animationDelay: `${i * 100}ms`, animationDuration: '800ms' }}
          >
            <div className="h-2 bg-gray-200 rounded w-12 mb-2" />
            <div className="h-5 bg-gray-200 rounded w-16" />
          </div>
        ))}
      </div>

      {/* Chart skeleton */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
          <div className="h-3 bg-gray-300 rounded animate-pulse w-20" />
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded animate-pulse w-full" />
          <div className="h-3 bg-gray-200 rounded animate-pulse w-4/5" />
          <div className="h-3 bg-gray-200 rounded animate-pulse w-3/5" />
        </div>
      </div>

      {/* Insights skeleton */}
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
        {[1, 2].map((i) => (
          <div
            key={i}
            className="flex items-start gap-2 p-3 bg-gray-100 rounded-lg animate-pulse"
            style={{ animationDelay: `${i * 150}ms`, animationDuration: '700ms' }}
          >
            <div className="w-4 h-4 bg-gray-200 rounded-full animate-pulse" />
            <div className="space-y-1 flex-1">
              <div className="h-3 bg-gray-200 rounded w-24" />
              <div className="h-2 bg-gray-100 rounded w-40" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AIAnalysisCard({ transactions, budgets, className = "" }: AIAnalysisCardProps) {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [typingPhase, setTypingPhase] = useState<"summary" | "insights" | "suggestions" | "done">("summary");
  const [visibleInsights, setVisibleInsights] = useState(0);
  const [visibleSuggestions, setVisibleSuggestions] = useState(0);

  // Summary 打字机效果 - 优化速度
  const { displayedText: summaryText, isTyping: isSummaryTyping } = useTypingEffect(
    analysis?.summary || "",
    15,  // 加速：25ms -> 15ms 每字
    0
  );

  // Summary 完成后进入 insights 阶段
  useEffect(() => {
    if (!isSummaryTyping && analysis?.summary && typingPhase === "summary") {
      setTypingPhase("insights");
    }
  }, [isSummaryTyping, analysis?.summary, typingPhase]);

  // Insights 逐个显示 - 优化速度
  useEffect(() => {
    if (typingPhase === "insights" && analysis?.insights) {
      if (visibleInsights < analysis.insights.length) {
        const timer = setTimeout(() => {
          setVisibleInsights((prev) => prev + 1);
        }, 150);  // 加速：300ms -> 150ms
        return () => clearTimeout(timer);
      } else {
        setTypingPhase("suggestions");
      }
    }
  }, [typingPhase, visibleInsights, analysis?.insights]);

  // Suggestions 逐个显示 - 优化速度
  useEffect(() => {
    if (typingPhase === "suggestions" && analysis?.suggestions) {
      if (visibleSuggestions < analysis.suggestions.length) {
        const timer = setTimeout(() => {
          setVisibleSuggestions((prev) => prev + 1);
        }, 150);  // 加速：300ms -> 150ms
        return () => clearTimeout(timer);
      } else {
        setTypingPhase("done");
      }
    }
  }, [typingPhase, visibleSuggestions, analysis?.suggestions]);

  // 开始分析时重置状态
  useEffect(() => {
    if (analysis) {
      setTypingPhase("summary");
      setVisibleInsights(0);
      setVisibleSuggestions(0);
    }
  }, [analysis]);

  async function handleAnalyze() {
    setLoading(true);
    setError(null);
    setAnalysis(null);
    setHasAnalyzed(true);

    try {
      const result = await apiFetch<AnalysisResult>("/api/ai/analyze-consumption", {
        method: "POST",
        body: JSON.stringify({
          transactions: transactions.map(t => ({
            id: t.id,
            amount: t.amount,
            category: t.category,
            platform: t.platform,
            date: t.date,
            merchant: t.merchant,
            description: t.description,
          })),
          budgets: budgets.map(b => ({
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

  function getInsightIcon(type: string) {
    switch (type) {
      case "warning":
        return <AlertCircle className="w-4 h-4 text-amber-500" />;
      case "success":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-blue-500" />;
    }
  }

  function getPriorityColor(priority: string) {
    switch (priority) {
      case "high":
        return "bg-red-50 text-red-700 border-red-200";
      case "medium":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-blue-50 text-blue-700 border-blue-200";
    }
  }

  if (!hasAnalyzed && !loading) {
    return (
      <div className={`rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden ${className}`}>
        <div className="p-4 md:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">AI 智能分析</h3>
              <p className="text-sm text-gray-500">基于您的消费数据，AI 将提供个性化洞察</p>
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={transactions.length === 0}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            开始 AI 分析
          </button>

          {transactions.length === 0 && (
            <p className="text-sm text-gray-400 text-center mt-2">暂无交易数据</p>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden ${className}`}>
        <div className="p-4 md:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">AI 智能分析</h3>
              <p className="text-sm text-gray-500">正在分析您的消费数据...</p>
            </div>
          </div>

          <SkeletonLoader />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-2xl border border-red-200 bg-red-50 shadow-sm overflow-hidden ${className}`}>
        <div className="p-4 md:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">AI 智能分析</h3>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            className="w-full py-3 px-4 rounded-xl border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            重试
          </button>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className={`rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden ${className}`}>
      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">AI 智能分析</h3>
              <p className="text-xs text-gray-500">基于 {transactions.length} 笔交易</p>
            </div>
          </div>
          <button
            onClick={handleAnalyze}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="重新分析"
          >
            <RefreshCw className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-1">总支出</p>
            <p className="text-lg font-bold text-gray-900">¥{analysis.stats.totalExpense.toFixed(2)}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-1">日均消费</p>
            <p className="text-lg font-bold text-gray-900">¥{analysis.stats.avgDaily.toFixed(2)}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-1">主要类别</p>
            <p className="text-lg font-bold text-gray-900 truncate">{analysis.stats.topCategory}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-1">占比</p>
            <p className="text-lg font-bold text-gray-900">{analysis.stats.topCategoryPercent}%</p>
          </div>
        </div>

        {/* Summary with typing effect */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 mb-4 min-h-[60px]">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-purple-500" />
            <span className="text-xs text-purple-600 font-medium">消费总结</span>
            {isSummaryTyping && <Loader2 className="w-3 h-3 animate-spin text-purple-400" />}
          </div>
          <p className="text-sm text-gray-700">
            {summaryText}
            {isSummaryTyping && <span className="inline-block w-1.5 h-4 bg-purple-400 ml-0.5 animate-pulse" />}
          </p>
        </div>

        {/* Expand/Collapse Toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-1 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          {expanded ? (
            <>
              <span>收起详情</span>
              <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              <span>查看更多</span>
              <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Expanded Content - Streaming effect */}
        {expanded && (
          <div className="space-y-4 pt-2 border-t border-gray-100">
            {/* Insights - Streaming */}
            {analysis.insights.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  关键洞察
                  {typingPhase === "insights" && visibleInsights < analysis.insights.length && (
                    <Loader2 className="w-3 h-3 animate-spin text-purple-400 ml-auto" />
                  )}
                </h4>
                <div className="space-y-2">
                  {analysis.insights.slice(0, visibleInsights).map((insight, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg animate-in slide-in-from-left-2 duration-300"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      {getInsightIcon(insight.type)}
                      <div>
                        <p className="text-sm font-medium text-gray-800">{insight.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{insight.description}</p>
                      </div>
                    </div>
                  ))}
                  {/* Placeholder skeletons while typing */}
                  {typingPhase === "insights" && analysis.insights.slice(visibleInsights).map((_, idx) => (
                    <div key={`skeleton-${idx}`} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg animate-pulse">
                      <div className="w-4 h-4 bg-gray-200 rounded-full" />
                      <div className="space-y-1 flex-1">
                        <div className="h-3 bg-gray-200 rounded w-24" />
                        <div className="h-2 bg-gray-100 rounded w-40" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions - Streaming */}
            {analysis.suggestions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  优化建议
                  {typingPhase === "suggestions" && visibleSuggestions < analysis.suggestions.length && (
                    <Loader2 className="w-3 h-3 animate-spin text-amber-400 ml-auto" />
                  )}
                </h4>
                <div className="space-y-2">
                  {analysis.suggestions.slice(0, visibleSuggestions).map((suggestion, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border animate-in slide-in-from-left-2 duration-300 ${getPriorityColor(suggestion.priority)}`}
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <p className="text-sm font-medium">{suggestion.title}</p>
                      <p className="text-xs mt-0.5 opacity-80">{suggestion.description}</p>
                    </div>
                  ))}
                  {/* Placeholder skeletons while typing */}
                  {typingPhase === "suggestions" && analysis.suggestions.slice(visibleSuggestions).map((_, idx) => (
                    <div key={`skeleton-${idx}`} className="p-3 rounded-lg border bg-gray-50 border-gray-200 animate-pulse">
                      <div className="h-3 bg-gray-200 rounded w-32 mb-1" />
                      <div className="h-2 bg-gray-100 rounded w-48" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
