"use client";

import { newConnection } from "@/utils/connection";
import Logs from "./Logs";
import { useEffect, useState } from "react";
import { HubConnection } from "@microsoft/signalr";

export default function LogsPage() {
  const [connection, setConnection] = useState<HubConnection | null>(null);

  useEffect(() => {
    if (!connection) {
      newConnection().then(setConnection);
    }
  }, []);

  if (!connection) return <div>Loading...</div>;

  return <Logs connection={connection} />;
}
