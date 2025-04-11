/**
 * Util shim for browser environments
 * This provides compatibility interfaces for code expecting Node's util module
 */

// Basic debuglog implementation
export const debuglog = () => {
  return () => {}; // No-op function
};

// Basic inspect implementation
export const inspect = (obj) => {
  if (typeof obj === 'object' && obj !== null) {
    try {
      return JSON.stringify(obj);
    } catch (e) {
      return String(obj);
    }
  }
  return String(obj);
};

// Basic format implementation (like util.format)
export const format = (...args) => {
  return args.map(arg => 
    typeof arg === 'object' && arg !== null 
      ? JSON.stringify(arg) 
      : String(arg)
  ).join(' ');
};

// Basic inherits implementation
export const inherits = (ctor, superCtor) => {
  ctor.super_ = superCtor;
  ctor.prototype = Object.create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
};

// Export default module interface
export default {
  debuglog,
  inspect,
  format,
  inherits,
  // Add other needed util functions
  promisify: (fn) => {
    return (...args) => {
      return new Promise((resolve, reject) => {
        fn(...args, (err, ...results) => {
          if (err) return reject(err);
          if (results.length === 1) return resolve(results[0]);
          return resolve(results);
        });
      });
    };
  }
};