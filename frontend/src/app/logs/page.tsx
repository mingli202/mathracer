"use client";

import { newConnection } from "@/utils/connection";
import Logs from "./Logs";
import { useEffect, useState } from "react";
import { HubConnection, HubConnectionState } from "@microsoft/signalr";

export default function LogsPage() {
  const [connection, setConnection] = useState<HubConnection | null>(null);

  useEffect(() => {
    if (!connection) {
      const c = newConnection();
      c.start().then(() => setConnection(c));
    }
  }, []);

  if (connection?.state !== HubConnectionState.Connected)
    return (
      <div className="flex h-full w-full items-center justify-center">
        Loading...
      </div>
    );

  return <Logs connection={connection} />;
}
