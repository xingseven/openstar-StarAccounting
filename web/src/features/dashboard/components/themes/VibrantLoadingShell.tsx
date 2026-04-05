"use client";

function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-[12px] bg-[#E5E7EB] ${className ?? ""}`} />;
}

export function VibrantLoadingShell() {
  return (
    <div className="space-y-4 lg:space-y-6 bg-transparent min-h-screen font-sans">
      <div className="mb-2 flex items-center justify-between">
        <Sk className="h-8 w-32" />
        <div className="flex gap-2">
          <Sk className="h-9 w-20 rounded-full" />
          <Sk className="h-9 w-20 rounded-full" />
        </div>
      </div>

      {/* Row 1 */}
      <div className="grid grid-cols-1 gap-4 lg:gap-6 lg:grid-cols-[1.5fr_1fr_0.8fr]">
        <div className="rounded-[24px] bg-white p-6 space-y-4">
          <div className="flex justify-between"><Sk className="h-5 w-32" /></div>
          <Sk className="h-[140px] w-full" />
        </div>
        <div className="rounded-[24px] bg-white p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between"><Sk className="h-4 w-24" /><Sk className="h-4 w-12" /></div>
            <Sk className="h-8 w-32 mt-2" />
          </div>
          <Sk className="h-[70px] w-full mt-4" />
        </div>
        <div className="rounded-[24px] p-6 space-y-4 flex flex-col justify-between relative overflow-hidden" style={{ backgroundColor: "#111827" }}>
          <div className="relative z-10">
            <Sk className="h-4 w-24 !bg-gray-700" />
            <Sk className="h-8 w-32 mt-2 !bg-gray-700" />
          </div>
          <div className="relative z-10 flex justify-between items-center mt-8">
            <Sk className="h-4 w-12 !bg-gray-700" />
            <Sk className="h-8 w-8 rounded-full !rounded-full !bg-gray-700" />
          </div>
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 gap-4 lg:gap-6 lg:grid-cols-[1fr_2fr]">
        <div className="rounded-[24px] bg-white p-6 space-y-4">
          <div className="flex justify-between"><Sk className="h-5 w-24" /></div>
          <Sk className="h-10 w-32" />
          <Sk className="h-[160px] w-full" />
        </div>
        <div className="rounded-[24px] bg-white p-6 space-y-4">
          <div className="flex justify-between"><Sk className="h-5 w-24" /></div>
          <Sk className="h-[220px] w-full" />
        </div>
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-1 gap-4 lg:gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-[24px] bg-white p-6 space-y-4">
          <Sk className="h-5 w-32 mb-6" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex justify-between p-3 bg-gray-50 rounded-2xl">
              <div className="flex gap-3">
                <Sk className="h-10 w-10 rounded-full !rounded-full" />
                <div>
                  <Sk className="h-4 w-20 mb-1" />
                  <Sk className="h-3 w-16" />
                </div>
              </div>
              <Sk className="h-5 w-16 mt-2" />
            </div>
          ))}
        </div>
        <div className="rounded-[24px] bg-white p-6 space-y-4 flex flex-col items-center">
          <Sk className="h-5 w-40 mb-4 self-start" />
          <Sk className="h-40 w-40 rounded-full !rounded-full" />
          <div className="flex gap-4 mt-6">
            <Sk className="h-4 w-12" />
            <Sk className="h-4 w-12" />
            <Sk className="h-4 w-12" />
          </div>
        </div>
      </div>
    </div>
  );
}
