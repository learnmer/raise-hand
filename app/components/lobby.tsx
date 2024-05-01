import type { ReactNode } from "react";
import { Input } from "./ui/input";
import { useAppState } from "./app-state";
import { Button } from "./ui/button";
import { LogIn, Shuffle } from "lucide-react";
import { generate } from "random-words";

export function Lobby(): ReactNode {
  const { appState, setRoomId, setUsername, setInRoom } = useAppState();
  const canEnterRoom =
    appState.roomId.length > 0 && appState.username.length > 0;
  return (
    <div className="flex items-center justify-center w-full h-full flex-col space-y-4 px-2">
      <div className="text-xl">Raise your hand virtually. Be fast.</div>
      <div className="flex flex-row items-center justify-stretch w-full max-w-screen-md space-x-4">
        <Input
          value={appState.roomId}
          onChange={(evt) => {
            setRoomId(evt.target.value);
          }}
          placeholder="Room ID"
          className="flex-1"
        />
        <Button
          variant="outline"
          size={"icon"}
          onClick={() => {
            setRoomId(generate({ exactly: 4, join: "-" }));
          }}
        >
          <Shuffle />
        </Button>
      </div>
      <div className="flex flex-row items-center justify-stretch w-full max-w-screen-md space-x-4">
        <Input
          value={appState.username}
          onChange={(evt) => {
            setUsername(evt.target.value);
          }}
          placeholder="Username"
          className="flex-1"
        />
      </div>
      <div className="flex flex-row items-center justify-stretch w-full max-w-screen-sm space-x-4">
        <Button
          onClick={() => {
            if (canEnterRoom) {
              setInRoom(true);
            }
          }}
          disabled={!canEnterRoom}
          className="w-full"
        >
          <LogIn className="mr-2 h-4 w-4" /> Enter Room
        </Button>
      </div>
    </div>
  );
}
