import { useEffect, useState, type ReactNode } from "react";
import { useAppState } from "./app-state";
import usePartySocket from "partysocket/react";
import {
  raiseHandTimeoutMilliseconds,
  type LowerHandClientMessage,
  type ServerMessage,
} from "message";
import { AnimatePresence, motion, type Transition } from "framer-motion";
import { cn } from "app/lib/utils";
import { Button } from "./ui/button";
import { ArrowDown, ArrowUp, Hand } from "lucide-react";

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
          (raiseHandTimeoutMilliseconds -
            (Date.now() -
              (clockSkewFromServer +
                appState.handState.timestampMilliseconds))) /
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
    <div className="flex items-stretch justify-center w-full h-full flex-col space-y-4">
      <div className="relative w-full h-full">
        <div className="flex items-stretch justify-center w-full h-full flex-col flex-1">
          <div className="flex flex-row justify-items-center items-center justify-center space-x-2 flex-1 flex-wrap">
            {appState.users.map((user) => (
              <motion.div
                key={user.username}
                layoutId={user.username}
                style={{ backgroundColor: user.color }}
                className={cn(
                  "text-white p-4 min-h-6 min-w-16 rounded-full text-center",
                  appState.username === user.username &&
                    "border-black dark:border-white border-2 border-dashed"
                )}
              >
                {user.username}
              </motion.div>
            ))}
          </div>
        </div>
        {(errorMessage ?? null) && (
          <div className="top-0 w-full absolute px-2 bg-red-500 text-center">
            {errorMessage}
          </div>
        )}
        <AnimatePresence>
          {isAnyUserRaisingHand && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                className="absolute top-0 bottom-0 left-0 right-0 bg-black"
              ></motion.div>
              <motion.div
                layoutId={appState.handState?.username ?? ""}
                style={
                  appState.users.find(
                    (u) => u.username === appState.handState?.username
                  )
                    ? {
                        backgroundColor: appState.users.find(
                          (u) => u.username === appState.handState?.username
                        )?.color,
                      }
                    : {}
                }
                className={cn(
                  "absolute inset-6 rounded-3xl ",
                  appState.handState?.username === appState.username &&
                    "border-black dark:border-white border-4 border-dashed"
                )}
              >
                <div className="flex items-center w-full h-full text-center justify-center text-white text-3xl">
                  {appState.handState?.username ?? ""}
                </div>
                <div className="absolute top-1 right-1 p-2">
                  {remainingHandRaisedSeconds}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
      {isCurrentUserRaisingHand ? (
        <Button
          className="text-lg min-h-36"
          onClick={() => {
            socket.send(
              JSON.stringify({ type: "lower-hand" } as LowerHandClientMessage)
            );
          }}
        >
          <Hand className="h-6 w-6" />
          <ArrowDown className="mr-2 h-6 w-6" />
          Lower Hand
        </Button>
      ) : isAnyUserRaisingHand ? (
        <Button disabled className="text-lg min-h-36">
          <Hand className="h-6 w-6" />
          <ArrowUp className="mr-2 h-6 w-6" />
          Raise Hand
        </Button>
      ) : (
        <Button
          className="text-lg min-h-36"
          onClick={() => {
            socket.send(
              JSON.stringify({ type: "raise-hand" } as RaiseHandClientMessage)
            );
          }}
        >
          <Hand className="h-6 w-6" />
          <ArrowUp className="mr-2 h-6 w-6" />
          Raise Hand
        </Button>
      )}
    </div>
  );
}

const background = {
  position: "fixed",
  top: "0",
  left: "0",
  bottom: "0",
  right: "0",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#ccc",
};

const container = {
  backgroundColor: "#eeeeee",
  borderRadius: "25px",
  width: "600px",
  height: "600px",
  margin: "0",
  padding: "0 20px 20px 0",
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "space-between",
  alignItems: "space-between",
  listStyle: "none",
};

const item = {
  padding: "20px",
  cursor: "pointer",
  margin: "20px 0 0 20px",
  flex: "1 1 90px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const overlay = {
  background: "rgba(0,0,0,0.6)",
  position: "fixed",
  top: "0",
  left: "0",
  bottom: "0",
  right: "0",
};

const singleImageContainer: CSSProperties = {
  position: "absolute",
  top: "0",
  left: "0",
  bottom: "0",
  right: "0",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  pointerEvents: "none",
};

const singleImage = {
  width: "500px",
  height: "300px",
  padding: 50,
};

const child = {
  width: 50,
  height: 50,
  borderRadius: 25,
  backgroundColor: "white",
  opacity: 0.5,
};
