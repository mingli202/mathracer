"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { exitLobby, GameStateContext } from "@/gameState";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState } from "react";

export default function JoinPage() {
  const [lobbyId, setLobbyId] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const { gameState, dispatch } = use(GameStateContext);
  const { currentPlayer } = gameState;

  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lobbyId.trim()) {
      setIsJoining(true);
      router.push(`/lobby?join=${lobbyId}`);
    }
  };

  return (
    <div className="animate-fade-in mx-auto max-w-md space-y-6">
      <Link href="/">
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            exitLobby(
              gameState.connection!,
              lobbyId,
              currentPlayer.playerId,
              dispatch,
            )
          }
          className="mb-4 flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          <span>Back to Menu</span>
        </Button>
      </Link>

      <div className="text-center">
        <h1 className="mb-2 text-3xl font-bold">Join Game</h1>
        <p className="text-muted-foreground">
          Enter the game code and your name to join
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="gameId" className="text-sm font-medium">
            Game Code
          </label>
          <Input
            id="gameId"
            placeholder="Enter game code"
            value={lobbyId}
            onChange={(e) => setLobbyId(e.target.value)}
            required
            className="h-12"
          />
        </div>

        <Button
          type="submit"
          className="math-button-primary h-12 w-full"
          disabled={!lobbyId.trim() || isJoining}
        >
          {isJoining ? "Joining..." : "Join Game"}
        </Button>
      </form>
    </div>
  );
}
