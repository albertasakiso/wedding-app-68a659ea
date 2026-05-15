import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// Hide splash once React has mounted
requestAnimationFrame(() => {
  const splash = document.getElementById("app-splash");
  if (splash) {
    splash.classList.add("hide");
    setTimeout(() => splash.remove(), 400);
  }
});

// Register service worker for PWA / offline support (production only)
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Silent fail — site works fine without SW
    });
  });
}
