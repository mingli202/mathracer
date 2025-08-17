"use client";

import { useEffect, useRef, useState } from "react";
import DrawingCanvas from "./DrawingCanvas";
import { Point, Stroke } from "@/types";
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
  const testInput = process.env.NODE_ENV === "development";

  const strokes = useRef<tf.Tensor[]>([]);
  const modelRef = useRef<tf.LayersModel | null>(null);
  const nSteps = 3;
  const gridSize = 20;

  const [lastStroke, setLastStoke] = useState<number[][]>([]);
  const [prediction, setPrediction] = useState<number | null>(null);

  useEffect(() => {
    async function loadModel() {
      try {
        await tf.setBackend("webgl");
      } catch {
        await tf.setBackend("cpu");
      }
      await tf.ready();
      modelRef.current = await tf.loadLayersModel(
        "https://raw.githubusercontent.com/mingli202/mathracer/refs/heads/digit-recognition/artifacts/leNet/model.json",
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

    if (testInput) {
      const pred = model.predict(strokeTensor);

      if (pred instanceof tf.Tensor) {
        const i = tf.argMax(pred, 1).arraySync() as number[];
        setPrediction(i[0]);
      }
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

  function transform(stroke: Stroke): tf.Tensor | undefined {
    if (!stroke.top || !stroke.bot || !stroke.left || !stroke.right) {
      return;
    }

    let offsetX = stroke.left.x;
    let offsetY = stroke.top.y;

    const rectWidth = stroke.right.x - offsetX;
    const rectHeight = stroke.bot.y - offsetY;

    if (rectHeight > rectWidth) {
      offsetX -= (rectHeight - rectWidth) / 2;
    } else {
      offsetY -= (rectWidth - rectHeight) / 2;
    }

    const squareSize = rectWidth > rectHeight ? rectWidth : rectHeight;

    const strokeArray: number[][] = Array.from({ length: 28 }, () =>
      Array(28).fill(0),
    );

    for (let i = 0; i < stroke.points.length; i++) {
      const point = stroke.points[i];

      drawPoint(strokeArray, point, offsetX, offsetY, squareSize);

      // connect previous point
      if (i !== 0) {
        const previousPoint = stroke.points[i - 1];

        for (const i of Array(nSteps).keys()) {
          const inBetweenPoint = {
            x:
              ((i + 1) * (point.x - previousPoint.x)) / nSteps +
              previousPoint.x,
            y:
              ((i + 1) * (point.y - previousPoint.y)) / nSteps +
              previousPoint.y,
          };

          drawPoint(strokeArray, inBetweenPoint, offsetX, offsetY, squareSize);
        }
      }
    }

    setLastStoke(strokeArray);

    return tf.tidy(() => tf.reshape(tf.tensor2d(strokeArray), [1, 28, 28, 1]));
  }

  function drawPoint(
    strokeArray: number[][],
    point: Point,
    offsetX: number,
    offsetY: number,
    squareSize: number,
  ) {
    // get index
    const x =
      Math.min(
        Math.floor(((point.x - offsetX) * gridSize) / squareSize),
        gridSize - 1,
      ) +
      (28 - gridSize) / 2;
    const y =
      Math.min(
        Math.floor(((point.y - offsetY) * gridSize) / squareSize),
        gridSize - 1,
      ) +
      (28 - gridSize) / 2;

    strokeArray[y][x] = 255;

    const crossOpacity = 255 / 2; // top bot left right
    const edgeOpacity = 255 / 4; // tl tr bl br

    strokeArray[y - 1][x] = Math.min(strokeArray[y - 1][x] + crossOpacity, 255);
    strokeArray[y + 1][x] = Math.min(strokeArray[y + 1][x] + crossOpacity, 255);
    strokeArray[y][x - 1] = Math.min(strokeArray[y][x - 1] + crossOpacity, 255);
    strokeArray[y][x + 1] = Math.min(strokeArray[y][x + 1] + crossOpacity, 255);
    strokeArray[y - 1][x - 1] = Math.min(
      strokeArray[y - 1][x - 1] + edgeOpacity,
      255,
    );
    strokeArray[y + 1][x + 1] = Math.min(
      strokeArray[y + 1][x + 1] + edgeOpacity,
      255,
    );
    strokeArray[y + 1][x - 1] = Math.min(
      strokeArray[y + 1][x - 1] + edgeOpacity,
      255,
    );
    strokeArray[y - 1][x + 1] = Math.min(
      strokeArray[y - 1][x + 1] + edgeOpacity,
      255,
    );
  }

  return (
    <>
      {/* Canvas to show input. Hide when not testing. */}
      {testInput ? (
        <div className="absolute bottom-0 left-full">
          <div className="border-secondary grid h-56 w-56 max-w-md grid-cols-[repeat(28,minmax(0,28fr))] grid-rows-[repeat(28,minmax(0,28fr))] border-2 border-solid">
            {lastStroke.map((rows, row) =>
              rows.map((col, i) =>
                col !== 0 ? (
                  <div
                    key={"" + i + ":" + row}
                    style={{
                      gridColumn: i + 1,
                      gridRow: row + 1,
                      opacity: col / 255,
                    }}
                    className="bg-primary"
                  />
                ) : null,
              ),
            )}
          </div>
          <p>Prediction: {prediction ?? "nothing"}</p>
        </div>
      ) : null}
      <DrawingCanvas handleNewStoke={handleNewStoke} />
    </>
  );
}
