import { stringToColor } from "app/lib/color";
import type { HandState, User } from "message";
import { createContext, useContext, useState, type ReactNode } from "react";

export type AppState = {
  roomId: string;
  username: string;
  users: (User & { color: string })[];
  handState?: HandState;
  inRoom: boolean;
};

const defaultAppState: AppState = {
  roomId: "",
  username: "",
  users: [],
  handState: undefined,
  inRoom: false,
};

type AppStateContextValue = {
  appState: AppState;
  setRoomId: (roomId: string) => void;
  setUsername: (username: string) => void;
  setUsers: (users: User[]) => void;
  setHandState: (handState: HandState) => void;
  setInRoom: (inRoom: boolean) => void;
};

const AppStateContext = createContext<AppStateContextValue>({
  appState: defaultAppState,
  setRoomId: (v) => {},
  setUsername: (v) => {},
  setUsers: (v) => {},
  setHandState: (v) => {},
  setInRoom: (v) => {},
});

export function AppStateProvider({
  children,
}: {
  children: ReactNode;
}): ReactNode {
  const [appState, setAppState] = useState<AppState>(defaultAppState);
  const setRoomId = (roomId: string) => {
    window.history.replaceState(null, "", `/${roomId}`);
    setAppState((as) => ({ ...as, roomId }));
  };
  const setUsername = (username: string) => {
    setAppState((as) => ({ ...as, username }));
  };
  const setUsers = (users: User[]) => {
    setAppState((as) => ({
      ...as,
      users: users.map((user) => ({
        ...user,
        color: stringToColor(user.username),
      })),
    }));
  };
  const setHandState = (handState: HandState) => {
    setAppState((as) => ({
      ...as,
      handState,
    }));
  };
  const setInRoom = (inRoom: boolean) => {
    setAppState((as) => ({
      ...as,
      inRoom,
    }));
  };
  return (
    <AppStateContext.Provider
      value={{
        appState,
        setRoomId,
        setUsername,
        setUsers,
        setHandState,
        setInRoom,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState(): AppStateContextValue {
  return useContext(AppStateContext);
}
