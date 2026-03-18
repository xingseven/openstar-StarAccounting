import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  /** 图标组件 */
  icon: LucideIcon;
  /** 标题 */
  title: string;
  /** 描述文本（可选） */
  description?: string;
  /** 自定义 className */
  className?: string;
  /** 右侧操作按钮（可选） */
  action?: React.ReactNode;
}

/**
 * 通用空状态展示组件
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  className,
  action,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
    >
      <div className="mb-4 rounded-full bg-gray-100 p-4">
        <Icon className="h-8 w-8 text-gray-300" />
      </div>
      <h3 className="mb-1 text-sm font-medium text-gray-900">{title}</h3>
      {description && (
        <p className="mb-4 max-w-sm text-xs text-gray-500">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
