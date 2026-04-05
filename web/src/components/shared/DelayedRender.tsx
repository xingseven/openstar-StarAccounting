import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface DelayedRenderProps {
  children: React.ReactNode;
  /** 延迟时间(毫秒) */
  delay: number;
  /** 是否懒加载(滚动到视图时加载) */
  lazy?: boolean;
  /** 自定义 className */
  className?: string;
  /** 加载前显示的占位内容 */
  fallback?: React.ReactNode;
}

export function DelayedRender({
  children,
  delay,
  lazy = false,
  className,
  fallback,
}: DelayedRenderProps) {
  const [shouldRender, setShouldRender] = useState(!lazy);
  const [isVisible, setIsVisible] = useState(!lazy);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!lazy) {
      return;
    }

    let timerId: number | undefined;
    let raf1: number | undefined;
    let raf2: number | undefined;

    const reveal = () => {
      raf1 = window.requestAnimationFrame(() => {
        raf2 = window.requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
    };

    const scheduleReveal = () => {
      if (delay > 0) {
        timerId = window.setTimeout(reveal, delay);
        return;
      }
      reveal();
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;

        setShouldRender(true);
        scheduleReveal();
        observer?.disconnect();
      },
      { rootMargin: "120px" }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer?.disconnect();
      if (timerId !== undefined) window.clearTimeout(timerId);
      if (raf1 !== undefined) window.cancelAnimationFrame(raf1);
      if (raf2 !== undefined) window.cancelAnimationFrame(raf2);
    };
  }, [delay, lazy]);

  return (
    <div ref={ref} className={className}>
      {shouldRender ? (
        <div
          className={cn(
            "h-full w-full transition-opacity duration-300 ease-out motion-reduce:transition-none",
            isVisible ? "opacity-100" : "opacity-0"
          )}
        >
          {children}
        </div>
      ) : fallback ? (
        fallback
      ) : null}
    </div>
  );
}
