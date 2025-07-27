import { getCurrentUser } from "@/auth";
import { redirect } from "next/navigation";

type Props = {
  children: React.ReactNode;
};

export default async function LogsLayout({ children }: Props) {
  const user = await getCurrentUser();

  if (!user && process.env.NODE_ENV === "production") {
    redirect("/login");
  }

  return children;
}
