"use client";

import { useEffect, useRef } from "react";

export default function DrawingCanvas() {
  const RECT_SIZE = 5;

  const canvasRef = useRef<HTMLCanvasElement>(null!);
  const containerRef = useRef<HTMLDivElement>(null!);
  const isPressing = useRef(false);

  function draw(clientX: number, clientY: number) {
    const canvas = canvasRef.current;
    const { left, top } = canvas.getBoundingClientRect();
    const x = clientX - left;
    const y = clientY - top;

    const ctx = canvasRef.current.getContext("2d");

    if (!ctx) {
      return;
    }

    ctx.fillStyle = "#000";
    ctx.fillRect(x - RECT_SIZE / 2, y - RECT_SIZE / 2, RECT_SIZE, RECT_SIZE);
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;

    const { width, height } = container.getBoundingClientRect();
    canvas.width = width;
    canvas.height = height;
  }, []);

  return (
    <div
      className="h-40 w-full max-w-md"
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
          draw(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => {
          if (isPressing.current) {
            draw(e.clientX, e.clientY);
          }
        }}
        onPointerUp={() => {
          isPressing.current = false;
        }}
      >
        Oops, your browser does not support HTML5 canvas:
      </canvas>
      <button
        className="hover:text-primary w-full text-center transition hover:cursor-pointer"
        onClick={() => {
          const ctx = canvasRef.current.getContext("2d");
          ctx?.clearRect(
            0,
            0,
            canvasRef.current.width,
            canvasRef.current.height,
          );
        }}
      >
        Clear
      </button>
    </div>
  );
}
