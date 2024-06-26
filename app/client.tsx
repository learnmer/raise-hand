import "./styles.css";
import "./tailwind-output.css";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "app/components/theme-provider";
import { AppHeader } from "./components/app-header";
import { AppStateProvider, useAppState } from "./components/app-state";
import { Room } from "./components/room";
import { Lobby } from "./components/lobby";
import { useEffect } from "react";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AppStateProvider>
        <AppHeader />
        <Main />
      </AppStateProvider>
    </ThemeProvider>
  );
}

function Main() {
  const { appState, setRoomId } = useAppState();
  useEffect(() => {
    if (window.location.pathname.replace("/", "")) {
      setRoomId(window.location.pathname.replace("/", ""));
    }
  }, []);
  return (
    <main className="main-section">
      {appState.inRoom ? <Room /> : <Lobby />}
    </main>
  );
}

createRoot(document.getElementById("app")!).render(<App />);
