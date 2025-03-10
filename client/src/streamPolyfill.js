/**
 * Explicit Stream polyfill
 * This provides the Transform implementation that's being externalized by Vite
 */

// Import the stream module
import streamBrowserify from 'stream-browserify';

// Create a named export for Transform class
export const Transform = streamBrowserify.Transform;

// Add it to the window object as well
if (typeof window !== 'undefined') {
  // Make sure stream is available on window
  (window).stream = (window).stream || streamBrowserify;
  
  // Add Transform as a properly attached property 
  (window).stream.Transform = Transform;
  
  // Also add directly to window for libraries that might expect it
  (window).Transform = Transform;
  
  console.log("Stream Transform class explicitly initialized");
}