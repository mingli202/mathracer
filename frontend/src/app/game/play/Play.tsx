"use client";

import EquationStack from "@/components/EquationStack";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GameStateAction, updatePlayerState } from "@/gameState";
import { withConnection } from "@/utils/connection";
import { useRouter } from "next/navigation";
import {
  ActionDispatch,
  RefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import DigitPredictor from "./DigitPredictor";
import Leaderboard from "./Leaderboard";
import ProgressBar from "./ProgressBar";
import { GameState } from "@/types";
import * as tf from "@tensorflow/tfjs";

type Props = {
  gameState: GameState;
  dispatch: ActionDispatch<[action: GameStateAction]>;
  modelRef: RefObject<tf.LayersModel | null>;
};
export default function Play({ gameState, dispatch, modelRef }: Props) {
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

  return (
    <div className="animate-fade-in mx-auto flex h-full w-full max-w-5xl flex-col gap-6 lg:flex-row">
      {/* Main game area */}
      <div className="flex flex-grow flex-col lg:order-1">
        <ProgressBar
          gameMode={gameMode}
          currentEquationIndex={currentEquationIndex}
          timeElapsed={timeElapsed}
        />

        <div className="relative mb-8 flex w-full flex-grow flex-col items-center justify-center">
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

          {isHandwritingMode && equations[currentEquationIndex] ? (
            <DigitPredictor
              submitAnswer={submitAnswer}
              rightAnswer={equations[currentEquationIndex].answer}
              modelRef={modelRef}
            />
          ) : (
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

      <Leaderboard
        players={players}
        currentPlayerId={currentPlayer.playerId}
        gameMode={gameMode}
      />
    </div>
  );
}
