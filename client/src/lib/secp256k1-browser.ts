/**
 * Browser-compatible implementation of secp256k1 for thor-devkit
 */

import { randomBytes, createHash } from './thor-polyfills';
import { ec as EC } from 'elliptic';
import { Buffer } from 'buffer';

// Initialize elliptic curve
const secp256k1 = new EC('secp256k1');

export function generatePrivateKey(): Buffer {
    while (true) {
        const privKey = randomBytes(32);
        if (secp256k1.keyFromPrivate(privKey).validate().result) {
            return Buffer.from(privKey);
        }
    }
}

export function deriveAddress(pubKey: Buffer): string {
    const hash = createHash('keccak256').update(pubKey.slice(1)).digest();
    return '0x' + hash.slice(-20).toString('hex');
}

export function sign(msgHash: Buffer, privKey: Buffer): Buffer {
    const key = secp256k1.keyFromPrivate(privKey);
    const sig = key.sign(msgHash, { canonical: true });
    return Buffer.concat([
        Buffer.from(sig.r.toArray('be', 32)),
        Buffer.from(sig.s.toArray('be', 32)),
        Buffer.from([(sig.recoveryParam || 0) + 27])
    ]);
}

export function recover(msgHash: Buffer, sig: Buffer): Buffer {
    const r = sig.slice(0, 32);
    const s = sig.slice(32, 64);
    const v = sig[64] - 27;
    
    if (v !== 0 && v !== 1) {
        throw new Error('invalid signature');
    }
    
    const pubKey = secp256k1.recoverPubKey(
        msgHash,
        { r: r.toString('hex'), s: s.toString('hex') },
        v
    );
    
    return Buffer.from(pubKey.encode('hex', false), 'hex');
}