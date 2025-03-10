/**
 * Browser-compatible implementation of secp256k1 for thor-devkit
 */
import * as ellipticLib from 'elliptic';
import { randomBytes } from 'crypto-browserify';

// Create secp256k1 elliptic curve instance
const elliptic = new ellipticLib.ec('secp256k1');

/**
 * Generate a random private key
 * @returns Buffer containing the private key
 */
export function generatePrivateKey(): Buffer {
  const bytes = randomBytes(32);
  return Buffer.from(bytes);
}

/**
 * Derive an address from a public key
 * @param pubKey Public key buffer
 * @returns Hex string address
 */
export function deriveAddress(pubKey: Buffer): string {
  return pubKey.toString('hex');
}

/**
 * Sign a message hash with a private key
 * @param msgHash Message hash to sign
 * @param privKey Private key to sign with
 * @returns Signature buffer
 */
export function sign(msgHash: Buffer, privKey: Buffer): Buffer {
  const keyPair = elliptic.keyFromPrivate(privKey);
  const signature = keyPair.sign(msgHash, { canonical: true });
  
  // Convert to buffer format expected by thor-devkit
  const r = Buffer.from(signature.r.toArray());
  const s = Buffer.from(signature.s.toArray());
  
  return Buffer.concat([r, s, Buffer.from([signature.recoveryParam || 0])]);
}

/**
 * Recover a public key from a signature and message hash
 * @param msgHash Message hash that was signed
 * @param sig Signature buffer
 * @returns Public key buffer
 */
export function recover(msgHash: Buffer, sig: Buffer): Buffer {
  const r = sig.slice(0, 32);
  const s = sig.slice(32, 64);
  const v = sig[64];
  
  // Recover the public key point
  const point = elliptic.recoverPubKey(
    msgHash.toString('hex'), 
    { r: r.toString('hex'), s: s.toString('hex') },
    v
  );
  
  // Convert to uncompressed format and remove the '04' prefix
  return Buffer.from(point.encode('hex', false).slice(2), 'hex');
}

// Default export for require() style imports
export default {
  generatePrivateKey,
  deriveAddress,
  sign,
  recover
};