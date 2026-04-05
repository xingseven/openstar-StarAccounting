"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const BottomSheet = DialogPrimitive.Root;
const BottomSheetTrigger = DialogPrimitive.Trigger;
const BottomSheetPortal = DialogPrimitive.Portal;

const BottomSheetOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "bottom-sheet-overlay fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-sm",
      className
    )}
    {...props}
  />
));
BottomSheetOverlay.displayName = DialogPrimitive.Overlay.displayName;

interface BottomSheetContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  hideClose?: boolean;
}

function isNestedRadixSelectTarget(target: EventTarget | null) {
  return target instanceof HTMLElement && Boolean(target.closest("[data-radix-popper-content-wrapper]"));
}

const BottomSheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  BottomSheetContentProps
>(({ className, children, hideClose = false, onInteractOutside, onPointerDownOutside, ...props }, ref) => (
  <BottomSheetPortal>
    <BottomSheetOverlay />
  <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "bottom-sheet-content fixed inset-x-0 bottom-0 z-50 mx-auto flex w-full max-w-3xl flex-col gap-4 rounded-t-[28px] border px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-18px_48px_rgba(15,23,42,0.18)] outline-none",
        "[background:var(--theme-surface-bg)] [border-color:var(--theme-surface-border)] [box-shadow:var(--theme-surface-shadow)]",
        className
      )}
      onInteractOutside={(event) => {
        if (isNestedRadixSelectTarget(event.target)) {
          event.preventDefault();
          return;
        }

        onInteractOutside?.(event);
      }}
      onPointerDownOutside={(event) => {
        if (isNestedRadixSelectTarget(event.target)) {
          event.preventDefault();
          return;
        }

        onPointerDownOutside?.(event);
      }}
      onFocusOutside={(event) => {
        if (isNestedRadixSelectTarget(event.target)) {
          event.preventDefault();
        }
      }}
      {...props}
    >
      <div className="mx-auto h-1.5 w-12 rounded-full [background:var(--theme-input-border)]" />
      {!hideClose ? (
        <DialogPrimitive.Close className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full border [border-color:var(--theme-input-border)] [background:var(--theme-input-bg)] [color:var(--theme-muted-text)] transition hover:brightness-95 hover:[color:var(--theme-body-text)] focus:outline-none focus:ring-2 focus:ring-ring/30">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      ) : null}
      {children}
    </DialogPrimitive.Content>
  </BottomSheetPortal>
));
BottomSheetContent.displayName = DialogPrimitive.Content.displayName;

const BottomSheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("space-y-1.5 px-1 text-left", className)} {...props} />
);
BottomSheetHeader.displayName = "BottomSheetHeader";

const BottomSheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />
);
BottomSheetFooter.displayName = "BottomSheetFooter";

const BottomSheetTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold tracking-tight [color:var(--theme-body-text)] sm:text-xl", className)}
    {...props}
  />
));
BottomSheetTitle.displayName = DialogPrimitive.Title.displayName;

const BottomSheetDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm leading-6 [color:var(--theme-muted-text)]", className)}
    {...props}
  />
));
BottomSheetDescription.displayName = DialogPrimitive.Description.displayName;

export {
  BottomSheet,
  BottomSheetPortal,
  BottomSheetOverlay,
  BottomSheetTrigger,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetFooter,
  BottomSheetTitle,
  BottomSheetDescription,
};
