"use client";

function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-[12px] bg-[#EAE2D9] ${className ?? ""}`} />;
}

export function CharmingPurpleLoadingShell() {
  return (
    <div className="space-y-4 lg:space-y-6 bg-transparent min-h-screen">
      <div className="mb-2 hidden lg:flex items-center justify-between">
        <Sk className="h-8 w-48" />
      </div>

      {/* Row 1 */}
      <div className="grid grid-cols-1 gap-4 lg:gap-6 lg:grid-cols-[1fr_1fr_2fr]">
        <div className="rounded-[24px] lg:rounded-[32px] p-6 space-y-4 flex flex-col justify-between" style={{ backgroundColor: "#365CA8" }}>
          <div>
            <div className="flex justify-between items-center"><Sk className="h-5 w-24 !bg-white/20" /><Sk className="h-8 w-8 !bg-white/20" /></div>
            <Sk className="h-4 w-32 mt-6 !bg-white/20" />
            <Sk className="h-4 w-40 mt-3 !bg-white/20" />
            <Sk className="h-4 w-28 mt-3 !bg-white/20" />
          </div>
          <Sk className="h-4 w-32 mt-8 !bg-white/20" />
        </div>
        <div className="rounded-[24px] lg:rounded-[32px] bg-white p-6 space-y-4">
          <div className="flex justify-between items-center"><Sk className="h-5 w-24" /><Sk className="h-8 w-8 rounded-full !rounded-full" /></div>
          <Sk className="h-[120px] w-full" />
        </div>
        <div className="rounded-[24px] lg:rounded-[32px] p-6 space-y-4" style={{ backgroundColor: "#BFE1D7" }}>
          <div className="flex justify-between items-center"><Sk className="h-5 w-24 !bg-white/40" /><Sk className="h-8 w-20 rounded-full !rounded-full !bg-white/40" /></div>
          <Sk className="h-[140px] w-full !bg-white/30" />
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 gap-4 lg:gap-6 lg:grid-cols-4">
        <div className="rounded-[24px] lg:rounded-[32px] bg-white p-6 space-y-4">
          <div className="flex justify-between items-center"><Sk className="h-5 w-24" /><Sk className="h-8 w-8 rounded-full !rounded-full" /></div>
          <Sk className="h-[140px] w-full" />
        </div>
        <div className="rounded-[24px] lg:rounded-[32px] p-6 space-y-4" style={{ backgroundColor: "#BFE1D7" }}>
          <div className="flex justify-between items-center"><Sk className="h-5 w-24 !bg-white/40" /><Sk className="h-8 w-8 rounded-full !rounded-full !bg-white/40" /></div>
          <Sk className="h-[140px] w-full !bg-white/30" />
        </div>
        <div className="rounded-[24px] lg:rounded-[32px] bg-white p-6 space-y-4">
          <div className="flex justify-between items-center"><Sk className="h-5 w-24" /><Sk className="h-8 w-8 rounded-full !rounded-full" /></div>
          <Sk className="h-[140px] w-full" />
        </div>
        <div className="rounded-[24px] lg:rounded-[32px] bg-white p-6 space-y-4">
          <div className="flex justify-between items-center"><Sk className="h-5 w-24" /><Sk className="h-8 w-8 rounded-full !rounded-full" /></div>
          <Sk className="h-[140px] w-[140px] rounded-full mx-auto !rounded-full mt-4" />
        </div>
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-1 gap-4 lg:gap-6 lg:grid-cols-[1.5fr_1.5fr_1fr]">
        <div className="rounded-[24px] lg:rounded-[32px] p-6 space-y-4" style={{ backgroundColor: "#B2A1D9" }}>
          <div className="flex justify-between items-center"><Sk className="h-5 w-24 !bg-white/30" /><Sk className="h-8 w-8 rounded-full !rounded-full !bg-white/30" /></div>
          <div className="space-y-6 mt-4">
            <Sk className="h-4 w-full !bg-white/30" />
            <Sk className="h-4 w-full !bg-white/30" />
            <Sk className="h-4 w-full !bg-white/30" />
          </div>
        </div>
        <div className="rounded-[24px] lg:rounded-[32px] bg-white p-6 space-y-4">
          <div className="flex justify-between items-center"><Sk className="h-5 w-24" /><Sk className="h-8 w-8 rounded-full !rounded-full" /></div>
          <Sk className="h-8 w-full mt-4" />
          <Sk className="h-8 w-full" />
          <Sk className="h-8 w-full" />
          <Sk className="h-8 w-full" />
        </div>
        <div className="rounded-[24px] lg:rounded-[32px] bg-white p-6 space-y-4">
          <div className="flex justify-between items-center"><Sk className="h-5 w-24" /><Sk className="h-8 w-8 rounded-full !rounded-full" /></div>
          <Sk className="h-[140px] w-full" />
        </div>
      </div>
    </div>
  );
}
