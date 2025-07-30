"use server";

import { cookies } from "next/headers";
import { User } from "./types";
import { HttpVerb } from "./utils/httpverb";
import { redirect } from "next/navigation";
import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

export const { privateKey, publicKey } = await window.crypto.subtle.generateKey(
  {
    name: "RSA-OAEP",
    modulusLength: 4096,
    publicExponent: new Uint8Array([1, 0, 1]),
    hash: "SHA-256",
  },
  true,
  ["encrypt", "decrypt"],
);

export async function getCookieValue(name: string): Promise<string | null> {
  const cookieStore = await cookies();
  const encryptedBase64Cookie = cookieStore.get(name)?.value;

  if (!encryptedBase64Cookie) {
    return null;
  }

  const decrypted: ArrayBuffer = await crypto.subtle.decrypt(
    { name: "RSA-OAEP" },
    privateKey,
    Uint8Array.from(atob(encryptedBase64Cookie), (t) => t.charCodeAt(0)),
  );

  return new TextDecoder().decode(decrypted);
}

export async function setCookieValue(
  name: string,
  value: string,
  options?: Partial<ResponseCookie>,
) {
  const cookieStore = await cookies();
  const encrypted = await crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    publicKey,
    new TextEncoder().encode(value),
  );
  const base64 = btoa(String.fromCharCode(...new Uint8Array(encrypted)));

  cookieStore.set(name, base64, options);
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return null;
  }

  return token === "token test" ? { username: "test", id: "1" } : null;

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
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/key`);
  const base64 = await res.text();

  const spki = Uint8Array.from(atob(base64), (t) => t.charCodeAt(0));

  // RSA algorithms always include a hash function
  // so we need to specify which one we use (SHA-256 here)
  const key = crypto.subtle.importKey(
    "spki",
    spki,
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["encrypt"],
  );

  return key;
}

export async function login(
  username: string,
  password: string,
): Promise<string> {
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

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
    method: HttpVerb.POST,
    body: JSON.stringify({ payload: base64 }),
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  const cookieStore = await cookies();
  const previousUrl = cookieStore.get("previousUrl")?.value ?? "/";
  if (res.ok) {
    cookieStore.set("token", "token test", { httpOnly: true });

    redirect(previousUrl);
  }
  return "Invalid credentials";
}
