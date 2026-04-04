const fs = require('fs');

let dash = fs.readFileSync('web/src/features/dashboard/components/themes/DefaultDashboard.tsx', 'utf8');

// 1. Swap the order of sections so Stats Cards (net worth) come before Charts
const chartsSectionRegex = /(<DelayedRender delay=\{60\}>[\s\S]*?<\/DelayedRender>)\s*(<DelayedRender delay=\{100\}>[\s\S]*?<\/DelayedRender>)/;
dash = dash.replace(chartsSectionRegex, '$2\n\n      $1');

// Update delays so they animate correctly:
// Make Cards delay 40, Charts delay 80
dash = dash.replace(/<DelayedRender delay=\{100\}>/, '<DelayedRender delay={40}>');
dash = dash.replace(/<DelayedRender delay=\{60\}>/, '<DelayedRender delay={80}>');

// 2. Change the layout of the stats section to be a more modern grid on mobile
// Currently: className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
// Let's make it: Top card full width, next 2 cards 50%, last card full width.
// Or just let it be a flex or grid layout that puts the first one full width.
dash = dash.replace(
  /className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"/,
  'className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 xl:grid-cols-4"'
);

// We need to pass a special prop to OverviewSummaryCard to make the first one col-span-2 on mobile
// Wait, replacing JSX is tricky, let's just replace the exact OverviewSummaryCard calls to add className.
dash = dash.replace(
  /<OverviewSummaryCard\s+label="净资产"/,
  '<OverviewSummaryCard\n            className="col-span-2 sm:col-span-1"\n            label="净资产"'
);
dash = dash.replace(
  /<OverviewSummaryCard\s+label="预算预警"/,
  '<OverviewSummaryCard\n            className="col-span-2 sm:col-span-1"\n            label="预算预警"'
);

// Now update the OverviewSummaryCard signature to accept className
dash = dash.replace(
  /icon: LucideIcon;\n  series: MiniTrendPoint\[\];\n\}\) \{/,
  'icon: LucideIcon;\n  series: MiniTrendPoint[];\n  className?: string;\n}) {'
);
dash = dash.replace(
  /className="relative overflow-hidden rounded-\[24px\] border px-4 py-4 shadow-\[0_10px_28px_rgba\(15,23,42,0\.04\)\] sm:min-h-\[224px\] sm:px-5 sm:py-5"/,
  'className={`relative overflow-hidden rounded-[24px] border px-4 py-4 shadow-[0_10px_28px_rgba(15,23,42,0.04)] sm:min-h-[224px] sm:px-5 sm:py-5 ${className || ""}`}'
);

// 3. Update the gradient colors for "blue" (which is now Cyan) and "green" (Emerald)
// Also make the text size of the Net Worth value larger.
dash = dash.replace(
  /tone === "blue"[\s\S]*?\{[\s\S]*?background: "linear-gradient\(135deg, #2f6fed 0%, #5d98ff 100%\)",[\s\S]*?\}/,
  `tone === "blue"
      ? {
          background: "linear-gradient(135deg, #0891b2 0%, #22d3ee 100%)", // Cyan theme
          color: "#ffffff",
          iconBg: "rgba(255,255,255,0.2)",
          detailColor: "rgba(255,255,255,0.85)",
          chartLine: "rgba(255,255,255,0.9)",
          chartFill: "rgba(255,255,255,0.15)",
        }`
);

// Make the text for value conditionally larger if it's the "Net Worth" card (tone === "blue" or just generally bigger)
dash = dash.replace(
  /<p className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl"\s*style=\{\{ color: toneStyles\.color \}\}>\{value\}<\/p>/,
  '<p className={`mt-2 font-bold tracking-tight font-numbers ${tone === "blue" ? "text-3xl sm:text-[34px]" : "text-xl sm:text-2xl"}`} style={{ color: toneStyles.color }}>{value}</p>'
);

// Adjust the pr-[42%] on mobile for non-full-width cards
// The full width card (col-span-2) has enough room, but the half-width ones don't have enough room for 42% right padding and a mini chart.
// Let's use responsive padding and hide chart on very small cards
dash = dash.replace(
  /<div className="pr-\[42%\]">/,
  '<div className="relative z-10 sm:pr-[42%]">'
);
dash = dash.replace(
  /<div className="pointer-events-none absolute inset-y-4 right-3 flex w-\[44%\] items-end sm:right-4 sm:inset-y-5">/,
  '<div className="pointer-events-none absolute inset-y-4 right-3 flex w-[44%] items-end opacity-20 sm:opacity-100 sm:right-4 sm:inset-y-5">'
);

fs.writeFileSync('web/src/features/dashboard/components/themes/DefaultDashboard.tsx', dash);
console.log('Dashboard layout optimized');