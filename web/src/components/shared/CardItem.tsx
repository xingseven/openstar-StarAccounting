interface CardItemProps {
  children: React.ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
}

export function CardItem({ children, className = "", href, onClick }: CardItemProps) {
  const baseClass = `rounded-2xl border border-gray-100 shadow-sm bg-white p-3 sm:p-4 hover:border-gray-200 hover:shadow-md transition-all ${className}`;

  if (href) {
    return (
      <a href={href} className={`group flex flex-col items-center justify-center ${baseClass}`}>
        {children}
      </a>
    );
  }

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={`group flex flex-col items-center justify-center w-full ${baseClass}`}
      >
        {children}
      </button>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center ${baseClass}`}>
      {children}
    </div>
  );
}
