"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SidebarContent } from "@/components/shared/Sidebar";

export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/82 text-slate-600 shadow-sm backdrop-blur transition hover:border-slate-300 hover:bg-white hover:text-slate-950 md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">打开导航菜单</span>
        </button>
      </SheetTrigger>

      <SheetContent side="left" className="w-[296px] border-r-0 bg-transparent p-2 shadow-none">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <SheetDescription className="sr-only">Mobile navigation menu</SheetDescription>
        <div className="h-full overflow-hidden rounded-[28px] border border-white/12 shadow-[0_22px_60px_rgba(15,23,42,0.3)]">
          <SidebarContent onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
