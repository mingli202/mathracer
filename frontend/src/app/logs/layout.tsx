import { getCurrentUser } from "@/auth";
import { redirect } from "next/navigation";

type Props = {
  children: React.ReactNode;
};

export default async function LogsLayout({ children }: Props) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return children;
}
