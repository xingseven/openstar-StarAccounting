"use client";

import { useRef, useState, useCallback } from "react";

interface SwipeToDeleteProps {
  children: React.ReactNode;
  onDelete: () => void;
  deleteThreshold?: number;
  disabled?: boolean;
}

export function SwipeToDelete({
  children,
  onDelete,
  deleteThreshold = 100,
  disabled = false,
}: SwipeToDeleteProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) return;
    startX.current = e.touches[0].clientX;
    setIsDragging(true);
  }, [disabled]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || disabled) return;
    
    currentX.current = e.touches[0].clientX;
    const diff = currentX.current - startX.current;
    
    if (diff < 0) {
      setTranslateX(Math.max(diff, -200));
    }
  }, [isDragging, disabled]);

  const handleTouchEnd = useCallback(() => {
    if (disabled) return;
    setIsDragging(false);
    
    if (translateX < -deleteThreshold) {
      onDelete();
      setTranslateX(0);
    } else {
      setTranslateX(0);
    }
  }, [translateX, deleteThreshold, onDelete, disabled]);

  return (
    <div className="relative overflow-hidden">
      <div
        ref={containerRef}
        className="transition-transform duration-200 touch-pan-y"
        style={{
          transform: `translateX(${translateX}px)`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
      
      {translateX < -20 && (
        <div
          className="absolute right-0 top-0 bottom-0 flex items-center justify-center bg-red-500 text-white px-6 transition-opacity"
          style={{ opacity: Math.min(Math.abs(translateX) / 100, 1) }}
        >
          <span className="text-sm font-medium">删除</span>
        </div>
      )}
    </div>
  );
}

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  disabled?: boolean;
}

export function PullToRefresh({
  children,
  onRefresh,
  disabled = false,
}: PullToRefreshProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const threshold = 80;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled || isRefreshing) return;
    
    const container = containerRef.current;
    if (!container || container.scrollTop > 0) return;
    
    startY.current = e.touches[0].clientY;
    setIsPulling(true);
  }, [disabled, isRefreshing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling || disabled || isRefreshing) return;
    
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;
    
    if (diff > 0) {
      setPullDistance(Math.min(diff * 0.5, 150));
    }
  }, [isPulling, disabled, isRefreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling || disabled) return;
    
    setIsPulling(false);
    
    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    
    setPullDistance(0);
  }, [isPulling, pullDistance, threshold, onRefresh, disabled]);

  const getRefreshIndicator = () => {
    const progress = Math.min(pullDistance / threshold, 1);
    
    if (isRefreshing) {
      return (
        <div className="flex items-center justify-center py-4">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        </div>
      );
    }
    
    if (pullDistance > 0) {
      return (
        <div 
          className="flex items-center justify-center py-4 transition-transform"
          style={{ 
            transform: `rotate(${progress * 360}deg)`,
            opacity: progress 
          }}
        >
          <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div
      ref={containerRef}
      className="overflow-auto"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {getRefreshIndicator()}
      {children}
    </div>
  );
}

interface LongPressProps {
  children: React.ReactNode;
  onLongPress: () => void;
  delay?: number;
  disabled?: boolean;
}

export function LongPress({
  children,
  onLongPress,
  delay = 500,
  disabled = false,
}: LongPressProps) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isPressed, setIsPressed] = useState(false);

  const handleStart = useCallback(() => {
    if (disabled) return;
    
    setIsPressed(true);
    timeoutRef.current = setTimeout(() => {
      onLongPress();
      setIsPressed(false);
    }, delay);
  }, [delay, onLongPress, disabled]);

  const handleEnd = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsPressed(false);
  }, []);

  return (
    <div
      className={`transition-opacity ${isPressed ? 'opacity-70' : ''}`}
      onTouchStart={handleStart}
      onTouchEnd={handleEnd}
      onTouchCancel={handleEnd}
      onMouseDown={handleStart}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
    >
      {children}
    </div>
  );
}
