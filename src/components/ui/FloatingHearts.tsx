"use client";

import React, { useMemo } from "react";

interface FloatingHeartsProps {
  count?: number;
  className?: string;
}

export const FloatingHearts: React.FC<FloatingHeartsProps> = ({ count = 12, className = "" }) => {
  const hearts = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${(i * 100) / count + (i % 3) * 2}%`,
      delay: `${(i * 0.7) % 5}s`,
      duration: `${6 + (i % 4) * 2}s`,
      size: `${14 + (i % 3) * 8}px`,
      opacity: 0.25 + (i % 5) * 0.1,
    }));
  }, [count]);

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none select-none z-0 ${className}`}
      aria-hidden="true"
    >
      {hearts.map((h) => (
        <span
          key={h.id}
          className="absolute bottom-[-40px] text-[var(--theme-accent)] transition-transform animate-float-heart"
          style={{
            left: h.left,
            fontSize: h.size,
            opacity: h.opacity,
            animationDelay: h.delay,
            animationDuration: h.duration,
          }}
        >
          ❤
        </span>
      ))}
    </div>
  );
};
