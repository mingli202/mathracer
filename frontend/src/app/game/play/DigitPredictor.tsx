"use client";

import { useEffect, useRef } from "react";
import DrawingCanvas from "./DrawingCanvas";
import { Point } from "@/types";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";

type Props = {
  submitIfCorrect: (answer: string) => void;
};

export default function DigitPredictor({ submitIfCorrect }: Props) {
  const points = useRef<Point[][]>([]);
  const model = useRef<tf.LayersModel | null>(null);

  useEffect(() => {
    async function loadModel() {
      try {
        await tf.setBackend("webgl");
      } catch {
        await tf.setBackend("cpu");
      }
      await tf.ready();
      model.current = await tf.loadLayersModel(
        "https://raw.githubusercontent.com/mingli202/mathracer/refs/heads/digit-recognition/frontend/public/models/mini/model.json",
      );

      console.log(model.current);
    }
    loadModel();

    return () => {
      model.current?.dispose();
    };
  }, []);

  function handleNewStoke(stroke: Point[]) {}

  return <DrawingCanvas handleNewStoke={handleNewStoke} />;
}
