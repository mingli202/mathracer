import { Mini } from "./mini";
import { ChatGpt5 } from "./chatGpt5";
import { KerasTutorial } from "./kerasTutorial";
import { LeNet } from "./leNet";
import { MobileNetMini } from "./mobileNetMini";
import { TfjsTutorial } from "./tfjsTutorial";

export const Models = {
  Mini,
  ChatGpt5,
  KerasTutorial,
  LeNet,
  MobileNetMini,
  TfjsTutorial,
} as const;

export type Models = (typeof Models)[keyof typeof Models];
