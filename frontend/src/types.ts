import { z } from "zod";
import { HubConnection } from "@microsoft/signalr";

export const Player = z.object({
  playerId: z.string(),
  name: z.string(),
  score: z.number(),
  isHost: z.boolean(),
  state: z.enum(["playing", "lobby", "completed"]),
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

export const Lobby = z.object({
  lobbyId: z.string(),
  gameMode: GameMode,
  equations: z.array(Equation),
  players: z.array(Player),
});

export type Player = z.infer<typeof Player>;
export type Equation = z.infer<typeof Equation>;
export type GameMode = z.infer<typeof GameMode>;
export type Lobby = z.infer<typeof Lobby>;

export type GameState = {
  lobby: Lobby;
  currentPlayer: Player;
  connection: HubConnection | null;
};
