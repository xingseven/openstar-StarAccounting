"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Wallet, 
  CreditCard, 
  PiggyBank, 
  Landmark, 
  Link as LinkIcon, 
  Settings,
  Palette,
  Info
} from "lucide-react";
import { clsx } from "clsx";

const items = [
  { href: "/", label: "总览", icon: LayoutDashboard },
  { href: "/assets", label: "资产", icon: Wallet },
  { href: "/consumption", label: "消费", icon: CreditCard },
  { href: "/savings", label: "储蓄", icon: PiggyBank },
  { href: "/loans", label: "贷款", icon: Landmark },
  { href: "/connections", label: "连接", icon: LinkIcon },
  { href: "/themes", label: "主题", icon: Palette },
  { href: "/settings", label: "设置", icon: Settings },
  { href: "/about", label: "关于", icon: Info },
];

export function SidebarContent() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-6 border-b flex items-center gap-3 shrink-0">
        <div className="h-9 w-9 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">
          X
        </div>
        <span className="font-bold text-xl text-gray-900 tracking-tight">XFDashboard</span>
      </div>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold text-gray-400 mb-2 px-3 uppercase tracking-wider">
          Menu
        </div>
        {items.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon className={clsx("h-5 w-5 transition-colors", isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-500")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t bg-gray-50/50 shrink-0">
        <div className="rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 p-4 text-white shadow-lg">
          <h4 className="font-semibold text-sm mb-1">OpenStar</h4>
          <p className="text-xs text-blue-100 opacity-90">
            开源个人财务管理面板
          </p>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="w-64 border-r hidden md:flex shrink-0 h-full">
      <SidebarContent />
    </aside>
  );
}
