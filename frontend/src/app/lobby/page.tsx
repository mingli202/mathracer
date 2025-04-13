"use client";

import { createLobby, GameStateContext, joinLobby } from "@/gameState";

import { useSearchParams } from "next/navigation";
import { use, useEffect } from "react";

export default function LobbyPage() {
  const urlSearchParams = useSearchParams();
  const joinId = urlSearchParams.get("join");

  const { gameState, dispatch } = use(GameStateContext);

  const { currentPlayer, lobby } = gameState;

  useEffect(() => {
    if (joinId) {
      joinLobby(
        joinId,
        gameState.currentPlayer.name,
        gameState.connection!,
        dispatch,
      );
    } else {
      createLobby(gameState, gameState.connection!, dispatch);
    }
  }, []);

  return (
    <div>
      <p>
        isHost:
        {currentPlayer.isHost ? "true" : "false"}
      </p>
      <p>
        id:
        {currentPlayer.playerId}
      </p>
      <p>
        lobbyId:
        {lobby.lobbyId}
      </p>
      <div>
        players:
        {lobby.players.map((p) => (
          <p key={p.playerId}>
            {p.isHost ? "true" : "false"}
            {p.playerId} {p.name}
          </p>
        ))}
      </div>
    </div>
  );
}
