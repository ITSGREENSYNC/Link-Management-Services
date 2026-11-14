import type { CurrencyCode, FleetVehicle, TripType } from '../types/travel';

export interface CurrencyConfig {
  code: CurrencyCode;
  name: string;
  symbol: string;
  rateFromUsd: number;
  decimals: number;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USD: { code: 'USD', name: 'US Dollar', symbol: '$', rateFromUsd: 1.0, decimals: 2 },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€', rateFromUsd: 0.92, decimals: 2 },
  GBP: { code: 'GBP', name: 'British Pound', symbol: '£', rateFromUsd: 0.79, decimals: 2 },
  CHF: { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF ', rateFromUsd: 0.88, decimals: 2 },
  AED: { code: 'AED', name: 'UAE Dirham', symbol: 'AED ', rateFromUsd: 3.67, decimals: 2 },
  JPY: { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rateFromUsd: 154.0, decimals: 0 },
};

export const CURRENCY_LIST: CurrencyConfig[] = Object.values(CURRENCIES);

export function convertUsdToCurrency(amountUsd: number, currency: CurrencyCode): number {
  const cfg = CURRENCIES[currency];
  const raw = amountUsd * cfg.rateFromUsd;
  if (cfg.decimals === 0) {
    return Math.round(raw);
  }
  return Math.round(raw * 100) / 100;
}

export function formatCurrency(amountInTarget: number, currency: CurrencyCode): string {
  const cfg = CURRENCIES[currency];
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: cfg.code,
    minimumFractionDigits: cfg.decimals,
    maximumFractionDigits: cfg.decimals,
  }).format(amountInTarget);
}

export function formatUsdAsCurrency(amountUsd: number, currency: CurrencyCode): string {
  return formatCurrency(convertUsdToCurrency(amountUsd, currency), currency);
}

export interface QuoteBreakdown {
  subtotalUsd: number;
  conciergeFeeUsd: number;
  taxUsd: number;
  totalUsd: number;
  subtotalConverted: number;
  conciergeFeeConverted: number;
  taxConverted: number;
  totalConverted: number;
  fxRate: number;
}

export function calculateExecutiveQuote(params: {
  vehicle: Pick<FleetVehicle, 'baseFareUsd' | 'perMileUsd' | 'hourlyRateUsd'>;
  tripType: TripType;
  distanceMiles: number;
  hours: number;
  currency: CurrencyCode;
}): QuoteBreakdown {
  const safeMiles = Math.max(1, Number.isFinite(params.distanceMiles) ? params.distanceMiles : 1);
  const safeHours = Math.max(2, Number.isFinite(params.hours) ? params.hours : 2);

  let subtotalUsd = 0;
  if (params.tripType === 'hourly') {
    subtotalUsd = params.vehicle.hourlyRateUsd * safeHours;
  } else if (params.tripType === 'airport') {
    // Airport FBO tarmac / terminal meet-and-greet flat base + mileage
    subtotalUsd = params.vehicle.baseFareUsd + safeMiles * params.vehicle.perMileUsd;
  } else {
    subtotalUsd = params.vehicle.baseFareUsd * 0.85 + safeMiles * params.vehicle.perMileUsd;
  }

  subtotalUsd = Math.round(subtotalUsd * 100) / 100;
  const conciergeFeeUsd = Math.round(subtotalUsd * 0.08 * 100) / 100; // 8% 24/7 dispatch & flight tracking
  const taxUsd = Math.round((subtotalUsd + conciergeFeeUsd) * 0.065 * 100) / 100; // 6.5% transport levy
  const totalUsd = Math.round((subtotalUsd + conciergeFeeUsd + taxUsd) * 100) / 100;

  return {
    subtotalUsd,
    conciergeFeeUsd,
    taxUsd,
    totalUsd,
    subtotalConverted: convertUsdToCurrency(subtotalUsd, params.currency),
    conciergeFeeConverted: convertUsdToCurrency(conciergeFeeUsd, params.currency),
    taxConverted: convertUsdToCurrency(taxUsd, params.currency),
    totalConverted: convertUsdToCurrency(totalUsd, params.currency),
    fxRate: CURRENCIES[params.currency].rateFromUsd,
  };
}

export interface BookingFormValidationInput {
  pickup: string;
  dropoff: string;
  pickupDateTime: string;
  passengerName: string;
  corporateEmail: string;
  passengers: number;
  maxPassengers: number;
}

export function validateBookingForm(input: BookingFormValidationInput): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!input.pickup.trim() || input.pickup.trim().length < 3) {
    errors.pickup = 'Enter a valid pickup airport, FBO, or street address.';
  }
  if (!input.dropoff.trim() || input.dropoff.trim().length < 3) {
    errors.dropoff = 'Enter a valid destination address or corporate hub.';
  }
  if (!input.pickupDateTime) {
    errors.pickupDateTime = 'Select a pickup date and local departure time.';
  }
  if (!input.passengerName.trim() || input.passengerName.trim().length < 2) {
    errors.passengerName = 'Enter the lead executive passenger name.';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(input.corporateEmail.trim())) {
    errors.corporateEmail = 'Enter a valid corporate email address for itinerary confirmation.';
  }
  if (input.passengers < 1 || input.passengers > input.maxPassengers) {
    errors.passengers = `Passenger count must be between 1 and ${input.maxPassengers} for this vehicle.`;
  }
  return errors;
}
