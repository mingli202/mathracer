export interface Player {
  id: number;
  name: string;
  score: number;
  isHost: boolean;
  progress: number;
  hasComplete: boolean;
  isSinglePlayer: boolean;
}

export interface Equation {
  id: string;
  equation: string;
  answer: number;
}

export type GameMode = { type: "equations" | "time"; count: number };

export type GameState = "menu" | "joining" | "lobby" | "playing" | "results";

export interface Game {
  id: string;
  gameMode: GameMode;
  questions: Equation;
}
