"use server";

import { cookies } from "next/headers";
import { HttpVerb } from "./utils/httpverb";
import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { Credentials, LoginResponse } from "./types";

// these have to be set or it will fail
const publicKeyBase64 = process.env.RSA_PUBLIC_KEY!;
const privateKeyBase64 = process.env.RSA_PRIVATE_KEY!;

const _publicKey = await crypto.subtle.importKey(
  "spki",
  Uint8Array.from(atob(publicKeyBase64), (t) => t.charCodeAt(0)),
  { name: "RSA-OAEP", hash: "SHA-256" },
  false,
  ["encrypt"],
);

const _privateKey = await crypto.subtle.importKey(
  "pkcs8",
  Uint8Array.from(atob(privateKeyBase64), (t) => t.charCodeAt(0)),
  { name: "RSA-OAEP", hash: "SHA-256" },
  false,
  ["decrypt"],
);

export async function getCookieValue(name: string): Promise<string | null> {
  const cookieStore = await cookies();

  // get cookie
  const encryptedBase64Cookie = cookieStore.get(name)?.value;

  if (!encryptedBase64Cookie) {
    return null;
  }

  const decrypted = await decryptRsaAndBase64(encryptedBase64Cookie);

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
  const base64 = await encryptRsaAndBase64(value);

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

  const response = await fetch(
    `${process.env.SERVER_URL}/api/auth/validateToken`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        Token: `${token}`,
      },
    },
  );

  return response;
}

export async function getServerPublicKey(): Promise<CryptoKey> {
  const res = await fetch(`${process.env.SERVER_URL}/api/auth/key`);
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

export async function encryptRsaAndBase64(
  value: string,
  customPublicKey?: CryptoKey,
): Promise<string> {
  const textEncoder = new TextEncoder();
  const key = customPublicKey ?? _publicKey;

  const encrypted = await crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    key,
    textEncoder.encode(value),
  );

  const base64 = btoa(String.fromCharCode(...new Uint8Array(encrypted)));

  return base64;
}

export async function decryptRsaAndBase64(
  encryptedBase64: string,
): Promise<string | null> {
  const key = _privateKey;
  const decrypted = await crypto.subtle
    .decrypt(
      { name: "RSA-OAEP" },
      key,
      Uint8Array.from(atob(encryptedBase64), (t) => t.charCodeAt(0)),
    )
    .then((res) => new TextDecoder().decode(res))
    .catch(() => null);

  return decrypted;
}

export async function login(credentials?: Credentials): Promise<LoginResponse> {
  let res: Response;

  if (!credentials) {
    res = await validateToken();
  } else {
    const serverPublicKey = await getServerPublicKey();
    const base64payload = await encryptRsaAndBase64(
      JSON.stringify(credentials),
      serverPublicKey,
    );

    res = await fetch(`${process.env.SERVER_URL}/api/auth/login`, {
      method: HttpVerb.POST,
      body: JSON.stringify({ payload: base64payload }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  if (res.ok) {
    const token = await res.text();
    await setCookieValue("token", token);

    return { ok: true, message: "Logged in successfully" };
  }
  (await cookies()).delete("token");

  return { ok: false, message: "Invalid credentials" } as const;
}
