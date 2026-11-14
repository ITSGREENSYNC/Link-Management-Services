export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'CHF' | 'AED' | 'JPY';

export type TripType = 'airport' | 'hourly' | 'point_to_point';

export type VehicleCategory = 'all' | 'suv' | 'sedan' | 'van';

export type PaymentMethod =
  | 'corporate_invoice'
  | 'multi_currency_card'
  | 'wire_escrow'
  | 'virtual_card';

export interface FleetVehicle {
  id: string;
  name: string;
  category: Exclude<VehicleCategory, 'all'>;
  tagline: string;
  passengers: number;
  luggage: number;
  baseFareUsd: number;
  perMileUsd: number;
  hourlyRateUsd: number;
  image: string;
  features: string[];
}

export interface CorporateService {
  id: string;
  number: string;
  title: string;
  description: string;
  slaHighlight: string;
}

export interface CorporateCorridor {
  id: string;
  region: string;
  title: string;
  pickupDefault: string;
  dropoffDefault: string;
  distanceMiles: number;
  estimatedMinutes: number;
  summary: string;
}

export interface Reservation {
  id: string;
  referenceCode: string;
  tripType: TripType;
  pickup: string;
  dropoff: string;
  pickupDateTime: string;
  flightNumber: string;
  passengers: number;
  hours?: number;
  distanceMiles: number;
  vehicleId: string;
  vehicleName: string;
  currency: CurrencyCode;
  subtotalUsd: number;
  conciergeFeeUsd: number;
  taxUsd: number;
  totalUsd: number;
  totalInCurrency: number;
  paymentMethod: PaymentMethod;
  passengerName: string;
  corporateEmail: string;
  status: 'Confirmed' | 'Chauffeur En Route' | 'Flight Delayed - Adjusted' | 'Completed';
  chauffeurName: string;
  createdAt: string;
  cachedOffline: boolean;
}

export interface DispatchAlert {
  id: string;
  reservationRef: string;
  severity: 'info' | 'warning' | 'urgent';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface EncryptedDocumentRecord {
  id: string;
  title: string;
  category: 'Passport & Visa' | 'FBO Flight Manifest' | 'Corporate NDA / SLA' | 'Expense Invoice';
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
  sha256Digest: string;
  saltBase64: string;
  ivBase64: string;
  ciphertextBase64: string;
}

export interface GdprConsentState {
  essentialOperations: true;
  flightTelemetry: boolean;
  pushDispatchAlerts: boolean;
  offlineLocalCache: boolean;
  updatedAt: string;
  policyVersion: string;
}

export interface GdprAuditEntry {
  id: string;
  action: string;
  detail: string;
  timestamp: string;
}

export interface AccessibilitySettings {
  largeText: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
}
