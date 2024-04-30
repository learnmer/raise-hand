import type * as Party from "partykit/server";
import {
  raiseHandTimeoutMilliseconds,
  type BroadcastRaiseHandServerMessage,
  type HandState,
  type LowerHandClientMessage,
  type RaiseHandClientMessage,
  type User,
  type UserListServerMessage,
} from "../message";

const HAND_STATE = "hand-state";
export default class Server implements Party.Server {
  options: Party.ServerOptions = { hibernate: true };

  constructor(readonly room: Party.Room) {}

  onStart(): void | Promise<void> {}

  async onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    console.info(`onConnect from ${getConnectionUsername(conn)}`);
    this.brodcastUserList();
    await this.broadcastHandState();
  }

  async onMessage(message: string, sender: Party.Connection) {
    console.info(`got message from ${getConnectionUsername(sender)}`, message);
    const msg: LowerHandClientMessage | RaiseHandClientMessage | any =
      JSON.parse(message);
    if (msg.type === "raise-hand") {
      await this.room.storage.transaction<boolean>(async (txn) => {
        const handState = await txn.get<HandState>(HAND_STATE);
        if (
          handState === undefined ||
          handState.timestampMilliseconds <
            Date.now() - raiseHandTimeoutMilliseconds
        ) {
          await txn.put<HandState>(HAND_STATE, {
            username: getConnectionUsername(sender),
            timestampMilliseconds: Date.now(),
          });
          await txn.setAlarm(Date.now() + raiseHandTimeoutMilliseconds + 250);
          console.info("raise hand success", getConnectionUsername(sender));
          return true;
        }
        console.info("raise hand false", getConnectionUsername(sender));
        return false;
      });
    } else if (msg.type === "lower-hand") {
      await this.room.storage.transaction<boolean>(async (txn) => {
        const handState = await txn.get<HandState>(HAND_STATE);
        if (
          handState !== undefined &&
          handState.username === getConnectionUsername(sender) &&
          handState.timestampMilliseconds >
            Date.now() - raiseHandTimeoutMilliseconds
        ) {
          await txn.put<HandState>(HAND_STATE, {
            username: getConnectionUsername(sender),
            timestampMilliseconds: 0,
          });
          console.info("lower hand success", getConnectionUsername(sender));
          return true;
        }
        console.info("lower hand false", getConnectionUsername(sender));
        return false;
      });
    } else {
      console.info("received invalid message from client");
    }
    await this.broadcastHandState();
  }

  onRequest(req: Party.Request) {
    console.info("received onRequest");
    return new Response(JSON.stringify({}), { status: 404 });
  }

  onClose(conn: Party.Connection<unknown>): void | Promise<void> {
    console.info(`onClose from ${getConnectionUsername(conn)}`);
    this.brodcastUserList();
  }

  onError(conn: Party.Connection<unknown>, error: Error): void | Promise<void> {
    console.info(`onError from ${getConnectionUsername(conn)}`);
    this.brodcastUserList();
  }

  async onAlarm(): Promise<void> {
    console.info("running onAlarm");
    await this.room.storage.transaction(async (txn) => {
      const handState = await txn.get<HandState>(HAND_STATE);
      if (
        handState !== undefined &&
        handState.timestampMilliseconds <
          Date.now() - raiseHandTimeoutMilliseconds
      ) {
        await txn.put<HandState>(HAND_STATE, {
          username: handState.username,
          timestampMilliseconds: 0,
        });
      }
    });
    await this.broadcastHandState();
  }

  brodcastUserList(): void {
    console.info(`broadcasting user list`);
    const users: User[] = [];
    for (const conn of this.room.getConnections()) {
      users.push({ username: getConnectionUsername(conn) });
    }
    const message: UserListServerMessage = {
      type: "user-list",
      payload: {
        users,
      },
    };
    for (const conn of this.room.getConnections()) {
      conn.send(JSON.stringify(message));
    }
    console.info(`broadcasted user list`, message);
  }

  async broadcastHandState(): Promise<void> {
    console.info(`broadcasting hand state`);
    const handState = await this.room.storage.get<HandState>(HAND_STATE);
    if (handState) {
      const msg: BroadcastRaiseHandServerMessage = {
        type: "broadcast-raise-hand",
        payload: handState,
      };
      for (const conn of this.room.getConnections()) {
        conn.send(JSON.stringify(msg));
      }
    }
    console.info(`broadcasted hand state`, handState);
  }
}

function getConnectionUsername(conn: Party.Connection): string {
  const url = new URL(conn.uri);
  return url.searchParams.get("username") ?? "";
}

Server satisfies Party.Worker;
