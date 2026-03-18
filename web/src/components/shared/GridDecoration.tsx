import { cn } from "@/lib/utils";

interface GridDecorationProps {
  mode?: "light" | "dark";
  opacity?: number;
  className?: string;
}

/**
 * 极简线条装饰组件 (替换原有的网格背景)
 * 采用不规则的几根细线，营造现代、轻盈的视觉感
 */
export function GridDecoration({ 
  mode = "light", 
  opacity, 
  className 
}: GridDecorationProps) {
  const strokeColor = mode === "light" ? "rgba(0,0,0,1)" : "rgba(255,255,255,1)";
  const defaultOpacity = mode === "light" ? 0.04 : 0.08;
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
        {/* 线条 1: 从左上斜向下 */}
        <path 
          d="M-20 20 L150 180" 
          stroke={strokeColor} 
          strokeWidth="0.5" 
          strokeDasharray="4 2"
        />
        {/* 线条 2: 右侧的一根长线 */}
        <path 
          d="M300 -10 L420 150" 
          stroke={strokeColor} 
          strokeWidth="0.8" 
        />
        {/* 线条 3: 底部的一根水平微斜线 */}
        <path 
          d="M50 190 L350 170" 
          stroke={strokeColor} 
          strokeWidth="0.3" 
        />
        {/* 线条 4: 左侧短促的装饰线 */}
        <path 
          d="M10 100 L60 80" 
          stroke={strokeColor} 
          strokeWidth="1" 
        />
      </svg>
    </div>
  );
}
