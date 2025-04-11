/**
 * VM shim for browser environments
 * This provides compatibility interfaces for code expecting Node's VM module
 */

// Minimal implementation for browser compatibility
class Script {
  constructor(code, options) {
    this.code = code;
    this.options = options || {};
  }

  runInNewContext(context, options) {
    console.warn("VM script execution was called in browser environment. This is a stub implementation.");
    // This is an extremely simplified and unsafe version.
    // In a real implementation, would need to properly sandbox code
    try {
      // In browser we can't really safely run this, so we return a stub
      return {};
    } catch (err) {
      console.error("Error executing VM script:", err);
      throw err;
    }
  }

  runInThisContext(options) {
    console.warn("VM script execution was called in browser environment. This is a stub implementation.");
    // In browser we can't really safely run this, so we return a stub
    return {};
  }
}

export default {
  Script,
  createContext: (context) => {
    return context || {};
  },
  runInNewContext: (code, context, options) => {
    const script = new Script(code, options);
    return script.runInNewContext(context || {}, options);
  },
  runInThisContext: (code, options) => {
    const script = new Script(code, options);
    return script.runInThisContext(options);
  }
};