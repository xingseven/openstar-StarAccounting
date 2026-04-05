"use client";

function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-[12px] bg-[#ecedf5] ${className ?? ""}`} />;
}

export function OrangePurpleLoadingShell() {
  return (
    <div className="space-y-4 bg-[#F7F8FC] min-h-screen">
      {/* Row 1 */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-[18px] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] space-y-3">
          <Sk className="h-3 w-16" />
          <Sk className="h-8 w-24" />
          <Sk className="h-2 w-12" />
        </div>
        <div className="rounded-[18px] p-5 space-y-3" style={{ background:"linear-gradient(135deg,#FF8C5A,#FF5533)" }}>
          <Sk className="h-3 w-16 !bg-white/20" />
          <Sk className="h-8 w-24 !bg-white/30" />
          <Sk className="h-2 w-12 !bg-white/20" />
        </div>
        <div className="rounded-[18px] p-5 space-y-3" style={{ background:"linear-gradient(135deg,#9B7FFF,#6B3FFF)" }}>
          <Sk className="h-3 w-16 !bg-white/20" />
          <Sk className="h-8 w-24 !bg-white/30" />
          <Sk className="h-2 w-12 !bg-white/20" />
        </div>
        <div className="rounded-[18px] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] space-y-3">
          <Sk className="h-3 w-16" />
          <Sk className="h-20 w-full" />
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.8fr_0.9fr_1.3fr]">
        <div className="rounded-[18px] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] space-y-3">
          <Sk className="h-3 w-24" />
          <Sk className="h-[220px] w-full" />
        </div>
        <div className="rounded-[18px] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] flex flex-col items-center gap-3">
          <Sk className="h-3 w-20" />
          <Sk className="h-40 w-40 rounded-full !rounded-full" />
        </div>
        <div className="rounded-[18px] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] space-y-3">
          <Sk className="h-3 w-24" />
          <Sk className="h-[220px] w-full" />
        </div>
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1.2fr]">
        <div className="rounded-[18px] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] space-y-3">
          <Sk className="h-3 w-24" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Sk key={i} className="h-10 w-full" />
          ))}
        </div>
        <div className="rounded-[18px] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] space-y-3">
          <Sk className="h-3 w-20" />
          <Sk className="h-[220px] w-full" />
        </div>
      </div>
    </div>
  );
}
