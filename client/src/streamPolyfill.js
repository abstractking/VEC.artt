// Import stream from the stream-browserify package
import * as stream from 'stream-browserify';

// Make specific classes available
export const Transform = stream.Transform;
export const Readable = stream.Readable;
export const Writable = stream.Writable;
export const Duplex = stream.Duplex;

// Export the entire module as default
export default stream;