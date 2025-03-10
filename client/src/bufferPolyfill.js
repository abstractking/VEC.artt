// Import Buffer from the buffer package
import { Buffer } from 'buffer';

// Ensure Buffer is available in the global scope
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
}

export { Buffer };