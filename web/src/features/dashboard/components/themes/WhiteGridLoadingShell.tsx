"use client";

function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-[16px] bg-[#E1E5EB] ${className ?? ""}`} />;
}

export function WhiteGridLoadingShell() {
  return (
    <div className="space-y-4 lg:space-y-6 font-sans">
      <div className="absolute inset-0 z-[-1] min-h-[120vh] w-full"
           style={{
             backgroundColor: "#F9FAFB",
             backgroundImage: "radial-gradient(#D1D5DB 1.5px, transparent 1.5px)",
             backgroundSize: "24px 24px"
           }} />

      <div className="mb-4 hidden lg:flex items-center justify-between">
        <Sk className="h-8 w-40" />
      </div>

      {/* Row 1 */}
      <div className="grid grid-cols-2 gap-4 lg:gap-6 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-[32px] bg-white border border-white p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center"><Sk className="h-6 w-24" /><Sk className="h-8 w-12 rounded-full !rounded-full" /></div>
            <Sk className="h-10 w-24 mt-6" />
            <Sk className="h-4 w-32 mt-4" />
          </div>
        ))}
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 gap-4 lg:gap-6 lg:grid-cols-[1.8fr_0.9fr_1fr]">
        <div className="rounded-[32px] bg-white border border-white p-6 space-y-4 shadow-sm">
          <div className="flex justify-between items-center"><Sk className="h-6 w-32" /><Sk className="h-10 w-24 rounded-full !rounded-full" /></div>
          <div className="flex items-center gap-8 mt-4">
            <Sk className="h-40 w-40 rounded-full !rounded-full shrink-0" />
            <div className="flex-1 space-y-4"><Sk className="h-6 w-full" /><Sk className="h-6 w-full" /><Sk className="h-6 w-full" /></div>
          </div>
        </div>
        <div className="rounded-[32px] bg-white border border-white p-6 space-y-4 shadow-sm">
          <div className="flex justify-between items-center"><Sk className="h-6 w-24" /><Sk className="h-8 w-16 rounded-full !rounded-full" /></div>
          <Sk className="h-[140px] w-full mt-4" />
        </div>
        <div className="rounded-[32px] bg-white border border-white p-6 space-y-4 shadow-sm">
          <div className="flex justify-between items-center"><Sk className="h-6 w-24" /><Sk className="h-8 w-16 rounded-full !rounded-full" /></div>
          <div className="space-y-6 mt-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-4 items-center">
                <Sk className="h-10 w-10 rounded-[14px] !rounded-[14px] shrink-0" />
                <div className="flex-1 space-y-2"><Sk className="h-4 w-24" /><Sk className="h-3 w-32" /></div>
                <Sk className="h-5 w-10" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-1 gap-4 lg:gap-6 lg:grid-cols-[1.8fr_0.9fr_1fr]">
        <div className="rounded-[32px] bg-white border border-white p-6 space-y-4 shadow-sm">
          <div className="flex justify-between items-center"><Sk className="h-6 w-32" /><Sk className="h-8 w-24 rounded-full !rounded-full" /></div>
          <div className="space-y-4 mt-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex justify-between items-center p-2">
                <div className="flex gap-4 items-center"><Sk className="h-10 w-10 rounded-full !rounded-full" /><Sk className="h-4 w-24" /></div>
                <Sk className="h-10 w-24 rounded-full !rounded-full" />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[32px] bg-white border border-white p-6 space-y-4 shadow-sm">
          <div className="flex justify-between items-center"><Sk className="h-6 w-24" /><Sk className="h-8 w-16 rounded-full !rounded-full" /></div>
          <div className="flex flex-col justify-between h-[150px] mt-4">
            {[...Array(4)].map((_, i) => <div key={i} className="flex items-center gap-3"><Sk className="h-4 w-6" /><Sk className="h-3 flex-1 rounded-full !rounded-full" /></div>)}
          </div>
        </div>
        <div className="rounded-[32px] bg-white border border-white p-6 space-y-4 shadow-sm">
          <div className="flex justify-between items-center"><Sk className="h-6 w-24" /><Sk className="h-8 w-16 rounded-full !rounded-full" /></div>
          <Sk className="h-[150px] w-full mt-4" />
        </div>
      </div>
    </div>
  );
}
