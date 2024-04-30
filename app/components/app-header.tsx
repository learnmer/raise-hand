import type { ReactNode } from "react";
import { useAppState } from "./app-state";
import { Button } from "./ui/button";
import { Github, LogOut } from "lucide-react";
import { ModeToggle } from "./mode-toggle";

type AppHeaderProps = {
  roomId?: string;
};

export function AppHeader({ roomId }: AppHeaderProps): ReactNode {
  const { appState, setInRoom } = useAppState();
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        {appState.inRoom ? (
          <Button
            variant="outline"
            size="icon"
            className="px-2"
            onClick={() => {
              setInRoom(false);
            }}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        ) : null}
        <div className="mr-4 flex items-center">
          {appState.inRoom ? (
            <span className="hidden font-bold sm:inline-block mr-6 space-x-2">
              {appState.roomId}
            </span>
          ) : (
            <a
              href="https://learnmer.com"
              className="mr-6 flex items-center space-x-2"
              rel="noopener"
            >
              <span className="font-bold inline-block">Learnmer</span>
            </a>
          )}
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="flex items-center space-x-4">
            <Button asChild variant="outline" size="icon">
              <a href="https://github.com/learnmer/raise-hand" rel="noopener">
                <Github />
              </a>
            </Button>
            <ModeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}
