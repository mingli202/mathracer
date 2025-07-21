import * as signalR from "@microsoft/signalr";

export async function newConnection() {
  const c = new signalR.HubConnectionBuilder()
    .withUrl(process.env.NEXT_PUBLIC_HUB_URL!, { withCredentials: true })
    .build();

  await c.start();
  return c;
}

export async function withConnection(
  f: (arg: signalR.HubConnection) => Promise<void>,
) {
  const c = new signalR.HubConnectionBuilder()
    .withUrl(process.env.NEXT_PUBLIC_HUB_URL!)
    .build();

  await c.start();
  await f(c);
  await c.stop();
}
