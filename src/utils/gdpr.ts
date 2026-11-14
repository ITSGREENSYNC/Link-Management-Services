import type {
  DispatchAlert,
  EncryptedDocumentRecord,
  GdprAuditEntry,
  GdprConsentState,
  Reservation,
} from '../types/travel';

export const DEFAULT_GDPR_CONSENT: GdprConsentState = {
  essentialOperations: true,
  flightTelemetry: true,
  pushDispatchAlerts: true,
  offlineLocalCache: true,
  updatedAt: '2026-11-14T00:00:00.000Z',
  policyVersion: 'GDPR-2026.2',
};

export function updateConsentPreference(
  current: GdprConsentState,
  key: Exclude<keyof GdprConsentState, 'essentialOperations' | 'updatedAt' | 'policyVersion'>,
  value: boolean,
  nowIso: string = new Date().toISOString()
): { nextConsent: GdprConsentState; auditEntry: GdprAuditEntry } {
  const nextConsent: GdprConsentState = {
    ...current,
    [key]: value,
    essentialOperations: true,
    updatedAt: nowIso,
  };

  const labelMap: Record<typeof key, string> = {
    flightTelemetry: 'Real-Time Flight & GPS Telemetry',
    pushDispatchAlerts: 'Push Dispatch & Delay Notifications',
    offlineLocalCache: 'Encrypted Offline Local Caching',
  };

  const auditEntry: GdprAuditEntry = {
    id: `gdpr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    action: value ? 'Consent Granted' : 'Consent Withdrawn',
    detail: `${labelMap[key]} set to ${value ? 'Enabled' : 'Disabled'} under ${current.policyVersion}`,
    timestamp: nowIso,
  };

  return { nextConsent, auditEntry };
}

export interface GdprDataExportPackage {
  exportedAt: string;
  controller: {
    organization: string;
    dpoEmail: string;
    lawfulBasis: string;
    regulation: string;
  };
  consentState: GdprConsentState;
  consentAuditTrail: GdprAuditEntry[];
  reservations: Reservation[];
  dispatchAlerts: DispatchAlert[];
  encryptedVaultMetadata: Array<{
    id: string;
    title: string;
    category: string;
    fileName: string;
    sha256Digest: string;
    createdAt: string;
    encryptionStandard: string;
  }>;
}

export function buildGdprExportPackage(params: {
  consentState: GdprConsentState;
  auditTrail: GdprAuditEntry[];
  reservations: Reservation[];
  alerts: DispatchAlert[];
  vaultDocs: EncryptedDocumentRecord[];
  nowIso?: string;
}): GdprDataExportPackage {
  return {
    exportedAt: params.nowIso ?? new Date().toISOString(),
    controller: {
      organization: 'Link Management Services Ltd.',
      dpoEmail: 'dpo@linkmanagement.com',
      lawfulBasis: 'Article 6(1)(b) Contract Performance & Article 6(1)(a) Explicit Consent',
      regulation: 'EU/UK GDPR (Articles 15, 17, 20, 32)',
    },
    consentState: params.consentState,
    consentAuditTrail: params.auditTrail,
    reservations: params.reservations,
    dispatchAlerts: params.alerts,
    encryptedVaultMetadata: params.vaultDocs.map((doc) => ({
      id: doc.id,
      title: doc.title,
      category: doc.category,
      fileName: doc.fileName,
      sha256Digest: doc.sha256Digest,
      createdAt: doc.createdAt,
      encryptionStandard: 'AES-256-GCM (PBKDF2-SHA256, 100k rounds)',
    })),
  };
}
