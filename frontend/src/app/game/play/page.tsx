"use client";

import { use, useEffect, useRef } from "react";
import Play from "./Play";
import { GameStateContext } from "@/gameState";
import { useRouter } from "next/navigation";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";

export default function PlayPage() {
  const router = useRouter();

  const { gameState, dispatch } = use(GameStateContext);
  const { lobby, modelName: model } = gameState;

  const modelRef = useRef<tf.LayersModel | null>(null);

  useEffect(() => {
    if (lobby.lobbyId === "") {
      router.push("/game");
    }

    async function loadModel() {
      try {
        await tf.setBackend("webgl");
      } catch {
        await tf.setBackend("cpu");
      }
      await tf.ready();
      modelRef.current = await tf.loadLayersModel(
        `https://raw.githubusercontent.com/mingli202/mathracer/refs/heads/main/artifacts/${model}/model.json`,
      );
      // warm up the model
      modelRef.current.predict(tf.randomUniform([1, 28, 28, 1]));
    }
    loadModel();

    return () => {
      modelRef.current?.dispose();
    };
  }, []);

  return lobby.lobbyId !== "" ? (
    <Play gameState={gameState} dispatch={dispatch} modelRef={modelRef} />
  ) : null;
}
