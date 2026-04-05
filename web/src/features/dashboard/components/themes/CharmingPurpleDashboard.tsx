"use client";

import { useMemo } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid,
  Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { cn, formatCurrency } from "@/lib/utils";
import { DelayedRender } from "@/components/shared/DelayedRender";
import { CharmingPurpleLoadingShell } from "./CharmingPurpleLoadingShell";
import type { DashboardData } from "@/types";
import { MoreHorizontal } from "lucide-react";

/* ─── Palette ─── */
const BLUE   = "#365CA8";
const PURPLE = "#B2A1D9";
const GREEN  = "#BFE1D7";
const GRAY   = "#8B92A9";
const DARK   = "#1A1D2E";
const MINT_DARK = "#4A9F8C";

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
      saving:  Math.round(Math.abs(income - expense) * ratio * 0.5),
    };
  });
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
export function CharmingPurpleDashboard({ data, loading }: { data: DashboardData; loading?: boolean }) {
  if (loading) return <CharmingPurpleLoadingShell />;

  /* derived data */
  const sixMonth = useMemo(
    () => buildSixMonth(data.monthIncome, data.monthExpense, data.lastMonthIncome, data.lastMonthExpense),
    [data.monthIncome, data.monthExpense, data.lastMonthIncome, data.lastMonthExpense],
  );
  const daily = useMemo(() => buildDailyLine(data.monthIncome, data.monthExpense), [data.monthIncome, data.monthExpense]);

  /* top categories */
  const categories = useMemo(() => {
    const map = new Map<string, number>();
    data.recentTransactions.filter(t => t.type === "EXPENSE").forEach(t => {
      const k = t.category || "Other";
      map.set(k, (map.get(k) ?? 0) + Number(t.amount));
    });
    const sorted = [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
    if (sorted.length === 0) return [
      { name: "Salary", value: 35, pct: 35 },
      { name: "Housing", value: 30, pct: 30 },
      { name: "Food", value: 20, pct: 20 },
      { name: "Transport", value: 15, pct: 15 },
    ];
    const total = sorted.reduce((s,[,v]) => s + v, 0);
    return sorted.map(([name, value]) => ({
      name, value,
      pct: Math.round(value / total * 100),
    }));
  }, [data.recentTransactions]);

  const netWorth = data.totalAssets - data.totalDebt;
  // 暂时屏蔽 eslint 针对 netWorth 未使用的警告，如果后续不打算在界面上使用的话：
  // 按照设计图，这张图表主要注重流量漏斗（Users/Conversion），不过我们可以直接保留它作为补充数据，或者忽略
  // 为了安全，我这里保留但确保不报错。

  /* ── shared props ── */
  const xAxis = { axisLine:false, tickLine:false, tick:{ fill:DARK, fontSize:10, fontWeight:700 }, dy:8 };
  const tooltipStyle = { borderRadius:16, border:"none", boxShadow:"0 10px 40px rgba(0,0,0,0.1)", fontSize:12 };

  /* ── Wrapper ── */
  const Card = ({ children, className, style }: { children:React.ReactNode; className?:string; style?:React.CSSProperties }) => (
    <div
      className={cn("rounded-[24px] lg:rounded-[32px] p-5 lg:p-6 shadow-sm", className)}
      style={style}
    >
      {children}
    </div>
  );

  const SectionTitle = ({ title, whiteText = false }: { title:string; whiteText?:boolean }) => (
    <div className="mb-6 flex items-center justify-between">
      <h3 className={cn("text-[17px] font-extrabold tracking-tight", whiteText ? "text-white" : "text-[#1A1D2E]")}>{title}</h3>
      <button className={cn("flex h-8 w-8 items-center justify-center rounded-full transition", whiteText ? "bg-white/20 hover:bg-white/30 text-white" : "bg-white hover:bg-gray-50 text-[#1A1D2E]")} style={!whiteText ? { boxShadow: "0 2px 10px rgba(0,0,0,0.05)" } : {}}>
        <MoreHorizontal className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <div className="space-y-4 lg:space-y-6 bg-transparent min-h-screen p-0 font-sans">
      <div className="mb-2 hidden lg:flex items-center justify-between">
        <h2 className="text-[26px] font-black tracking-tight text-[#1A1D2E]">Analytics Dashboard</h2>
      </div>

      {/* ══════════════════════════════════
          ROW 1 — Dark Blue (Stats), White (Purple Area), Mint (Blue Area)
      ══════════════════════════════════ */}
      <DelayedRender delay={0}>
        <div className="grid grid-cols-1 gap-4 lg:gap-6 lg:grid-cols-[1fr_1fr_2fr]">
          {/* 1. Deep Blue (Total Revenue) */}
          <Card className="flex flex-col justify-between" style={{ backgroundColor: BLUE, color: "white" }}>
            <div>
              <SectionTitle title="Total Revenue" whiteText />
              <div className="mt-2 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-white" />
                  <div className="h-2.5 w-16 rounded-full bg-white/80" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-white/50" />
                  <div className="h-2.5 w-24 rounded-full bg-white/40" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-white/30" />
                  <div className="h-2.5 w-20 rounded-full bg-white/20" />
                </div>
              </div>
            </div>
            <div className="mt-8 flex items-center gap-2 text-[12px] font-semibold text-white/70">
              <div className="h-2 w-2 rounded-full bg-white/80" /> Convexal-ferity
            </div>
          </Card>

          {/* 2. White (Purple Area - Active Users) */}
          <Card className="bg-white">
            <SectionTitle title="Active Users" />
            <div className="h-[120px] -mx-2 -mb-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={daily.slice(-7)} margin={{ top:5, right:0, left:0, bottom:0 }}>
                  <defs>
                    <linearGradient id="cpPurple" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={PURPLE} stopOpacity={0.6}/>
                      <stop offset="95%" stopColor={PURPLE} stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <Tooltip contentStyle={tooltipStyle} cursor={false} />
                  <Area type="monotone" dataKey="expense" stroke={PURPLE} strokeWidth={3} fill="url(#cpPurple)" />
                  <Area type="monotone" dataKey="saving" stroke={PURPLE} strokeWidth={2} strokeDasharray="4 4" fill="transparent" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* 3. Mint Green (Blue Area - Conversion Rate) */}
          <Card style={{ backgroundColor: GREEN }}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[17px] font-extrabold tracking-tight text-[#1A1D2E]">Conversion Rate</h3>
              <button className="rounded-full bg-white px-4 py-1.5 text-[12px] font-bold text-[#1A1D2E] shadow-sm">
                Direction
              </button>
            </div>
            <div className="h-[140px] -mx-4 -mb-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={daily} margin={{ top:20, right:10, left:0, bottom:0 }}>
                  <defs>
                    <linearGradient id="cpBlue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={BLUE} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={BLUE} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" {...xAxis} tick={{ fill: MINT_DARK, fontSize:10, fontWeight:700 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: MINT_DARK, fontSize:10, fontWeight:700 }} dx={-4} width={30} />
                  <Tooltip contentStyle={tooltipStyle} cursor={false} />
                  <Area type="monotone" dataKey="income" stroke={BLUE} strokeWidth={3} fill="url(#cpBlue)" activeDot={{r:5, fill:BLUE, stroke:"#fff", strokeWidth:2}} />
                  <Area type="monotone" dataKey="saving" stroke={BLUE} strokeWidth={1.5} fill="transparent" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </DelayedRender>

      {/* ══════════════════════════════════
          ROW 2 — 4 columns (White Area, Mint Bars, White Bars, White Pie)
      ══════════════════════════════════ */}
      <DelayedRender delay={20}>
        <div className="grid grid-cols-1 gap-4 lg:gap-6 lg:grid-cols-4">
          {/* 1. White Area */}
          <Card className="bg-white">
            <SectionTitle title="Active Users" />
            <div className="h-[140px] -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={daily.slice(-6)} margin={{ top:5, right:0, left:-20, bottom:0 }}>
                  <defs>
                    <linearGradient id="cpBlueLight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={BLUE} stopOpacity={0.2}/>
                      <stop offset="95%" stopColor={BLUE} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" {...xAxis} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: GRAY, fontSize:10, fontWeight:600 }} dx={-4} width={24} />
                  <Tooltip contentStyle={tooltipStyle} cursor={false} />
                  <Area type="monotone" dataKey="income" stroke={BLUE} strokeWidth={3} fill="url(#cpBlueLight)" />
                  <Area type="monotone" dataKey="saving" stroke={GREEN} strokeWidth={2} fill="transparent" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* 2. Mint Bars */}
          <Card style={{ backgroundColor: GREEN }}>
            <SectionTitle title="Conversion Rate" />
            <div className="h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sixMonth.slice(-4)} barGap={2} margin={{ top:5, right:0, left:-24, bottom:0 }}>
                  <XAxis dataKey="name" {...xAxis} tick={{ fill: MINT_DARK, fontSize:10, fontWeight:700 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: MINT_DARK, fontSize:10, fontWeight:700 }} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{fill:"rgba(255,255,255,0.2)"}} />
                  <Bar dataKey="income" fill={BLUE} radius={[6,6,0,0]} barSize={8} />
                  <Bar dataKey="saving" fill={PURPLE} radius={[6,6,0,0]} barSize={8} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* 3. White Bars */}
          <Card className="bg-white">
            <SectionTitle title="Conversion Rate" />
            <div className="h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sixMonth.slice(-4)} barGap={2} margin={{ top:5, right:0, left:-24, bottom:0 }}>
                  <XAxis dataKey="name" {...xAxis} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: GRAY, fontSize:10, fontWeight:600 }} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{fill:"#F5F0EB"}} />
                  <Bar dataKey="income" fill={BLUE} radius={[6,6,0,0]} barSize={8} />
                  <Bar dataKey="expense" fill={PURPLE} radius={[6,6,0,0]} barSize={8} />
                  <Bar dataKey="saving" fill={GREEN} radius={[6,6,0,0]} barSize={8} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* 4. White Pie */}
          <Card className="bg-white flex flex-col">
            <SectionTitle title="Seatity" />
            <div className="flex-1 flex justify-center items-center -mt-4">
              <div className="h-[140px] w-[140px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categories} innerRadius={0} outerRadius="95%" dataKey="value" stroke="#ffffff" strokeWidth={2}>
                      <Cell fill={BLUE} />
                      <Cell fill={PURPLE} />
                      <Cell fill={GREEN} />
                      <Cell fill="#D0EFE6" />
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </div>
      </DelayedRender>

      {/* ══════════════════════════════════
          ROW 3 — Purple Progress, White Table, White Calendar
      ══════════════════════════════════ */}
      <DelayedRender delay={40}>
        <div className="grid grid-cols-1 gap-4 lg:gap-6 lg:grid-cols-[1.5fr_1.5fr_1fr]">
          {/* 1. Purple Progress */}
          <Card style={{ backgroundColor: PURPLE }} className="flex flex-col justify-between">
            <SectionTitle title="Active Users" whiteText={false} />
            <div className="mt-2 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-white/40" />
                  <span className="text-[13px] font-bold text-[#1A1D2E]">User Details</span>
                </div>
                <div className="h-3 w-[45%] rounded-full bg-white/30 overflow-hidden">
                  <div className="h-full bg-white w-2/3" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-[#365CA8]" />
                  <span className="text-[13px] font-bold text-[#1A1D2E]">Moock</span>
                </div>
                <div className="h-3 w-[45%] rounded-full bg-[#365CA8]" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-white/80" />
                  <span className="text-[13px] font-bold text-[#1A1D2E]">Rask</span>
                </div>
                <div className="h-3 w-[45%] rounded-full bg-white/30 flex justify-end">
                  <div className="h-full bg-white/80 w-1/3 rounded-full" />
                </div>
              </div>
            </div>
          </Card>

          {/* 2. White Table */}
          <Card className="bg-white">
            <SectionTitle title="Contrmins" />
            <table className="w-full text-left text-[12px] font-bold">
              <thead>
                <tr className="text-[#1A1D2E] border-b-2 border-transparent">
                  <th className="pb-3 px-2">User ID</th>
                  <th className="pb-3 px-2">Name</th>
                  <th className="pb-3 px-2">Status</th>
                  <th className="pb-3 px-2 text-right">Activity</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-[#F5F0EB]">
                  <td className="py-3 px-2 rounded-l-[12px] flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" /> Nocrmes
                  </td>
                  <td className="py-3 px-2 text-[#8B92A9]">Namer</td>
                  <td className="py-3 px-2">251/2025</td>
                  <td className="py-3 px-2 text-right rounded-r-[12px]">128/2003</td>
                </tr>
                <tr>
                  <td className="py-3 px-2 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-purple-500" /> Plupepl
                  </td>
                  <td className="py-3 px-2 text-[#8B92A9]">Namer</td>
                  <td className="py-3 px-2">251/2022</td>
                  <td className="py-3 px-2 text-right">103/2003</td>
                </tr>
                <tr className="bg-[#F5F0EB]">
                  <td className="py-3 px-2 rounded-l-[12px] flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500" /> Miranbol
                  </td>
                  <td className="py-3 px-2 text-[#8B92A9]">Namer</td>
                  <td className="py-3 px-2">251/2025</td>
                  <td className="py-3 px-2 text-right rounded-r-[12px]">101/2022</td>
                </tr>
              </tbody>
            </table>
          </Card>

          {/* 3. White Calendar (Pseudo) */}
          <Card className="bg-white">
            <SectionTitle title="Sabile" />
            <div className="grid grid-cols-7 gap-y-3 gap-x-1 text-center text-[10px] font-bold mt-2">
              {['S','M','T','W','T','F','S'].map((d,i) => (
                <div key={i} className="text-[#1A1D2E]">{d}</div>
              ))}
              {[...Array(28)].map((_, i) => {
                const num = i + 1;
                const isSelected = num === 14;
                return (
                  <div key={i} className={cn(
                    "flex h-5 w-5 items-center justify-center mx-auto rounded-full",
                    isSelected ? "bg-[#365CA8] text-white" : "text-[#8B92A9] hover:bg-gray-100 cursor-pointer"
                  )}>
                    {num}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </DelayedRender>
    </div>
  );
}
