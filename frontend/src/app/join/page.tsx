"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function JoinPage() {
  const router = useRouter();

  return (
    <div className="animate-fade-in w-sm space-y-6">
      <Link href="/">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          <span>Back to Menu</span>
        </Button>
      </Link>

      <div className="text-center">
        <h1 className="mb-2 text-3xl font-bold">Join Game</h1>
        <p className="text-muted-foreground">Enter the lobby id (6 letters)</p>
      </div>

      <form
        action={(formData) => {
          const lobbyId = formData.get("lobbyId") as string;
          router.push(`/lobby?join=${lobbyId}`);
        }}
        className="space-y-4"
      >
        <div className="space-y-2">
          <label htmlFor="lobbyId" className="text-sm font-medium">
            Lobby ID
          </label>
          <Input
            id="lobbyId"
            name="lobbyId"
            placeholder="Enter game code"
            required
            pattern="^[a-z]{6}$"
            className="h-12"
          />
        </div>

        <Button type="submit" className="math-button-primary h-12 w-full">
          JoinGame
        </Button>
      </form>
    </div>
  );
}
