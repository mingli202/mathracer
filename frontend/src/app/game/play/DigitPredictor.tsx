"use client";

import { RefObject, useRef, useState } from "react";
import DrawingCanvas from "./DrawingCanvas";
import { Point, Stroke } from "@/types";
import * as tf from "@tensorflow/tfjs";

type Props = {
  submitAnswer: () => Promise<void>;
  rightAnswer: number;
  modelRef: RefObject<tf.LayersModel | null>;
};

export default function DigitPredictor({
  submitAnswer,
  rightAnswer,
  modelRef,
}: Props) {
  const testInput = false;

  const strokes = useRef<tf.Tensor[]>([]);
  const nSteps = 3;
  const gridSize = 20;

  const [lastStroke, setLastStoke] = useState<number[][]>([]);
  const [prediction, setPrediction] = useState<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null!);

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
      const pred = model.predict(strokeTensor) as tf.Tensor;

      const i = tf.argMax(pred, 1).arraySync() as number[];
      setPrediction(i[0]);
    } else {
      strokes.current.push(strokeTensor);
      parseStrokes();
    }
  }

  /**
   * Loop through some combinations of strokes to guess what the player wrote
   * 1. Each stroke is a number
   * 2. Pairs of consecutive strokes is a number.
   */
  async function parseStrokes() {
    const st = strokes.current;
    const nDigits = rightAnswer.toString().length;

    // at least as many strokes as the number of digits
    // better performance but you can't see your errors as you write
    // if (st.length < nDigits) {
    //   return;
    // }

    const model = modelRef.current;
    if (!model) {
      return;
    }

    let sum = 0;
    for (let i = 0; i < st.length; i++) {
      const tensor = st[i];

      const pred = model.predict(tensor) as tf.Tensor;

      const index = (await tf.argMax(pred, 1).array()) as number[];
      sum += index[0] * Math.pow(10, st.length - 1 - i);
    }

    if (sum === rightAnswer) {
      clear();
      submitAnswer();
      return;
    }
    setPrediction(sum);

    // consider pairs of strokes to be part of one number
    // chances are the first digit will be low (Benford's law)
    // so start grouping the last strokes
    if (st.length > nDigits * 2) {
      return;
    }
  }

  function transform(stroke: Stroke): tf.Tensor | undefined {
    // at least 2 points
    if (
      !stroke.top ||
      !stroke.bot ||
      !stroke.left ||
      !stroke.right ||
      stroke.points.length < 2
    ) {
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

      // connect previous point with points in the middle
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

    const crossOpacity = 255 / 3; // top bot left right
    const edgeOpacity = 255 / 3; // tl tr bl br

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

  function clear() {
    strokes.current = [];
    const ctx = canvasRef.current.getContext("2d");
    ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setPrediction(null);
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
      <>
        <p>Prediction: {prediction}</p>
        <DrawingCanvas
          handleNewStoke={handleNewStoke}
          clear={clear}
          canvasRef={canvasRef}
        />
      </>
    </>
  );
}
