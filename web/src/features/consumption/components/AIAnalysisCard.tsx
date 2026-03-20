"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { Sparkles, TrendingUp, TrendingDown, AlertCircle, Lightbulb, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";

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

export function AIAnalysisCard({ transactions, budgets, className = "" }: AIAnalysisCardProps) {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  async function handleAnalyze() {
    setLoading(true);
    setError(null);

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
      setHasAnalyzed(true);
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center animate-pulse">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">AI 智能分析</h3>
              <p className="text-sm text-gray-500">正在分析您的消费数据...</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-gray-100 rounded animate-pulse w-1/2" />
            <div className="h-20 bg-gray-100 rounded animate-pulse mt-4" />
          </div>
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

        {/* Summary */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 mb-4">
          <p className="text-sm text-gray-700">{analysis.summary}</p>
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

        {/* Expanded Content */}
        {expanded && (
          <div className="space-y-4 pt-2 border-t border-gray-100">
            {/* Insights */}
            {analysis.insights.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  关键洞察
                </h4>
                <div className="space-y-2">
                  {analysis.insights.map((insight, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                      {getInsightIcon(insight.type)}
                      <div>
                        <p className="text-sm font-medium text-gray-800">{insight.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{insight.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {analysis.suggestions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  优化建议
                </h4>
                <div className="space-y-2">
                  {analysis.suggestions.map((suggestion, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border ${getPriorityColor(suggestion.priority)}`}
                    >
                      <p className="text-sm font-medium">{suggestion.title}</p>
                      <p className="text-xs mt-0.5 opacity-80">{suggestion.description}</p>
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
