"use client";

import { GameMode, GameState, Lobby, Player } from "@/types";
import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import { ActionDispatch, createContext, useEffect, useReducer } from "react";
import { z } from "zod";

const defaultState = {
  lobby: {
    lobbyId: "",
    gameMode: { type: "time", count: 10 },
    players: [],
    equations: [],
  },
  currentPlayer: {
    playerId: "",
    hasComplete: false,
    isHost: false,
    name: "Player",
    score: 0,
  },
  connection: null,
} satisfies GameState;

export const GameStateContext = createContext<{
  gameState: GameState;
  dispatch: ActionDispatch<[action: GameStateAction]>;
}>({
  gameState: defaultState,
  dispatch: () => {},
});

export function GameStateWrapper({ children }: { children: React.ReactNode }) {
  const [gameState, dispatch] = useReducer(gameStateReducer, defaultState);

  useEffect(() => {
    (async function () {
      // await new Promise((res) => setTimeout(res, 5000));

      const c = new HubConnectionBuilder()
        .withUrl("http://localhost:5103/hub")
        .build();

      c.start()
        .then(() => dispatch({ type: "setConnection", connection: c }))
        .catch((e) => console.log(e));
    })();
  }, []);

  useEffect(() => {
    const c = gameState.connection;

    if (!c) {
      return;
    }

    c.on("SyncPlayers", (res: string) => {
      const players = z.array(Player).parse(JSON.parse(res));
      dispatch({ type: "setPlayers", players });
    });

    c.on("AddUnloadEventListener", (lobbyId: string, playerId: string) => {
      window.addEventListener(
        "beforeunload",
        () => {
          exitLobby(c, lobbyId, playerId, dispatch);
        },
        { once: true },
      );
    });

    return () => {
      c.off("SyncPlayers");
      c.off("AddUnloadEventListener");
    };
  }, [gameState.connection]);

  return (
    <GameStateContext.Provider value={{ gameState, dispatch }}>
      {gameState.connection ? children : <div>Connecting...</div>}
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
      lobby: Lobby;
      currentPlayer: Player;
    }
  | {
      type: "selectMode";
      mode: GameMode;
    }
  | {
      type: "setConnection";
      connection: HubConnection | null;
    }
  | {
      type: "setName";
      name: string;
    }
  | {
      type: "exitLobby";
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
        lobby: action.lobby,
        currentPlayer: action.currentPlayer,
      };

    case "selectMode":
      return {
        ...state,
        lobby: {
          ...lobby,
          gameMode: action.mode,
        },
      };

    case "setConnection":
      return {
        ...state,
        connection: action.connection,
      };

    case "setName":
      return {
        ...state,
        currentPlayer: {
          ...currentPlayer,
          name: action.name,
        },
        lobby: {
          ...lobby,
          players: lobby.players.map((p) =>
            p.playerId === currentPlayer.playerId
              ? {
                  ...currentPlayer,
                  name: action.name,
                }
              : p,
          ),
        },
      };

    case "exitLobby":
      return {
        ...state,
        lobby: {
          ...lobby,
          players: [],
          equations: [],
        },
        currentPlayer: {
          playerId: "",
          hasComplete: false,
          isHost: false,
          name: "Player",
          score: 0,
        },
      };
  }
}

export async function createLobby(
  gameState: GameState,
  conn: HubConnection,
  dispatch: ActionDispatch<[action: GameStateAction]>,
) {
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
    lobby: res.lobby,
    currentPlayer: res.player,
  });
}

export async function joinLobby(
  joinId: string,
  name: string,
  conn: HubConnection,
  dispatch: ActionDispatch<[action: GameStateAction]>,
): Promise<boolean> {
  try {
    const res: { player: Player; lobby: Lobby } = z
      .object({
        player: Player,
        lobby: Lobby,
      })
      .parse(JSON.parse(await conn.invoke("JoinLobby", joinId, name)));

    dispatch({
      type: "joinLobby",
      lobby: res.lobby,
      currentPlayer: res.player,
    });
    return true;
  } catch (e) {
    console.log(e);
    alert("this lobby doesn't exist!");
    return false;
  }
}

export async function exitLobby(
  connection: HubConnection,
  lobbyId: string,
  playerId: string,
  dispatch: ActionDispatch<[action: GameStateAction]>,
) {
  await connection.invoke("ExitLobby", lobbyId, playerId);
  dispatch({ type: "exitLobby" });
}
