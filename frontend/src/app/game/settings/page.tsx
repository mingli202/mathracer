import { Model } from "@/types";
import Setting from "./settings";

export default async function SettingPage() {
  const res = await fetch(
    "https://raw.githubusercontent.com/mingli202/mathracer/refs/heads/main/artifacts/metadata.json",
  );
  const metadata = (await res.json()) as Record<
    Model,
    { totalParams: number; accuracy: number; loss: number }
  >;

  return <Setting metadata={metadata} />;
}
