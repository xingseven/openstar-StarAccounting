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
  const [shouldRender, setShouldRender] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timerId: number | undefined;
    let idleId: number | undefined;
    let observer: IntersectionObserver | undefined;
    let raf1: number | undefined;
    let raf2: number | undefined;

    const renderWithDelay = () => {
      const mount = () => {
        // 先挂载（opacity-0）
        setShouldRender(true);
        // 下一帧再触发淡入（opacity-100），确保浏览器绘制了 opacity-0 的帧
        raf1 = window.requestAnimationFrame(() => {
          raf2 = window.requestAnimationFrame(() => {
            setIsVisible(true);
          });
        });
      };

      if (delay > 0) {
        timerId = window.setTimeout(mount, delay);
      } else {
        mount();
      }
    };

    const scheduleRender = () => {
      if ("requestIdleCallback" in window) {
        const requestIdle = window.requestIdleCallback as (
          callback: IdleRequestCallback,
          options?: IdleRequestOptions
        ) => number;
        idleId = requestIdle(() => renderWithDelay(), { timeout: 600 });
        return;
      }
      renderWithDelay();
    };

    if (lazy) {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            scheduleRender();
            observer?.disconnect();
          }
        },
        { rootMargin: "120px" }
      );

      if (ref.current) {
        observer.observe(ref.current);
      }

      return () => {
        observer?.disconnect();
        if (timerId !== undefined) window.clearTimeout(timerId);
        if (idleId !== undefined && "cancelIdleCallback" in window) {
          (window.cancelIdleCallback as (handle: number) => void)(idleId);
        }
        if (raf1 !== undefined) window.cancelAnimationFrame(raf1);
        if (raf2 !== undefined) window.cancelAnimationFrame(raf2);
      };
    } else {
      renderWithDelay();
      return () => {
        if (timerId !== undefined) window.clearTimeout(timerId);
        if (raf1 !== undefined) window.cancelAnimationFrame(raf1);
        if (raf2 !== undefined) window.cancelAnimationFrame(raf2);
      };
    }
  }, [delay, lazy]);

  return (
    <div ref={ref} className={className}>
      {shouldRender ? (
        <div
          className={cn(
            "h-full w-full transition-opacity duration-500 ease-out",
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
