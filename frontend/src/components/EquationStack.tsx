"use client";

import React from "react";
import { cn } from "@/utils/cn";
import { Equation } from "@/types";

interface EquationStackProps {
  equations: Equation[];
  currentIndex: number;
  stackSize?: number;
}

const EquationStack: React.FC<EquationStackProps> = ({
  equations,
  currentIndex,
  stackSize = 3,
}) => {
  // Only show a few equations at a time in the stack
  const visibleEquations = equations.slice(
    Math.max(0, currentIndex),
    Math.min(currentIndex + stackSize, equations.length),
  );

  return (
    <div className="flex h-full w-full max-w-md flex-col items-center justify-center gap-1">
      {visibleEquations.map((equation, index) => {
        // First equation is the current one, others are upcoming
        const isCurrent = index === 0;

        return (
          <div
            key={equation.id}
            className={cn(
              "equation-card w-full",
              "animate-fade-down",
              isCurrent
                ? "z-10 scale-100 opacity-100"
                : `opacity-${80 - index * 20}`,
            )}
            style={{
              opacity: isCurrent ? 1 : Math.max(0.4, 1 - index * 0.2),
              zIndex: -equation.id,
            }}
          >
            <span
              className={cn(
                "text-3xl md:text-4xl",
                isCurrent ? "font-bold" : "text-muted-foreground font-medium",
              )}
            >
              {equation.equation}
            </span>
          </div>
        );
      })}

      {visibleEquations.length === 0 && (
        <div className="equation-card bg-muted/50 w-full animate-pulse border-dashed">
          <span className="text-muted-foreground">No more equations</span>
        </div>
      )}
    </div>
  );
};

export default EquationStack;
