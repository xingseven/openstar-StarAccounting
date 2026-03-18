import { cn } from "@/lib/utils";

interface GridDecorationProps {
  mode?: "light" | "dark";
  opacity?: number;
  className?: string;
}

/**
 * 灵动曲线装饰组件
 * 采用不规则分散的弯曲线条，营造轻盈、流体感和高级感
 */
export function GridDecoration({ 
  mode = "light", 
  opacity, 
  className 
}: GridDecorationProps) {
  const strokeColor = mode === "light" ? "rgba(0,0,0,1)" : "rgba(255,255,255,1)";
  const defaultOpacity = mode === "light" ? 0.03 : 0.06;
  const finalOpacity = opacity ?? defaultOpacity;

  return (
    <div className={cn("absolute inset-0 pointer-events-none overflow-hidden", className)} style={{ opacity: finalOpacity }}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 400 200"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* 底部的一抹微弧 */}
        <path
          d="M80 220 C 180 140, 320 190, 440 160"
          stroke={strokeColor}
          strokeWidth="0.4"
        />
      </svg>
    </div>
  );
}
