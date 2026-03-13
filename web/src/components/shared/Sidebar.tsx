import Link from "next/link";

const items = [
  { href: "/", label: "总览" },
  { href: "/assets", label: "资产" },
  { href: "/consumption", label: "消费" },
  { href: "/savings", label: "储蓄" },
  { href: "/loans", label: "贷款" },
  { href: "/connections", label: "连接" },
  { href: "/settings", label: "设置" },
];

export function Sidebar() {
  return (
    <aside className="w-60 border-r p-4 hidden md:block">
      <div className="mb-4 text-sm font-semibold">导航</div>
      <nav className="space-y-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block rounded px-2 py-1 text-sm hover:bg-gray-100"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

