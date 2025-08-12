"use client";

import { Point } from "@/types";
import { useEffect, useRef } from "react";

const RECT_SIZE = 4;

type Props = {
  handleNewPoint: (point: Point) => void;
};

export default function DrawingCanvas({ handleNewPoint }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null!);
  const containerRef = useRef<HTMLDivElement>(null!);
  const isPressing = useRef(false);
  const previousPoint = useRef<Point | null>(null!);

  function handleDraw(clientX: number, clientY: number) {
    const canvas = canvasRef.current;
    const { left, top } = canvas.getBoundingClientRect();
    const x = clientX - left;
    const y = clientY - top;

    const ctx = canvasRef.current.getContext("2d", { alpha: false });

    if (!ctx) {
      return;
    }

    ctx.fillStyle = "#000";
    ctx.fillRect(x - RECT_SIZE / 2, y - RECT_SIZE / 2, RECT_SIZE, RECT_SIZE);

    if (previousPoint.current) {
      ctx.beginPath();
      ctx.moveTo(previousPoint.current.x, previousPoint.current.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    previousPoint.current = { x, y };
    handleNewPoint({ x, y });
  }

  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;

      const ctx = canvasRef.current.getContext("2d", { alpha: false });
      ctx?.clearRect(0, 0, canvas.width, canvas.height);

      const container = containerRef.current;

      const { width, height } = container.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
      previousPoint.current = null;
    };
    window.addEventListener("resize", resize);
    resize();
    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <div
      className="h-56 w-full max-w-md"
      style={{
        touchAction: "none",
        userSelect: "none",
      }}
      ref={containerRef}
    >
      <canvas
        ref={canvasRef}
        className="border-secondary h-full w-full rounded-lg border-2 border-solid"
        onPointerDown={(e) => {
          isPressing.current = true;
          handleDraw(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => {
          if (isPressing.current) {
            handleDraw(e.clientX, e.clientY);
          }
        }}
        onPointerUp={() => {
          isPressing.current = false;
          previousPoint.current = null;
        }}
      >
        Oops, your browser does not support HTML5 canvas:
      </canvas>
      <button
        className="hover:text-primary w-full text-center transition hover:cursor-pointer"
        onClick={() => {
          const ctx = canvasRef.current.getContext("2d", { alpha: false });
          ctx?.clearRect(
            0,
            0,
            canvasRef.current.width,
            canvasRef.current.height,
          );
          previousPoint.current = null;
        }}
      >
        Clear
      </button>
    </div>
  );
}
