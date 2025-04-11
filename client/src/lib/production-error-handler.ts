/**
 * Production Error Handler
 * 
 * This module provides enhanced error handling for production deployments
 * to help diagnose issues on platforms like Netlify.
 */

// Function to log errors in a way that's visible even on a blank white screen
export function setupProductionErrorHandler() {
  if (import.meta.env.DEV) {
    console.log('[ErrorHandler] Running in development mode, skipping production error handler');
    return;
  }

  // Create a visible error display element
  const errorDisplay = document.createElement('div');
  errorDisplay.id = 'production-error-display';
  errorDisplay.style.position = 'fixed';
  errorDisplay.style.bottom = '0';
  errorDisplay.style.left = '0';
  errorDisplay.style.right = '0';
  errorDisplay.style.background = 'rgba(255, 0, 0, 0.8)';
  errorDisplay.style.color = 'white';
  errorDisplay.style.padding = '10px';
  errorDisplay.style.fontFamily = 'monospace';
  errorDisplay.style.zIndex = '9999';
  errorDisplay.style.display = 'none';
  document.body.appendChild(errorDisplay);

  // Track if we've already had an error
  let hasError = false;

  // Override the console.error method
  const originalConsoleError = console.error;
  console.error = function(...args) {
    // Call the original console.error
    originalConsoleError.apply(console, args);

    // Only show the first error to avoid flooding
    if (!hasError) {
      hasError = true;
      errorDisplay.style.display = 'block';
      errorDisplay.innerHTML = `<strong>Error:</strong> ${args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ')}`;
    }
  };

  // Global error handler
  window.addEventListener('error', (event) => {
    console.error('Uncaught error:', event.error);
  });

  // Unhandled promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
  });

  // Check specifically for React rendering errors
  const originalError = console.error;
  console.error = function(...args) {
    // Check if this is a React error
    const errorString = args.join(' ');
    if (errorString.includes('React') || errorString.includes('Uncaught Error')) {
      if (!hasError) {
        hasError = true;
        errorDisplay.style.display = 'block';
        errorDisplay.innerHTML = `<strong>React Error:</strong> ${errorString}`;
      }
    }
    originalError.apply(console, args);
  };

  console.log('[ErrorHandler] Production error handler initialized');
}

// Function to add a healthcheck indicator
export function addHealthCheck() {
  // Create a small dot to indicate the app is at least partially loaded
  const healthIndicator = document.createElement('div');
  healthIndicator.style.position = 'fixed';
  healthIndicator.style.top = '5px';
  healthIndicator.style.right = '5px';
  healthIndicator.style.width = '10px';
  healthIndicator.style.height = '10px';
  healthIndicator.style.borderRadius = '50%';
  healthIndicator.style.background = 'green';
  healthIndicator.style.zIndex = '9999';
  document.body.appendChild(healthIndicator);
}