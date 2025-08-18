"use client";

import { GameStateAction, GameStateContext } from "@/gameState";
import { Model } from "@/types";
import { ArrowLeft, ChevronDown, Sparkle } from "lucide-react";
import Link from "next/link";
import { ActionDispatch, use, useState } from "react";

type Props = {
  metadata: Record<
    Model,
    { totalParams: number; accuracy: number; loss: number }
  >;
};
export default function Setting({ metadata }: Props) {
  const { gameState, dispatch } = use(GameStateContext);
  const { modelName } = gameState;

  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="flex h-full w-xl flex-col gap-4 pt-20">
      <h1 className="flex items-center gap-2 text-2xl font-bold">
        <Link href="/game" className="flex items-center gap-2">
          <ArrowLeft className="inline-block" />
        </Link>
        <b>Settings</b>
      </h1>
      <div className="border-secondary flex flex-col gap-4 rounded-xl border-2 border-solid p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkle />
            <p>Mnist Model (for handwritten mode)</p>
          </div>
          <div
            className="relative flex shrink-0 items-center gap-2 hover:cursor-pointer"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <p>{modelName}</p>
            {showDropdown ? (
              <>
                <ChevronDown className="rotate-180" />
                <ModelDropdown dispatch={dispatch} metadata={metadata} />
              </>
            ) : (
              <ChevronDown />
            )}
          </div>
        </div>
        <p>
          It is recommended to use smaller models on smaller devices and
          browsers that don{"'"}t support WebGL. However, smaller models have
          less accuracy.
        </p>
      </div>
    </div>
  );
}

function ModelDropdown({
  dispatch,
  metadata,
}: {
  dispatch: ActionDispatch<[action: GameStateAction]>;
  metadata: Record<
    Model,
    { totalParams: number; accuracy: number; loss: number }
  >;
}) {
  const descriptions: Record<Model, string> = {
    [Model.KerasTutorial]: "The model architecture in the Keras tutorial",
    [Model.TfjsTutorial]: "The model architecture in the tfjs tutorial",
    [Model.Mini]: "The smallest architecture",
    [Model.ChatGpt5]:
      '"Light" architecture that I asked ChatGPT5 to generate. The most accurate model.',
    [Model.MobileNetMini]: "Mini version of the MobileNet architecture",
    [Model.LeNet]: "The classic LeNet architecture",
  };

  return (
    <div className="bg-background absolute top-full right-0 w-fit rounded-lg p-2 shadow shadow-black/50">
      <div className="flex flex-col">
        {Object.entries(metadata)
          .sort(([_a, mA], [_b, mB]) => mA.totalParams - mB.totalParams)
          .map(([modelName, metadata]) => (
            <button
              key={modelName}
              className="hover:bg-secondary rounded-sm p-2 text-left transition hover:cursor-pointer"
              onClick={() =>
                dispatch({ type: "selectModel", modelName: modelName as Model })
              }
            >
              <b>{modelName}</b>
              <p className="w-xs">{descriptions[modelName as Model]}</p>
              <p className="w-xs text-sm">
                Params: {metadata.totalParams}, accuracy:{" "}
                {(metadata.accuracy * 100).toFixed(2)}%, loss:{" "}
                {(metadata.loss * 100).toFixed(2)}%
              </p>
            </button>
          ))}
      </div>
    </div>
  );
}
