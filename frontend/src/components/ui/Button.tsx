import { forwardRef } from "react";
import type * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant = "primary", ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50",
      variant === "primary" && "bg-amber-500 text-white shadow-sm hover:bg-amber-600 hover:shadow-md",
      variant === "secondary" && "bg-sky-500 text-white shadow-sm hover:bg-sky-600 hover:shadow-md",
      variant === "ghost" && "border border-slate-200 bg-white text-slate-700 hover:border-amber-200 hover:bg-amber-50",
      variant === "danger" && "bg-rose-500 text-white hover:bg-rose-600",
      className
    )}
    {...props}
  />
));

Button.displayName = "Button";
