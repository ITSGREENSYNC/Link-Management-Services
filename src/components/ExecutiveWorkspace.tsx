import React, { useState } from 'react';
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Database,
  Download,
  FileText,
  Lock,
  RefreshCw,
  Shield,
  Trash2,
  Unlock,
  Upload,
} from 'lucide-react';
import type {
  DispatchAlert,
  EncryptedDocumentRecord,
  GdprAuditEntry,
  GdprConsentState,
  Reservation,
} from '../types/travel';
import { formatCurrency } from '../utils/currency';
import { decryptDocumentContent, encryptDocumentContent } from '../utils/cryptoVault';
import { estimateCacheFootprintBytes } from '../utils/offlineCache';

export type WorkspaceTab = 'trips' | 'vault' | 'gdpr' | 'offline';

interface ExecutiveWorkspaceProps {
  activeTab: WorkspaceTab;
  onTabChange: (tab: WorkspaceTab) => void;
  isOnline: boolean;
  simulatedOffline: boolean;
  onToggleSimulatedOffline: () => void;
  lastSyncedAt: string;
  onSyncCache: () => void;
  reservations: Reservation[];
  alerts: DispatchAlert[];
  onTriggerAlert: (kind: 'delay' | 'arrived' | 'reroute') => void;
  onMarkAllAlertsRead: () => void;
  notificationPermission: NotificationPermission | 'unsupported';
  onRequestNotificationPermission: () => void;
  vaultDocs: EncryptedDocumentRecord[];
  onAddEncryptedDoc: (doc: EncryptedDocumentRecord) => void;
  onDeleteEncryptedDoc: (id: string) => void;
  gdprConsent: GdprConsentState;
  gdprAudit: GdprAuditEntry[];
  onToggleGdprConsent: (
    key: Exclude<keyof GdprConsentState, 'essentialOperations' | 'updatedAt' | 'policyVersion'>,
    value: boolean
  ) => void;
  onExportGdprData: () => void;
  onEraseAllGdprData: () => void;
}

const WORKSPACE_TABS: Array<{ id: WorkspaceTab; label: string }> = [
  { id: 'trips', label: 'Trips & Push Alerts' },
  { id: 'vault', label: 'Encrypted Document Vault' },
  { id: 'gdpr', label: 'GDPR Privacy Center' },
  { id: 'offline', label: 'Offline Cache & Sync' },
];

export const ExecutiveWorkspace: React.FC<ExecutiveWorkspaceProps> = ({
  activeTab,
  onTabChange,
  isOnline,
  simulatedOffline,
  onToggleSimulatedOffline,
  lastSyncedAt,
  onSyncCache,
  reservations,
  alerts,
  onTriggerAlert,
  onMarkAllAlertsRead,
  notificationPermission,
  onRequestNotificationPermission,
  vaultDocs,
  onAddEncryptedDoc,
  onDeleteEncryptedDoc,
  gdprConsent,
  gdprAudit,
  onToggleGdprConsent,
  onExportGdprData,
  onEraseAllGdprData,
}) => {
  // Encrypted Vault local interactive state (never persisted as plaintext)
  const [vaultPassphrase, setVaultPassphrase] = useState('');
  const [unlockedPassphrase, setUnlockedPassphrase] = useState<string | null>(null);
  const [decryptedMap, setDecryptedMap] = useState<Record<string, string>>({});
  const [vaultError, setVaultError] = useState<string | null>(null);
  const [vaultStatus, setVaultStatus] = useState<string | null>(null);

  // New Encrypted Document form
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocCategory, setNewDocCategory] = useState<EncryptedDocumentRecord['category']>('FBO Flight Manifest');
  const [newDocContent, setNewDocContent] = useState('');
  const [newDocFileName, setNewDocFileName] = useState('');

  // GDPR Erasure confirmation state
  const [confirmErase, setConfirmErase] = useState(false);
  const [gdprMessage, setGdprMessage] = useState<string | null>(null);

  const unreadAlertCount = alerts.filter((a) => !a.read).length;

  const handleUnlockVault = async (e: React.FormEvent) => {
    e.preventDefault();
    setVaultError(null);
    setVaultStatus(null);
    if (!vaultPassphrase.trim()) {
      setVaultError('Enter a vault passphrase to unlock or initialize encryption.');
      return;
    }

    if (vaultDocs.length === 0) {
      setUnlockedPassphrase(vaultPassphrase);
      setVaultStatus('Vault unlocked with active AES-256-GCM key.');
      return;
    }

    const nextDecrypted: Record<string, string> = {};
    let matchedCount = 0;
    for (const doc of vaultDocs) {
      try {
        const plain = await decryptDocumentContent(doc, vaultPassphrase);
        nextDecrypted[doc.id] = plain;
        matchedCount++;
      } catch {
        // Document encrypted under another passphrase or wrong passphrase
      }
    }

    if (matchedCount === 0) {
      setVaultError(
        'Passphrase did not decrypt existing documents. Try "Executive2026!" for pre-loaded sample dossiers.'
      );
      return;
    }

    setDecryptedMap(nextDecrypted);
    setUnlockedPassphrase(vaultPassphrase);
    setVaultStatus(`Unlocked ${matchedCount} of ${vaultDocs.length} encrypted documents.`);
  };

  const handleLockVault = () => {
    setUnlockedPassphrase(null);
    setDecryptedMap({});
    setVaultPassphrase('');
    setVaultError(null);
    setVaultStatus('Vault locked. Plaintext cleared from memory.');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewDocFileName(file.name);
    if (!newDocTitle) {
      setNewDocTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
    const text = await file.text();
    setNewDocContent(text.slice(0, 8000));
  };

  const handleEncryptAndSaveDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    setVaultError(null);
    setVaultStatus(null);

    const activeKey = unlockedPassphrase || vaultPassphrase;
    if (!activeKey || activeKey.length < 4) {
      setVaultError('Enter or unlock a vault passphrase (min 4 characters) before encrypting.');
      return;
    }
    if (!newDocTitle.trim() || !newDocContent.trim()) {
      setVaultError('Provide both a document title and confidential content (or upload a file).');
      return;
    }

    try {
      const encrypted = await encryptDocumentContent(newDocContent.trim(), activeKey);
      const record: EncryptedDocumentRecord = {
        id: `doc-${Date.now()}`,
        title: newDocTitle.trim(),
        category: newDocCategory,
        fileName: newDocFileName.trim() || `${newDocTitle.trim().toLowerCase().replace(/\s+/g, '_')}.txt`,
        mimeType: 'text/plain',
        sizeBytes: encrypted.sizeBytes,
        createdAt: new Date().toISOString(),
        sha256Digest: encrypted.sha256Digest,
        saltBase64: encrypted.saltBase64,
        ivBase64: encrypted.ivBase64,
        ciphertextBase64: encrypted.ciphertextBase64,
      };
      onAddEncryptedDoc(record);
      setUnlockedPassphrase(activeKey);
      setDecryptedMap((prev) => ({ ...prev, [record.id]: newDocContent.trim() }));
      setNewDocTitle('');
      setNewDocContent('');
      setNewDocFileName('');
      setVaultStatus(`Document "${record.title}" encrypted with AES-256-GCM and cached locally.`);
    } catch (err) {
      setVaultError(err instanceof Error ? err.message : 'Encryption error.');
    }
  };

  return (
    <section
      id="workspace"
      aria-labelledby="workspace-heading"
      className="scroll-mt-20 border-t border-[#E5E2DA] bg-[#F3F1EA]/65 py-14 dark:border-[#1E2330] dark:bg-[#0D1016]"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-wide text-[#9A6F14] dark:text-[#F2D06B]">
              Executive Travel Workspace
            </p>
            <h2
              id="workspace-heading"
              className="mt-1.5 font-display text-3xl font-semibold tracking-tight text-[#111318] text-balance dark:text-[#F5F6F8]"
            >
              Itineraries, Encrypted Vault &amp; GDPR Governance
            </h2>
          </div>

          <p className="font-mono text-xs text-[#4B5563] dark:text-[#9CA3AF]">
            {reservations.length} Cached Trips · {vaultDocs.length} Encrypted Docs · {unreadAlertCount} Unread Alerts
          </p>
        </div>

        {/* Accessible Tablist */}
        <div
          role="tablist"
          aria-label="Executive workspace sections"
          className="mt-6 flex flex-wrap gap-2 border-b border-[#DFDCD2] pb-3 dark:border-[#232938]"
        >
          {WORKSPACE_TABS.map((tab) => {
            const selected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={selected}
                aria-controls={`panel-${tab.id}`}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`min-h-[42px] rounded-lg px-4 py-2 text-sm font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  selected
                    ? 'bg-[#111318] text-[#F5D77F] dark:bg-[#E5BE53] dark:text-[#0B0D12]'
                    : 'bg-white text-[#374151] border border-[#DFDCD2] hover:bg-[#FAF9F6] dark:border-[#252B3B] dark:bg-[#12151C] dark:text-[#CBD5E1] dark:hover:bg-[#1A1F2B]'
                }`}
              >
                {tab.label}
                {tab.id === 'trips' && unreadAlertCount > 0 ? ` (${unreadAlertCount})` : ''}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Trips & Push Dispatch Alerts */}
        {activeTab === 'trips' && (
          <div
            role="tabpanel"
            id="panel-trips"
            aria-labelledby="tab-trips"
            className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12"
          >
            {/* Cached Trips List */}
            <div className="space-y-4 lg:col-span-7">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl font-semibold text-[#111318] dark:text-[#F5F6F8]">
                  Cached Executive Itineraries
                </h3>
                <span className="text-xs text-[#4B5563] dark:text-[#9CA3AF]">
                  Available offline across sessions
                </span>
              </div>

              {reservations.length === 0 ? (
                <div className="rounded-xl border border-[#DFDCD2] bg-white p-8 text-center dark:border-[#232938] dark:bg-[#12151C]">
                  <p className="text-sm font-medium text-[#111318] dark:text-[#F5F6F8]">
                    No active itineraries cached on this device.
                  </p>
                  <p className="mt-1 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                    Confirm a transfer above to store it locally for offline review.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reservations.map((res) => (
                    <article
                      key={res.id}
                      data-testid="reservation-card"
                      className="rounded-xl border border-[#DFDCD2] bg-white p-5 dark:border-[#232938] dark:bg-[#12151C]"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#4B5563] dark:text-[#9CA3AF]">
                        <span className="font-mono font-semibold text-[#111318] dark:text-[#F2D06B]">
                          {res.referenceCode} · {res.flightNumber}
                        </span>
                        <span className="inline-flex items-center gap-1.5 font-semibold text-[#111318] dark:text-[#E5E7EB]">
                          {res.status.includes('Delayed') ? (
                            <AlertTriangle className="h-3.5 w-3.5 text-[#D97706]" aria-hidden="true" />
                          ) : (
                            <CheckCircle2 className="h-3.5 w-3.5 text-[#15803D] dark:text-[#4ADE80]" aria-hidden="true" />
                          )}
                          <span>{res.status}</span>
                        </span>
                      </div>

                      <h4 className="mt-2 font-display text-lg font-semibold text-[#111318] dark:text-[#F5F6F8]">
                        {res.pickup} → {res.dropoff}
                      </h4>

                      <p className="mt-1.5 text-sm text-[#4B5563] dark:text-[#CBD5E1]">
                        {res.vehicleName} · Chauffeur: {res.chauffeurName} · Lead: {res.passengerName}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#ECE9E0] pt-3 text-xs dark:border-[#232938]">
                        <span className="font-mono text-[#4B5563] dark:text-[#9CA3AF]">
                          Departure: {res.pickupDateTime.replace('T', ' ')} · {res.passengers} Pax
                        </span>
                        <span className="font-mono text-sm font-semibold tabular-nums text-[#111318] dark:text-[#F2D06B]">
                          {formatCurrency(res.totalInCurrency, res.currency)} ({res.currency})
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

            {/* Push Notification Dispatch Center */}
            <div className="space-y-4 lg:col-span-5">
              <div className="rounded-xl border border-[#DFDCD2] bg-white p-6 dark:border-[#232938] dark:bg-[#12151C]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-lg font-semibold text-[#111318] dark:text-[#F5F6F8]">
                      Push Dispatch &amp; Delay Alerts
                    </h3>
                    <p className="mt-1 text-xs text-[#4B5563] dark:text-[#9CA3AF]">
                      Browser Push:{' '}
                      <span className="font-mono font-semibold">
                        {notificationPermission === 'granted'
                          ? 'Active'
                          : notificationPermission === 'denied'
                          ? 'Blocked (In-App Live Alerts Active)'
                          : notificationPermission === 'unsupported'
                          ? 'In-App Live Alerts Active'
                          : 'Ready to Enable'}
                      </span>
                    </p>
                  </div>
                  <Bell className="h-5 w-5 text-[#9A6F14] dark:text-[#F2D06B]" aria-hidden="true" />
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {notificationPermission !== 'granted' && notificationPermission !== 'unsupported' && (
                    <button
                      type="button"
                      onClick={onRequestNotificationPermission}
                      className="min-h-[40px] rounded-lg bg-[#111318] px-3.5 py-2 text-xs font-semibold text-[#F5D77F] hover:bg-[#1F2430] dark:bg-[#E5BE53] dark:text-[#0B0D12]"
                    >
                      Enable Browser Push Notifications
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onTriggerAlert('delay')}
                    className="min-h-[40px] rounded-lg border border-[#D6D3CB] px-3.5 py-2 text-xs font-semibold text-[#111318] hover:bg-[#F3F1EA] dark:border-[#2A3040] dark:text-[#F5F6F8] dark:hover:bg-[#1B202C]"
                  >
                    Simulate Flight Delay (+35m)
                  </button>
                  <button
                    type="button"
                    onClick={() => onTriggerAlert('arrived')}
                    className="min-h-[40px] rounded-lg border border-[#D6D3CB] px-3.5 py-2 text-xs font-semibold text-[#111318] hover:bg-[#F3F1EA] dark:border-[#2A3040] dark:text-[#F5F6F8] dark:hover:bg-[#1B202C]"
                  >
                    Simulate Chauffeur Arrival
                  </button>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-[#ECE9E0] pt-4 dark:border-[#232938]">
                  <span className="text-xs font-semibold text-[#374151] dark:text-[#CBD5E1]">
                    Recent Dispatch Feed
                  </span>
                  {unreadAlertCount > 0 && (
                    <button
                      type="button"
                      onClick={onMarkAllAlertsRead}
                      className="text-xs font-medium text-[#9A6F14] hover:underline dark:text-[#F2D06B]"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div aria-live="polite" className="mt-3 space-y-3">
                  {alerts.length === 0 ? (
                    <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                      No dispatch alerts recorded.
                    </p>
                  ) : (
                    alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className="rounded-lg border border-[#E5E2DA] bg-[#FAF9F6] p-3.5 dark:border-[#232938] dark:bg-[#0B0D12]"
                      >
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className="font-mono font-semibold text-[#9A6F14] dark:text-[#F2D06B]">
                            {alert.reservationRef} · {alert.severity.toUpperCase()}
                          </span>
                          <span className="font-mono text-[#6B7280] dark:text-[#9CA3AF]">
                            {alert.read ? 'Read' : 'New'}
                          </span>
                        </div>
                        <p className="mt-1 text-sm font-semibold text-[#111318] dark:text-[#F5F6F8]">
                          {alert.title}
                        </p>
                        <p className="mt-0.5 text-xs leading-relaxed text-[#4B5563] dark:text-[#CBD5E1]">
                          {alert.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: AES-256-GCM Encrypted Document Vault */}
        {activeTab === 'vault' && (
          <div
            role="tabpanel"
            id="panel-vault"
            aria-labelledby="tab-vault"
            className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12"
          >
            <div className="space-y-6 lg:col-span-5">
              <div className="rounded-xl border border-[#DFDCD2] bg-white p-6 dark:border-[#232938] dark:bg-[#12151C]">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-semibold text-[#111318] dark:text-[#F5F6F8]">
                    AES-256-GCM Key Control
                  </h3>
                  {unlockedPassphrase ? (
                    <Unlock className="h-5 w-5 text-[#15803D] dark:text-[#4ADE80]" aria-hidden="true" />
                  ) : (
                    <Lock className="h-5 w-5 text-[#9A6F14] dark:text-[#F2D06B]" aria-hidden="true" />
                  )}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-[#4B5563] dark:text-[#9CA3AF]">
                  Documents are encrypted client-side with Web Crypto PBKDF2-SHA256 (100,000 rounds)
                  and AES-256-GCM before local caching. Demo dossiers use passphrase{' '}
                  <code className="font-mono font-semibold text-[#111318] dark:text-[#F2D06B]">
                    Executive2026!
                  </code>
                </p>

                <form onSubmit={handleUnlockVault} className="mt-4 space-y-3">
                  <div>
                    <label
                      htmlFor="vault-passphrase"
                      className="block text-xs font-medium text-[#374151] dark:text-[#CBD5E1]"
                    >
                      Vault Passphrase
                    </label>
                    <input
                      id="vault-passphrase"
                      type="password"
                      value={vaultPassphrase}
                      onChange={(e) => setVaultPassphrase(e.target.value)}
                      placeholder="Enter passphrase (e.g., Executive2026!)"
                      className="mt-1 min-h-[44px] w-full rounded-lg border border-[#D6D3CB] bg-[#FAF9F6] px-3.5 py-2 text-sm text-[#111318] dark:border-[#2C3344] dark:bg-[#0B0D12] dark:text-[#F5F6F8]"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="submit"
                      className="min-h-[42px] rounded-lg bg-[#111318] px-4 py-2 text-xs font-semibold text-[#F5D77F] hover:bg-[#1F2430] dark:bg-[#E5BE53] dark:text-[#0B0D12]"
                    >
                      Unlock Vault
                    </button>
                    {unlockedPassphrase && (
                      <button
                        type="button"
                        onClick={handleLockVault}
                        className="min-h-[42px] rounded-lg border border-[#D6D3CB] px-4 py-2 text-xs font-semibold text-[#111318] hover:bg-[#F3F1EA] dark:border-[#2A3040] dark:text-[#F5F6F8] dark:hover:bg-[#1B202C]"
                      >
                        Lock Vault
                      </button>
                    )}
                  </div>
                </form>

                {vaultError && (
                  <p role="alert" className="mt-3 text-xs font-medium text-[#B91C1C] dark:text-[#FCA5A5]">
                    {vaultError}
                  </p>
                )}
                {vaultStatus && (
                  <p role="status" className="mt-3 text-xs font-medium text-[#15803D] dark:text-[#86EFAC]">
                    {vaultStatus}
                  </p>
                )}
              </div>

              {/* Encrypt & Add Document Form */}
              <form
                onSubmit={handleEncryptAndSaveDoc}
                className="rounded-xl border border-[#DFDCD2] bg-white p-6 space-y-4 dark:border-[#232938] dark:bg-[#12151C]"
              >
                <h3 className="font-display text-lg font-semibold text-[#111318] dark:text-[#F5F6F8]">
                  Encrypt &amp; Store Corporate Document
                </h3>

                <div>
                  <label
                    htmlFor="new-doc-title"
                    className="block text-xs font-medium text-[#374151] dark:text-[#CBD5E1]"
                  >
                    Document Title
                  </label>
                  <input
                    id="new-doc-title"
                    type="text"
                    value={newDocTitle}
                    onChange={(e) => setNewDocTitle(e.target.value)}
                    placeholder="e.g., Davos Summit Diplomatic Credentials"
                    className="mt-1 min-h-[44px] w-full rounded-lg border border-[#D6D3CB] bg-[#FAF9F6] px-3.5 py-2 text-sm text-[#111318] dark:border-[#2C3344] dark:bg-[#0B0D12] dark:text-[#F5F6F8]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="new-doc-category"
                    className="block text-xs font-medium text-[#374151] dark:text-[#CBD5E1]"
                  >
                    Classification
                  </label>
                  <select
                    id="new-doc-category"
                    value={newDocCategory}
                    onChange={(e) =>
                      setNewDocCategory(e.target.value as EncryptedDocumentRecord['category'])
                    }
                    className="mt-1 min-h-[44px] w-full rounded-lg border border-[#D6D3CB] bg-[#FAF9F6] px-3.5 py-2 text-sm text-[#111318] dark:border-[#2C3344] dark:bg-[#0B0D12] dark:text-[#F5F6F8]"
                  >
                    <option value="FBO Flight Manifest">FBO Flight Manifest</option>
                    <option value="Passport & Visa">Passport &amp; Visa</option>
                    <option value="Corporate NDA / SLA">Corporate NDA / SLA</option>
                    <option value="Expense Invoice">Expense Invoice</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="new-doc-file"
                    className="inline-flex min-h-[40px] cursor-pointer items-center gap-2 rounded-lg border border-[#D6D3CB] px-3.5 py-2 text-xs font-semibold text-[#111318] hover:bg-[#F3F1EA] dark:border-[#2A3040] dark:text-[#F5F6F8] dark:hover:bg-[#1B202C]"
                  >
                    <Upload className="h-4 w-4" aria-hidden="true" />
                    <span>Upload Local Text/Manifest File</span>
                  </label>
                  <input
                    id="new-doc-file"
                    type="file"
                    accept=".txt,.json,.csv,.md"
                    onChange={handleFileUpload}
                    className="sr-only"
                  />
                  {newDocFileName && (
                    <span className="ml-2 font-mono text-xs text-[#4B5563] dark:text-[#9CA3AF]">
                      {newDocFileName}
                    </span>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="new-doc-content"
                    className="block text-xs font-medium text-[#374151] dark:text-[#CBD5E1]"
                  >
                    Confidential Payload (Encrypted Before Storage)
                  </label>
                  <textarea
                    id="new-doc-content"
                    rows={3}
                    value={newDocContent}
                    onChange={(e) => setNewDocContent(e.target.value)}
                    placeholder="Passport numbers, tarmac gate codes, or board briefing notes..."
                    className="mt-1 w-full rounded-lg border border-[#D6D3CB] bg-[#FAF9F6] px-3.5 py-2 text-sm text-[#111318] dark:border-[#2C3344] dark:bg-[#0B0D12] dark:text-[#F5F6F8]"
                  />
                </div>

                <button
                  type="submit"
                  className="min-h-[44px] w-full rounded-lg bg-[#111318] px-4 py-2.5 text-sm font-semibold text-[#F5D77F] hover:bg-[#1F2430] dark:bg-[#E5BE53] dark:text-[#0B0D12]"
                >
                  Encrypt &amp; Store in Vault
                </button>
              </form>
            </div>

            {/* Stored Encrypted Documents */}
            <div className="space-y-4 lg:col-span-7">
              <h3 className="font-display text-xl font-semibold text-[#111318] dark:text-[#F5F6F8]">
                Encrypted Local Storage ({vaultDocs.length})
              </h3>

              {vaultDocs.length === 0 ? (
                <div className="rounded-xl border border-[#DFDCD2] bg-white p-8 text-center dark:border-[#232938] dark:bg-[#12151C]">
                  <p className="text-sm font-medium text-[#111318] dark:text-[#F5F6F8]">
                    Vault is empty.
                  </p>
                  <p className="mt-1 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                    Add a confidential travel manifest or invoice to encrypt it with AES-256-GCM.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {vaultDocs.map((doc) => {
                    const decrypted = decryptedMap[doc.id];
                    return (
                      <article
                        key={doc.id}
                        data-testid="vault-doc-card"
                        className="rounded-xl border border-[#DFDCD2] bg-white p-5 dark:border-[#232938] dark:bg-[#12151C]"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <FileText
                              className="mt-0.5 h-5 w-5 shrink-0 text-[#9A6F14] dark:text-[#F2D06B]"
                              aria-hidden="true"
                            />
                            <div>
                              <h4 className="font-display text-base font-semibold text-[#111318] dark:text-[#F5F6F8]">
                                {doc.title}
                              </h4>
                              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                                {doc.category} · {doc.fileName} · {doc.sizeBytes} bytes
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => onDeleteEncryptedDoc(doc.id)}
                            aria-label={`Delete encrypted document ${doc.title}`}
                            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-md border border-[#E5E2DA] px-2.5 py-1 text-xs font-medium text-[#B91C1C] hover:bg-[#FEE2E2]/40 dark:border-[#2A3040] dark:text-[#FCA5A5] dark:hover:bg-[#7F1D1D]/20"
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Purge</span>
                          </button>
                        </div>

                        <div className="mt-3 rounded-lg border border-[#ECE9E0] bg-[#FAF9F6] p-3 font-mono text-xs dark:border-[#232938] dark:bg-[#0B0D12]">
                          <p className="truncate text-[#6B7280] dark:text-[#9CA3AF]">
                            SHA-256: {doc.sha256Digest}
                          </p>
                          <p className="mt-0.5 truncate text-[#6B7280] dark:text-[#9CA3AF]">
                            IV: {doc.ivBase64} · Cipher: {doc.ciphertextBase64.slice(0, 36)}…
                          </p>
                        </div>

                        {decrypted ? (
                          <div className="mt-3 rounded-lg border border-[#15803D]/30 bg-[#15803D]/5 p-3.5 dark:border-[#4ADE80]/30 dark:bg-[#14532D]/20">
                            <p className="text-xs font-semibold text-[#15803D] dark:text-[#86EFAC]">
                              Decrypted Content (Memory Only)
                            </p>
                            <pre className="mt-1.5 whitespace-pre-wrap font-mono text-xs leading-relaxed text-[#111318] dark:text-[#F5F6F8]">
                              {decrypted}
                            </pre>
                          </div>
                        ) : (
                          <p className="mt-3 text-xs font-medium text-[#9A6F14] dark:text-[#F2D06B]">
                            Locked — Enter passphrase on the left to decrypt plaintext.
                          </p>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: GDPR Compliance Center */}
        {activeTab === 'gdpr' && (
          <div
            role="tabpanel"
            id="panel-gdpr"
            aria-labelledby="tab-gdpr"
            className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12"
          >
            <div className="space-y-6 lg:col-span-7">
              <div className="rounded-xl border border-[#DFDCD2] bg-white p-6 dark:border-[#232938] dark:bg-[#12151C]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-display text-xl font-semibold text-[#111318] dark:text-[#F5F6F8]">
                      GDPR Granular Consent &amp; Data Protection
                    </h3>
                    <p className="mt-1 text-xs text-[#4B5563] dark:text-[#9CA3AF]">
                      Policy {gdprConsent.policyVersion} · Data Controller: Link Management Services
                      Ltd. (dpo@linkmanagement.com)
                    </p>
                  </div>
                  <Shield className="h-5 w-5 text-[#9A6F14] dark:text-[#F2D06B]" aria-hidden="true" />
                </div>

                <div className="mt-5 divide-y divide-[#ECE9E0] dark:divide-[#232938]">
                  <div className="flex items-center justify-between gap-4 py-3.5">
                    <div>
                      <p className="text-sm font-semibold text-[#111318] dark:text-[#F5F6F8]">
                        Essential Chauffeur Dispatch &amp; Billing (Article 6(1)(b))
                      </p>
                      <p className="text-xs text-[#4B5563] dark:text-[#9CA3AF]">
                        Required to fulfill confirmed reservations and multi-currency tax invoicing.
                      </p>
                    </div>
                    <span className="font-mono text-xs font-semibold text-[#15803D] dark:text-[#4ADE80]">
                      Always Active
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 py-3.5">
                    <div>
                      <label
                        htmlFor="consent-flight"
                        className="text-sm font-semibold text-[#111318] dark:text-[#F5F6F8]"
                      >
                        Real-Time Flight &amp; GPS Telemetry (Article 6(1)(a))
                      </label>
                      <p className="text-xs text-[#4B5563] dark:text-[#9CA3AF]">
                        Adjusts chauffeur staging automatically on commercial or FBO tail delays.
                      </p>
                    </div>
                    <input
                      id="consent-flight"
                      type="checkbox"
                      checked={gdprConsent.flightTelemetry}
                      onChange={(e) => onToggleGdprConsent('flightTelemetry', e.target.checked)}
                      className="h-5 w-5 shrink-0 accent-[#111318] dark:accent-[#E5BE53]"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-4 py-3.5">
                    <div>
                      <label
                        htmlFor="consent-push"
                        className="text-sm font-semibold text-[#111318] dark:text-[#F5F6F8]"
                      >
                        Push Dispatch &amp; Delay Notifications
                      </label>
                      <p className="text-xs text-[#4B5563] dark:text-[#9CA3AF]">
                        Sends instant gate change and chauffeur arrival alerts to your device.
                      </p>
                    </div>
                    <input
                      id="consent-push"
                      type="checkbox"
                      checked={gdprConsent.pushDispatchAlerts}
                      onChange={(e) => onToggleGdprConsent('pushDispatchAlerts', e.target.checked)}
                      className="h-5 w-5 shrink-0 accent-[#111318] dark:accent-[#E5BE53]"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-4 py-3.5">
                    <div>
                      <label
                        htmlFor="consent-cache"
                        className="text-sm font-semibold text-[#111318] dark:text-[#F5F6F8]"
                      >
                        Offline Local Itinerary Caching
                      </label>
                      <p className="text-xs text-[#4B5563] dark:text-[#9CA3AF]">
                        Persists reservations and encrypted vault blobs in IndexedDB for zero-signal travel.
                      </p>
                    </div>
                    <input
                      id="consent-cache"
                      type="checkbox"
                      checked={gdprConsent.offlineLocalCache}
                      onChange={(e) => onToggleGdprConsent('offlineLocalCache', e.target.checked)}
                      className="h-5 w-5 shrink-0 accent-[#111318] dark:accent-[#E5BE53]"
                    />
                  </div>
                </div>

                {/* Article 15/20 Portability & Article 17 Right to Erasure */}
                <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-[#ECE9E0] pt-5 dark:border-[#232938]">
                  <button
                    type="button"
                    onClick={() => {
                      onExportGdprData();
                      setGdprMessage('Article 15/20 JSON data archive downloaded.');
                    }}
                    className="inline-flex min-h-[42px] items-center gap-2 rounded-lg bg-[#111318] px-4 py-2 text-xs font-semibold text-[#F5D77F] hover:bg-[#1F2430] dark:bg-[#E5BE53] dark:text-[#0B0D12]"
                  >
                    <Download className="h-4 w-4" aria-hidden="true" />
                    <span>Export Personal Data (Art. 15/20)</span>
                  </button>

                  {!confirmErase ? (
                    <button
                      type="button"
                      onClick={() => setConfirmErase(true)}
                      className="inline-flex min-h-[42px] items-center gap-2 rounded-lg border border-[#B91C1C]/50 px-4 py-2 text-xs font-semibold text-[#B91C1C] hover:bg-[#FEE2E2]/40 dark:border-[#FCA5A5]/40 dark:text-[#FCA5A5] dark:hover:bg-[#7F1D1D]/20"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                      <span>Right to Erasure (Art. 17)</span>
                    </button>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onEraseAllGdprData();
                          setConfirmErase(false);
                          setUnlockedPassphrase(null);
                          setDecryptedMap({});
                          setGdprMessage('All local personal data, bookings, and encrypted vault blobs erased.');
                        }}
                        className="min-h-[42px] rounded-lg bg-[#B91C1C] px-4 py-2 text-xs font-semibold text-white hover:bg-[#991B1B]"
                      >
                        Confirm Permanent Erasure
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmErase(false)}
                        className="min-h-[42px] rounded-lg border border-[#D6D3CB] px-3 py-2 text-xs font-medium text-[#111318] dark:border-[#2A3040] dark:text-[#F5F6F8]"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                {gdprMessage && (
                  <p role="status" className="mt-3 text-xs font-medium text-[#15803D] dark:text-[#86EFAC]">
                    {gdprMessage}
                  </p>
                )}
              </div>
            </div>

            {/* Consent Audit Trail */}
            <div className="rounded-xl border border-[#DFDCD2] bg-white p-6 lg:col-span-5 dark:border-[#232938] dark:bg-[#12151C]">
              <h3 className="font-display text-lg font-semibold text-[#111318] dark:text-[#F5F6F8]">
                GDPR Consent Audit Log
              </h3>
              <p className="mt-1 text-xs text-[#4B5563] dark:text-[#9CA3AF]">
                Timestamped record of privacy preference changes under EU/UK GDPR Article 7(1).
              </p>

              <div className="mt-4 space-y-3">
                {gdprAudit.length === 0 ? (
                  <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                    Default privacy baseline active. Toggle any preference to record an audit event.
                  </p>
                ) : (
                  gdprAudit.slice(0, 6).map((entry) => (
                    <div
                      key={entry.id}
                      className="rounded-lg border border-[#ECE9E0] bg-[#FAF9F6] p-3 text-xs dark:border-[#232938] dark:bg-[#0B0D12]"
                    >
                      <div className="flex items-center justify-between font-semibold text-[#111318] dark:text-[#F2D06B]">
                        <span>{entry.action}</span>
                        <span className="font-mono font-normal text-[#6B7280] dark:text-[#9CA3AF]">
                          {entry.timestamp.slice(0, 19).replace('T', ' ')}
                        </span>
                      </div>
                      <p className="mt-1 text-[#4B5563] dark:text-[#CBD5E1]">{entry.detail}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Offline Cache & PWA Sync */}
        {activeTab === 'offline' && (
          <div
            role="tabpanel"
            id="panel-offline"
            aria-labelledby="tab-offline"
            className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3"
          >
            <div className="rounded-xl border border-[#DFDCD2] bg-white p-6 dark:border-[#232938] dark:bg-[#12151C]">
              <Database className="h-5 w-5 text-[#9A6F14] dark:text-[#F2D06B]" aria-hidden="true" />
              <h3 className="mt-3 font-display text-lg font-semibold text-[#111318] dark:text-[#F5F6F8]">
                Local Cache Footprint
              </h3>
              <p className="mt-2 font-mono text-2xl font-bold tabular-nums text-[#111318] dark:text-[#F2D06B]">
                {(estimateCacheFootprintBytes() / 1024).toFixed(1)} KB
              </p>
              <p className="mt-1 text-xs text-[#4B5563] dark:text-[#9CA3AF]">
                IndexedDB + localStorage mirror active across browser restarts.
              </p>
            </div>

            <div className="rounded-xl border border-[#DFDCD2] bg-white p-6 dark:border-[#232938] dark:bg-[#12151C]">
              <RefreshCw className="h-5 w-5 text-[#9A6F14] dark:text-[#F2D06B]" aria-hidden="true" />
              <h3 className="mt-3 font-display text-lg font-semibold text-[#111318] dark:text-[#F5F6F8]">
                Network &amp; Service Worker
              </h3>
              <p className="mt-2 text-sm font-semibold text-[#111318] dark:text-[#F5F6F8]">
                {isOnline ? 'Connected — Live Sync Ready' : 'Disconnected — Serving Cached App Shell'}
              </p>
              <p className="mt-1 font-mono text-xs text-[#4B5563] dark:text-[#9CA3AF]">
                Last Sync: {lastSyncedAt.slice(0, 19).replace('T', ' ')} UTC
              </p>
            </div>

            <div className="flex flex-col justify-between rounded-xl border border-[#DFDCD2] bg-white p-6 dark:border-[#232938] dark:bg-[#12151C]">
              <div>
                <h3 className="font-display text-lg font-semibold text-[#111318] dark:text-[#F5F6F8]">
                  Low-Connectivity Controls
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-[#4B5563] dark:text-[#9CA3AF]">
                  Verify uninterrupted itinerary and encrypted vault access in tunnels, alpine passes,
                  or inflight Wi-Fi drops.
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={onSyncCache}
                  className="min-h-[40px] rounded-lg bg-[#111318] px-4 py-2 text-xs font-semibold text-[#F5D77F] dark:bg-[#E5BE53] dark:text-[#0B0D12]"
                >
                  Sync &amp; Snapshot Now
                </button>
                <button
                  type="button"
                  onClick={onToggleSimulatedOffline}
                  className="min-h-[40px] rounded-lg border border-[#D6D3CB] px-4 py-2 text-xs font-semibold text-[#111318] dark:border-[#2A3040] dark:text-[#F5F6F8]"
                >
                  {simulatedOffline ? 'Restore Online Mode' : 'Simulate Offline'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
