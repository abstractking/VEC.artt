/**
 * This file is the entry point for the application.
 * Polyfills must be loaded in the correct order to ensure compatibility
 */

// First, include the global polyfill that sets window.global = window
// This needs to be first as other modules may depend on global being defined
import "./globalPolyfill.js";

// Explicitly load process, buffer, and stream polyfills to address Vite externalization
import "./processPolyfill.js";
import "./bufferPolyfill.js";
import "./streamPolyfill.js";

// Load build-specific polyfills for Node.js modules
import "./lib/build-polyfills";

// Load Thor-specific crypto polyfills
import "./lib/thor-polyfills";

// For secp256k1 browser compatibility
import "./lib/secp256k1-browser";

// Then include the other Node.js polyfills
import "./lib/polyfills";

console.log("All polyfills loaded in main entry point");

// Only continue with other imports after all polyfills are loaded
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
