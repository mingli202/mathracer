"use client";

import { Stroke } from "@/types";
import { RefObject, useCallback, useEffect, useRef } from "react";

type Props = {
  handleNewStoke: (points: Stroke | null) => void;
  clear: () => void;
  canvasRef: RefObject<HTMLCanvasElement>;
};

export default function DrawingCanvas({
  handleNewStoke,
  clear,
  canvasRef,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null!);
  const isPressing = useRef(false);
  const stroke = useRef<Stroke>({ points: [] });

  const cl = useCallback(() => {
    clear();
    stroke.current = { points: [] };
  }, []);

  function handleDraw(clientX: number, clientY: number) {
    const canvas = canvasRef.current;
    const { left, top } = canvas.getBoundingClientRect();
    const x = clientX - left;
    const y = clientY - top;

    const ctx = canvasRef.current.getContext("2d");

    if (!ctx) {
      return;
    }

    const point = { x, y };

    if (stroke.current.points.length > 0) {
      const previousPoint =
        stroke.current.points[stroke.current.points.length - 1];

      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.moveTo(previousPoint.x, previousPoint.y);
      ctx.lineTo(x, y);
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // add the point and update the rect
    stroke.current.points.push(point);

    if (!stroke.current.top || point.y < stroke.current.top.y) {
      stroke.current.top = point;
    }
    if (!stroke.current.bot || point.y > stroke.current.bot.y) {
      stroke.current.bot = point;
    }
    if (!stroke.current.left || point.x < stroke.current.left.x) {
      stroke.current.left = point;
    }
    if (!stroke.current.right || point.x > stroke.current.right.x) {
      stroke.current.right = point;
    }
  }

  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;

      const ctx = canvasRef.current.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);

      const container = containerRef.current;

      const { width, height } = container.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
      stroke.current = { points: [] };
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
          handleNewStoke(stroke.current);
          isPressing.current = false;
          stroke.current = { points: [] };
        }}
      >
        Oops, your browser does not support HTML5 canvas:
      </canvas>
      <button
        className="hover:text-primary w-full text-center transition hover:cursor-pointer"
        onClick={() => cl()}
      >
        Clear
      </button>
    </div>
  );
}
