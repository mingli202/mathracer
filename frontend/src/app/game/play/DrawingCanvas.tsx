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
      className="border-secondary w-full max-w-md rounded-lg border-2 border-solid"
      style={{
        touchAction: "none",
        userSelect: "none",
      }}
      ref={containerRef}
    >
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%" }}
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
    </div>
  );
}
