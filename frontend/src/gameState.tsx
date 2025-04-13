"use client";

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
      type: "joinLobby";
      connection: HubConnection;
      lobby: Lobby;
      currentPlayer: Player;
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

    case "joinLobby":
      return {
        ...state,
        connection: action.connection,
        lobby: action.lobby,
      };

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
  gameState: GameState,
  dispatch: ActionDispatch<[action: GameStateAction]>,
) {
  const conn = await newConnection();
  const res: { player: Player; lobby: Lobby } = z
    .object({ player: Player, lobby: Lobby })
    .parse(
      JSON.parse(
        await conn.invoke(
          "CreateLobby",
          JSON.stringify(gameState.lobby.gameMode),
          gameState.currentPlayer.name,
        ),
      ),
    );

  dispatch({
    type: "joinLobby",
    connection: conn,
    lobby: res.lobby,
    currentPlayer: res.player,
  });
}

export async function joinLobby(
  joinId: string,
  name: string,
  dispatch: ActionDispatch<[action: GameStateAction]>,
) {
  const conn = await newConnection();

  try {
    const res: { player: Player; lobby: Lobby } = z
      .object({
        player: Player,
        lobby: Lobby,
      })
      .parse(JSON.parse(await conn.invoke("JoinLobby", joinId, name)));

    dispatch({
      type: "joinLobby",
      connection: conn,
      lobby: res.lobby,
      currentPlayer: res.player,
    });
  } catch (e) {
    alert("this lobby doesn't exist!");
  }
}
