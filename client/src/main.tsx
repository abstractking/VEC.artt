
/**
 * This file is the entry point for the application.
 * Polyfills are loaded in a specific order to ensure compatibility.
 */

// Load the unified polyfill system first
import "./lib/polyfills";

// Load production error handler
import { setupProductionErrorHandler, addHealthCheck } from './lib/production-error-handler';

// After polyfills are loaded, import other dependencies
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Set up production error handling
if (import.meta.env.PROD) {
  // Add a small indicator to show the app at least started loading
  addHealthCheck();
  // Setup production error handler
  setupProductionErrorHandler();
}

// Log environment information
console.log("[App] Environment mode:", import.meta.env.MODE);
console.log("[App] Base URL:", import.meta.env.BASE_URL);
console.log("[App] Initialization start:", new Date().toISOString());

// Create root element if it doesn't exist
const rootElement = document.getElementById("root");
if (!rootElement) {
  const root = document.createElement("div");
  root.id = "root";
  document.body.appendChild(root);
}

// Explicitly check browser compatibility before rendering
const checkBrowserCompatibility = () => {
  // Check for key browser features we require
  const features = {
    fetch: typeof fetch !== 'undefined',
    promise: typeof Promise !== 'undefined',
    localStorage: typeof localStorage !== 'undefined',
    dynamicImport: true, // This is harder to test directly
  };
  
  console.log("[App] Browser compatibility check:", features);
  
  return Object.values(features).every(Boolean);
};

// Only render if browser is compatible
if (checkBrowserCompatibility()) {
  // Render with error boundary
  try {
    console.log("[App] Rendering application");
    createRoot(document.getElementById("root")!).render(<App />);
  } catch (error) {
    console.error("Failed to render application:", error);
    document.body.innerHTML = '<div style="padding: 20px; font-family: sans-serif;">Failed to load application. Please check console for details.</div>';
  }
} else {
  console.error("Browser compatibility check failed");
  document.body.innerHTML = '<div style="padding: 20px; font-family: sans-serif;">Your browser is not compatible with this application. Please try a modern browser like Chrome, Firefox, or Edge.</div>';
}
