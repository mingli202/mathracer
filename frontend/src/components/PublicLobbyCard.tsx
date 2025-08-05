import { GameMode } from "@/types";
import { Button } from "./ui/button";
import { Trophy, Timer, Users } from "lucide-react";

type PublicLobbyCardProp = {
  lobbyId: string;
  hostName: string;
  numPlayers: number;
  gameMode: GameMode;
};

export default function PublicLobbyCard({
  lobbyId,
  hostName,
  numPlayers,
  gameMode,
}: PublicLobbyCardProp) {
  const gameUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/game/lobby?join=${lobbyId}`;

  const handleJoin = () => {
    window.location.href = gameUrl;
  };

  return (
    <Button
      className={
        "focus:ring-primary/50 bg-accent bg-opacity-30 hover:bg-opacity-40 flex h-full w-full items-start rounded-xl border border-gray-100 p-4 text-left transition-all duration-200 hover:scale-[1.02] hover:shadow-md focus:ring-2 focus:outline-none"
      }
      onClick={handleJoin}
    >
      <div className="flex w-full flex-col items-start">
        <div className="flex flex-row items-center justify-between">
          <div className="font-bold text-gray-900">{`${hostName}'s Lobby`}</div>
          <div className="bg-math-purple rounded-2xl p-1.5 text-gray-700">
            {lobbyId}
          </div>
        </div>
        <div className="flex flex-row items-center text-xs text-gray-500">
          {gameMode.type === "equations" ? (
            <div className="space-x-3">
              <Trophy size={12} />
              <span>{`Race to ${String(gameMode.count)} equations`}</span>
            </div>
          ) : (
            <div className="flex flex-row space-x-1.5">
              <Timer size={12} />
              <span>{`${String(gameMode.count)} second challenge`}</span>
            </div>
          )}
        </div>
        <div className="flex w-full flex-row items-center justify-between">
          <div className="flex flex-row space-x-1.5 text-xs text-gray-500">
            <Users size={12} />
            <span>{`${numPlayers} players`}</span>
          </div>
          <div className="rounded-lg bg-gray-400 p-2 text-sm font-medium text-gray-900 hover:bg-emerald-300">
            Join
          </div>
        </div>
      </div>
    </Button>
  );
}
