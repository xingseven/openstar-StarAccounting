"use client";

function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-[12px] bg-[#E4E9F0] ${className ?? ""}`} />;
}

export function DustyBlueLoadingShell() {
  return (
    <div className="space-y-4 lg:space-y-6 bg-transparent min-h-screen">
      <div className="mb-2 flex items-center justify-between">
        <Sk className="h-6 w-32" />
      </div>

      {/* Row 1 */}
      <div className="grid grid-cols-1 gap-4 lg:gap-6 lg:grid-cols-[1.2fr_1fr_1.8fr]">
        <div className="rounded-[28px] p-6 space-y-4" style={{ background:"linear-gradient(135deg, #6C829E, #4A5F7A)" }}>
          <Sk className="h-4 w-24 !bg-white/20" />
          <div className="flex justify-center gap-8 mt-4">
            <Sk className="h-28 w-28 rounded-full !rounded-full !bg-white/20" />
            <Sk className="h-28 w-28 rounded-full !rounded-full !bg-white/20" />
          </div>
        </div>
        <div className="rounded-[28px] bg-white p-6 space-y-4">
          <Sk className="h-4 w-24" />
          <Sk className="h-[120px] w-full" />
        </div>
        <div className="rounded-[28px] bg-white p-6 space-y-4">
          <Sk className="h-4 w-24" />
          <Sk className="h-8 w-full" />
          <Sk className="h-8 w-full" />
          <Sk className="h-8 w-full" />
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 gap-4 lg:gap-6 lg:grid-cols-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-[28px] bg-white p-6 space-y-4">
            <Sk className="h-4 w-24" />
            <Sk className="h-[120px] w-full" />
          </div>
        ))}
        <div className="rounded-[28px] p-6 space-y-4" style={{ background:"#8CA2BA" }}>
          <Sk className="h-4 w-24 !bg-white/20" />
          <Sk className="h-[120px] w-full !bg-white/20" />
        </div>
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-1 gap-4 lg:gap-6 lg:grid-cols-[1fr_1fr_2fr]">
        <div className="rounded-[28px] bg-white p-6 space-y-4">
          <Sk className="h-4 w-24" />
          <Sk className="h-[140px] w-full" />
        </div>
        <div className="rounded-[28px] bg-white p-6 space-y-4">
          <Sk className="h-4 w-24" />
          <Sk className="h-8 w-full" />
          <Sk className="h-8 w-full" />
          <Sk className="h-8 w-full" />
        </div>
        <div className="rounded-[28px] bg-white p-6 space-y-4">
          <Sk className="h-4 w-24" />
          <Sk className="h-[140px] w-full" />
        </div>
      </div>
    </div>
  );
}
