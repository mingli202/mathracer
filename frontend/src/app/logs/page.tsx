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
      </form>
    </main>
  );
}
