// Import process from the process package
import process from 'process';

// Ensure process is available in the global scope
if (typeof window !== 'undefined') {
  window.process = process;
}

export default process;