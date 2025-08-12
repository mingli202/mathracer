import { useRef } from "react";
import DrawingCanvas from "./DrawingCanvas";
import { Point } from "@/types";

type Props = {
  submitIfCorrect: (answer: string) => void;
};

export default function DigitPredictor({ submitIfCorrect }: Props) {
  const points = useRef<Point[]>([]);

  function handleNewPoint(point: Point) {}

  return <DrawingCanvas handleNewPoint={handleNewPoint} />;
}
