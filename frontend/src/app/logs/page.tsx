"use client";

import { GameStateContext } from "@/gameState";
import { use, useState } from "react";
import SeverityCheckbox from "./SeverityCheckbox";
import { LogSeverity } from "@/types";

export default function Logs() {
  const { gameState } = use(GameStateContext);
  const { connection } = gameState;

  const [logSeverityChecked, setLogSeverityChecked] = useState<
    Record<LogSeverity, boolean>
  >({
    [LogSeverity.Info]: false,
    [LogSeverity.Debug]: false,
    [LogSeverity.Error]: false,
  });

  const [regexFilter, setRegexFilter] = useState("");

  return (
    <main className="flex h-full w-full flex-col gap-4">
      <p className="shink-0 w-full text-center">Server Logs</p>
      <form className="flex w-full shrink-0 flex-col gap-2">
        <div className="flex w-full items-center gap-4">
          <p>Severity:</p>
          <SeverityCheckbox
            logSeverity={LogSeverity.Info}
            logSeverityChecked={logSeverityChecked}
            setLogSeverityChecked={setLogSeverityChecked}
          />
          <SeverityCheckbox
            logSeverity={LogSeverity.Debug}
            logSeverityChecked={logSeverityChecked}
            setLogSeverityChecked={setLogSeverityChecked}
          />
          <SeverityCheckbox
            logSeverity={LogSeverity.Error}
            logSeverityChecked={logSeverityChecked}
            setLogSeverityChecked={setLogSeverityChecked}
          />
          <button
            className="bg-muted text-muted-foreground border-muted hover:bg-foreground/10 hover:text-foreground rounded-md px-2 py-1 transition"
            type="button"
            onClick={() => {
              setLogSeverityChecked({
                [LogSeverity.Info]: true,
                [LogSeverity.Debug]: true,
                [LogSeverity.Error]: true,
              });
            }}
          >
            Select All
          </button>
          <button
            className="bg-muted text-muted-foreground border-muted hover:bg-foreground/10 hover:text-foreground rounded-md px-2 py-1 transition"
            type="button"
            onClick={() => {
              setLogSeverityChecked({
                [LogSeverity.Info]: false,
                [LogSeverity.Debug]: false,
                [LogSeverity.Error]: false,
              });
            }}
          >
            Clear
          </button>
        </div>
        <div className="flex w-full items-center gap-2">
          <label htmlFor="regex-filter" className="shrink-0">
            Regex Filter:
          </label>
          <input
            type="text"
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex w-full rounded-md border px-3 py-2 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            id="regex-filter"
            name="regex-filter"
            placeholder="Enter a regex filter"
            value={regexFilter}
            onChange={(e) => setRegexFilter(e.target.value)}
          />
        </div>
      </form>
    </main>
  );
}
