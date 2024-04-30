import "./styles.css";
import "./tailwind-output.css";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "app/components/theme-provider";
import { AppHeader } from "./components/app-header";
import { AppStateProvider } from "./components/app-state";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AppStateProvider>
        <AppHeader />
      </AppStateProvider>
    </ThemeProvider>
  );
}

createRoot(document.getElementById("app")!).render(<App />);
