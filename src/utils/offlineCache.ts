import type {
  AccessibilitySettings,
  CurrencyCode,
  DispatchAlert,
  EncryptedDocumentRecord,
  GdprAuditEntry,
  GdprConsentState,
  Reservation,
} from '../types/travel';

const DB_NAME = 'link_management_offline_db';
const DB_VERSION = 1;
const STORE_NAME = 'kv_store';
const LS_PREFIX = 'lms_cache_v1_';

export interface OfflinePersistedState {
  reservations: Reservation[];
  alerts: DispatchAlert[];
  vaultDocs: EncryptedDocumentRecord[];
  gdprConsent: GdprConsentState;
  gdprAudit: GdprAuditEntry[];
  currency: CurrencyCode;
  accessibility: AccessibilitySettings;
  lastSyncedAt: string;
}

function openIdb(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined') {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function cacheGetItem<T>(key: string): Promise<T | null> {
  try {
    const db = await openIdb();
    if (db) {
      const idbVal = await new Promise<T | null>((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(key);
        req.onsuccess = () => resolve((req.result as T) ?? null);
        req.onerror = () => resolve(null);
      });
      db.close();
      if (idbVal !== null) return idbVal;
    }
  } catch {
    // Fallback to localStorage
  }

  try {
    const raw = window.localStorage.getItem(`${LS_PREFIX}${key}`);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export async function cacheSetItem<T>(key: string, value: T): Promise<void> {
  try {
    window.localStorage.setItem(`${LS_PREFIX}${key}`, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors cleanly
  }

  try {
    const db = await openIdb();
    if (db) {
      await new Promise<void>((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put(value, key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      });
      db.close();
    }
  } catch {
    // localStorage mirror already saved
  }
}

export async function clearAllOfflineCache(): Promise<void> {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(LS_PREFIX)) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => window.localStorage.removeItem(k));
  } catch {
    // Ignore
  }

  try {
    const db = await openIdb();
    if (db) {
      await new Promise<void>((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      });
      db.close();
    }
  } catch {
    // Ignore
  }
}

export function estimateCacheFootprintBytes(): number {
  let total = 0;
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(LS_PREFIX)) {
        const v = window.localStorage.getItem(k) || '';
        total += k.length + v.length;
      }
    }
  } catch {
    return 0;
  }
  return total * 2;
}
