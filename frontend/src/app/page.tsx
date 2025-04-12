"use client";

import { useEffect, useState } from "react";
import { ConnectionContext } from "./connectionContext";
import Wrapper from "./wrapper";
import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const searchParams = useSearchParams();
  const isJoining = searchParams.get("join") ? true : false;
  const gameId = searchParams.get("join") ?? crypto.randomUUID().toString();

  const [conn, setConn] = useState<HubConnection | null>(null);

  useEffect(() => {
    const id = setInterval(() => {
      const connection = new HubConnectionBuilder()
        .withUrl("http://localhost:5103/hub")
        .build();

      connection
        .start()
        .then(() => {
          clearInterval(id);
          setConn(connection);
        })
        .catch(() => {
          setConn(null);
        });
    }, 1000);

    return () => {
      if (conn) {
        conn.stop();
      }
    };
  }, []);

  return !conn ? (
    <div className="flex h-full w-full items-center justify-center">
      Making Connection...
    </div>
  ) : (
    <ConnectionContext.Provider value={conn}>
      <Wrapper gameId={gameId} isJoining={isJoining} />
    </ConnectionContext.Provider>
  );
}
