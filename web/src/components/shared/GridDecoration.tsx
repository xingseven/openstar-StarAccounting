import { clsx } from "clsx";

interface GridDecorationProps {
  mode?: "light" | "dark";
  opacity?: number;
  className?: string;
}

export function GridDecoration({ 
  mode = "light", 
  opacity, 
  className 
}: GridDecorationProps) {
  // 浅色模式（用于白色卡片）：深色网格
  const lightStyles = {
    backgroundImage: `
      repeating-linear-gradient(30deg, transparent, transparent 20px, #000 20px, #000 21px), 
      repeating-linear-gradient(150deg, transparent, transparent 25px, #000 25px, #000 26px)
    `,
    opacity: opacity ?? 0.015
  };

  // 深色模式（用于黑色/蓝色卡片）：白色网格
  const darkStyles = {
    backgroundImage: `
      repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.3) 10px, rgba(255,255,255,0.3) 11px), 
      repeating-linear-gradient(-45deg, transparent, transparent 15px, rgba(255,255,255,0.2) 15px, rgba(255,255,255,0.2) 16px)
    `,
    opacity: opacity ?? 0.05
  };

  return (
    <div 
      className={clsx("absolute inset-0 pointer-events-none", className)}
      style={mode === "light" ? lightStyles : darkStyles}
    />
  );
}
