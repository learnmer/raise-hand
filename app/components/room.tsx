import { useEffect, useState, type ReactNode } from "react";
import { useAppState } from "./app-state";
import usePartySocket from "partysocket/react";
import { raiseHandTimeoutMilliseconds, type ServerMessage } from "message";

export function Room(): ReactNode {
  const { appState, setUsers, setHandState } = useAppState();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [clockSkewFromServer, setClockSkewFromServer] = useState<number>(0);
  const [remainingHandRaisedSeconds, setRemainingHandRaisedSeconds] = useState<
    string | null
  >(null);
  useEffect(() => {
    const handle = setInterval(() => {
      if (
        appState.handState?.timestampMilliseconds &&
        clockSkewFromServer + appState.handState.timestampMilliseconds >
          Date.now() - raiseHandTimeoutMilliseconds
      ) {
        const remainingSeconds =
          (Date.now() -
            (clockSkewFromServer + appState.handState.timestampMilliseconds)) /
          1000;
        setRemainingHandRaisedSeconds(remainingSeconds.toFixed(1));
      } else {
        setRemainingHandRaisedSeconds(null);
      }
    }, 50);
    return () => {
      clearInterval(handle);
    };
  }, [
    appState.handState,
    appState.handState?.timestampMilliseconds,
    clockSkewFromServer,
  ]);
  // Cannot accurately calculate time delta in client side due to clock skew with server
  const isCurrentUserRaisingHand =
    appState.handState &&
    appState.username === appState.handState.username &&
    appState.handState.timestampMilliseconds !== 0;
  const isAnyUserRaisingHand =
    appState.handState && appState.handState.timestampMilliseconds !== 0;
  const socket = usePartySocket({
    room: appState.roomId,
    query: { username: appState.username },
    onClose(event) {
      setErrorMessage("DISCONNECTED: connection closed");
      console.warn("onClose", event);
    },
    onError(event) {
      setErrorMessage("DISCONNECTED: connection error");
      console.error("onError", event);
    },
    onMessage(event) {
      setErrorMessage(null);
      console.info("onMessafe", event);
      const msg: ServerMessage = JSON.parse(event.data);
      if (msg.type === "user-list") {
        setUsers(msg.payload.users);
      } else if (msg.type === "broadcast-raise-hand") {
        setHandState(msg.payload);
        setClockSkewFromServer(Date.now() - msg.payload.timestampMilliseconds);
      }
    },
  });
  return (
    <div className="flex items-stretch justify-center w-full h-full flex-col space-y-4"></div>
  );
}
