import { LogSeverity } from "@/types";
import { cn } from "@/utils/cn";
import { Bug, Info, TriangleAlert } from "lucide-react";

type Props = {
  logSeverity: LogSeverity;
  logSeverityChecked: Record<LogSeverity, boolean>;
  setLogSeverityChecked: React.Dispatch<
    React.SetStateAction<Record<LogSeverity, boolean>>
  >;
};

export default function SeverityCheckbox({
  logSeverity,
  logSeverityChecked,
  setLogSeverityChecked,
}: Props) {
  return (
    <div>
      <input
        type="checkbox"
        name={logSeverity}
        id={logSeverity}
        className="hidden"
        checked={logSeverityChecked[logSeverity]}
        onChange={(e) =>
          setLogSeverityChecked({
            ...logSeverityChecked,
            [logSeverity]: e.target.checked,
          })
        }
      />
      <label
        htmlFor={logSeverity}
        className={cn(
          "flex gap-1 text-gray-400",
          logSeverityChecked[logSeverity] && {
            "text-foreground": logSeverity === LogSeverity.Info,
            "text-yellow-700": logSeverity === LogSeverity.Debug,
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
