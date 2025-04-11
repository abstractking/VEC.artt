/**
 * Stream shim for browser environments
 * This provides compatibility interfaces for code expecting Node's Stream module
 */

// Basic Transform stream implementation
export class Transform {
  constructor() {
    this._events = {};
  }
  
  _transform() {
    // Minimal implementation
  }
  
  pipe() {
    // Minimal implementation
    return this;
  }
  
  on(event, listener) {
    this._events[event] = this._events[event] || [];
    this._events[event].push(listener);
    return this;
  }
  
  emit(event, ...args) {
    if (!this._events[event]) return false;
    this._events[event].forEach(listener => listener(...args));
    return true;
  }
}

// Basic Readable stream implementation
export class Readable {
  constructor() {
    this._events = {};
  }
  
  pipe() {
    // Minimal implementation
    return this;
  }
  
  on(event, listener) {
    this._events[event] = this._events[event] || [];
    this._events[event].push(listener);
    return this;
  }
  
  emit(event, ...args) {
    if (!this._events[event]) return false;
    this._events[event].forEach(listener => listener(...args));
    return true;
  }
}

// Basic Writable stream implementation
export class Writable {
  constructor() {
    this._events = {};
  }
  
  write() {
    // Minimal implementation
    return true;
  }
  
  end() {
    // Minimal implementation
    return this;
  }
  
  on(event, listener) {
    this._events[event] = this._events[event] || [];
    this._events[event].push(listener);
    return this;
  }
  
  emit(event, ...args) {
    if (!this._events[event]) return false;
    this._events[event].forEach(listener => listener(...args));
    return true;
  }
}

// Export default module interface
export default {
  Transform,
  Readable,
  Writable,
  // Add other needed stream classes/utilities
  pipeline: () => {
    throw new Error('stream.pipeline is not supported in browser environments');
  }
};