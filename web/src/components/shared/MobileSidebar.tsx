"use client";

import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { SidebarContent } from "@/components/shared/Sidebar";
import { Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar when route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="md:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-md transition-colors mr-2">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-48 border-r-0 bg-transparent">
        <div className="w-full h-full rounded-2xl shadow-xl shadow-gray-200/60 border border-gray-100/80 overflow-hidden">
          {/* Accessibility requirements for Dialog/Sheet */}
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <SheetDescription className="sr-only">
            Mobile navigation menu
          </SheetDescription>
          <SidebarContent />
        </div>
      </SheetContent>
    </Sheet>
  );
}
