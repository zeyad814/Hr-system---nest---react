import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 flex flex-col w-[90%] sm:w-[85%] md:w-[75%] lg:w-[65%] xl:w-[55%] max-w-4xl translate-x-[-50%] translate-y-[-50%] border bg-background shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-lg max-h-[85vh] sm:max-h-[90vh]",
        className
      )}
      {...props}
      onInteractOutside={(e) => {
        // منع إغلاق الحوار عند التفاعل مع العناصر الداخلية
        const target = e.target as Element;
        if (target.closest('[data-dialog-content]') || target.closest('input') || target.closest('textarea') || target.closest('select')) {
          e.preventDefault();
        }
      }}
      onPointerDownOutside={(e) => {
        // منع إغلاق الحوار عند النقر على العناصر الداخلية
        const target = e.target as Element;
        if (target.closest('[data-dialog-content]') || target.closest('input') || target.closest('textarea') || target.closest('select')) {
          e.preventDefault();
        }
      }}
      onFocusOutside={(e) => {
        // منع فقدان التركيز من حقول الإدخال
        const target = e.target as Element;
        if (target.closest('input') || target.closest('textarea') || target.closest('select')) {
          e.preventDefault();
        }
      }}
    >
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-5 lg:p-6" data-dialog-content>
        {children}
      </div>
      <DialogPrimitive.Close className="absolute right-2 top-2 sm:right-3 sm:top-3 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-10">
        <X className="h-3 w-3 sm:h-4 sm:w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 sm:space-y-2 text-center sm:text-left pb-2 sm:pb-3 border-b border-border/10",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:space-x-2 pt-3 sm:pt-4 mt-3 sm:mt-4 border-t border-border/10",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-sm font-semibold leading-tight tracking-tight sm:text-base md:text-lg pr-6 sm:pr-8",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-xs text-muted-foreground sm:text-sm leading-relaxed pr-6 sm:pr-8", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

const DialogBody = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex-1 py-2 sm:py-3 space-y-3 sm:space-y-4 min-h-0",
      className
    )}
    {...props}
    onMouseDown={(e) => {
      // منع فقدان التركيز عند النقر داخل منطقة المحتوى
      e.stopPropagation();
    }}
    onPointerDown={(e) => {
      // منع فقدان التركيز عند النقر داخل منطقة المحتوى
      e.stopPropagation();
    }}
    onFocus={(e) => {
      // الحفاظ على التركيز داخل حقول الإدخال
      e.stopPropagation();
    }}
  />
)
DialogBody.displayName = "DialogBody"

// مكون محسن لحقول الإدخال داخل الحوار
const DialogInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    className?: string;
  }
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
    onMouseDown={(e) => {
      e.stopPropagation();
      props.onMouseDown?.(e);
    }}
    onPointerDown={(e) => {
      e.stopPropagation();
      props.onPointerDown?.(e);
    }}
    onFocus={(e) => {
      e.stopPropagation();
      props.onFocus?.(e);
    }}
    onBlur={(e) => {
      e.stopPropagation();
      props.onBlur?.(e);
    }}
  />
))
DialogInput.displayName = "DialogInput"

// مكون محسن لمناطق النص داخل الحوار
const DialogTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    className?: string;
  }
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
    onMouseDown={(e) => {
      e.stopPropagation();
      props.onMouseDown?.(e);
    }}
    onPointerDown={(e) => {
      e.stopPropagation();
      props.onPointerDown?.(e);
    }}
    onFocus={(e) => {
      e.stopPropagation();
      props.onFocus?.(e);
    }}
    onBlur={(e) => {
      e.stopPropagation();
      props.onBlur?.(e);
    }}
  />
))
DialogTextarea.displayName = "DialogTextarea"

// مكون محسن لقوائم الاختيار داخل الحوار
const DialogSelect = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & {
    className?: string;
  }
>(({ className, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
    onMouseDown={(e) => {
      e.stopPropagation();
      props.onMouseDown?.(e);
    }}
    onPointerDown={(e) => {
      e.stopPropagation();
      props.onPointerDown?.(e);
    }}
    onFocus={(e) => {
      e.stopPropagation();
      props.onFocus?.(e);
    }}
    onBlur={(e) => {
      e.stopPropagation();
      props.onBlur?.(e);
    }}
  />
))
DialogSelect.displayName = "DialogSelect"

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogInput,
  DialogTextarea,
  DialogSelect,
}
