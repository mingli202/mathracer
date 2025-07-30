import { newConnection } from "@/utils/connection";
import Logs from "./Logs";

export default async function LogsPage() {
  const connection = await newConnection();

  return <Logs connection={connection} />;
}
