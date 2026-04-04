import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 格式化货币
 * @param value 数值
 * @param options 格式化选项
 */
export function formatCurrency(
  value: number, 
  options: { 
    withSymbol?: boolean; 
    decimals?: number;
    compact?: boolean;
  } = {}
) {
  const { 
    withSymbol = true, 
    decimals = 0,
    compact = false 
  } = options;

  const formatter = new Intl.NumberFormat('zh-CN', {
    style: withSymbol ? 'currency' : 'decimal',
    currency: 'CNY',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    notation: compact ? 'compact' : 'standard',
  });

  return formatter.format(value);
}
