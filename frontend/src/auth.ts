"use server";

import { cookies } from "next/headers";
import { User } from "./types";
import { HttpVerb } from "./utils/httpverb";

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

export async function getPublicKey(): Promise<CryptoKey> {
  const key: CryptoKey = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/key`,
  )
    .then((key) => key.text())
    .then((base64) => {
      const spki = Uint8Array.from(atob(base64), (t) => t.charCodeAt(0));

      // RSA algorithms always include a hash function
      // so we need to specify which one we use (SHA-256 here)
      return crypto.subtle.importKey(
        "spki",
        spki,
        { name: "RSA-OAEP", hash: "SHA-256" },
        false,
        ["encrypt"],
      );
    });
  return key;
}

export async function login(username: string, password: string) {
  const textEncoder = new TextEncoder();
  const payload: Uint8Array<ArrayBufferLike> = textEncoder.encode(
    JSON.stringify({ username, password }),
  );

  const key = await getPublicKey();

  const encrypted = await crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    key,
    payload,
  );

  const base64 = btoa(String.fromCharCode(...new Uint8Array(encrypted)));

  await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
    method: HttpVerb.POST,
    body: JSON.stringify({ payload: base64 }),
    headers: {
      "Conten-Type": "application/json",
    },
    credentials: "include",
  });
}
