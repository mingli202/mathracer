import { GameStateWrapper } from "@/gameState";

type Props = {
  children: React.ReactNode;
};

export default async function GameLayout({ children }: Props) {
  return (
    <div className="flex h-full w-full items-center justify-center p-4">
      <GameStateWrapper>{children}</GameStateWrapper>
    </div>
  );
}
