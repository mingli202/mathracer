"use server";

import { cookies } from "next/headers";
import { HttpVerb } from "./utils/httpverb";
import { redirect } from "next/navigation";
import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { Credentials } from "./types";

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
    ...options,
    httpOnly: true,
  });
}

export async function validateToken(): Promise<Response> {
  const token = await getCookieValue("token");

  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (token === "some token") {
    return new Response(null, { status: 200 });
  } else {
    return new Response("Unauthorized", { status: 401 });
  }

  const response = await fetch("/api/auth/validateToken", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  });

  return response;
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
  credentials: Credentials,
): Promise<"Invalid credentials"> {
  const base64payload = await encryptRSAAndBase64(JSON.stringify(credentials));

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
    method: HttpVerb.POST,
    body: JSON.stringify({ payload: base64payload }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (res.ok) {
    const token = await res.text();
    await setCookieValue("token", token);

    const previousUrl = (await getCookieValue("previousUrl")) ?? "/";

    redirect(previousUrl);
  }
  return "Invalid credentials" as const;
}
