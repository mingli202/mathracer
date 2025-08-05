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
  hostName: z.string(),
});

export const PublicLobbies = z.object({
  lobbies: z.array(Lobby),
});

export const Credentials = z.object({
  username: z.string(),
  password: z.string(),
});

export const LoginResponse = z.object({
  ok: z.boolean(),
  message: z.string(),
});

export type Player = z.infer<typeof Player>;
export type Equation = z.infer<typeof Equation>;
export type GameMode = z.infer<typeof GameMode>;
export type Lobby = z.infer<typeof Lobby>;
export type PublicLobbies = z.infer<typeof PublicLobbies>;
export type Credentials = z.infer<typeof Credentials>;
export type LoginResponse = z.infer<typeof LoginResponse>;

export type GameState = {
  lobby: Lobby;
  currentPlayer: Player;
  connection: HubConnection;
};

export const LogSeverity = {
  Info: "Info",
  Debug: "Debug",
  Error: "Error",
} as const;
export type LogSeverity = (typeof LogSeverity)[keyof typeof LogSeverity];

export const Log = z.object({
  timestamp: z.string(),
  severity: z.enum([
    LogSeverity.Info,
    LogSeverity.Debug,
    LogSeverity.Error,
  ] as const),
  message: z.string(),
  details: z.string(),
});
export type Log = z.infer<typeof Log>;
