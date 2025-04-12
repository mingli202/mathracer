import { z } from "zod";

export const Player = z.object({
  id: z.number(),
  name: z.string(),
  score: z.number(),
  isHost: z.boolean(),
  hasComplete: z.boolean(),
});

export const Equation = z.object({
  id: z.number(),
  equation: z.string(),
  answer: z.number(),
});

export const GameMode = z.object({
  type: z.enum(["equations", "time"]),
  count: z.number(),
});

export const Game = z.object({
  id: z.string(),
  gameMode: GameMode,
  questions: Equation,
});
