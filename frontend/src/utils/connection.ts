import * as signalR from "@microsoft/signalr";

export async function newConnection() {
  const url = process.env.NEXT_PUBLIC_HUB_URL ?? "http://localhost:5103/hub";

  const c = new signalR.HubConnectionBuilder()
    .withUrl(url, { withCredentials: true })
    .build();

  await c.start();
  return c;
}

export async function withConnection(
  f: (arg: signalR.HubConnection) => Promise<void>,
) {
  const c = await newConnection();

  await f(c);
  await c.stop();
}
