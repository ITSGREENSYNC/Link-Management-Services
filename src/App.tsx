import { useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { BookingEstimator } from './components/BookingEstimator';
import { AboutAndPillars } from './components/AboutAndPillars';
import { ServicesAndFleet } from './components/ServicesAndFleet';
import { CorridorsSection } from './components/CorridorsSection';
import { ExecutiveWorkspace, type WorkspaceTab } from './components/ExecutiveWorkspace';
import { Footer } from './components/Footer';
import {
  FLEET_VEHICLES,
  SEED_ALERTS,
  SEED_RESERVATIONS,
  SEED_SAMPLE_PLAIN_DOCS,
} from './data/catalog';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import type {
  AccessibilitySettings,
  CorporateCorridor,
  CurrencyCode,
  DispatchAlert,
  EncryptedDocumentRecord,
  GdprAuditEntry,
  GdprConsentState,
  Reservation,
} from './types/travel';
import { encryptDocumentContent } from './utils/cryptoVault';
import {
  buildGdprExportPackage,
  DEFAULT_GDPR_CONSENT,
  updateConsentPreference,
} from './utils/gdpr';
import {
  cacheGetItem,
  cacheSetItem,
  clearAllOfflineCache,
} from './utils/offlineCache';

export default function App() {
  const { isOnline, simulatedOffline, setSimulatedOffline } = useOnlineStatus();

  // Theme (Light vs Nighttime Dark Mode)
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof document === 'undefined') return false;
    return document.documentElement.classList.contains('dark');
  });

  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(FLEET_VEHICLES[0].id);
  const [pickup, setPickup] = useState<string>('Denver International Airport (DEN) — Private FBO');
  const [dropoff, setDropoff] = useState<string>('Four Seasons Resort Vail, CO');
  const [distanceMiles, setDistanceMiles] = useState<number>(120);

  const [reservations, setReservations] = useState<Reservation[]>(SEED_RESERVATIONS);
  const [alerts, setAlerts] = useState<DispatchAlert[]>(SEED_ALERTS);
  const [vaultDocs, setVaultDocs] = useState<EncryptedDocumentRecord[]>([]);
  const [gdprConsent, setGdprConsent] = useState<GdprConsentState>(DEFAULT_GDPR_CONSENT);
  const [gdprAudit, setGdprAudit] = useState<GdprAuditEntry[]>([]);
  const [accessibility, setAccessibility] = useState<AccessibilitySettings>({
    largeText: false,
    highContrast: false,
    reducedMotion: false,
  });

  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>('trips');
  const [lastSyncedAt, setLastSyncedAt] = useState<string>(new Date().toISOString());
  const [hydrated, setHydrated] = useState(false);

  // Live in-app push toast for instant trip updates & delays
  const [activeToast, setActiveToast] = useState<DispatchAlert | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<
    NotificationPermission | 'unsupported'
  >(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
    return Notification.permission;
  });

  // Hydrate cached offline data on mount + seed encrypted vault docs if none exist
  useEffect(() => {
    let active = true;
    async function hydrate() {
      const [
        cachedRes,
        cachedAlerts,
        cachedDocs,
        cachedConsent,
        cachedAudit,
        cachedCurrency,
        cachedA11y,
        cachedSynced,
      ] = await Promise.all([
        cacheGetItem<Reservation[]>('reservations'),
        cacheGetItem<DispatchAlert[]>('alerts'),
        cacheGetItem<EncryptedDocumentRecord[]>('vaultDocs'),
        cacheGetItem<GdprConsentState>('gdprConsent'),
        cacheGetItem<GdprAuditEntry[]>('gdprAudit'),
        cacheGetItem<CurrencyCode>('currency'),
        cacheGetItem<AccessibilitySettings>('accessibility'),
        cacheGetItem<string>('lastSyncedAt'),
      ]);

      if (!active) return;

      if (cachedRes) setReservations(cachedRes);
      if (cachedAlerts) setAlerts(cachedAlerts);
      if (cachedConsent) setGdprConsent(cachedConsent);
      if (cachedAudit) setGdprAudit(cachedAudit);
      if (cachedCurrency) setCurrency(cachedCurrency);
      if (cachedA11y) setAccessibility(cachedA11y);
      if (cachedSynced) setLastSyncedAt(cachedSynced);

      if (cachedDocs) {
        setVaultDocs(cachedDocs);
      } else {
        // Seed 2 real AES-256-GCM encrypted corporate dossiers on first visit
        const seededEncrypted: EncryptedDocumentRecord[] = [];
        for (const item of SEED_SAMPLE_PLAIN_DOCS) {
          const payload = await encryptDocumentContent(item.content, 'Executive2026!');
          seededEncrypted.push({
            id: item.id,
            title: item.title,
            category: item.category,
            fileName: item.fileName,
            mimeType: 'text/plain',
            sizeBytes: payload.sizeBytes,
            createdAt: '2026-11-14T08:00:00.000Z',
            sha256Digest: payload.sha256Digest,
            saltBase64: payload.saltBase64,
            ivBase64: payload.ivBase64,
            ciphertextBase64: payload.ciphertextBase64,
          });
        }
        if (active) {
          setVaultDocs(seededEncrypted);
          await cacheSetItem('vaultDocs', seededEncrypted);
        }
      }

      if (active) setHydrated(true);
    }

    hydrate();
    return () => {
      active = false;
    };
  }, []);

  // Persist changes automatically when offlineLocalCache consent is active
  useEffect(() => {
    if (!hydrated || !gdprConsent.offlineLocalCache) return;
    cacheSetItem('reservations', reservations);
    cacheSetItem('alerts', alerts);
    cacheSetItem('vaultDocs', vaultDocs);
    cacheSetItem('gdprConsent', gdprConsent);
    cacheSetItem('gdprAudit', gdprAudit);
    cacheSetItem('currency', currency);
    cacheSetItem('accessibility', accessibility);
    cacheSetItem('lastSyncedAt', lastSyncedAt);
  }, [
    hydrated,
    reservations,
    alerts,
    vaultDocs,
    gdprConsent,
    gdprAudit,
    currency,
    accessibility,
    lastSyncedAt,
  ]);

  // Apply Dark Mode & WCAG accessibility classes on documentElement
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('lms_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('lms_theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.fontSize = accessibility.largeText ? '18px' : '16px';
    root.classList.toggle('high-contrast', accessibility.highContrast);
    root.classList.toggle('reduced-motion', accessibility.reducedMotion);
  }, [accessibility]);

  const scrollToElement = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: accessibility.reducedMotion ? 'auto' : 'smooth' });
    }
  };

  const handleNavSelect = (id: string) => {
    if (id === 'privacy') {
      setWorkspaceTab('gdpr');
      scrollToElement('workspace');
      return;
    }
    scrollToElement(id);
  };

  const dispatchPushNotification = (alert: DispatchAlert) => {
    setAlerts((prev) => [alert, ...prev]);
    setActiveToast(alert);

    if (
      gdprConsent.pushDispatchAlerts &&
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      try {
        new Notification(`Link Management Services — ${alert.title}`, {
          body: alert.message,
          icon: '/pwa-192x192.png',
        });
      } catch {
        // Ignore browser notification errors in restricted contexts
      }
    }
  };

  const handleCreateReservation = (reservation: Reservation) => {
    setReservations((prev) => [reservation, ...prev]);
    setLastSyncedAt(new Date().toISOString());

    dispatchPushNotification({
      id: `alert-${Date.now()}`,
      reservationRef: reservation.referenceCode,
      severity: 'info',
      title: 'Reservation Confirmed & Cached Offline',
      message: `${reservation.vehicleName} assigned to ${reservation.passengerName} (${reservation.currency}).`,
      timestamp: new Date().toISOString(),
      read: false,
    });
  };

  const handleTriggerSimulatedAlert = (kind: 'delay' | 'arrived' | 'reroute') => {
    const targetRef = reservations[0]?.referenceCode ?? 'LMS-88412';
    const now = new Date().toISOString();

    if (kind === 'delay') {
      setReservations((prev) =>
        prev.map((r, i) =>
          i === 0 ? { ...r, status: 'Flight Delayed - Adjusted' } : r
        )
      );
      dispatchPushNotification({
        id: `alert-${Date.now()}`,
        reservationRef: targetRef,
        severity: 'warning',
        title: 'Flight Delay Detected — Pickup Adjusted +35m',
        message: `Dispatch automatically shifted chauffeur staging at FBO ramp by +35 minutes for ${targetRef}.`,
        timestamp: now,
        read: false,
      });
    } else if (kind === 'arrived') {
      setReservations((prev) =>
        prev.map((r, i) => (i === 0 ? { ...r, status: 'Chauffeur En Route' } : r))
      );
      dispatchPushNotification({
        id: `alert-${Date.now()}`,
        reservationRef: targetRef,
        severity: 'info',
        title: 'Chauffeur Staged at Executive Gate',
        message: `Chauffeur Henrik Lindqvist is staged outside FBO Lounge for ${targetRef}.`,
        timestamp: now,
        read: false,
      });
    } else {
      dispatchPushNotification({
        id: `alert-${Date.now()}`,
        reservationRef: targetRef,
        severity: 'urgent',
        title: 'Corridor Weather Reroute Activated',
        message: `Alternate express corridor selected to maintain on-time arrival for ${targetRef}.`,
        timestamp: now,
        read: false,
      });
    }
  };

  const handleRequestNotificationPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    try {
      const result = await Notification.requestPermission();
      setNotificationPermission(result);
    } catch {
      // Ignore permission rejection
    }
  };

  const handleSelectCorridor = (corridor: CorporateCorridor) => {
    setPickup(corridor.pickupDefault);
    setDropoff(corridor.dropoffDefault);
    setDistanceMiles(corridor.distanceMiles);
    scrollToElement('booking-estimator');
  };

  const handleToggleGdprConsent = (
    key: Exclude<keyof GdprConsentState, 'essentialOperations' | 'updatedAt' | 'policyVersion'>,
    value: boolean
  ) => {
    const { nextConsent, auditEntry } = updateConsentPreference(gdprConsent, key, value);
    setGdprConsent(nextConsent);
    setGdprAudit((prev) => [auditEntry, ...prev]);
  };

  const handleExportGdprData = () => {
    const pkg = buildGdprExportPackage({
      consentState: gdprConsent,
      auditTrail: gdprAudit,
      reservations,
      alerts,
      vaultDocs,
    });
    const blob = new Blob([JSON.stringify(pkg, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `link-management-gdpr-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleEraseAllGdprData = async () => {
    await clearAllOfflineCache();
    setReservations([]);
    setAlerts([]);
    setVaultDocs([]);
    const resetAudit: GdprAuditEntry = {
      id: `gdpr-erase-${Date.now()}`,
      action: 'Article 17 Erasure Executed',
      detail: 'All personal reservations, dispatch alerts, and encrypted vault documents purged.',
      timestamp: new Date().toISOString(),
    };
    setGdprAudit([resetAudit]);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#111318] dark:bg-[#090B0F] dark:text-[#F5F6F8]">
      {/* WCAG Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-[#111318] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[#F2D06B]"
      >
        Skip to main content
      </a>

      <Header
        onBookClick={() => scrollToElement('booking-estimator')}
        onSelectSection={handleNavSelect}
      />

      <main id="main-content">
        <HeroSection
          currency={currency}
          onCurrencyChange={setCurrency}
          isDark={isDark}
          onToggleDark={() => setIsDark((prev) => !prev)}
          isOnline={isOnline}
          simulatedOffline={simulatedOffline}
          onToggleSimulatedOffline={() => setSimulatedOffline((prev) => !prev)}
          accessibility={accessibility}
          onUpdateAccessibility={setAccessibility}
          onJumpToEstimator={() => scrollToElement('booking-estimator')}
          onJumpToWorkspace={(tab) => {
            setWorkspaceTab(tab);
            scrollToElement('workspace');
          }}
        />

        <BookingEstimator
          currency={currency}
          onCurrencyChange={setCurrency}
          selectedVehicleId={selectedVehicleId}
          onSelectVehicleId={setSelectedVehicleId}
          pickup={pickup}
          dropoff={dropoff}
          distanceMiles={distanceMiles}
          onPickupChange={setPickup}
          onDropoffChange={setDropoff}
          onDistanceChange={setDistanceMiles}
          onCreateReservation={handleCreateReservation}
          isOnline={isOnline}
        />

        <AboutAndPillars onBookClick={() => scrollToElement('booking-estimator')} />

        <ServicesAndFleet
          currency={currency}
          selectedVehicleId={selectedVehicleId}
          onSelectVehicleForBooking={(vehicleId) => {
            setSelectedVehicleId(vehicleId);
            scrollToElement('booking-estimator');
          }}
        />

        <CorridorsSection onSelectCorridor={handleSelectCorridor} />

        <ExecutiveWorkspace
          activeTab={workspaceTab}
          onTabChange={setWorkspaceTab}
          isOnline={isOnline}
          simulatedOffline={simulatedOffline}
          onToggleSimulatedOffline={() => setSimulatedOffline((prev) => !prev)}
          lastSyncedAt={lastSyncedAt}
          onSyncCache={() => setLastSyncedAt(new Date().toISOString())}
          reservations={reservations}
          alerts={alerts}
          onTriggerAlert={handleTriggerSimulatedAlert}
          onMarkAllAlertsRead={() =>
            setAlerts((prev) => prev.map((a) => ({ ...a, read: true })))
          }
          notificationPermission={notificationPermission}
          onRequestNotificationPermission={handleRequestNotificationPermission}
          vaultDocs={vaultDocs}
          onAddEncryptedDoc={(doc) => setVaultDocs((prev) => [doc, ...prev])}
          onDeleteEncryptedDoc={(id) =>
            setVaultDocs((prev) => prev.filter((d) => d.id !== id))
          }
          gdprConsent={gdprConsent}
          gdprAudit={gdprAudit}
          onToggleGdprConsent={handleToggleGdprConsent}
          onExportGdprData={handleExportGdprData}
          onEraseAllGdprData={handleEraseAllGdprData}
        />
      </main>

      <Footer
        onJumpToPrivacy={() => {
          setWorkspaceTab('gdpr');
          scrollToElement('workspace');
        }}
        onJumpToEstimator={() => scrollToElement('booking-estimator')}
      />

      {/* Non-intrusive Push Dispatch Toast (max 1 toast, WCAG live region) */}
      {activeToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 left-4 right-4 z-50 rounded-xl border border-[#E5BE53]/60 bg-[#111318] p-4 text-white shadow-xl sm:left-auto sm:right-4 sm:w-full sm:max-w-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <Bell className="mt-0.5 h-4 w-4 shrink-0 text-[#F2D06B]" aria-hidden="true" />
              <div>
                <p className="font-mono text-xs font-semibold text-[#F2D06B]">
                  {activeToast.reservationRef} · Dispatch Push
                </p>
                <p className="mt-0.5 text-sm font-semibold">{activeToast.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-[#CBD5E1]">
                  {activeToast.message}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveToast(null)}
              aria-label="Dismiss dispatch notification"
              className="rounded-md p-1 text-[#9CA3AF] hover:text-white"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
