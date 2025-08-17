import { GameMode } from "@/types";
import { Progress } from "@radix-ui/react-progress";

type Props = {
  gameMode: GameMode;
  currentEquationIndex: number;
  timeElapsed: number;
};
export default function ProgressBar({
  gameMode,
  currentEquationIndex,
  timeElapsed,
}: Props) {
  const calculateProgress = () => {
    if (gameMode.type === "equations") {
      return (currentEquationIndex / gameMode.count) * 100;
    } else if (gameMode.type === "time" && timeElapsed !== undefined) {
      return (timeElapsed / gameMode.count) * 100;
    }
    return 0;
  };

  const getProgressText = () => {
    if (gameMode.type === "equations") {
      return `Equation ${currentEquationIndex + 1} of ${gameMode.count}`;
    } else {
      return timeElapsed !== undefined
        ? `${gameMode.count - timeElapsed} seconds remaining`
        : "";
    }
  };

  return (
    <div className="mb-6">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-medium">{getProgressText()}</h2>
        <div className="text-muted-foreground text-sm">
          {gameMode.type === "equations"
            ? `First to ${gameMode.count}`
            : `${gameMode.count}s Challenge`}
        </div>
      </div>
      <Progress value={calculateProgress()} className="h-2" />
    </div>
  );
}
