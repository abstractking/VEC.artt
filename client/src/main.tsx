
/**
 * This file is the entry point for the application.
 * Polyfills are loaded in a specific order to ensure compatibility.
 */

// Load the unified polyfill system first
import "./lib/polyfills";

// After polyfills are loaded, import other dependencies
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Create root element if it doesn't exist
const rootElement = document.getElementById("root");
if (!rootElement) {
  const root = document.createElement("div");
  root.id = "root";
  document.body.appendChild(root);
}

// Render with error boundary
try {
  createRoot(document.getElementById("root")!).render(<App />);
} catch (error) {
  console.error("Failed to render application:", error);
  document.body.innerHTML = '<div style="padding: 20px;">Failed to load application. Please check console for details.</div>';
}
