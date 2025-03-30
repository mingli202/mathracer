"use client";

import GameScreen from "@/components/GameScreen";
import JoinGameScreen from "@/components/JoinGameScreen";
import LobbyScreen from "@/components/LobbyScreen";
import MainMenu from "@/components/MainMenu";
import ResultsScreen from "@/components/ResultsScreen";
import { GameMode, GameState, Player } from "@/types/game";
import { useEffect, useMemo, useReducer, useState } from "react";
import { useSearchParams } from "next/navigation";
import * as signalR from "@microsoft/signalr";

export default function Page() {
  const urlSearchParams = useSearchParams();
  const isJoining = urlSearchParams.get("join") !== null;
  const gameId = urlSearchParams.get("join") ?? crypto.randomUUID().toString();

  const currentPlayer: Player = {
    id: crypto.randomUUID().toString(),
    name: "Guest",
    score: 0,
    isHost: false,
    progress: 0,
  };

  const [screen, setScreen] = useState<GameState>(isJoining ? "lobby" : "menu");
  const [gameOps, dispatch] = useReducer(gameOpsreducer, {
    gameId: gameId,
    currentPlayer,
    players: [currentPlayer],
    gameMode: { type: "time", seconds: 10 },
  });

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl("localhost:5103/hub")
      .build();
  }, []);

  return (
    <main className="flex h-full w-full items-center justify-center">
      {(() => {
        switch (screen) {
          case "menu":
            return (
              <MainMenu
                onSelectMode={(gameMode) =>
                  dispatch({ type: "setGameMode", gameMode })
                }
                onJoinGame={() => setScreen("joining")}
                onCreateGame={() => {
                  dispatch({ type: "createGame" });
                  setScreen("lobby");
                }}
                onStartSinglePlayer={() => {
                  setScreen("playing");
                }}
              />
            );
          case "joining":
            return (
              <JoinGameScreen
                onJoinGame={() => {}}
                onBackToMenu={() => setScreen("menu")}
              />
            );
          case "lobby":
            return (
              <LobbyScreen
                onBackToMenu={() => {
                  dispatch({ type: "exitLobby" });
                  setScreen("menu");
                }}
                onStartGame={() => setScreen("playing")}
                players={gameOps.players}
                gameId={gameId}
                isHost={gameOps.currentPlayer.isHost}
                selectedMode={gameOps.gameMode}
              />
            );
          case "playing":
            return (
              <GameScreen
                {...gameOps}
                onGameEnd={() => setScreen("results")}
                equations={[]}
              />
            );
          case "results":
            return (
              <ResultsScreen
                players={gameOps.players}
                gameMode={gameOps.gameMode}
                onBackToMenu={() => setScreen("menu")}
                onPlayAgain={() => setScreen("playing")}
              />
            );
        }
      })()}
    </main>
  );
}

type GameOps = {
  currentPlayer: Player;
  players: Player[];
  gameMode: GameMode;
  gameId: string;
};

type GameOpsAction =
  | {
      type: "addPlayer";
      player: Player;
    }
  | {
      type: "setGameMode";
      gameMode: GameMode;
    }
  | {
      type: "createGame";
    }
  | {
      type: "exitLobby";
    };

function gameOpsreducer(state: GameOps, action: GameOpsAction): GameOps {
  switch (action.type) {
    case "addPlayer":
      return {
        ...state,
        players: [...state.players, action.player],
      };
    case "setGameMode":
      return {
        ...state,
        gameMode: action.gameMode,
      };
    case "createGame":
      return {
        ...state,
        players: state.players.map((p) => {
          return {
            ...p,
            isHost: p.id === state.currentPlayer.id,
          };
        }),
        currentPlayer: {
          ...state.currentPlayer,
          isHost: true,
        },
      };
    case "exitLobby":
      return {
        ...state,
        players: state.players.map((p) => {
          return {
            ...p,
            isHost: false,
          };
        }),
        currentPlayer: {
          ...state.currentPlayer,
          isHost: false,
        },
      };
  }
}
