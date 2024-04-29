export const raiseHandTimeoutMilliseconds = 5 * 1000;

export type RaiseHandClientMessage = { type: "raise-hand" };

export type LowerHandClientMessage = { type: "lower-hand" };

export type ClientMessage = RaiseHandClientMessage | LowerHandClientMessage;

export type HandState = {
  username: string;
  timestampMilliseconds: number;
};

export type User = { username: string };

export type UserListServerMessage = {
  type: "user-list";
  payload: { users: User[] };
};

export type BroadcastRaiseHandServerMessage = {
  type: "broadcast-raise-hand";
  payload: HandState;
};

export type ServerMessage =
  | UserListServerMessage
  | BroadcastRaiseHandServerMessage;
