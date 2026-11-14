import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeSha256Hex,
  decryptDocumentContent,
  encryptDocumentContent,
} from './cryptoVault';

test('AES-256-GCM encryption and decryption roundtrips with valid passphrase', async () => {
  const secretText = 'Flight N718GA FBO Manifest: Zurich ZRH -> Denver APA, PAX: 3 VIPs.';
  const passphrase = 'exec-vault-key-2026';

  const encrypted = await encryptDocumentContent(secretText, passphrase);
  assert.ok(encrypted.ciphertextBase64.length > 0);
  assert.ok(encrypted.ivBase64.length > 0);
  assert.ok(encrypted.saltBase64.length > 0);
  assert.equal(encrypted.sha256Digest, await computeSha256Hex(secretText));

  const decrypted = await decryptDocumentContent(encrypted, passphrase);
  assert.equal(decrypted, secretText);
});

test('AES-256-GCM rejects decryption with incorrect passphrase', async () => {
  const encrypted = await encryptDocumentContent('Confidential Board Itinerary', 'correct-pass');
  await assert.rejects(
    async () => {
      await decryptDocumentContent(encrypted, 'wrong-pass');
    },
    /Decryption failed/
  );
});
