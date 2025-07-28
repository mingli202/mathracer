"use client";

import { GameStateContext } from "@/gameState";
import { use, useEffect, useState } from "react";
import SeverityCheckbox from "./SeverityCheckbox";
import { Log, LogSeverity } from "@/types";
import { cn } from "@/utils/cn";
import { Bug, Info, TriangleAlert } from "lucide-react";

export default function Logs() {
  const { gameState } = use(GameStateContext);
  const { connection } = gameState;

  const [logSeverityChecked, setLogSeverityChecked] = useState<
    Record<LogSeverity, boolean>
  >({
    [LogSeverity.Info]: true,
    [LogSeverity.Debug]: true,
    [LogSeverity.Error]: true,
  });

  const [regexFilter, setRegexFilter] = useState("");

  const [logs, setLogs] = useState<Log[]>([]);
  const [isPaused, setIsPaused] = useState(false);

  function startListening() {
    setIsPaused(false);
    connection.on("Log", (log: string) => {
      setLogs((logs) => [...logs, Log.parse(JSON.parse(log))]);
    });
  }

  function stopListening() {
    setIsPaused(true);
    connection.off("Log");
  }

  useEffect(() => {
    startListening();

    return () => {
      stopListening();
    };
  }, []);

  return (
    <main className="flex h-full w-full flex-col gap-4">
      <p className="shink-0 w-full text-center">Server Logs</p>
      <form
        className="flex w-full shrink-0 flex-col gap-2"
        action={(formData) => {
          const _regexFilter =
            formData.get("regex-filter")?.toString() ?? regexFilter;
          setRegexFilter(_regexFilter);
        }}
      >
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
            Deselect All
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
          />
        </div>
        <div className="flex w-full items-center gap-2">
          <button
            className="bg-muted text-muted-foreground border-muted hover:bg-foreground/10 hover:text-foreground w-fit rounded-md px-2 py-1 transition"
            type="button"
            onClick={() => {
              setLogs([]);
            }}
          >
            Clear Logs
          </button>
          {isPaused ? (
            <button
              className="bg-muted text-muted-foreground border-muted hover:bg-foreground/10 hover:text-foreground w-fit rounded-md px-2 py-1 transition"
              type="button"
              onClick={() => {
                startListening();
              }}
            >
              Resume Logs
            </button>
          ) : (
            <button
              className="bg-muted text-muted-foreground border-muted hover:bg-foreground/10 hover:text-foreground w-fit rounded-md px-2 py-1 transition"
              type="button"
              onClick={() => {
                stopListening();
              }}
            >
              Pause Logs
            </button>
          )}
        </div>
      </form>

      {/* logs */}
      <div className="overflow-x-none flex h-full w-full flex-col gap-2 overflow-y-auto rounded-md border border-gray-100 bg-white p-4 shadow-sm">
        {logs
          .filter(
            (log) =>
              (regexFilter === "" || log.message.match(regexFilter)) &&
              logSeverityChecked[log.severity],
          )
          .map((log, i) => (
            <div
              key={log.timestamp + i}
              className={cn("flex w-full items-center gap-2 text-sm", {
                "text-foreground": log.severity === LogSeverity.Info,
                "text-yellow-700": log.severity === LogSeverity.Debug,
                "text-red-700": log.severity === LogSeverity.Error,
              })}
            >
              {log.severity === LogSeverity.Info && <Info />}
              {log.severity === LogSeverity.Debug && <Bug />}
              {log.severity === LogSeverity.Error && <TriangleAlert />}
              <p className="font-bold">{log.timestamp}</p>
              <p>{log.message}</p>
            </div>
          ))}
      </div>
    </main>
  );
}
