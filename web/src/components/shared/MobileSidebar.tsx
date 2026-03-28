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
        <button className="inline-flex h-10 w-10 items-center justify-center rounded-[18px] bg-white/76 text-slate-600 backdrop-blur transition hover:bg-white hover:text-slate-950 md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">打开导航菜单</span>
        </button>
      </SheetTrigger>

      <SheetContent side="left" className="w-[296px] border-r-0 bg-transparent p-2 shadow-none">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <SheetDescription className="sr-only">Mobile navigation menu</SheetDescription>
        <div className="h-full overflow-hidden rounded-[26px] shadow-[0_20px_52px_rgba(15,23,42,0.22)]">
          <SidebarContent onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
