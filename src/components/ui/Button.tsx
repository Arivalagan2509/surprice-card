"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

export interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", children, ...props }, ref) => {
    const sizeClasses = {
      sm: "px-4 py-2 text-sm min-h-[44px]",
      md: "px-6 py-3 text-base min-h-[48px]",
      lg: "px-8 py-4 text-lg min-h-[52px]",
    }[size];

    const variantClasses = {
      primary:
        "bg-[var(--theme-accent)] text-white shadow-lg shadow-[var(--theme-accent)]/25 hover:brightness-105 active:brightness-95 font-semibold",
      secondary:
        "bg-white/85 text-[var(--theme-text)] border border-[var(--theme-accent)]/20 shadow-sm backdrop-blur-sm hover:bg-white font-medium",
      outline:
        "border-2 border-[var(--theme-accent)] text-[var(--theme-accent)] bg-transparent hover:bg-[var(--theme-accent)]/10 font-medium",
      ghost:
        "text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-black/5 font-medium",
    }[variant];

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
        className={`inline-flex items-center justify-center rounded-2xl transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-accent)] disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none ${sizeClasses} ${variantClasses} ${className}`}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
