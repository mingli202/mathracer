"use client";

import PlayerList from "@/components/PlayerList";
import { Button } from "@/components/ui/button";
import { exitLobby, GameStateContext } from "@/gameState";
import { Home, RotateCcw, Trophy } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useLayoutEffect } from "react";

export default function ResultsPage() {
  const { gameState, dispatch } = use(GameStateContext);
  const { lobby, currentPlayer, connection } = gameState;
  const { gameMode, players, lobbyId } = lobby;
  const router = useRouter();

  useLayoutEffect(() => {
    if (lobbyId === "") {
      router.push("/game");
    }
  }, []);

  const highestScore =
    gameMode.type === "equations"
      ? Math.min(
          ...players.map((player) =>
            player.state === "completed" ? player.score : Infinity,
          ),
        )
      : Math.max(...players.map((player) => player.score));
  const winners = players.filter(
    (player) => player.score === highestScore && player.state === "completed",
  );

  // For display, sort players by score (highest first)
  const sortedPlayers =
    gameMode.type === "equations"
      ? [...players].sort((a, b) => {
          if (a.state === "completed" && !(b.state === "completed")) return -1;
          if (!(a.state === "completed") && b.state === "completed") return 1;

          if (a.state === "completed" && b.state === "completed") {
            return a.score - b.score;
          }
          return b.score - a.score;
        })
      : [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="animate-fade-in mx-auto max-w-xl space-y-8">
      <div className="text-center">
        <h1 className="mb-2 text-3xl font-bold">Game Over!</h1>
        <p className="text-muted-foreground">
          {gameMode.type === "equations"
            ? `First to solve ${gameMode.count} equations`
            : `Most equations solved in ${gameMode.count} seconds`}
        </p>
      </div>

      <div className="py-6 text-center">
        <div className="bg-accent mb-4 inline-block rounded-full p-6">
          <Trophy size={48} className="text-accent-foreground" />
        </div>

        <h2 className="mb-2 text-2xl font-bold">
          {winners.length === 1 ? `${winners[0].name} wins!` : "It's a tie!"}
        </h2>

        {winners.length > 1 && (
          <div className="mb-2 text-lg">
            {winners.map((winner) => winner.name).join(" & ")}
          </div>
        )}

        <div className="text-lg">
          {gameMode.type === "equations" ? (
            <>
              Solving {gameMode.count} equations in{" "}
              <span className="font-bold">{highestScore}</span> seconds
            </>
          ) : (
            <>
              With <span className="font-bold">{highestScore}</span> equations
              solved
            </>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Final Results</h3>
        <PlayerList
          players={sortedPlayers}
          showScores={true}
          currentPlayerId={currentPlayer.playerId}
          gameMode={gameMode}
        />
      </div>

      <div className="flex flex-col gap-3 pt-4 sm:flex-row">
        <Button
          className="math-button-primary flex w-full flex-1 items-center justify-center gap-2"
          onClick={() => {
            if (players.length > 1) {
              router.push("/game/lobby");
            } else {
              connection.send("MoveToGameScreen", lobbyId);
            }
          }}
        >
          <RotateCcw size={18} />
          <span>Play Again</span>
        </Button>

        <Link href="/game" className="w-full">
          <Button
            variant="outline"
            className="flex w-full flex-1 items-center justify-center gap-2"
            onClick={async () => {
              exitLobby(
                gameState.connection,
                lobbyId,
                currentPlayer.playerId,
                dispatch,
              );
            }}
          >
            <Home size={18} />
            <span>Back to Menu</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
