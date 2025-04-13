import { GameMode, GameState, Lobby, Player } from "@/types";
import { newConnection } from "@/utils/connection";
import { HubConnection } from "@microsoft/signalr";
import { ActionDispatch, createContext, useReducer } from "react";
import { z } from "zod";

const defaultState = {
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
} as GameState;

export const GameStateContext = createContext<{
  gameState: GameState;
  dispatch: ActionDispatch<[action: GameStateAction]>;
}>({
  gameState: defaultState,
  dispatch: () => {},
});

export function GameStateWrapper({ children }: { children: React.ReactNode }) {
  const [gameState, dispatch] = useReducer(gameStateReducer, defaultState);

  return (
    <GameStateContext.Provider value={{ gameState, dispatch }}>
      {children}
    </GameStateContext.Provider>
  );
}

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
    }
  | {
      type: "selectMode";
      mode: GameMode;
    };

export function gameStateReducer(
  state: GameState,
  action: GameStateAction,
): GameState {
  const { currentPlayer, lobby } = state;

  switch (action.type) {
    case "setPlayers":
      return {
        ...state,
        lobby: {
          ...lobby,
          players: action.players,
        },
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

    case "joinLobby":
      return state;

    case "selectMode":
      return {
        ...state,
        lobby: {
          ...lobby,
          gameMode: action.mode,
        },
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
