interface CardContainerProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "blue";
  padding?: "xs" | "sm" | "md" | "lg";
}

export function CardContainer({
  children,
  className = "",
  variant = "default",
  padding = "sm"
}: CardContainerProps) {
  const variantClasses = {
    default: "bg-white border-gray-100",
    blue: "bg-blue-600 text-white",
  }[variant];

  const paddingClasses = {
    xs: "p-1 md:p-6",
    sm: "p-3 md:p-5 lg:p-7",
    md: "p-4 sm:p-6",
    lg: "p-6 sm:p-8",
  }[padding];

  return (
    <div
      className={`
        rounded-2xl border shadow-sm overflow-hidden relative group
        ${variantClasses}
        ${paddingClasses}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
