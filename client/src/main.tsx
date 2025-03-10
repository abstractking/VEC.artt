/**
 * This file is the entry point for the application.
 * Polyfills must be loaded in the correct order to ensure compatibility
 */

// First, include the global polyfill that sets window.global = window
// This needs to be first as other modules may depend on global being defined
import "./globalPolyfill.js";

// Explicitly load process and buffer polyfills to address Vite externalization
import "./processPolyfill.js";
import "./bufferPolyfill.js";

// Then include the other Node.js polyfills
import "./lib/polyfills";

console.log("All polyfills loaded in main entry point");

// Only continue with other imports after all polyfills are loaded
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
