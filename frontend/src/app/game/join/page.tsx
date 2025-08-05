"use client";

import PublicLobbyCard from "@/components/PublicLobbyCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PublicLobbies } from "@/types";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function JoinPage() {
  const router = useRouter();

  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [publicLobbies, setPublicLobbies] = useState<PublicLobbies | null>(
    null,
  );

  useEffect(() => {
    async function getPublicLobbies() {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/lobby/public`,
      );
      const lobbies = PublicLobbies.parse(await res.json());
      setPublicLobbies(lobbies);
    }

    getPublicLobbies();
  }, []);

  return (
    <div className="animate-fade-in flex w-sm flex-col gap-4 space-y-6">
      <Link href="/game">
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <ArrowLeft size={16} />
          <span>Back to Menu</span>
        </Button>
      </Link>

      <form
        action={async (formData) => {
          if (isLoading) return;

          setIsLoading(true);
          const lobbyId = formData.get("lobbyId") as string;
          let lobbyExists = false;

          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/lobby/exists/${lobbyId}`,
          );
          lobbyExists = (await res.text()) === "true";

          if (lobbyExists) {
            router.push(`/game/lobby?join=${lobbyId}`);
          } else {
            setError(true);
          }
          setIsLoading(false);
        }}
        className="space-y-4"
      >
        <h1 className="text-center text-3xl font-bold">Join Game</h1>
        <div className="space-y-2">
          <label htmlFor="lobbyId" className="text-sm font-medium">
            Lobby ID
          </label>
          <Input
            id="lobbyId"
            name="lobbyId"
            placeholder="Enter the lobby id (6 letters)"
            required
            pattern="^[a-z]{6}$"
            className="h-12"
          />
        </div>

        <Button type="submit" className="math-button-primary h-12 w-full">
          {isLoading ? "Loading..." : "Join Game"}
        </Button>
        {error && (
          <p className="w-full text-center text-red-500">
            Lobby id doesn{"'"}t exist
          </p>
        )}
      </form>

      <div className="w-full">
        <h2 className="mb-4 text-xl font-semibold">Join Public Lobbies</h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6">
          {publicLobbies && publicLobbies.lobbies.length > 0 ? (
            publicLobbies.lobbies.map((lobby) => (
              <PublicLobbyCard
                key={lobby.lobbyId}
                lobbyId={lobby.lobbyId}
                hostName={lobby.hostName}
                numPlayers={lobby.players.length}
                gameMode={lobby.gameMode}
              />
            ))
          ) : (
            <div>No public lobbies....</div>
          )}
        </div>
      </div>
    </div>
  );
}
