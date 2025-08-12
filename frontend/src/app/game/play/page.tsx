"use client";

import EquationStack from "@/components/EquationStack";
import PlayerList from "@/components/PlayerList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { GameStateContext, updatePlayerState } from "@/gameState";
import { withConnection } from "@/utils/connection";
import { useRouter } from "next/navigation";
import {
  use,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import DigitPredictor from "./DigitPredictor";

export default function PlayPage() {
  const { gameState, dispatch } = use(GameStateContext);
  const { lobby, currentPlayer } = gameState;
  const connection = gameState.connection;
  const { players, equations, gameMode, lobbyId } = lobby;

  const [countDown, setCountDown] = useState(3);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const [boxStyle, setBoxStyle] = useState("math-button-primary");
  const [formStyle, setFormStyle] = useState("bg-background/70");

  const [animation, setAnimation] = useState("");
  const [currentEquationIndex, setCurrentEquationIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const now = useMemo(() => Math.round(Date.now() / 1000), []);
  const router = useRouter();

  const [isHandwritingMode, setIsHandwritingMode] = useState(false);

  useLayoutEffect(() => {
    if (lobbyId === "") {
      router.push("/game");
    }
  }, []);

  useEffect(() => {
    connection.on("CountDown", (count: number) => {
      setCountDown(count);
    });

    connection.on("TimeElapsed", (time) => setTimeElapsed(time));

    connection.on("StartGame", async () => {
      await withConnection(async (c) => {
        await c.send("StartGame", lobby.lobbyId);
      });
    });

    updatePlayerState(
      connection,
      lobbyId,
      currentPlayer.playerId,
      "playing",
      dispatch,
    );

    return () => {
      connection.off("CountDown");
      connection.off("TimeElapsed");
      connection.off("StartGame");
    };
  }, []);

  // Handle time-based game end
  useEffect(() => {
    if (
      (gameMode.type === "time" && timeElapsed === gameMode.count) ||
      (gameMode.type === "equations" && currentEquationIndex === gameMode.count)
    ) {
      (async function () {
        await connection.invoke(
          "PlayerCompleted",
          lobbyId,
          currentPlayer.playerId,
        );
        router.push("/game/results");
      })();
    }
  }, [timeElapsed, currentEquationIndex]);

  useEffect(() => {
    if (countDown == 0) {
      inputRef.current?.focus();
    }
  }, [countDown]);

  async function submitAnswer() {
    setCurrentEquationIndex(currentEquationIndex + 1);

    let score = currentPlayer.score + 1;
    if (
      gameMode.type === "equations" &&
      currentEquationIndex === gameMode.count - 1
    ) {
      score = Math.round(Date.now() / 1000) - now;
    }

    if (inputRef.current) {
      inputRef.current.value = "";
    }

    await connection
      .send("UpdateScore", lobbyId, currentPlayer.playerId, score)
      .catch();
  }

  async function submitIfCorrect(answer: string) {
    answer = answer.replace(/\D/g, "");

    if (answer === equations[currentEquationIndex].answer.toString()) {
      setAnimation("animate-scale-in");
      setTimeout(() => setAnimation(""), 300);
      await submitAnswer();
    } else {
      if (
        answer.length >=
        equations[currentEquationIndex].answer.toString().length
      ) {
        setBoxStyle("math-button-destructive");
        setFormStyle("bg-destructive/70");
      } else {
        setBoxStyle("math-button-primary");
        setFormStyle("bg-background/70");
      }
    }
  }

  // Calculate progress based on game mode
  const calculateProgress = () => {
    if (gameMode.type === "equations") {
      return (currentEquationIndex / gameMode.count) * 100;
    } else if (gameMode.type === "time" && timeElapsed !== undefined) {
      return (timeElapsed / gameMode.count) * 100;
    }
    return 0;
  };

  // Format progress text based on game mode
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
    <>
      <div className="animate-fade-in mx-auto flex h-full w-full max-w-5xl flex-col gap-6 lg:flex-row">
        {/* Main game area */}
        <div className="flex flex-grow flex-col lg:order-1">
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

          <div className="mb-8 flex w-full flex-grow flex-col items-center justify-center">
            {countDown > 0 && (
              <div className="absolute z-50 flex h-full w-full items-center justify-center font-extrabold">
                <div className="border-primary bg-secondary/10 flex h-[7rem] w-[7rem] items-center justify-center rounded-full border-[4px] border-solid text-6xl backdrop-blur-xs backdrop-filter">
                  <span className="text-primary">{countDown}</span>
                </div>
              </div>
            )}

            <div
              className={`mb-6 flex w-full items-center justify-center ${animation}`}
            >
              <EquationStack
                equations={equations}
                currentIndex={currentEquationIndex}
                stackSize={3}
              />
            </div>

            {isHandwritingMode ? (
              <form
                onSubmit={(e: React.FormEvent) => {
                  e.preventDefault();
                  if (inputRef.current) {
                    inputRef.current.value = "";
                    submitIfCorrect(inputRef.current?.value);
                  }
                }}
                className={`relative flex w-full max-w-xs flex-col items-center`}
              >
                <Input
                  ref={inputRef}
                  type="text"
                  onChange={(e) => submitIfCorrect(e.target.value)}
                  placeholder="Type your answer"
                  className={`mb-4 h-14 text-center text-xl ${formStyle}`}
                  autoComplete="off"
                  disabled={countDown > 0}
                />
                <Button type="submit" className={`w-full ${boxStyle}`}>
                  Enter
                </Button>
              </form>
            ) : (
              <DigitPredictor />
            )}
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="z-100"
            onClick={() => setIsHandwritingMode(!isHandwritingMode)}
          >
            {isHandwritingMode
              ? "Switch to typing mode"
              : "Switch to handwriting mode"}
          </Button>
        </div>

        {/* Leaderboard sidebar */}
        <div className="lg:order-2 lg:w-64">
          <div className="sticky">
            <h3 className="mb-3 text-lg font-semibold">Leaderboard</h3>
            <PlayerList
              players={players}
              showScores
              currentPlayerId={currentPlayer.playerId}
              gameMode={gameMode}
            />
          </div>
        </div>
      </div>
    </>
  );
}
