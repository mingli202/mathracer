import * as signalR from "@microsoft/signalr";

export function newConnection() {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/hub`;

  const c = new signalR.HubConnectionBuilder()
    .withUrl(url, { withCredentials: true })
    .build();

  return c;
}

export async function withConnection(
  f: (arg: signalR.HubConnection) => Promise<void>,
) {
  const c = newConnection();
  await c.start();

  await f(c);
  await c.stop();
}
