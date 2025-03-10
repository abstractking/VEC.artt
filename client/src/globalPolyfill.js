// Ensure global is defined in browser environments
if (typeof window !== 'undefined') {
  window.global = window;
}

// Export global for module imports
export default (typeof window !== 'undefined' ? window : global);