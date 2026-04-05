"use client";

import { useMemo } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid,
  Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { cn, formatCurrency } from "@/lib/utils";
import { DelayedRender } from "@/components/shared/DelayedRender";
import { DustyBlueLoadingShell } from "./DustyBlueLoadingShell";
import type { DashboardData } from "@/types";

/* ─── Palette ─── */
const DARK_SLATE  = "#5D728F";
const MEDIUM_SLATE = "#8CA2BA";
const LIGHT_SLATE = "#C6D4E1";
const ACCENT_DARK = "#293A4C";
const APP_BG      = "#F0F4F8";

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

function buildDailyLine(income: number) {
  const base = Math.max(income / 30, 100);
  return Array.from({ length: 12 }, (_, i) => ({
    name: MONTH_LABELS[(new Date().getMonth() - 11 + i + 12) % 12] || String(i + 1),
    val1: Math.round(base * (0.5 + Math.sin(i * 0.8) * 0.4 + Math.random() * 0.2)),
    val2: Math.round(base * (0.3 + Math.cos(i * 0.6) * 0.3 + Math.random() * 0.1)),
  }));
}

/* ─── Component ─── */
export function DustyBlueDashboard({ data, loading }: { data: DashboardData; loading?: boolean }) {
  if (loading) return <DustyBlueLoadingShell />;

  /* derived data */
  const sixMonth = useMemo(
    () => buildSixMonth(data.monthIncome, data.monthExpense, data.lastMonthIncome, data.lastMonthExpense),
    [data.monthIncome, data.monthExpense, data.lastMonthIncome, data.lastMonthExpense],
  );
  const daily = useMemo(() => buildDailyLine(data.monthIncome), [data.monthIncome]);

  /* top categories */
  const categories = useMemo(() => {
    const map = new Map<string, number>();
    data.recentTransactions.filter(t => t.type === "EXPENSE").forEach(t => {
      const k = t.category || "Other";
      map.set(k, (map.get(k) ?? 0) + Number(t.amount));
    });
    const sorted = [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
    if (sorted.length === 0) return [
      { name: "Salary", value: 50, pct: 50 },
      { name: "Driver", value: 30, pct: 30 },
      { name: "Food",   value: 20, pct: 20 },
    ];
    return sorted.map(([name, value]) => ({
      name,
      value,
      pct: Math.round((value / sorted.reduce((s, [, v]) => s + v, 0)) * 100),
    }));
  }, [data.recentTransactions]);

  /* ── shared props ── */
  const xAxis = { axisLine:false, tickLine:false, tick:{ fill:"#8CA2BA", fontSize:11, fontWeight:600 }, dy:8 };
  const yAxis = {
    axisLine:false, tickLine:false,
    tick:{ fill:"#8CA2BA", fontSize:10, fontWeight:600 }, dx:-4, width:32,
    tickFormatter:(v:number)=> v >= 1000 ? `${(v/1000).toFixed(0)}k` : String(v),
  };
  const tooltipStyle = { borderRadius:12, border:"none", boxShadow:"0 8px 30px rgba(93,114,143,0.15)", fontSize:12 };

  /* ── Card wrapper ── */
  const Card = ({ children, className, style }: { children:React.ReactNode; className?:string; style?:React.CSSProperties }) => (
    <div
      className={cn("rounded-[28px] bg-white p-5 lg:p-6", className)}
      style={{
        boxShadow: "0 10px 40px rgba(125,140,159,0.1)",
        ...style
      }}
    >
      {children}
    </div>
  );

  const SectionTitle = ({ title, action }: { title:string; action?:boolean }) => (
    <div className="mb-4 flex items-center justify-between">
      <h3 className="text-[16px] font-bold text-[#293A4C]">{title}</h3>
      {action && (
        <button className="flex items-center gap-1 rounded-full bg-[#F0F4F8] px-3 py-1.5 text-[11px] font-bold text-[#5D728F] hover:bg-[#E2E8F0] transition">
          Sort <span className="text-[9px]">▼</span>
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-4 lg:space-y-6 bg-transparent min-h-screen p-0 font-sans">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-[22px] font-extrabold tracking-tight text-[#293A4C]">Dashbags</h2>
      </div>

      {/* ══════════════════════════════════
          ROW 1 — 3 columns (Dark Rings, Light Bars, Wide Table)
      ══════════════════════════════════ */}
      <DelayedRender delay={0}>
        <div className="grid grid-cols-1 gap-4 lg:gap-6 lg:grid-cols-[1.2fr_1fr_1.8fr]">
          {/* Card 1: Key Metrics (Dark Slate with 2 Rings) */}
          <Card
            className="flex flex-col relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #6C829E 0%, #4A5F7A 100%)",
              boxShadow: "0 12px 30px rgba(74,95,122,0.3)"
            }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-white">Key Metrics</h3>
              <button className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-white/30 transition backdrop-blur-md">
                Sort <span className="text-[9px]">▼</span>
              </button>
            </div>
            <div className="flex flex-1 items-center justify-center gap-8">
              {/* Ring 1 */}
              <div className="relative h-[110px] w-[110px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={[{ value: 58 }, { value: 42 }]} innerRadius="70%" outerRadius="100%" dataKey="value" stroke="none">
                      <Cell fill="#ffffff" />
                      <Cell fill="rgba(255,255,255,0.2)" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[24px] font-bold text-white font-numbers">58%</span>
                </div>
              </div>
              {/* Ring 2 */}
              <div className="relative h-[110px] w-[110px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={[{ value: 56 }, { value: 44 }]} innerRadius="70%" outerRadius="100%" dataKey="value" stroke="none">
                      <Cell fill="#9DB1C8" />
                      <Cell fill="rgba(255,255,255,0.2)" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[24px] font-bold text-white font-numbers">56%</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Card 2: Bar + Horizontal Progress */}
          <Card className="flex flex-col">
            <SectionTitle title="Key Metrics" action />
            <div className="flex h-[120px] items-end justify-between mt-2">
              <div className="h-full w-[55%]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sixMonth.slice(-5)} barGap={2} margin={{ top:0, right:0, left:0, bottom:0 }}>
                    <XAxis dataKey="name" {...xAxis} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={tooltipStyle} cursor={{fill:"transparent"}} />
                    <Bar dataKey="income" fill={DARK_SLATE} radius={[4,4,0,0]} barSize={6} />
                    <Bar dataKey="expense" fill={LIGHT_SLATE} radius={[4,4,0,0]} barSize={6} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex h-full w-[40%] flex-col justify-center space-y-3">
                {[70, 45, 20, 85].map((val, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-3 text-[10px] font-bold text-[#8CA2BA]">x{i}</span>
                    <div className="h-2 flex-1 rounded-full bg-[#F0F4F8]">
                      <div className="h-full rounded-full" style={{ width: `${val}%`, backgroundColor: i%2===0 ? DARK_SLATE : MEDIUM_SLATE }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Card 3: Soctitums (Table) */}
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-[#293A4C]">Soctitums</h3>
              <div className="flex gap-2">
                <button className="flex items-center gap-1 rounded-full bg-[#F0F4F8] px-3 py-1.5 text-[11px] font-bold text-[#5D728F]">Search <span className="text-[9px]">▼</span></button>
              </div>
            </div>
            <table className="w-full text-left text-[12px]">
              <thead>
                <tr className="border-b border-[#F0F4F8]">
                  <th className="pb-2 font-bold text-[#8CA2BA]">Name</th>
                  <th className="pb-2 font-bold text-[#8CA2BA]">Comadry</th>
                  <th className="pb-2 font-bold text-[#8CA2BA]">Sertilery</th>
                  <th className="pb-2 font-bold text-[#8CA2BA]">Aopilhe</th>
                </tr>
              </thead>
              <tbody>
                {["Hamral", "Pemaga Dook", "Parsoive Dook"].map((name, i) => (
                  <tr key={i} className="border-b border-[#F0F4F8]/50 last:border-0">
                    <td className="py-3 font-bold text-[#5D728F]">{name}</td>
                    <td className="py-3 text-[#293A4C] font-semibold">211,0004</td>
                    <td className="py-3 text-[#293A4C] font-semibold">121,3004</td>
                    <td className="py-3 text-[#293A4C] font-semibold">415,0003</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      </DelayedRender>

      {/* ══════════════════════════════════
          ROW 2 — 4 columns (Pie, Area, Donut, Med-Slate Donut)
      ══════════════════════════════════ */}
      <DelayedRender delay={20}>
        <div className="grid grid-cols-1 gap-4 lg:gap-6 lg:grid-cols-4">
          {/* Card 1: Nonesyer Pie */}
          <Card>
            <SectionTitle title="Nonesyer" action />
            <div className="flex h-[120px] items-center mt-2">
              <div className="h-full w-[50%]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categories} innerRadius={0} outerRadius="90%" dataKey="value" stroke="none">
                      {categories.map((_, i) => <Cell key={i} fill={[ACCENT_DARK, DARK_SLATE, LIGHT_SLATE][i%3]} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-[50%] pl-2 space-y-2">
                {categories.slice(0,3).map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: [ACCENT_DARK, DARK_SLATE, LIGHT_SLATE][i%3] }} />
                    <span className="text-[11px] font-bold text-[#5D728F] truncate">{c.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Card 2: Proivels Area */}
          <Card>
            <SectionTitle title="Proivels" action />
            <div className="h-[120px] mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={daily.slice(0, 6)} margin={{ top:0, right:0, left:-20, bottom:0 }}>
                  <defs>
                    <linearGradient id="dbGrad1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={DARK_SLATE} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={DARK_SLATE} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="dbGrad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={LIGHT_SLATE} stopOpacity={0.4}/>
                      <stop offset="95%" stopColor={LIGHT_SLATE} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" {...xAxis} />
                  <YAxis {...yAxis} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="val1" stroke={DARK_SLATE} strokeWidth={2} fill="url(#dbGrad1)" />
                  <Area type="monotone" dataKey="val2" stroke={MEDIUM_SLATE} strokeWidth={2} fill="url(#dbGrad2)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Card 3: Edaal Sluds Donut */}
          <Card>
            <SectionTitle title="Edaal Sluds" action />
            <div className="flex h-[120px] items-center mt-2">
              <div className="h-full w-[50%]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={[{v:60},{v:40}]} innerRadius="60%" outerRadius="90%" dataKey="v" stroke="none">
                      <Cell fill={DARK_SLATE} />
                      <Cell fill={LIGHT_SLATE} />
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-[50%] pl-2 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#5D728F]" />
                  <span className="text-[11px] font-bold text-[#5D728F]">Huey Solidory</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#C6D4E1]" />
                  <span className="text-[11px] font-bold text-[#5D728F]">Sartily</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#8CA2BA]" />
                  <span className="text-[11px] font-bold text-[#5D728F]">Cemming</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Card 4: Medium Slate Donut */}
          <Card
            className="flex flex-col"
            style={{ background: MEDIUM_SLATE }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-white">Coltors</h3>
              <button className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-white/30 transition">
                Sort <span className="text-[9px]">▼</span>
              </button>
            </div>
            <div className="flex h-[120px] items-center">
              <div className="h-full w-[50%]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={[{v:40},{v:30},{v:30}]} innerRadius="60%" outerRadius="90%" dataKey="v" stroke="none">
                      <Cell fill={ACCENT_DARK} />
                      <Cell fill="#ffffff" />
                      <Cell fill={LIGHT_SLATE} />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-[50%] pl-2 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#293A4C]" />
                  <span className="text-[10px] font-bold text-white">Culcure</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-white" />
                  <span className="text-[10px] font-bold text-white">Astormant</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#C6D4E1]" />
                  <span className="text-[10px] font-bold text-white">Gohary</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </DelayedRender>

      {/* ══════════════════════════════════
          ROW 3 — 3 columns (Bars, Horiz Progress, Wide Area)
      ══════════════════════════════════ */}
      <DelayedRender delay={40}>
        <div className="grid grid-cols-1 gap-4 lg:gap-6 lg:grid-cols-[1fr_1fr_2fr]">
          {/* Card 1: Crantapity (Bars) */}
          <Card>
            <SectionTitle title="Crantapity" action />
            <div className="h-[140px] mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sixMonth} barGap={4} margin={{ top:0, right:0, left:0, bottom:0 }}>
                  <XAxis dataKey="name" {...xAxis} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{fill:"transparent"}} />
                  <Bar dataKey="income" fill={DARK_SLATE} radius={[4,4,0,0]} barSize={8} />
                  <Bar dataKey="expense" fill={LIGHT_SLATE} radius={[4,4,0,0]} barSize={8} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Card 2: Horiz Progress */}
          <Card>
            <SectionTitle title="Sevidems" action />
            <div className="h-[140px] mt-2 flex flex-col justify-between">
              {[80, 60, 40, 20].map((val, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="w-4 text-[11px] font-bold text-[#8CA2BA]">{i+1}</span>
                  <div className="h-3 flex-1 mx-3 rounded-full bg-[#F0F4F8]">
                    <div className="h-full rounded-full" style={{ width: `${val}%`, backgroundColor: DARK_SLATE }} />
                  </div>
                  <span className="text-[11px] font-bold text-[#8CA2BA]">{val*3} Atm</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Card 3: Canples (Wide Area) */}
          <Card>
            <SectionTitle title="Canples" />
            <div className="h-[140px] mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={daily} margin={{ top:0, right:0, left:-20, bottom:0 }}>
                  <defs>
                    <linearGradient id="dbGrad3" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={DARK_SLATE} stopOpacity={0.2}/>
                      <stop offset="95%" stopColor={DARK_SLATE} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F4F8" />
                  <XAxis dataKey="name" {...xAxis} />
                  <YAxis {...yAxis} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="val1" stroke={DARK_SLATE} strokeWidth={2.5} fill="url(#dbGrad3)" />
                  <Area type="monotone" dataKey="val2" stroke={MEDIUM_SLATE} strokeWidth={2} fill="transparent" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </DelayedRender>
    </div>
  );
}
