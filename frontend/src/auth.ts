"use server";

import { cookies } from "next/headers";
import { User } from "./types";

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  if (!token) {
    return null;
  }

  const response = await fetch("/api/auth", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).catch(() => null);

  if (!response || !response.ok) {
    return null;
  }

  const user = await response.json();

  return user;
}
