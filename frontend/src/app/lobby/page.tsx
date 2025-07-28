"use client";

import PlayerList from "@/components/PlayerList";
import { Button } from "@/components/ui/button";
import {
  createLobby,
  exitLobby,
  GameStateContext,
  joinLobby,
} from "@/gameState";
import { ArrowLeft, Copy, Play, LoaderCircle } from "lucide-react";
import Link from "next/link";

import { useRouter, useSearchParams } from "next/navigation";
import { use, useState } from "react";

export default function LobbyPage() {
  const urlSearchParams = useSearchParams();

  const { gameState, dispatch } = use(GameStateContext);

  const [showNameDialogue, setShowNameDialogue] = useState(true);
  const [copyModalMessage, setCopyModalMessage] = useState<
    "loading" | "copied"
  >("loading");
  const [copyModalCoords, setCopyModalCoords] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const router = useRouter();

  const { currentPlayer, lobby, connection } = gameState;
  const { lobbyId, players, gameMode } = lobby;

  const joinId = urlSearchParams.get("join");
  const gameUrl = `http://localhost:3000/lobby?join=${lobbyId}`;

  const copyInviteLink = (text: string, x: number, y: number) => {
    setCopyModalMessage("loading");
    setCopyModalCoords({ x, y });
    navigator.clipboard.writeText(text);
    setCopyModalMessage("copied");
    console.log("copied");

    const f = () => {
      window.removeEventListener("mousemove", f);
      // window.removeEventListener("click", f);
      setCopyModalCoords(null);
      setCopyModalMessage("loading");
    };

    window.addEventListener("mousemove", f, { once: true });
    // window.addEventListener("click", f, { once: true });
  };

  const canStart = (): boolean => {
    return !players.some((p) => p.state === "playing");
  };
  // Display game mode info
  const getModeDescription = () => {
    if (gameMode.type === "equations") {
      return `First to solve ${gameMode.count} equations wins`;
    } else {
      return `Solve the most equations in ${gameMode.count} seconds`;
    }
  };

  return (
    <div className="animate-fade-in flex max-w-2xl flex-col items-center justify-center space-y-6">
      {showNameDialogue && currentPlayer.state === "lobby" ? (
        <div className="flex h-full w-full flex-col items-center justify-center">
          <p>Join as...</p>
          <form
            className="w-60"
            action={async (formdata) => {
              const name = formdata.get("name")?.toString() ?? "Guest";
              dispatch({
                type: "setName",
                name,
              });

              if (joinId) {
                if (
                  !(await joinLobby(
                    joinId,
                    name,
                    gameState.connection,
                    dispatch,
                  ))
                ) {
                  return router.push("/");
                }
              } else {
                await createLobby(
                  name,
                  gameMode,
                  gameState.connection,
                  dispatch,
                );
              }

              setShowNameDialogue(false);
            }}
          >
            <label htmlFor="name" />
            <input
              className="w-full p-2 outline-none placeholder:italic"
              placeholder="name..."
              id="name"
              name="name"
              type="text"
              autoFocus
            />
            <div className="bg-secondary h-0.5 w-full rounded-full" />
            <Button className="mt-2 w-full" type="submit">
              Ok
            </Button>
          </form>
        </div>
      ) : (
        <>
          {copyModalCoords ? (
            <div
              className="bg-background absolute z-10 -translate-x-1/2 -translate-y-full rounded-md p-1 shadow-lg"
              style={{
                top: copyModalCoords.y,
                left: copyModalCoords.x,
              }}
            >
              {copyModalMessage === "copied" ? (
                "Copied!"
              ) : (
                <LoaderCircle className="animate-spin" />
              )}
            </div>
          ) : null}

          <div className="w-full">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="mb-4 flex items-center gap-2"
                onClick={() =>
                  exitLobby(
                    gameState.connection,
                    lobbyId,
                    currentPlayer.playerId,
                    dispatch,
                  )
                }
              >
                <ArrowLeft size={16} />
                <span>Back to Menu</span>
              </Button>
            </Link>

            <h1 className="mb-2 text-center text-3xl font-bold">Game Lobby</h1>
            <div className="text-muted-foreground mb-6 flex w-full flex-col items-center text-center">
              <p>{getModeDescription()}</p>
              <button
                className="flex cursor-pointer items-center justify-center gap-2 hover:underline"
                onClick={(e) => copyInviteLink(lobbyId, e.clientX, e.clientY)}
              >
                Lobby id: {lobbyId} <Copy size={16} />
              </button>
            </div>
          </div>

          <div className="bg-secondary/30 border-secondary w-full rounded-lg border p-4">
            <div className="mb-2 flex flex-col items-center justify-between gap-3 md:flex-row">
              <div className="text-sm font-medium">
                Share this link to invite players:
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => copyInviteLink(gameUrl, e.clientX, e.clientY)}
                  className="flex items-center gap-1"
                >
                  <Copy size={14} />
                  <span>Copy</span>
                </Button>
              </div>
            </div>
            <div className="bg-background truncate rounded border p-2 text-xs">
              {gameUrl}
            </div>
          </div>

          <div className="w-full">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Players ({players.length})
              </h2>
              {currentPlayer.isHost && players.length > 1 && canStart() && (
                <Button
                  className="math-button-primary flex items-center gap-2"
                  onClick={async () => {
                    connection.send("MoveToGameScreen", lobbyId);
                  }}
                >
                  <Play size={16} />
                  <span>Start Game</span>
                </Button>
              )}
            </div>

            <PlayerList
              players={players}
              currentPlayerId={currentPlayer.playerId}
              gameMode={gameMode}
            />

            {(players.length < 2 || !canStart()) && (
              <p className="text-muted-foreground mt-4 text-center text-sm">
                Waiting for players...
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
