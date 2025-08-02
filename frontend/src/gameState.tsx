"use client";

import { Equation, GameMode, GameState, Lobby, Player } from "@/types";
import { HubConnection } from "@microsoft/signalr";
import { useRouter } from "next/navigation";
import { ActionDispatch, createContext, useEffect, useReducer } from "react";
import { z } from "zod";
import { newConnection } from "./utils/connection";

const defaultState = {
  lobby: {
    lobbyId: "",
    gameMode: { type: "time", count: 10 },
    players: [],
    equations: [],
  },
  currentPlayer: {
    playerId: "",
    state: "lobby",
    isHost: false,
    name: "Player",
    score: 0,
  },
  connection: null!,
} satisfies GameState;

export const GameStateContext = createContext<{
  gameState: GameState;
  dispatch: ActionDispatch<[action: GameStateAction]>;
}>({
  gameState: defaultState,
  dispatch: () => {},
});

type Props = {
  children: React.ReactNode;
};

export function GameStateWrapper({ children }: Props) {
  const [gameState, dispatch] = useReducer(gameStateReducer, defaultState);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const c = await newConnection();

      dispatch({ type: "setConnection", connection: c });

      c.on("SyncPlayers", (res: string) => {
        const players = z.array(Player).parse(JSON.parse(res));
        dispatch({ type: "setPlayers", players });
      });

      c.on("SyncEquations", (res: string) => {
        const equations = z.array(Equation).parse(JSON.parse(res));
        dispatch({ type: "setEquations", equations });
      });

      c.on("AddUnloadEventListener", (lobbyId: string, playerId: string) => {
        window.addEventListener(
          "beforeunload",
          () => {
            exitLobby(c, lobbyId, playerId, dispatch);
            // c.stop();
          },
          { once: true },
        );
      });

      c.on("MoveToGameScreen", () => router.push("/game/play"));
    })();
  }, []);

  if (!gameState.connection) return <div>Connecting...</div>;

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
      type: "setEquations";
      equations: Equation[];
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
      connection: HubConnection;
    }
  | {
      type: "setName";
      name: string;
    }
  | {
      type: "exitLobby";
    }
  | {
      type: "setCurrentPlayerState";
      state: Player["state"];
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

    case "setEquations":
      return {
        ...state,
        lobby: {
          ...lobby,
          equations: action.equations,
        },
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
          lobbyId: "",
        },
        currentPlayer: {
          playerId: "",
          state: "lobby",
          isHost: false,
          name: "Player",
          score: 0,
        },
      };

    case "setCurrentPlayerState":
      return {
        ...state,
        currentPlayer: {
          ...currentPlayer,
          state: action.state,
        },
      };
  }
}

export async function createLobby(
  name: string,
  gameMode: GameMode,
  conn: HubConnection,
  dispatch: ActionDispatch<[action: GameStateAction]>,
) {
  const res: { player: Player; lobby: Lobby } = z
    .object({ player: Player, lobby: Lobby })
    .parse(
      JSON.parse(
        await conn.invoke("CreateLobby", JSON.stringify(gameMode), name),
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
  dispatch({ type: "exitLobby" });

  if (connection.state === "Connected") {
    await connection.send("ExitLobby", lobbyId, playerId);
  }
}

export async function updatePlayerState(
  connection: HubConnection,
  lobbyId: string,
  playerId: string,
  state: Player["state"],
  dispatch: ActionDispatch<[action: GameStateAction]>,
) {
  dispatch({ type: "setCurrentPlayerState", state });
  await connection.send("UpdatePlayerState", lobbyId, playerId, state);
}
