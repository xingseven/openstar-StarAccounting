interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "5xl" | "2xl" | "full";
}

export function PageContainer({ children, className = "", maxWidth = "5xl" }: PageContainerProps) {
  const maxWidthClass = {
    "5xl": "max-w-5xl",
    "2xl": "max-w-2xl",
    "full": "",
  }[maxWidth];

  return (
    <div className={`${maxWidthClass} mx-auto space-y-4 md:space-y-8 ${className}`}>
      {children}
    </div>
  );
}
