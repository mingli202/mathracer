"use client";

import { GameStateContext } from "@/gameState";
import { Fragment, use, useEffect, useRef, useState } from "react";
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
  const timer = useRef<number | null>(null);
  const activeSearchDelayMs = 500;

  const [logs, setLogs] = useState<Log[]>([]);
  const [isPaused, setIsPaused] = useState(false);

  const [selectedLog, setSelectedLog] = useState<Log | null>(null);

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
        <div className="flex w-full flex-wrap items-center gap-x-4 gap-y-1">
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
            className="bg-muted text-muted-foreground border-muted hover:bg-foreground/10 hover:text-foreground shrink-0 rounded-md px-2 py-1 transition"
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
            className="bg-muted text-muted-foreground border-muted hover:bg-foreground/10 hover:text-foreground shrink-0 rounded-md px-2 py-1 transition"
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
            placeholder="Filter messges by regex"
            defaultValue={regexFilter}
            onChange={(e) => {
              const value = e.target.value;

              if (timer.current) {
                window.clearTimeout(timer.current);
              }

              timer.current = window.setTimeout(() => {
                setRegexFilter(value);
              }, activeSearchDelayMs);
            }}
          />
        </div>
        <div className="flex w-full items-center gap-2">
          <button
            className="bg-muted text-muted-foreground border-muted hover:bg-foreground/10 hover:text-foreground w-fit rounded-md px-2 py-1 transition"
            type="button"
            onClick={() => {
              setLogs([]);
              setSelectedLog(null);
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
      <div className="overflow-x-none relative flex h-full w-full flex-col overflow-y-auto rounded-md border border-gray-100 bg-white p-2 shadow-sm">
        {logs.map((log, i) => {
          if (!logSeverityChecked[log.severity]) {
            return null;
          }

          if (regexFilter === "") {
            return (
              <LogEntry
                log={log}
                key={log.timestamp + i}
                selectedLog={selectedLog}
                setSelectedLog={setSelectedLog}
              />
            );
          }

          // case insensitive unless there is an uppercase letter
          let regex;
          try {
            regex = new RegExp(regexFilter, "g");
            if (regexFilter.toLowerCase() === regexFilter) {
              regex = new RegExp(regexFilter, "gi");
            }
          } catch (e) {
            console.error(e);
            return null;
          }
          const matches = log.message.matchAll(regex).toArray();

          if (matches.length === 0) {
            return null;
          }

          // highlight matched text in the log message
          let next = 0;
          const messageWithHighlights = matches.map((match, ii) => {
            const matchIndex = match.index;
            const start = next;
            next = matchIndex + match[0].length;

            // add a non-highlighted section with a highlighted section
            return (
              <Fragment key={log.timestamp + ii + start}>
                <span>{log.message.slice(start, matchIndex)}</span>
                <span className="bg-yellow-200 font-bold text-black">
                  {match[0]}
                </span>
              </Fragment>
            );
          });

          // add the last bit that might be left
          messageWithHighlights.push(
            <span key={log.timestamp + next + messageWithHighlights.length}>
              {log.message.slice(next)}
            </span>,
          );

          return (
            <LogEntry
              log={log}
              customMessage={messageWithHighlights}
              key={log.timestamp + i}
              selectedLog={selectedLog}
              setSelectedLog={setSelectedLog}
            />
          );
        })}
      </div>
    </main>
  );
}

function LogEntry({
  log,
  customMessage,
  selectedLog,
  setSelectedLog,
  ...props
}: {
  log: Log;
  withDetails?: boolean;
  selectedLog: Log | null;
  customMessage?: React.ReactNode;
  setSelectedLog: React.Dispatch<React.SetStateAction<Log | null>>;
} & React.ComponentProps<"div">) {
  const isSelected = selectedLog === log;

  return (
    <div
      className={cn(
        "hover:bg-muted flex max-h-3/4 w-full flex-col rounded-sm p-1 text-sm transition hover:cursor-pointer",
        {
          "text-foreground": log.severity === LogSeverity.Info,
          "text-yellow-700": log.severity === LogSeverity.Debug,
          "text-red-700": log.severity === LogSeverity.Error,
        },
        selectedLog === log && "bg-muted",
      )}
      onClick={() => setSelectedLog((l) => (l === log ? null : log))}
      {...props}
    >
      <div className="flex w-full items-center gap-2">
        {log.severity === LogSeverity.Info && <Info className="shrink-0" />}
        {log.severity === LogSeverity.Debug && <Bug className="shrink-0" />}
        {log.severity === LogSeverity.Error && (
          <TriangleAlert className="shrink-0" />
        )}
        <p className="shrink-0 font-bold">
          {isSelected ? log.timestamp : log.timestamp.split(" ")[1]}
        </p>
        <p className="overflow-hidden text-ellipsis whitespace-nowrap">
          {customMessage ?? log.message}
        </p>
      </div>
      {selectedLog === log && (
        <pre className="text-foreground overflow-y-auto p-2">{log.details}</pre>
      )}
    </div>
  );
}
