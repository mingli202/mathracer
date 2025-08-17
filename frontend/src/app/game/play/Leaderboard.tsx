import PlayerList from "@/components/PlayerList";
import { GameMode, Player } from "@/types";

type Props = {
  players: Player[];
  currentPlayerId: string;
  gameMode: GameMode;
};
export default function Leaderboard(props: Props) {
  return (
    <div className="lg:order-2 lg:w-64">
      <div className="sticky">
        <h3 className="mb-3 text-lg font-semibold">Leaderboard</h3>
        <PlayerList showScores {...props} />
      </div>
    </div>
  );
}
