"use client";

import GameScreen from "@/components/GameScreen";
import JoinGameScreen from "@/components/JoinGameScreen";
import LobbyScreen from "@/components/LobbyScreen";
import MainMenu from "@/components/MainMenu";
import ResultsScreen from "@/components/ResultsScreen";
import { GameState, Player } from "@/types/game";
import { use, useEffect, useReducer, useState } from "react";
import { ConnectionContext } from "./connectionContext";
import { gameOpsreducer } from "./gameOps";
import { withConnection } from "@/utils/connection";
import { useRouter } from "next/navigation";

type Props = {
  gameId: string;
  isJoining: boolean;
};

export default function Wrapper({ gameId, isJoining }: Props) {
  const initialPlayer: Player = {
    id: 1,
    name: "Player",
    score: 0,
    isHost: false,
    progress: 0,
    hasComplete: false,
    isSinglePlayer: false,
  };

  const [screen, setScreen] = useState<GameState>(isJoining ? "lobby" : "menu");
  const [gameOps, dispatch] = useReducer(gameOpsreducer, {
    gameId,
    currentPlayer: initialPlayer,
    players: [],
    gameMode: { type: "time", count: 10 },
    equations: [],
  });

  const [countDown, setCountDown] = useState(3);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const connection = use(ConnectionContext)!;
  const router = useRouter();

  useEffect(() => {
    connection.on("StartGame", (req: string) => {
      console.log("game started!!!");
      dispatch({ type: "setEquations", equations: JSON.parse(req) });
      setScreen("playing");
    });

    connection.on("SyncPlayers", (players: string) => {
      console.log("sync players");
      dispatch({
        type: "setPlayers",
        players: JSON.parse(players),
      });
    });

    connection.on("SetGameMode", (mode: string) => {
      dispatch({
        type: "setGameMode",
        gameMode: JSON.parse(mode),
      });
    });

    connection.on("AddUnloadEventListener", (player: string) => {
      const p: Player = JSON.parse(player);

      const f = async () => {
        await connection.send("RemovePlayer", gameId, p.id);
      };

      window.addEventListener("beforeunload", f, { once: true });

      dispatch({
        type: "setCurrentPlayer",
        player: p,
      });
    });

    connection.on("CountDown", (count: number) => {
      setCountDown(count);
    });

    connection.on("TimeElapsed", (time) => setTimeElapsed(time));

    return () => {
      connection.off("CountDown");
      connection.off("TimeElapsed");
      connection.off("StartGame");
      connection.off("SyncPlayers");
      connection.off("SetGameMode");
      connection.off("AddUnloadEventListener");
    };
  }, []);

  async function play() {
    console.log("gameOps.gameId:", gameOps.gameId);

    await withConnection(async (c) => {
      await c.send("ClearStats", gameOps.gameId);
      await c.send(
        "StartGame",
        gameOps.gameId,
        JSON.stringify(gameOps.gameMode),
      );
    });
  }

  async function exitLobby() {
    console.log("gameOps.gameId:", gameOps.gameId);

    await connection
      .send("RemovePlayer", gameOps.gameId, gameOps.currentPlayer.id)
      .catch();

    dispatch({ type: "exitLobby" });
    router.push("/");

    setScreen("menu");
  }

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
                  setScreen("lobby");
                }}
                onStartSinglePlayer={async () => {
                  dispatch({
                    type: "setCurrentPlayer",
                    player: { ...gameOps.currentPlayer, isSinglePlayer: true },
                  });

                  const countDownId = setInterval(() => {
                    setCountDown((c) => c - 1);

                    if (countDown == 0) {
                      clearInterval(countDownId);

                      const timerId = setInterval(() => {
                        setTimeElapsed(timeElapsed + 1);
                      }, 1000);
                    }
                  }, 1000);

                  setScreen("playing");
                }}
              />
            );
          case "joining":
            return (
              <JoinGameScreen
                onJoinGame={(gameId) => {
                  dispatch({ type: "setGameId", gameId });
                  setScreen("lobby");
                }}
                onBackToMenu={() => setScreen("menu")}
              />
            );
          case "lobby":
            return (
              <LobbyScreen
                dispatch={dispatch}
                onBackToMenu={exitLobby}
                onStartGame={play}
                players={gameOps.players}
                gameId={gameOps.gameId}
                currentPlayer={gameOps.currentPlayer}
                selectedMode={gameOps.gameMode}
              />
            );
          case "playing":
            return (
              <GameScreen
                onGameEnd={() => {
                  setScreen("results");
                }}
                gameOps={gameOps}
                dispatch={dispatch}
                countDown={countDown}
                timeElapsed={timeElapsed}
              />
            );
          case "results":
            return (
              <ResultsScreen
                currentPlayer={gameOps.currentPlayer}
                players={gameOps.players}
                gameMode={gameOps.gameMode}
                onBackToMenu={exitLobby}
                onPlayAgain={() => {
                  if (gameOps.currentPlayer.isSinglePlayer) {
                    play();
                  } else {
                    setScreen("lobby");
                  }
                }}
                dispatch={dispatch}
              />
            );
        }
      })()}
    </main>
  );
}
