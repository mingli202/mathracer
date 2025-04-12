import { GameMode, GameState, Lobby, Player } from "@/types";
import { newConnection } from "@/utils/connection";
import { HubConnection } from "@microsoft/signalr";
import { ActionDispatch, createContext } from "react";
import { z } from "zod";

export const GameStateContext = createContext<GameState>({
  lobby: {
    lobbyId: "",
    gameMode: { type: "time", count: 10 },
    players: [],
    equations: [],
  },
  currentPlayer: {
    playerId: 0,
    hasComplete: false,
    isHost: false,
    name: "Player",
    score: 0,
  },
  connection: null,
});

export type GameStateAction =
  | {
      type: "setPlayers";
      players: Player[];
    }
  | {
      type: "createLobby";
      connection: HubConnection;
      lobby: Lobby;
      currentPlayer: Player;
    }
  | {
      type: "joinLobby";
    };

export function gameStateReducer(state: GameState, action: GameStateAction) {
  const { currentPlayer } = state;

  switch (action.type) {
    case "setPlayers":
      return {
        ...state,
        players: action.players,
        currentPlayer:
          action.players.find((p) => p.playerId === currentPlayer.playerId) ??
          currentPlayer,
      };

    case "createLobby":
      return {
        ...state,
        connection: action.connection,
        lobby: action.lobby,
      };
  }
}

export async function createLobby(
  gameMode: GameMode,
  dispatch: ActionDispatch<[action: GameStateAction]>,
) {
  const conn = await newConnection();
  const res: { player: Player; lobby: Lobby } = z
    .object({ player: Player, lobby: Lobby })
    .parse(await conn.invoke("CreateLobby", JSON.stringify(gameMode)));

  dispatch({
    type: "createLobby",
    connection: conn,
    lobby: res.lobby,
    currentPlayer: res.player,
  });
}
