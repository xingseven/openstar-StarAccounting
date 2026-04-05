"use client";

import { useMemo } from "react";
import {
  Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { cn, formatCurrency } from "@/lib/utils";
import { DelayedRender } from "@/components/shared/DelayedRender";
import { WhiteGridLoadingShell } from "./WhiteGridLoadingShell";
import type { DashboardData } from "@/types";
import { MoreHorizontal, User, Smartphone, Monitor, ShieldCheck, ChevronDown, CheckCircle2, Plus, ArrowRight, CircleDashed, LayoutGrid, Music } from "lucide-react";

/* ─── Palette ─── */
const NAVY        = "#31465F";
const SLATE_LIGHT = "#9EAAB9";
const SLATE_SUPER_LIGHT = "#E1E5EB";
const BG          = "#EBEFF3";
const CARD_BG     = "#F8F9FA";

const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

/* ─── Component ─── */
export function WhiteGridDashboard({ data, loading }: { data: DashboardData; loading?: boolean }) {
  if (loading) return <WhiteGridLoadingShell />;

  const monthBalance = data.monthIncome - data.monthExpense;

  /* derived data */
  const sixMonth = useMemo(() => {
    const idx = new Date().getMonth();
    return Array.from({ length: 4 }, (_, i) => {
      const m = (idx - (3 - i) + 12) % 12;
      const ratio = 0.6 + i * 0.1;
      return {
        name: ["Sun", "Mon", "Tue", "Wed"][i % 4],
        income: Math.round(data.monthIncome * ratio),
        expense: Math.round(data.monthExpense * ratio),
      };
    });
  }, [data.monthIncome, data.monthExpense]);

  const categories = useMemo(() => {
    const map = new Map<string, number>();
    data.recentTransactions.filter(t => t.type === "EXPENSE").forEach(t => {
      const k = t.category || "Other";
      map.set(k, (map.get(k) ?? 0) + Number(t.amount));
    });
    const sorted = [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
    if (sorted.length === 0) return [
      { name: "Housing", value: 45, pct: 45 },
      { name: "Salary", value: 30, pct: 30 },
      { name: "Other", value: 25, pct: 25 },
    ];
    const total = sorted.reduce((s,[,v]) => s + v, 0);
    return sorted.map(([name, value]) => ({
      name, value,
      pct: Math.round(value / total * 100),
    }));
  }, [data.recentTransactions]);

  const Card = ({ children, className }: { children:React.ReactNode; className?:string }) => (
    <div className={cn("rounded-[32px] bg-white p-6 shadow-[0_4px_24px_rgba(185,196,209,0.5)] border border-white", className)}>
      {children}
    </div>
  );

  const Header = ({ title, showAction = true, btnText }: { title:string; showAction?:boolean; btnText?:string }) => (
    <div className="mb-4 flex items-center justify-between">
      <h3 className="text-[17px] font-black tracking-tight text-[#232E3E]">{title}</h3>
      {showAction && (
        btnText ? (
          <button className="flex items-center gap-1 rounded-full bg-[#F2F4F7] px-3 py-1.5 text-[11px] font-bold text-[#8D98A9] hover:bg-[#E2E7ED] transition">
            {btnText} <ChevronDown className="h-3 w-3 ml-1" />
          </button>
        ) : (
          <button className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F2F4F7] text-[#8D98A9] hover:bg-[#E2E7ED] transition">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        )
      )}
    </div>
  );

  return (
    <div className="space-y-4 lg:space-y-6 min-h-screen p-0 font-sans text-[#232E3E]">
      <div className="mb-2 hidden lg:flex items-center justify-between">
        <h2 className="text-[28px] font-black tracking-tight">Dashboard</h2>
      </div>

      {/* ══════════════════════════════════
          ROW 1 — 4 Cards (Caanycnsy, Jueets, Fallt, Puell duty)
      ══════════════════════════════════ */}
      <DelayedRender delay={0}>
        <div className="grid grid-cols-2 gap-4 lg:gap-6 lg:grid-cols-4">
          <Card className="flex flex-col justify-between">
            <Header title="Caanycnsy" />
            <div className="mt-2">
              <p className="text-[38px] font-black leading-none tracking-tighter font-numbers text-[#232E3E]">
                {formatCurrency(data.totalAssets, { compact:true, withSymbol:false }).replace('K', '')}
              </p>
            </div>
            <div className="mt-4">
              <p className="text-[12px] font-black text-[#232E3E]">12.28 PM</p>
              <p className="mt-1 text-[10px] font-bold text-[#A6B3C4] leading-tight">Decent actual data do not bind by place.<br/>Measurements note without tempo.</p>
            </div>
          </Card>

          <Card className="flex flex-col justify-between">
            <Header title="Jueets" />
            <div className="mt-2 flex items-baseline">
              <p className="text-[38px] font-black leading-none tracking-tighter font-numbers text-[#232E3E]">
                {formatCurrency(monthBalance, { compact:true, withSymbol:false }).replace('K', '')}
              </p>
              <span className="text-[18px] font-black text-[#232E3E] ml-1">9</span>
            </div>
            <div className="mt-4">
              <p className="text-[12px] font-black text-[#232E3E]">$2.55 PM</p>
              <p className="mt-1 text-[10px] font-bold text-[#A6B3C4]">28th - 28/23</p>
            </div>
          </Card>

          <Card className="flex flex-col justify-between">
            <Header title="Fallt" />
            <div className="mt-2 flex items-baseline">
              <p className="text-[38px] font-black leading-none tracking-tighter font-numbers text-[#232E3E]">150</p>
              <span className="text-[20px] font-black text-[#232E3E] ml-1">%</span>
            </div>
            <p className="text-[10px] font-bold text-[#A6B3C4] mt-1">Total Cleans</p>
            <div className="mt-5 flex gap-3">
              <button className="flex-1 rounded-full bg-[#31465F] py-2 text-[12px] font-bold text-white shadow-md">Main</button>
              <button className="flex-1 rounded-full bg-[#F2F4F7] py-2 text-[12px] font-bold text-[#8D98A9]">Factoul</button>
            </div>
          </Card>

          <Card className="flex flex-col relative">
            <Header title="Puell duty" btnText="Pegi" />
            <div className="flex-1 flex items-center justify-center -mt-2">
              <div className="relative h-28 w-28">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={[{v:75},{v:15},{v:10}]} innerRadius="72%" outerRadius="90%" dataKey="v" stroke="none" startAngle={90} endAngle={450}>
                      <Cell fill={NAVY} />
                      <Cell fill={SLATE_SUPER_LIGHT} />
                      <Cell fill={SLATE_LIGHT} />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="absolute top-24 left-4 text-center">
              <p className="text-[10px] font-bold text-[#232E3E]">1.4K</p>
              <p className="text-[9px] font-bold text-[#A6B3C4]">Meror</p>
            </div>
            <div className="absolute bottom-8 right-6 text-center">
              <p className="text-[10px] font-bold text-[#232E3E]">3K</p>
              <p className="text-[9px] font-bold text-[#A6B3C4]">Narg</p>
            </div>
          </Card>
        </div>
      </DelayedRender>

      {/* ══════════════════════════════════
          ROW 2 — Bashboars (Pie), Stoucation (Bar), Groexcts (List)
      ══════════════════════════════════ */}
      <DelayedRender delay={20}>
        <div className="grid grid-cols-1 gap-4 lg:gap-6 lg:grid-cols-[1.8fr_0.9fr_1fr]">
          {/* Pie with Lines */}
          <Card className="flex flex-col relative overflow-hidden">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[17px] font-black tracking-tight text-[#232E3E]">Bashboars</h3>
              <button className="rounded-full bg-[#31465F] px-5 py-2 text-[12px] font-bold text-white shadow-md">Salk</button>
            </div>
            <div className="flex flex-1 items-center relative pl-8">
              {/* Decorative line from pie to right list */}
              <div className="absolute right-[140px] top-1/2 h-[1px] w-12 bg-[#8D98A9]" />
              <div className="absolute left-[30px] top-1/2 h-[1px] w-12 bg-[#8D98A9]" />
              
              <div className="relative h-40 w-40 z-10 mx-10">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categories} innerRadius={0} outerRadius="95%" dataKey="value" stroke="none">
                      <Cell fill={NAVY} />
                      <Cell fill={SLATE_LIGHT} />
                      <Cell fill={SLATE_SUPER_LIGHT} />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col justify-center gap-4 ml-8 z-10 bg-white/50 rounded-2xl py-2 px-4 backdrop-blur-sm shadow-[0_4px_16px_rgba(185,196,209,0.2)]">
                {categories.map((c, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: [NAVY, SLATE_LIGHT, SLATE_SUPER_LIGHT][i % 3] }} />
                    <span className="text-[13px] font-black text-[#232E3E] font-numbers">{c.pct}% <span className="text-[#A6B3C4] text-[11px] ml-1">{c.name.substring(0,3)}</span></span>
                  </div>
                ))}
              </div>
              
              <div className="absolute left-[10px] top-1/2 -translate-y-1/2 z-10 bg-white/50 backdrop-blur-sm px-2 py-1 rounded shadow-[0_4px_16px_rgba(185,196,209,0.2)]">
                 <span className="text-[9px] font-bold text-[#A6B3C4]">Reamor</span>
              </div>
              <div className="absolute right-[110px] top-[48%] z-10 bg-white/50 backdrop-blur-sm px-2 py-1 rounded shadow-[0_4px_16px_rgba(185,196,209,0.2)]">
                 <span className="text-[9px] font-bold text-[#A6B3C4]">A-Stoad</span>
              </div>
            </div>
          </Card>

          {/* Stoucation (Bar) */}
          <Card>
            <Header title="Stoucation" btnText="Pegi" />
            <div className="h-[140px] mt-4 relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sixMonth} barGap={-16} margin={{ top:0, right:0, left:0, bottom:0 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill:SLATE_LIGHT, fontSize:10, fontWeight:700}} dy={10} />
                  <Tooltip cursor={{fill:"transparent"}} contentStyle={{borderRadius:16, border:"none", boxShadow:"0 10px 40px rgba(0,0,0,0.1)"}} />
                  {/* Thick Pill Bars: one light, one dark overlapping */}
                  <Bar dataKey="income" fill={SLATE_SUPER_LIGHT} radius={[12,12,12,12]} barSize={20} />
                  <Bar dataKey="expense" fill={NAVY} radius={[12,12,12,12]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Groexcts (List) */}
          <Card>
            <Header title="Groexcts" btnText="Pegi" />
            <div className="space-y-4 mt-6">
              {[
                { icon: Monitor, title: "Nerlenps", sub: "Polere Eu Swan", val: 284 },
                { icon: ShieldCheck, title: "Atoia Nontion", sub: "Cents No Funtartion", val: 325 },
                { icon: CircleDashed, title: "Howilfesh", sub: "Dunro Ala Sylerivon", val: 533, light: true },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px]", item.light ? "bg-[#F2F4F7] text-[#8D98A9]" : "bg-[#31465F] text-white shadow-md")}>
                      <item.icon className="h-5 w-5" strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className="text-[13px] font-black text-[#232E3E] leading-tight">{item.title}</p>
                      <p className="text-[10px] font-bold text-[#A6B3C4] leading-tight mt-0.5 tracking-tight">{item.sub}</p>
                    </div>
                  </div>
                  <span className="text-[13px] font-black text-[#232E3E] font-numbers ml-2">{item.val}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </DelayedRender>

      {/* ══════════════════════════════════
          ROW 3 — Munlirouters (Avatars), Poel daion (Horiz Bars), Stedigts (Thin bars)
      ══════════════════════════════════ */}
      <DelayedRender delay={40}>
        <div className="grid grid-cols-1 gap-4 lg:gap-6 lg:grid-cols-[1.8fr_0.9fr_1fr]">
          {/* Munlirouters */}
          <Card>
            <Header title="Munlirouters" btnText="Ounedcare" />
            <div className="space-y-4 mt-4">
              {["Harlis palcets", "Harlis palcets", "Harlis palcets"].map((name, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-[20px] hover:bg-[#F2F4F7] transition">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E2E7ED]">
                      <User className="h-5 w-5 text-[#8D98A9]" />
                    </div>
                    <span className="text-[13px] font-black text-[#232E3E]">{name}</span>
                  </div>
                  <button className="rounded-full bg-[#31465F] px-6 py-2.5 text-[11px] font-bold text-white shadow-sm w-24">
                    {["Mankilt", "Megplaz", "Sucmer"][i]}
                  </button>
                </div>
              ))}
            </div>
          </Card>

          {/* Poel daion (Horizontal bars) */}
          <Card>
            <Header title="Poel daion" btnText="Pegi" />
            <div className="flex flex-col justify-between h-[150px] mt-4">
              {[
                { label: "1st", val: 80 },
                { label: "2nd", val: 65 },
                { label: "3rd", val: 90 },
                { label: "4th", val: 40 },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-5 text-[10px] font-bold text-[#A6B3C4] text-right">{item.label}</span>
                  <div className="h-2.5 flex-1 rounded-full bg-[#F2F4F7] overflow-hidden flex">
                    <div className="h-full rounded-full bg-[#31465F]" style={{ width: `${item.val}%` }} />
                    <div className="h-full rounded-full bg-[#B9C4D1] ml-1" style={{ width: `${100 - item.val - 10}%` }} />
                  </div>
                </div>
              ))}
              <div className="flex justify-between pl-8 pr-2 mt-1">
                {[1,2,10,19,10].map((n, i) => <span key={i} className="text-[9px] font-bold text-[#A6B3C4]">{n}</span>)}
              </div>
            </div>
          </Card>

          {/* Stedigts (Multi-Bar) */}
          <Card>
            <Header title="Stedigts" btnText="Pegi" />
            <div className="h-[150px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sixMonth.concat([{name:'Thu',income:3000,expense:2000},{name:'Fri',income:5000,expense:4000}])} barGap={2} margin={{ top:0, right:0, left:-24, bottom:0 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill:SLATE_LIGHT, fontSize:9, fontWeight:700}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill:SLATE_LIGHT, fontSize:9, fontWeight:700}} tickFormatter={(v)=>v>0?`${v/1000}k`:''} />
                  <Tooltip cursor={{fill:"transparent"}} contentStyle={{borderRadius:16, border:"none", boxShadow:"0 10px 40px rgba(0,0,0,0.1)"}} />
                  <Bar dataKey="income" fill={NAVY} radius={[4,4,0,0]} barSize={6} />
                  <Bar dataKey="expense" fill={SLATE_LIGHT} radius={[4,4,0,0]} barSize={6} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </DelayedRender>
    </div>
  );
}
