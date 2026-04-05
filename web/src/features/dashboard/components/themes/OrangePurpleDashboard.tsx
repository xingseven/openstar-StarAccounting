"use client";

import { useMemo } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid,
  Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { cn, formatCurrency } from "@/lib/utils";
import { DelayedRender } from "@/components/shared/DelayedRender";
import { OrangePurpleLoadingShell } from "./OrangePurpleLoadingShell";
import type { DashboardData } from "@/types";

/* ─── Palette ─── */
const ORANGE = "#FF6B35";
const PURPLE = "#7B61FF";
const BLUE   = "#4B9EFF";
const GREEN  = "#3CC8A0";
const RED    = "#FF4D6D";
const TEAL   = "#2DC8D4";

const BAR_COLORS = [ORANGE, PURPLE, BLUE, GREEN, RED, TEAL];
const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

/* ─── Helpers ─── */
function buildSixMonth(income: number, expense: number, lastIncome: number, lastExpense: number) {
  const idx = new Date().getMonth();
  return Array.from({ length: 6 }, (_, i) => {
    const m = (idx - (5 - i) + 12) % 12;
    const ratio = 0.6 + i * 0.08 + Math.sin(i) * 0.15;
    return {
      name: MONTH_LABELS[m],
      income:  Math.round((i === 5 ? income  : (lastIncome  || income  * 0.9)) * ratio),
      expense: Math.round((i === 5 ? expense : (lastExpense || expense * 0.9)) * ratio),
    };
  });
}

function buildWeekly(expense: number) {
  const labels = ["Sep","Oct","Tue","Wed","Thu","Fri","Mon"];
  const base = Math.max(expense / 7, 200);
  return labels.map((name) => ({
    name,
    a: Math.round(base * (0.4 + Math.random() * 0.8)),
    b: Math.round(base * (0.3 + Math.random() * 0.7)),
    c: Math.round(base * (0.2 + Math.random() * 0.5)),
  }));
}

function buildDailyLine(income: number) {
  const base = Math.max(income / 30, 100);
  return Array.from({ length: 12 }, (_, i) => ({
    name: String(i + 1),
    value: Math.round(base * (0.5 + Math.sin(i * 0.8) * 0.4 + Math.random() * 0.2)),
  }));
}

/* ─── Component ─── */
export function OrangePurpleDashboard({ data, loading }: { data: DashboardData; loading?: boolean }) {
  if (loading) return <OrangePurpleLoadingShell />;

  /* derived data */
  const sixMonth = useMemo(
    () => buildSixMonth(data.monthIncome, data.monthExpense, data.lastMonthIncome, data.lastMonthExpense),
    [data.monthIncome, data.monthExpense, data.lastMonthIncome, data.lastMonthExpense],
  );
  const weekly  = useMemo(() => buildWeekly(data.monthExpense), [data.monthExpense]);
  const daily   = useMemo(() => buildDailyLine(data.monthIncome), [data.monthIncome]);

  /* top categories for donut */
  const categories = useMemo(() => {
    const map = new Map<string, number>();
    data.recentTransactions.filter(t => t.type === "EXPENSE").forEach(t => {
      const k = t.category || "其他";
      map.set(k, (map.get(k) ?? 0) + Number(t.amount));
    });
    const sorted = [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
    if (sorted.length === 0) return [
      { name: "餐饮", value: 40, pct: 40, color: ORANGE },
      { name: "购物", value: 30, pct: 30, color: PURPLE },
      { name: "账单", value: 20, pct: 20, color: BLUE },
      { name: "其他", value: 10, pct: 10, color: GREEN },
    ];
    const total = sorted.reduce((s,[,v]) => s + v, 0);
    return sorted.map(([name, value], i) => ({
      name, value,
      pct: Math.round(value / total * 100),
      color: BAR_COLORS[i % BAR_COLORS.length],
    }));
  }, [data.recentTransactions]);

  const topPct = categories[0]?.pct ?? 0;

  const netWorth     = data.totalAssets - data.totalDebt;
  const incomeChg    = data.lastMonthIncome > 0 ? ((data.monthIncome - data.lastMonthIncome) / data.lastMonthIncome * 100).toFixed(1) : "0";
  const expenseChg   = data.lastMonthExpense > 0 ? ((data.monthExpense - data.lastMonthExpense) / data.lastMonthExpense * 100).toFixed(1) : "0";

  /* ── shared chart axis props ── */
  const xAxis = { axisLine:false, tickLine:false, tick:{ fill:"#b0b8cc", fontSize:10, fontWeight:600 }, dy:8 };
  const yAxis = {
    axisLine:false, tickLine:false,
    tick:{ fill:"#b0b8cc", fontSize:10, fontWeight:600 }, dx:-4, width:32,
    tickFormatter:(v:number)=> v >= 1000 ? `${(v/1000).toFixed(0)}k` : String(v),
  };
  const tooltipStyle = { borderRadius:10, border:"none", boxShadow:"0 4px 20px rgba(0,0,0,0.1)", fontSize:12 };

  /* ── Card wrapper ── */
  const Card = ({ children, className, style }: { children:React.ReactNode; className?:string; style?:React.CSSProperties }) => (
    <div className={cn("rounded-[18px] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)]", className)} style={style}>
      {children}
    </div>
  );

  const SectionTitle = ({ title, sub }: { title:string; sub?:string }) => (
    <div className="mb-4 flex items-center justify-between">
      <h3 className="text-[15px] font-bold text-[#1a1d2e]">{title}</h3>
      {sub && <span className="rounded-full bg-[#f1f3f9] px-3 py-1 text-[11px] font-semibold text-[#8b92a9]">{sub}</span>}
    </div>
  );

  /* ── Delta badge ── */
  const Delta = ({ val, positive, suffix = "%" }: { val: string | number; positive?: boolean; suffix?: string }) => {
    const pos = positive ?? Number(val) >= 0;
    return (
      <span className={cn("text-[11px] font-bold", pos ? "text-[#3CC8A0]" : "text-[#FF4D6D]")}>
        {Number(val) >= 0 ? "+" : ""}{val}{suffix}
      </span>
    );
  };

  return (
    <div className="space-y-4 bg-[#F7F8FC] min-h-screen p-0">
      {/* ══════════════════════════════════
          ROW 1 — 3 stat cards + mini-bar chart
      ══════════════════════════════════ */}
      <DelayedRender delay={0}>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {/* KP — Net Worth (white card) */}
          <Card>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-[#8b92a9]">KP</p>
                <p className="mt-2 text-[26px] font-extrabold leading-tight tracking-tight text-[#1a1d2e] font-numbers">
                  {formatCurrency(netWorth, { compact: true, withSymbol: false })}
                </p>
                <p className="mt-1 text-[11px] text-[#8b92a9]">净资产</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[#f0f0ff]">
                <div className="h-4 w-4 rounded-[4px] bg-[#7B61FF]" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Delta val={incomeChg} positive={Number(incomeChg) >= 0} />
              <span className="text-[10px] text-[#b0b8cc]">vs 上月</span>
            </div>
          </Card>

          {/* KB — Month Expense (orange gradient) */}
          <Card style={{ background: "linear-gradient(135deg,#FF8C5A 0%,#FF5533 100%)" }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-white/80">KB</p>
                <p className="mt-2 text-[26px] font-extrabold leading-tight tracking-tight text-white font-numbers">
                  {formatCurrency(data.monthExpense, { compact: true, withSymbol: false })}
                </p>
                <p className="mt-1 text-[11px] text-white/70">月支出</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-white/20">
                <div className="h-4 w-4 rounded-[4px] bg-white/80" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className={cn("text-[11px] font-bold", Number(expenseChg) >= 0 ? "text-red-100" : "text-green-200")}>
                {Number(expenseChg) >= 0 ? "+" : ""}{expenseChg}%
              </span>
              <span className="text-[10px] text-white/60">vs 上月</span>
            </div>
          </Card>

          {/* KPI — Month Income (purple gradient) */}
          <Card style={{ background: "linear-gradient(135deg,#9B7FFF 0%,#6B3FFF 100%)" }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-white/80">KPI</p>
                <p className="mt-2 text-[26px] font-extrabold leading-tight tracking-tight text-white font-numbers">
                  {formatCurrency(data.monthIncome, { compact: true, withSymbol: false })}
                </p>
                <p className="mt-1 text-[11px] text-white/70">月收入</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-white/20">
                <div className="h-4 w-4 rounded-[4px] bg-white/80" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className={cn("text-[11px] font-bold", Number(incomeChg) >= 0 ? "text-green-200" : "text-red-200")}>
                {Number(incomeChg) >= 0 ? "+" : ""}{incomeChg}%
              </span>
              <span className="text-[10px] text-white/60">vs 上月</span>
            </div>
          </Card>

          {/* Suepict — mini bar chart */}
          <Card>
            <SectionTitle title="支出分布" />
            <div className="h-[90px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sixMonth.slice(-4)} barGap={2} barCategoryGap="20%" margin={{ top:4, right:0, left:0, bottom:0 }}>
                  <Bar dataKey="expense" radius={[4,4,0,0]} barSize={10}>
                    {sixMonth.slice(-4).map((_, i) => (
                      <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                  <Bar dataKey="income" fill="#e8ebf4" radius={[4,4,0,0]} barSize={10} />
                  <Tooltip contentStyle={tooltipStyle} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </DelayedRender>

      {/* ══════════════════════════════════
          ROW 2 — big bar chart + donut + line
      ══════════════════════════════════ */}
      <DelayedRender delay={30}>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.8fr_0.9fr_1.3fr]">
          {/* Core — Grouped bar: income vs expense */}
          <Card>
            <SectionTitle title="收支走势" />
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sixMonth} barGap={4} barCategoryGap="28%" margin={{ top:8, right:0, left:-8, bottom:0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f1f7" />
                  <XAxis dataKey="name" {...xAxis} />
                  <YAxis {...yAxis} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="income"  name="收入" fill={ORANGE} radius={[6,6,0,0]} barSize={12} />
                  <Bar dataKey="expense" name="支出" fill={PURPLE} radius={[6,6,0,0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Donut — top category */}
          <Card className="flex flex-col items-center justify-center">
            <SectionTitle title="消费构成" />
            <div className="relative h-[160px] w-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categories}
                    innerRadius="62%"
                    outerRadius="88%"
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={6}
                  >
                    {categories.map((c, i) => <Cell key={i} fill={c.color} />)}
                  </Pie>
                  <Tooltip formatter={(v:number) => formatCurrency(v)} contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[28px] font-extrabold leading-none text-[#1a1d2e] font-numbers">{topPct}%</span>
                <span className="mt-1 text-[10px] font-semibold text-[#8b92a9]">{categories[0]?.name}</span>
              </div>
            </div>
          </Card>

          {/* Line — daily trend */}
          <Card>
            <SectionTitle title="收入曲线" sub="近期" />
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={daily} margin={{ top:8, right:0, left:-8, bottom:0 }}>
                  <defs>
                    <linearGradient id="opLineGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={PURPLE} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={PURPLE} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f1f7" />
                  <XAxis dataKey="name" {...xAxis} />
                  <YAxis {...yAxis} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="value" name="收入" stroke={PURPLE} strokeWidth={2.5} fill="url(#opLineGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </DelayedRender>

      {/* ══════════════════════════════════
          ROW 3 — transactions table + weekly bars
      ══════════════════════════════════ */}
      <DelayedRender delay={60}>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1.2fr]">
          {/* Table */}
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[15px] font-bold text-[#1a1d2e]">近期交易</h3>
              <button className="rounded-full border border-[#e8ebf4] px-4 py-1.5 text-[11px] font-bold text-[#7B61FF] hover:bg-[#f5f3ff] transition-colors">
                + 全部
              </button>
            </div>
            <table className="w-full text-left text-[12px]">
              <thead>
                <tr className="border-b border-[#f0f1f7]">
                  <th className="pb-3 font-bold text-[#b0b8cc]">分类</th>
                  <th className="pb-3 font-bold text-[#b0b8cc]">描述</th>
                  <th className="pb-3 font-bold text-[#b0b8cc]">日期</th>
                  <th className="pb-3 font-bold text-[#b0b8cc]">关联</th>
                  <th className="pb-3 text-right font-bold text-[#b0b8cc]">金额</th>
                </tr>
              </thead>
              <tbody>
                {data.recentTransactions.slice(0, 5).map((tx, i) => {
                  const isIncome = tx.type === "INCOME";
                  const colors   = [ORANGE, PURPLE, BLUE, GREEN, TEAL];
                  const dotColor = colors[i % colors.length];
                  return (
                    <tr key={tx.id} className="border-b border-[#f7f8fc] last:border-0">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-[8px] text-white text-[11px] font-bold"
                               style={{ background: dotColor }}>
                            {(tx.category || "?").slice(0, 1)}
                          </div>
                          <span className="font-semibold text-[#1a1d2e]">{tx.category || "其他"}</span>
                        </div>
                      </td>
                      <td className="py-3 text-[#8b92a9]">{tx.merchant || tx.platform || "—"}</td>
                      <td className="py-3 text-[#8b92a9]">
                        {new Date(tx.date).toLocaleDateString("zh-CN", { month:"2-digit", day:"2-digit" })}
                      </td>
                      <td className="py-3 text-[#8b92a9]">
                        {formatCurrency(Number(tx.amount) * 1.2, { compact:true })}
                      </td>
                      <td className={cn("py-3 text-right font-bold font-numbers", isIncome ? "text-[#3CC8A0]" : "text-[#FF4D6D]")}>
                        {isIncome ? "+" : "-"}{formatCurrency(Number(tx.amount), { compact:true })}
                      </td>
                    </tr>
                  );
                })}
                {data.recentTransactions.length === 0 && (
                  <tr><td colSpan={5} className="py-8 text-center text-[#b0b8cc]">暂无交易记录</td></tr>
                )}
              </tbody>
            </table>
          </Card>

          {/* Cleer Tranes — weekly multi bar */}
          <Card>
            <SectionTitle title="周度支出" sub="近7天" />
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekly} barGap={2} barCategoryGap="15%" margin={{ top:8, right:0, left:-8, bottom:0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f1f7" />
                  <XAxis dataKey="name" {...xAxis} />
                  <YAxis {...yAxis} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="a" name="支出" fill={ORANGE} radius={[4,4,0,0]} barSize={8} />
                  <Bar dataKey="b" name="收入" fill={PURPLE} radius={[4,4,0,0]} barSize={8} />
                  <Bar dataKey="c" name="结余" fill={BLUE}   radius={[4,4,0,0]} barSize={8} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </DelayedRender>
    </div>
  );
}
