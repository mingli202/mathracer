"use client";

import { login } from "@/auth";

export default function LoginPage() {
  async function handleAction(formData: FormData) {
    const username = formData.get("username")?.toString() ?? "";
    const password = formData.get("password")?.toString() ?? "";

    await login(username, password);
  }

  return (
    <main className="flex h-full w-full items-center justify-center">
      <form className="flex w-96 flex-col gap-2" action={handleAction}>
        <div>
          <label htmlFor="username" className="shrink-0">
            Username:
          </label>
          <input
            type="text"
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex w-full rounded-md border px-3 py-2 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            id="username"
            name="username"
            placeholder="Username"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="shrink-0">
            Password:
          </label>
          <input
            type="password"
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex w-full rounded-md border px-3 py-2 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            id="password"
            name="password"
            placeholder="Password"
            required
          />
        </div>
        <div className="flex w-full items-center gap-2">
          <button
            className="bg-accent text-accent-foreground border-muted hover:bg-accent-foreground hover:text-accent w-full cursor-pointer rounded-md px-2 py-1 transition"
            type="submit"
          >
            Login
          </button>
        </div>
      </form>
    </main>
  );
}
