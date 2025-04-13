"use client";

import { Button } from "@/components/ui/button";
import { PlusCircle, Timer, Trophy, User, Users } from "lucide-react";
import GameModeCard from "@/components/GameModeCard";
import Link from "next/link";
import { GameMode } from "@/types";
import { use } from "react";
import { GameStateContext } from "@/gameState";

export default function Page() {
  const { dispatch } = use(GameStateContext);

  function onSelectMode(mode: GameMode) {
    dispatch({ type: "selectMode", mode });
  }

  return (
    <div className="animate-fade-in mx-auto flex max-w-3xl flex-col items-center space-y-8">
      <div className="w-full space-y-3 text-center">
        <h1 className="from-primary via-secondary to-accent bg-gradient-to-r bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
          Mathracer
        </h1>
        <p className="text-muted-foreground text-lg">
          Race against others to solve math equations and claim victory!
        </p>
      </div>

      <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
        <Link href="/play">
          <Button
            variant="outline"
            size="lg"
            className="math-button-accent flex h-16 w-full items-center justify-center gap-2"
          >
            <User size={20} />
            <span>Single Player</span>
          </Button>
        </Link>

        <Link href="/lobby">
          <Button
            variant="outline"
            size="lg"
            className="math-button-primary flex h-16 w-full items-center justify-center gap-2"
          >
            <PlusCircle size={20} />
            <span>Create Game</span>
          </Button>
        </Link>

        <Link href="/join">
          <Button
            variant="outline"
            size="lg"
            className="math-button-secondary flex h-16 w-full items-center justify-center gap-2"
          >
            <Users size={20} />
            <span>Join Game</span>
          </Button>
        </Link>
      </div>

      <div className="w-full">
        <h2 className="mb-4 text-xl font-semibold">Select Game Mode</h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <GameModeCard
            title="Race to 10"
            description="First to solve 10 equations wins"
            icon={<Trophy size={24} />}
            onClick={() => onSelectMode({ type: "equations", count: 10 })}
            bgColor="bg-math-purple"
          />

          <GameModeCard
            title="Race to 30"
            description="First to solve 30 equations wins"
            icon={<Trophy size={24} />}
            onClick={() => onSelectMode({ type: "equations", count: 30 })}
            bgColor="bg-math-purple"
          />

          <GameModeCard
            title="10 Second Sprint"
            description="Solve the most in 10 seconds"
            icon={<Timer size={24} />}
            onClick={() => onSelectMode({ type: "time", count: 10 })}
            bgColor="bg-math-blue"
          />

          <GameModeCard
            title="30 Second Challenge"
            description="Solve the most in 30 seconds"
            icon={<Timer size={24} />}
            onClick={() => onSelectMode({ type: "time", count: 30 })}
            bgColor="bg-math-blue"
          />
        </div>
      </div>
    </div>
  );
}
