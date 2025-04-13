import { GameStateContext, GameStateWrapper } from "@/gameState";
import { use } from "react";

export default function GameStateTest() {
  return (
    <GameStateWrapper>
      <ChildComponent />
    </GameStateWrapper>
  );
}

export function ChildComponent() {
  const { gameState, dispatch } = use(GameStateContext);

  return (
    <div>
      <button></button>
      Hello world is this no the best thing in the world
    </div>
  );
}
