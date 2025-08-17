"use client";

import { useEffect, useRef, useState } from "react";
import DrawingCanvas from "./DrawingCanvas";
import { Stroke } from "@/types";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";

type Props = {
  submitAnswer: () => Promise<void>;
  rightAnswer: number;
};

export default function DigitPredictor({
  submitIfCorrect,
  rightAnswer,
}: Props) {
  const showPostprocessing = true;

  const strokes = useRef<tf.Tensor2D[]>([]);
  const modelRef = useRef<tf.LayersModel | null>(null);
  const nSteps = 5;
  const gridSize = 20;

  const [lastStroke, setLastStoke] = useState<number[][]>([]);

  useEffect(() => {
    async function loadModel() {
      try {
        await tf.setBackend("webgl");
      } catch {
        await tf.setBackend("cpu");
      }
      await tf.ready();
      modelRef.current = await tf.loadLayersModel(
        "https://raw.githubusercontent.com/mingli202/mathracer/refs/heads/digit-recognition/artifacts/mini/model.json",
      );
    }
    loadModel();

    return () => {
      modelRef.current?.dispose();
    };
  }, []);

  function handleNewStoke(stroke: Stroke | null) {
    if (!stroke) {
      return;
    }

    const model = modelRef.current;

    if (!model) {
      return;
    }

    const strokeTensor = transform(stroke);
    if (!strokeTensor) {
      return;
    }

    strokes.current.push(strokeTensor);
    parseStrokes();
  }

  /**
   * Loop through some combinations of strokes to guess what the player wrote
   * 1. Each stroke is a number
   * 2. Pairs of consecutive strokes is a number
   */
  function parseStrokes() {}

  function transform(stroke: Stroke): tf.Tensor2D | undefined {
    console.log("stroke:", stroke);
    if (!stroke.top || !stroke.bot || !stroke.left || !stroke.right) {
      return;
    }

    let offsetX = stroke.left.x;
    console.log("offsetX:", offsetX);
    let offsetY = stroke.top.y;
    console.log("offsetY:", offsetY);

    const rectWidth = stroke.right.x - offsetX;
    console.log("rectWidth:", rectWidth);
    const rectHeight = stroke.bot.y - offsetY;
    console.log("rectHeight:", rectHeight);

    if (rectHeight > rectWidth) {
      offsetX -= (rectHeight - rectWidth) / 2;
    } else {
      offsetY -= (rectWidth - rectHeight) / 2;
    }

    const squareSize = rectWidth > rectHeight ? rectWidth : rectHeight;
    console.log("squareSize:", squareSize);

    const strokeArray: number[][] = Array.from({ length: gridSize }, () =>
      Array(gridSize).fill(0),
    );
    console.log("strokeArray:", strokeArray);

    for (let i = 0; i < stroke.points.length; i++) {
      const point = stroke.points[i];
      console.log("point:", point);
      // get index
      const x = Math.min(
        Math.floor(((point.x - offsetX) * gridSize) / squareSize),
        gridSize - 1,
      );
      console.log("x:", x);
      const y = Math.min(
        Math.floor(((point.y - offsetY) * gridSize) / squareSize),
        gridSize - 1,
      );
      console.log("y:", y);
      strokeArray[y][x] = 1;

      // connect previous point
      if (i === -1) {
        const previousPoint = stroke.points[i - 1];
        const previousX = Math.min(
          Math.floor(((previousPoint.x - offsetX) * gridSize) / squareSize),
          gridSize - 1,
        );
        const previousY = Math.min(
          Math.floor(((previousPoint.y - offsetY) * gridSize) / squareSize),
          gridSize - 1,
        );

        const deltaX = x - previousX;
        const deltaY = y - previousY;
        const length =
          Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2)) / nSteps;

        const dx = deltaX / length;
        const dy = deltaY / length;

        for (const i of Array(nSteps).keys()) {
          const stepX = Math.floor(previousX + dx * i);
          const stepY = Math.floor(previousY + dy * i);

          strokeArray[stepY][stepX] = 1;
        }
      }
    }

    console.log("strokeArray:", strokeArray);
    setLastStoke(strokeArray);

    return tf.tensor2d(strokeArray);
  }

  return (
    <>
      {showPostprocessing ? (
        <div className="border-secondary absolute bottom-0 left-full grid h-56 w-56 max-w-md grid-cols-[repeat(28,minmax(0,28fr))] grid-rows-[repeat(28,minmax(0,28fr))] border-2 border-solid">
          {lastStroke.map((rows, row) =>
            rows.map((col, i) =>
              col === 1 ? (
                <div
                  key={"" + i + ":" + row}
                  style={{
                    gridColumn: i + 1 + (28 - gridSize) / 2,
                    gridRow: row + 1 + (28 - gridSize) / 2,
                  }}
                  className="bg-primary"
                />
              ) : null,
            ),
          )}
        </div>
      ) : null}
      <DrawingCanvas handleNewStoke={handleNewStoke} />
    </>
  );
}
