function getSubtleCrypto(): SubtleCrypto {
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.subtle) {
    return globalThis.crypto.subtle;
  }
  throw new Error('Web Crypto SubtleCrypto API is unavailable in this environment.');
}

function getRandomBytes(length: number): Uint8Array {
  const arr = new Uint8Array(length);
  globalThis.crypto.getRandomValues(arr);
  return arr;
}

export function uint8ToBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64');
  }
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToUint8(base64: string): Uint8Array {
  if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(base64, 'base64'));
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

export async function computeSha256Hex(plaintext: string): Promise<string> {
  const subtle = getSubtleCrypto();
  const encoded = new TextEncoder().encode(plaintext);
  const digest = await subtle.digest('SHA-256', toArrayBuffer(encoded));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function deriveAesKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const subtle = getSubtleCrypto();
  const keyMaterial = await subtle.importKey(
    'raw',
    toArrayBuffer(new TextEncoder().encode(passphrase)),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: toArrayBuffer(salt),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export interface EncryptedPayload {
  saltBase64: string;
  ivBase64: string;
  ciphertextBase64: string;
  sha256Digest: string;
  sizeBytes: number;
}

export async function encryptDocumentContent(
  plaintext: string,
  passphrase: string
): Promise<EncryptedPayload> {
  if (!passphrase || passphrase.length < 4) {
    throw new Error('Vault passphrase must be at least 4 characters.');
  }
  const subtle = getSubtleCrypto();
  const salt = getRandomBytes(16);
  const iv = getRandomBytes(12);
  const key = await deriveAesKey(passphrase, salt);
  const encoded = new TextEncoder().encode(plaintext);

  const encryptedBuffer = await subtle.encrypt(
    { name: 'AES-GCM', iv: toArrayBuffer(iv) },
    key,
    toArrayBuffer(encoded)
  );

  const sha256Digest = await computeSha256Hex(plaintext);

  return {
    saltBase64: uint8ToBase64(salt),
    ivBase64: uint8ToBase64(iv),
    ciphertextBase64: uint8ToBase64(new Uint8Array(encryptedBuffer)),
    sha256Digest,
    sizeBytes: encoded.byteLength,
  };
}

export async function decryptDocumentContent(
  payload: Pick<EncryptedPayload, 'saltBase64' | 'ivBase64' | 'ciphertextBase64'>,
  passphrase: string
): Promise<string> {
  if (!passphrase) {
    throw new Error('Passphrase is required to unlock encrypted document.');
  }
  const subtle = getSubtleCrypto();
  const salt = base64ToUint8(payload.saltBase64);
  const iv = base64ToUint8(payload.ivBase64);
  const ciphertext = base64ToUint8(payload.ciphertextBase64);

  const key = await deriveAesKey(passphrase, salt);
  try {
    const decryptedBuffer = await subtle.decrypt(
      { name: 'AES-GCM', iv: toArrayBuffer(iv) },
      key,
      toArrayBuffer(ciphertext)
    );
    return new TextDecoder().decode(decryptedBuffer);
  } catch {
    throw new Error('Decryption failed: invalid passphrase or tampered ciphertext.');
  }
}
