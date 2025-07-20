"use client";

import React from "react";
import { cn } from "@/utils/cn";

interface GameModeCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  bgColor?: string;
}

const GameModeCard: React.FC<GameModeCardProps> = ({
  title,
  description,
  icon,
  onClick,
  bgColor = "bg-math-green",
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-start rounded-xl p-4 transition-all duration-200",
        "focus:ring-primary/50 hover:scale-[1.02] hover:shadow-md focus:ring-2 focus:outline-none",
        "w-full border border-gray-100 text-left",
        bgColor,
        "bg-opacity-30 hover:bg-opacity-40",
      )}
    >
      <div className="mr-4 flex-shrink-0 rounded-full bg-white/80 p-2">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
    </button>
  );
};

export default GameModeCard;
