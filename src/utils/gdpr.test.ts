import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildGdprExportPackage,
  DEFAULT_GDPR_CONSENT,
  updateConsentPreference,
} from './gdpr';

test('GDPR consent update preserves essentialOperations and records audit trail', () => {
  const { nextConsent, auditEntry } = updateConsentPreference(
    DEFAULT_GDPR_CONSENT,
    'flightTelemetry',
    false,
    '2026-11-14T10:00:00.000Z'
  );
  assert.equal(nextConsent.essentialOperations, true);
  assert.equal(nextConsent.flightTelemetry, false);
  assert.equal(nextConsent.updatedAt, '2026-11-14T10:00:00.000Z');
  assert.equal(auditEntry.action, 'Consent Withdrawn');
  assert.match(auditEntry.detail, /Real-Time Flight & GPS Telemetry/);
});

test('GDPR Article 15/20 export package omits raw ciphertext and exposes metadata', () => {
  const pkg = buildGdprExportPackage({
    consentState: DEFAULT_GDPR_CONSENT,
    auditTrail: [],
    reservations: [],
    alerts: [],
    vaultDocs: [
      {
        id: 'doc-1',
        title: 'Diplomatic Passport Scan',
        category: 'Passport & Visa',
        fileName: 'passport_dossier.txt',
        mimeType: 'text/plain',
        sizeBytes: 120,
        createdAt: '2026-11-14T08:00:00.000Z',
        sha256Digest: 'abc123',
        saltBase64: 'secret-salt',
        ivBase64: 'secret-iv',
        ciphertextBase64: 'secret-cipher',
      },
    ],
    nowIso: '2026-11-14T12:00:00.000Z',
  });

  assert.equal(pkg.exportedAt, '2026-11-14T12:00:00.000Z');
  assert.equal(pkg.controller.dpoEmail, 'dpo@linkmanagement.com');
  assert.equal(pkg.encryptedVaultMetadata.length, 1);
  assert.equal(pkg.encryptedVaultMetadata[0].sha256Digest, 'abc123');
  assert.equal('ciphertextBase64' in pkg.encryptedVaultMetadata[0], false);
});
