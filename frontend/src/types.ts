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

export const GameState = z.object({
  id: z.string(),
  gameMode: GameMode,
  questions: z.array(Equation),
  currentPlayer: Player,
  players: z.array(Player),
});

export type Player = z.infer<typeof Player>;
export type Equation = z.infer<typeof Equation>;
export type GameMode = z.infer<typeof GameMode>;
export type GameState = z.infer<typeof GameState>;
