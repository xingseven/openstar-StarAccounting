"use client";

import { useMemo } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid,
  Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { cn, formatCurrency } from "@/lib/utils";
import { DelayedRender } from "@/components/shared/DelayedRender";
import { VibrantLoadingShell } from "./VibrantLoadingShell";
import type { DashboardData } from "@/types";

/* ─── Palette ─── */
const BLUE   = "#0062FF";
const ORANGE = "#FF6B00";
const TEAL   = "#00C48C";
const YELLOW = "#FFD700";
const DARK   = "#111827";
const GRAY   = "#9CA3AF";

const PIE_COLORS = [BLUE, TEAL, YELLOW, ORANGE];
const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

/* ─── Helpers ─── */
function buildSixMonth(income: number, expense: number, lastIncome: number, lastExpense: number) {
  const idx = new Date().getMonth();
  return Array.from({ length: 6 }, (_, i) => {
    const m = (idx - (5 - i) + 12) % 12;
    const ratio = 0.5 + i * 0.1 + Math.sin(i) * 0.2;
    return {
      name: MONTH_LABELS[m],
      income:  Math.round((i === 5 ? income  : (lastIncome  || income  * 0.8)) * ratio),
      expense: Math.round((i === 5 ? expense : (lastExpense || expense * 0.8)) * ratio),
    };
  });
}

function buildWeekly(income: number) {
  const labels = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const base = Math.max(income / 7, 200);
  return labels.map((name, i) => ({
    name,
    v1: Math.round(base * (0.4 + Math.random() * 0.8)),
    v2: Math.round(base * (0.3 + Math.random() * 0.7)),
    v3: Math.round(base * (0.2 + Math.random() * 0.5)),
  }));
}

function buildDailyLine(income: number, expense: number) {
  const baseI = Math.max(income / 30, 100);
  const baseE = Math.max(expense / 30, 80);
  return Array.from({ length: 12 }, (_, i) => ({
    name: MONTH_LABELS[(new Date().getMonth() - 11 + i + 12) % 12] || String(i + 1),
    income:  Math.round(baseI * (0.6 + Math.sin(i * 0.7) * 0.4 + Math.random() * 0.2)),
    expense: Math.round(baseE * (0.4 + Math.cos(i * 0.5) * 0.3 + Math.random() * 0.2)),
  }));
}

/* ─── Component ─── */
export function VibrantDashboard({ data, loading }: { data: DashboardData; loading?: boolean }) {
  if (loading) return <VibrantLoadingShell />;

  /* derived data */
  const sixMonth = useMemo(
    () => buildSixMonth(data.monthIncome, data.monthExpense, data.lastMonthIncome, data.lastMonthExpense),
    [data.monthIncome, data.monthExpense, data.lastMonthIncome, data.lastMonthExpense],
  );
  const weekly = useMemo(() => buildWeekly(data.monthIncome), [data.monthIncome]);
  const daily  = useMemo(() => buildDailyLine(data.monthIncome, data.monthExpense), [data.monthIncome, data.monthExpense]);

  /* top categories */
  const categories = useMemo(() => {
    const map = new Map<string, number>();
    data.recentTransactions.filter(t => t.type === "EXPENSE").forEach(t => {
      const k = t.category || "Other";
      map.set(k, (map.get(k) ?? 0) + Number(t.amount));
    });
    const sorted = [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
    if (sorted.length === 0) return [
      { name: "Salary", value: 45, pct: 45 },
      { name: "Housing", value: 25, pct: 25 },
      { name: "Food", value: 20, pct: 20 },
      { name: "Transport", value: 10, pct: 10 },
    ];
    const total = sorted.reduce((s,[,v]) => s + v, 0);
    return sorted.map(([name, value]) => ({
      name, value,
      pct: Math.round(value / total * 100),
    }));
  }, [data.recentTransactions]);

  const netWorth = data.totalAssets - data.totalDebt;
  const incomeChg = data.lastMonthIncome > 0 ? ((data.monthIncome - data.lastMonthIncome) / data.lastMonthIncome * 100).toFixed(1) : "0";

  /* ── shared props ── */
  const xAxis = { axisLine:false, tickLine:false, tick:{ fill:GRAY, fontSize:11, fontWeight:500 }, dy:8 };
  const yAxis = {
    axisLine:false, tickLine:false,
    tick:{ fill:GRAY, fontSize:10, fontWeight:500 }, dx:-4, width:32,
    tickFormatter:(v:number)=> v >= 1000 ? `${(v/1000).toFixed(0)}k` : String(v),
  };
  const tooltipStyle = { borderRadius:16, border:"none", boxShadow:"0 10px 40px rgba(0,0,0,0.1)", fontSize:12 };

  /* ── Wrapper ── */
  const Card = ({ children, className, style }: { children:React.ReactNode; className?:string; style?:React.CSSProperties }) => (
    <div
      className={cn("rounded-[24px] bg-white p-5 lg:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)]", className)}
      style={style}
    >
      {children}
    </div>
  );

  const SectionTitle = ({ title, sub }: { title:string; sub?:string }) => (
    <div className="mb-6 flex items-center justify-between">
      <h3 className="text-[17px] font-extrabold text-[#111827]">{title}</h3>
      {sub && <span className="text-[13px] font-semibold text-[#6B7280]">{sub}</span>}
    </div>
  );

  return (
    <div className="space-y-4 lg:space-y-6 bg-transparent min-h-screen p-0 font-sans">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-[24px] font-black tracking-tight text-[#111827]">Overview</h2>
        <div className="flex gap-2">
          <button className="rounded-full bg-white px-4 py-2 text-[13px] font-bold text-[#374151] shadow-sm hover:bg-gray-50">Filter</button>
          <button className="rounded-full bg-[#0062FF] px-4 py-2 text-[13px] font-bold text-white shadow-md hover:bg-blue-600">Export</button>
        </div>
      </div>

      {/* ══════════════════════════════════
          ROW 1 — Weekly Overview (Line), Sales (Bar), Income (Dark)
      ══════════════════════════════════ */}
      <DelayedRender delay={0}>
        <div className="grid grid-cols-1 gap-4 lg:gap-6 lg:grid-cols-[1.5fr_1fr_0.8fr]">
          {/* 1. Line Chart */}
          <Card>
            <SectionTitle title="Weekly Overview" />
            <div className="h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={daily.slice(-7)} margin={{ top:5, right:0, left:-20, bottom:0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis dataKey="name" {...xAxis} />
                  <YAxis {...yAxis} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="income" stroke={BLUE} strokeWidth={3} dot={false} activeDot={{r:6, fill:BLUE, stroke:"#fff", strokeWidth:3}} />
                  <Line type="monotone" dataKey="expense" stroke={ORANGE} strokeWidth={3} dot={false} activeDot={{r:6, fill:ORANGE, stroke:"#fff", strokeWidth:3}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* 2. Month Expense (Sales) */}
          <Card className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold text-[#6B7280]">Month Expense</span>
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-600">+15%</span>
              </div>
              <p className="mt-1 text-[28px] font-black text-[#111827] font-numbers">
                {formatCurrency(data.monthExpense, { compact:true, withSymbol:false })}
              </p>
            </div>
            <div className="h-[70px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sixMonth.slice(-4)} barGap={2} margin={{ top:0, right:0, left:0, bottom:0 }}>
                  <Tooltip contentStyle={tooltipStyle} cursor={{fill:"#F3F4F6"}} />
                  <Bar dataKey="expense" fill={BLUE} radius={[4,4,0,0]} barSize={12}>
                    {sixMonth.slice(-4).map((_, i) => (
                      <Cell key={i} fill={i === 3 ? BLUE : "#E5E7EB"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* 3. Net Worth (Dark) */}
          <Card style={{ backgroundColor: DARK, color: "white" }} className="flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10">
              <span className="text-[13px] font-bold text-gray-400">Net Worth</span>
              <p className="mt-1 text-[28px] font-black text-white font-numbers">
                {formatCurrency(netWorth, { compact:true, withSymbol:false })}
              </p>
            </div>
            <div className="relative z-10 mt-auto flex items-center justify-between">
              <span className="text-[12px] font-bold text-green-400">+{incomeChg}%</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                <span className="text-white text-[14px]">↗</span>
              </div>
            </div>
            {/* decorative circle */}
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full border-[12px] border-white/5" />
          </Card>
        </div>
      </DelayedRender>

      {/* ══════════════════════════════════
          ROW 2 — Earnings (Stacked Bar), Overview (Area)
      ══════════════════════════════════ */}
      <DelayedRender delay={20}>
        <div className="grid grid-cols-1 gap-4 lg:gap-6 lg:grid-cols-[1fr_2fr]">
          {/* Earnings */}
          <Card className="flex flex-col justify-between">
            <SectionTitle title="Earnings" sub="Weekly" />
            <div className="mb-4">
              <p className="text-[32px] font-black text-[#0062FF] font-numbers">
                {formatCurrency(data.monthIncome, { compact:true, withSymbol:true })}
              </p>
            </div>
            <div className="h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekly} margin={{ top:0, right:0, left:0, bottom:0 }}>
                  <XAxis dataKey="name" {...xAxis} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{fill:"#F3F4F6"}} />
                  <Bar dataKey="v1" stackId="a" fill={BLUE} barSize={16} radius={[0,0,4,4]} />
                  <Bar dataKey="v2" stackId="a" fill={YELLOW} />
                  <Bar dataKey="v3" stackId="a" fill={ORANGE} radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Overview Area */}
          <Card>
            <SectionTitle title="Overview" sub="Monthly" />
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={daily} margin={{ top:10, right:0, left:-20, bottom:0 }}>
                  <defs>
                    <linearGradient id="vBlue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={BLUE} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={BLUE} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="vOrange" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={ORANGE} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={ORANGE} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis dataKey="name" {...xAxis} />
                  <YAxis {...yAxis} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="income" stroke={BLUE} strokeWidth={3} fill="url(#vBlue)" />
                  <Area type="monotone" dataKey="expense" stroke={ORANGE} strokeWidth={3} fill="url(#vOrange)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </DelayedRender>

      {/* ══════════════════════════════════
          ROW 3 — Top Performers (List), Sales by Category (Donut)
      ══════════════════════════════════ */}
      <DelayedRender delay={40}>
        <div className="grid grid-cols-1 gap-4 lg:gap-6 lg:grid-cols-[1.5fr_1fr]">
          {/* Top Performers (List) */}
          <Card>
            <SectionTitle title="Top Transactions" />
            <div className="space-y-4">
              {data.recentTransactions.slice(0, 4).map((tx, i) => {
                const isIncome = tx.type === "INCOME";
                const dotColor = PIE_COLORS[i % PIE_COLORS.length];
                return (
                  <div key={tx.id} className="flex items-center justify-between rounded-2xl bg-[#F9FAFB] p-3 transition hover:bg-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full text-white font-bold shadow-sm"
                           style={{ backgroundColor: dotColor }}>
                        {(tx.category || "?").slice(0, 1)}
                      </div>
                      <div>
                        <p className="text-[14px] font-bold text-[#111827]">{tx.category || "Other"}</p>
                        <p className="text-[12px] font-semibold text-[#6B7280]">{tx.merchant || tx.platform || "N/A"}</p>
                      </div>
                    </div>
                    {/* Fake mini sparkline */}
                    <div className="h-6 w-16 hidden md:block">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={[{v:2},{v:5},{v:3},{v:7},{v:4}]}>
                          <Line type="monotone" dataKey="v" stroke={isIncome ? TEAL : ORANGE} strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="text-right">
                      <p className={cn("text-[15px] font-black font-numbers", isIncome ? "text-[#00C48C]" : "text-[#111827]")}>
                        {isIncome ? "+" : "-"}{formatCurrency(Number(tx.amount), { compact:true })}
                      </p>
                    </div>
                  </div>
                );
              })}
              {data.recentTransactions.length === 0 && (
                <div className="py-8 text-center text-gray-400 font-semibold">No transactions</div>
              )}
            </div>
          </Card>

          {/* Sales by Category (Donut) */}
          <Card className="flex flex-col">
            <SectionTitle title="Expenses by Category" />
            <div className="flex flex-1 flex-col items-center justify-center">
              <div className="relative h-[160px] w-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categories} innerRadius="65%" outerRadius="95%" paddingAngle={4} dataKey="value" stroke="none" cornerRadius={6}>
                      {categories.map((_, i) => <Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v:number) => formatCurrency(v)} contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[26px] font-black text-[#111827] font-numbers">{categories[0]?.pct || 0}%</span>
                </div>
              </div>
              <div className="mt-6 flex w-full flex-wrap justify-center gap-4 px-2">
                {categories.map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i%PIE_COLORS.length] }} />
                    <span className="text-[12px] font-bold text-[#374151]">{c.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </DelayedRender>
    </div>
  );
}
