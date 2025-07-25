"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { withConnection } from "@/utils/connection";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";

export default function JoinPage() {
  const router = useRouter();

  const [error, setError] = useState(false);

  return (
    <div className="animate-fade-in flex w-sm flex-col gap-4 space-y-6">
      <Link href="/">
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <ArrowLeft size={16} />
          <span>Back to Menu</span>
        </Button>
      </Link>

      <form
        action={async (formData) => {
          const lobbyId = formData.get("lobbyId") as string;
          let lobbyExists = false;

          await withConnection(async (c) => {
            const res = z
              .boolean()
              .safeParse(await c.invoke("LobbyExists", lobbyId));

            lobbyExists = res.success;
          });

          if (lobbyExists) {
            router.push(`/lobby?join=${lobbyId}`);
          } else {
            setError(true);
          }
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
          JoinGame
        </Button>
        {error && (
          <p className="w-full text-center text-red-500">
            Lobby id doesn{"'"}t exist
          </p>
        )}
      </form>
    </div>
  );
}
