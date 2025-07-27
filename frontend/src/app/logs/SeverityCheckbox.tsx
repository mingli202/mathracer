"use client";

import { LogSeverity } from "@/types";
import { cn } from "@/utils/cn";
import { Bug, Info, TriangleAlert } from "lucide-react";
import { useState } from "react";

type Props = {
  logSeverity: LogSeverity;
};

export default function SeverityCheckbox({ logSeverity }: Props) {
  const [checked, setChecked] = useState(false);

  return (
    <div>
      <input
        type="checkbox"
        name={logSeverity}
        id={logSeverity}
        className="hidden"
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
      />
      <label
        htmlFor={logSeverity}
        className={cn(
          "flex gap-1 text-gray-400",
          checked && {
            "text-foreground": logSeverity === LogSeverity.Info,
            "text-yellow-600": logSeverity === LogSeverity.Debug,
            "text-red-700": logSeverity === LogSeverity.Error,
          },
        )}
      >
        {logSeverity === LogSeverity.Info && <Info />}
        {logSeverity === LogSeverity.Debug && <Bug />}
        {logSeverity === LogSeverity.Error && <TriangleAlert />}
        {logSeverity}
      </label>
    </div>
  );
}
