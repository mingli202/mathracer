"use server";

import { cookies } from "next/headers";
import { User } from "./types";
import { HttpVerb } from "./utils/httpverb";
import { redirect } from "next/navigation";
import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

let publicKey: CryptoKey;
let privateKey: CryptoKey;

crypto.subtle
  .generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 4096,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"],
  )
  .then(({ publicKey: pubK, privateKey: privK }) => {
    publicKey = pubK;
    privateKey = privK;
  });

export async function getCookieValue(name: string): Promise<string | null> {
  const cookieStore = await cookies();

  // get cookie
  const encryptedBase64Cookie = cookieStore.get(name)?.value;

  if (!encryptedBase64Cookie) {
    return null;
  }

  const decrypted = await decryptRSAAndBase64(encryptedBase64Cookie);

  if (!decrypted) {
    cookieStore.delete(name);
    return null;
  }

  return decrypted;
}

export async function setCookieValue(
  name: string,
  value: string,
  options?: Partial<ResponseCookie>,
) {
  const base64 = await encryptRSAAndBase64(value);

  // store
  const cookieStore = await cookies();
  cookieStore.set(name, base64, {
    httpOnly: true,
    ...options,
  });
}

export async function getCurrentUser(): Promise<User | null> {
  const token = await getCookieValue("token");

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

export async function encryptRSAAndBase64(value: string): Promise<string> {
  const textEncoder = new TextEncoder();
  const key = await getPublicKey();

  const encrypted = await crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    key,
    textEncoder.encode(value),
  );

  const base64 = btoa(String.fromCharCode(...new Uint8Array(encrypted)));

  return base64;
}

export async function decryptRSAAndBase64(
  encryptedBase64: string,
): Promise<string | null> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/decrypt`,
    {
      method: HttpVerb.POST,
      body: JSON.stringify({ payload: encryptedBase64 }),
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    },
  );

  if (res.ok) {
    const decrypted = await res.text();
    return decrypted;
  }

  return null;
}

export async function login(
  username: string,
  password: string,
): Promise<string> {
  const base64payload = await encryptRSAAndBase64(
    JSON.stringify({ username, password }),
  );

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
    method: HttpVerb.POST,
    body: JSON.stringify({ payload: base64payload }),
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (res.ok) {
    await setCookieValue("token", "token test");
    const previousUrl = (await getCookieValue("previousUrl")) ?? "/";
    console.log("previousUrl:", previousUrl);

    redirect(previousUrl);
  }
  return "Invalid credentials";
}
