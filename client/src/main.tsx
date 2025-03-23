/**
 * This file is the entry point for the application.
 * Polyfills are loaded in a specific order to ensure compatibility.
 */

// Load the unified polyfill system first
// This includes all necessary polyfills including buffer, process, crypto, etc.
import "./lib/polyfills";

// After polyfills are loaded, import other dependencies
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Log that initialization is complete
console.log("Application initialized successfully");

// Render the application
createRoot(document.getElementById("root")!).render(<App />);
