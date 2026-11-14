import React, { useMemo, useState } from 'react';
import { CheckCircle2, CreditCard, ShieldCheck } from 'lucide-react';
import { FLEET_VEHICLES } from '../data/catalog';
import type {
  CurrencyCode,
  PaymentMethod,
  Reservation,
  TripType,
} from '../types/travel';
import {
  calculateExecutiveQuote,
  CURRENCIES,
  CURRENCY_LIST,
  formatCurrency,
  validateBookingForm,
} from '../utils/currency';

interface BookingEstimatorProps {
  currency: CurrencyCode;
  onCurrencyChange: (currency: CurrencyCode) => void;
  selectedVehicleId: string;
  onSelectVehicleId: (id: string) => void;
  pickup: string;
  dropoff: string;
  distanceMiles: number;
  onPickupChange: (val: string) => void;
  onDropoffChange: (val: string) => void;
  onDistanceChange: (val: number) => void;
  onCreateReservation: (reservation: Reservation) => void;
  isOnline: boolean;
}

const PAYMENT_OPTIONS: Array<{ id: PaymentMethod; label: string; note: string }> = [
  { id: 'corporate_invoice', label: 'Corporate Invoice (Net-30)', note: 'PO / Cost Center billing' },
  { id: 'multi_currency_card', label: 'Multi-Currency Corporate Card', note: 'Amex / Visa / Mastercard' },
  { id: 'wire_escrow', label: 'SEPA / SWIFT Wire Escrow', note: 'Zero FX markup' },
  { id: 'virtual_card', label: 'Apple Pay / Virtual Card', note: 'Tokenized instant hold' },
];

export const BookingEstimator: React.FC<BookingEstimatorProps> = ({
  currency,
  onCurrencyChange,
  selectedVehicleId,
  onSelectVehicleId,
  pickup,
  dropoff,
  distanceMiles,
  onPickupChange,
  onDropoffChange,
  onDistanceChange,
  onCreateReservation,
  isOnline,
}) => {
  const [tripType, setTripType] = useState<TripType>('airport');
  const [pickupDateTime, setPickupDateTime] = useState('2026-11-20T09:00');
  const [flightNumber, setFlightNumber] = useState('BA 219');
  const [passengers, setPassengers] = useState(2);
  const [hours, setHours] = useState(4);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('corporate_invoice');
  const [passengerName, setPassengerName] = useState('');
  const [corporateEmail, setCorporateEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmedRef, setConfirmedRef] = useState<string | null>(null);

  const selectedVehicle = useMemo(
    () => FLEET_VEHICLES.find((v) => v.id === selectedVehicleId) ?? FLEET_VEHICLES[0],
    [selectedVehicleId]
  );

  const quote = useMemo(
    () =>
      calculateExecutiveQuote({
        vehicle: selectedVehicle,
        tripType,
        distanceMiles,
        hours,
        currency,
      }),
    [selectedVehicle, tripType, distanceMiles, hours, currency]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateBookingForm({
      pickup,
      dropoff,
      pickupDateTime,
      passengerName,
      corporateEmail,
      passengers,
      maxPassengers: selectedVehicle.passengers,
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setConfirmedRef(null);
      return;
    }

    setErrors({});
    const refCode = `LMS-${Math.floor(10000 + Math.random() * 89999)}`;
    const newReservation: Reservation = {
      id: `res-${Date.now()}`,
      referenceCode: refCode,
      tripType,
      pickup: pickup.trim(),
      dropoff: dropoff.trim(),
      pickupDateTime,
      flightNumber: flightNumber.trim() || 'Private / Ground',
      passengers,
      hours: tripType === 'hourly' ? hours : undefined,
      distanceMiles,
      vehicleId: selectedVehicle.id,
      vehicleName: selectedVehicle.name,
      currency,
      subtotalUsd: quote.subtotalUsd,
      conciergeFeeUsd: quote.conciergeFeeUsd,
      taxUsd: quote.taxUsd,
      totalUsd: quote.totalUsd,
      totalInCurrency: quote.totalConverted,
      paymentMethod,
      passengerName: passengerName.trim(),
      corporateEmail: corporateEmail.trim(),
      status: 'Confirmed',
      chauffeurName: 'Henrik Lindqvist',
      createdAt: new Date().toISOString(),
      cachedOffline: true,
    };

    onCreateReservation(newReservation);
    setConfirmedRef(refCode);
  };

  return (
    <section
      id="booking-estimator"
      aria-labelledby="estimator-heading"
      className="scroll-mt-20 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"
    >
      <div className="rounded-xl border border-[#DFDCD2] bg-white p-6 sm:p-8 dark:border-[#232938] dark:bg-[#12151C]">
        <div className="flex flex-col gap-3 border-b border-[#ECE9E0] pb-6 sm:flex-row sm:items-end sm:justify-between dark:border-[#232938]">
          <div>
            <p className="text-xs font-semibold tracking-wide text-[#9A6F14] dark:text-[#F2D06B]">
              Instant Corporate Dispatch &amp; Multi-Currency Settlement
            </p>
            <h2
              id="estimator-heading"
              className="mt-1 font-display text-2xl font-semibold tracking-tight text-[#111318] dark:text-[#F5F6F8] sm:text-3xl"
            >
              Find a vehicle to book
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { id: 'airport', label: 'Airport / FBO' },
                { id: 'hourly', label: 'Hourly Roadshow' },
                { id: 'point_to_point', label: 'Point-to-Point' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTripType(tab.id)}
                aria-pressed={tripType === tab.id}
                className={`min-h-[40px] rounded-lg px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  tripType === tab.id
                    ? 'bg-[#111318] text-[#F5D77F] dark:bg-[#E5BE53] dark:text-[#0B0D12]'
                    : 'bg-[#F3F1EA] text-[#374151] hover:bg-[#E7E4DA] dark:bg-[#1B202C] dark:text-[#CBD5E1] dark:hover:bg-[#252B3B]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left 8 columns: Route & Passenger Inputs */}
          <div className="space-y-5 lg:col-span-8">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="booking-pickup"
                  className="block text-sm font-medium text-[#1F2937] dark:text-[#E5E7EB]"
                >
                  Pickup Location / FBO
                </label>
                <input
                  id="booking-pickup"
                  type="text"
                  value={pickup}
                  onChange={(e) => onPickupChange(e.target.value)}
                  placeholder="e.g., Denver International Airport (DEN)"
                  aria-invalid={Boolean(errors.pickup)}
                  aria-describedby={errors.pickup ? 'pickup-error' : undefined}
                  className="mt-1.5 min-h-[44px] w-full rounded-lg border border-[#D6D3CB] bg-[#FAF9F6] px-3.5 py-2.5 text-sm text-[#111318] placeholder-[#6B7280] dark:border-[#2C3344] dark:bg-[#0B0D12] dark:text-[#F5F6F8] dark:placeholder-[#9CA3AF]"
                />
                {errors.pickup && (
                  <p id="pickup-error" className="mt-1 text-xs font-medium text-[#B91C1C] dark:text-[#FCA5A5]">
                    {errors.pickup}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="booking-dropoff"
                  className="block text-sm font-medium text-[#1F2937] dark:text-[#E5E7EB]"
                >
                  Destination / Corporate Hub
                </label>
                <input
                  id="booking-dropoff"
                  type="text"
                  value={dropoff}
                  onChange={(e) => onDropoffChange(e.target.value)}
                  placeholder="e.g., Four Seasons Resort Vail, CO"
                  aria-invalid={Boolean(errors.dropoff)}
                  aria-describedby={errors.dropoff ? 'dropoff-error' : undefined}
                  className="mt-1.5 min-h-[44px] w-full rounded-lg border border-[#D6D3CB] bg-[#FAF9F6] px-3.5 py-2.5 text-sm text-[#111318] placeholder-[#6B7280] dark:border-[#2C3344] dark:bg-[#0B0D12] dark:text-[#F5F6F8] dark:placeholder-[#9CA3AF]"
                />
                {errors.dropoff && (
                  <p id="dropoff-error" className="mt-1 text-xs font-medium text-[#B91C1C] dark:text-[#FCA5A5]">
                    {errors.dropoff}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <div className="sm:col-span-2">
                <label
                  htmlFor="booking-datetime"
                  className="block text-sm font-medium text-[#1F2937] dark:text-[#E5E7EB]"
                >
                  Pickup Date &amp; Time
                </label>
                <input
                  id="booking-datetime"
                  type="datetime-local"
                  value={pickupDateTime}
                  onChange={(e) => setPickupDateTime(e.target.value)}
                  aria-invalid={Boolean(errors.pickupDateTime)}
                  className="mt-1.5 min-h-[44px] w-full rounded-lg border border-[#D6D3CB] bg-[#FAF9F6] px-3.5 py-2.5 font-mono text-sm text-[#111318] dark:border-[#2C3344] dark:bg-[#0B0D12] dark:text-[#F5F6F8]"
                />
                {errors.pickupDateTime && (
                  <p className="mt-1 text-xs font-medium text-[#B91C1C] dark:text-[#FCA5A5]">
                    {errors.pickupDateTime}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="booking-flight"
                  className="block text-sm font-medium text-[#1F2937] dark:text-[#E5E7EB]"
                >
                  Flight / Tail No.
                </label>
                <input
                  id="booking-flight"
                  type="text"
                  value={flightNumber}
                  onChange={(e) => setFlightNumber(e.target.value)}
                  placeholder="BA 219 / N718GA"
                  className="mt-1.5 min-h-[44px] w-full rounded-lg border border-[#D6D3CB] bg-[#FAF9F6] px-3.5 py-2.5 font-mono text-sm text-[#111318] dark:border-[#2C3344] dark:bg-[#0B0D12] dark:text-[#F5F6F8]"
                />
              </div>

              <div>
                <label
                  htmlFor="booking-passengers"
                  className="block text-sm font-medium text-[#1F2937] dark:text-[#E5E7EB]"
                >
                  Passengers
                </label>
                <input
                  id="booking-passengers"
                  type="number"
                  min={1}
                  max={10}
                  value={passengers}
                  onChange={(e) => setPassengers(Number(e.target.value) || 1)}
                  className="mt-1.5 min-h-[44px] w-full rounded-lg border border-[#D6D3CB] bg-[#FAF9F6] px-3.5 py-2.5 font-mono text-sm tabular-nums text-[#111318] dark:border-[#2C3344] dark:bg-[#0B0D12] dark:text-[#F5F6F8]"
                />
                {errors.passengers && (
                  <p className="mt-1 text-xs font-medium text-[#B91C1C] dark:text-[#FCA5A5]">
                    {errors.passengers}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label
                  htmlFor="booking-vehicle"
                  className="block text-sm font-medium text-[#1F2937] dark:text-[#E5E7EB]"
                >
                  Executive Fleet Class
                </label>
                <select
                  id="booking-vehicle"
                  value={selectedVehicle.id}
                  onChange={(e) => onSelectVehicleId(e.target.value)}
                  className="mt-1.5 min-h-[44px] w-full rounded-lg border border-[#D6D3CB] bg-[#FAF9F6] px-3.5 py-2.5 text-sm text-[#111318] dark:border-[#2C3344] dark:bg-[#0B0D12] dark:text-[#F5F6F8]"
                >
                  {FLEET_VEHICLES.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} (Up to {v.passengers} guests)
                    </option>
                  ))}
                </select>
              </div>

              {tripType === 'hourly' ? (
                <div>
                  <label
                    htmlFor="booking-hours"
                    className="block text-sm font-medium text-[#1F2937] dark:text-[#E5E7EB]"
                  >
                    Charter Hours
                  </label>
                  <input
                    id="booking-hours"
                    type="number"
                    min={2}
                    max={24}
                    value={hours}
                    onChange={(e) => setHours(Math.max(2, Number(e.target.value) || 2))}
                    className="mt-1.5 min-h-[44px] w-full rounded-lg border border-[#D6D3CB] bg-[#FAF9F6] px-3.5 py-2.5 font-mono text-sm tabular-nums text-[#111318] dark:border-[#2C3344] dark:bg-[#0B0D12] dark:text-[#F5F6F8]"
                  />
                </div>
              ) : (
                <div>
                  <label
                    htmlFor="booking-miles"
                    className="block text-sm font-medium text-[#1F2937] dark:text-[#E5E7EB]"
                  >
                    Est. Distance (mi)
                  </label>
                  <input
                    id="booking-miles"
                    type="number"
                    min={1}
                    max={500}
                    value={distanceMiles}
                    onChange={(e) => onDistanceChange(Math.max(1, Number(e.target.value) || 1))}
                    className="mt-1.5 min-h-[44px] w-full rounded-lg border border-[#D6D3CB] bg-[#FAF9F6] px-3.5 py-2.5 font-mono text-sm tabular-nums text-[#111318] dark:border-[#2C3344] dark:bg-[#0B0D12] dark:text-[#F5F6F8]"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="booking-passenger-name"
                  className="block text-sm font-medium text-[#1F2937] dark:text-[#E5E7EB]"
                >
                  Lead Executive Name
                </label>
                <input
                  id="booking-passenger-name"
                  type="text"
                  value={passengerName}
                  onChange={(e) => setPassengerName(e.target.value)}
                  placeholder="Elena Rostova"
                  aria-invalid={Boolean(errors.passengerName)}
                  className="mt-1.5 min-h-[44px] w-full rounded-lg border border-[#D6D3CB] bg-[#FAF9F6] px-3.5 py-2.5 text-sm text-[#111318] placeholder-[#6B7280] dark:border-[#2C3344] dark:bg-[#0B0D12] dark:text-[#F5F6F8]"
                />
                {errors.passengerName && (
                  <p className="mt-1 text-xs font-medium text-[#B91C1C] dark:text-[#FCA5A5]">
                    {errors.passengerName}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="booking-email"
                  className="block text-sm font-medium text-[#1F2937] dark:text-[#E5E7EB]"
                >
                  Corporate Dispatch Email
                </label>
                <input
                  id="booking-email"
                  type="email"
                  value={corporateEmail}
                  onChange={(e) => setCorporateEmail(e.target.value)}
                  placeholder="executive@company.com"
                  aria-invalid={Boolean(errors.corporateEmail)}
                  className="mt-1.5 min-h-[44px] w-full rounded-lg border border-[#D6D3CB] bg-[#FAF9F6] px-3.5 py-2.5 text-sm text-[#111318] placeholder-[#6B7280] dark:border-[#2C3344] dark:bg-[#0B0D12] dark:text-[#F5F6F8]"
                />
                {errors.corporateEmail && (
                  <p className="mt-1 text-xs font-medium text-[#B91C1C] dark:text-[#FCA5A5]">
                    {errors.corporateEmail}
                  </p>
                )}
              </div>
            </div>

            {/* Multi-Currency Payment Settlement Method */}
            <div>
              <span className="block text-sm font-medium text-[#1F2937] dark:text-[#E5E7EB]">
                Settlement Method
              </span>
              <div className="mt-2 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {PAYMENT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPaymentMethod(opt.id)}
                    aria-pressed={paymentMethod === opt.id}
                    className={`flex min-h-[52px] items-center justify-between rounded-lg border px-3.5 py-2 text-left transition-colors ${
                      paymentMethod === opt.id
                        ? 'border-[#111318] bg-[#FAF9F6] dark:border-[#E5BE53] dark:bg-[#191D28]'
                        : 'border-[#E5E2DA] bg-white hover:bg-[#FAF9F6] dark:border-[#252B3B] dark:bg-[#0D1017] dark:hover:bg-[#151923]'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-semibold text-[#111318] dark:text-[#F5F6F8]">
                        {opt.label}
                      </div>
                      <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{opt.note}</div>
                    </div>
                    <CreditCard
                      className={`h-4 w-4 shrink-0 ${
                        paymentMethod === opt.id
                          ? 'text-[#9A6F14] dark:text-[#F2D06B]'
                          : 'text-[#9CA3AF]'
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right 4 columns: Live Multi-Currency Breakdown */}
          <div className="flex flex-col justify-between rounded-xl border border-[#E5E2DA] bg-[#FAF9F6] p-6 dark:border-[#252B3B] dark:bg-[#0B0D12] lg:col-span-4">
            <div>
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-display text-lg font-semibold text-[#111318] dark:text-[#F5F6F8]">
                  Multi-Currency Quote
                </h3>
                <select
                  aria-label="Quote settlement currency"
                  value={currency}
                  onChange={(e) => onCurrencyChange(e.target.value as CurrencyCode)}
                  className="min-h-[36px] rounded-md border border-[#D6D3CB] bg-white px-2.5 py-1 font-mono text-xs font-semibold text-[#111318] dark:border-[#2C3344] dark:bg-[#151923] dark:text-[#F2D06B]"
                >
                  {CURRENCY_LIST.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code}
                    </option>
                  ))}
                </select>
              </div>

              <p className="mt-1 text-xs text-[#4B5563] dark:text-[#9CA3AF]">
                FX Spot Rate: 1 USD = {CURRENCIES[currency].rateFromUsd} {currency} · Fixed guarantee
              </p>

              <dl
                aria-live="polite"
                className="mt-6 space-y-3 border-t border-[#E5E2DA] pt-4 text-sm dark:border-[#232938]"
              >
                <div className="flex items-center justify-between">
                  <dt className="text-[#4B5563] dark:text-[#9CA3AF]">Chauffeur &amp; Vehicle</dt>
                  <dd className="font-mono font-medium tabular-nums text-[#111318] dark:text-[#F5F6F8]">
                    {formatCurrency(quote.subtotalConverted, currency)}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-[#4B5563] dark:text-[#9CA3AF]">24/7 FBO Dispatch (8%)</dt>
                  <dd className="font-mono font-medium tabular-nums text-[#111318] dark:text-[#F5F6F8]">
                    {formatCurrency(quote.conciergeFeeConverted, currency)}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-[#4B5563] dark:text-[#9CA3AF]">Corporate Tax / Levy</dt>
                  <dd className="font-mono font-medium tabular-nums text-[#111318] dark:text-[#F5F6F8]">
                    {formatCurrency(quote.taxConverted, currency)}
                  </dd>
                </div>
                <div className="flex items-center justify-between border-t border-[#E5E2DA] pt-3 dark:border-[#232938]">
                  <dt className="font-semibold text-[#111318] dark:text-[#F5F6F8]">Guaranteed Total</dt>
                  <dd
                    data-testid="quote-total"
                    className="font-mono text-xl font-bold tabular-nums text-[#111318] dark:text-[#F2D06B]"
                  >
                    {formatCurrency(quote.totalConverted, currency)}
                  </dd>
                </div>
              </dl>

              <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-[#4B5563] dark:text-[#9CA3AF]">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#9A6F14] dark:text-[#F2D06B]" aria-hidden="true" />
                <span>
                  GDPR Article 6(1)(b) encrypted local itinerary caching enabled.{' '}
                  {isOnline ? 'Immediate live dispatch.' : 'Queued locally and accessible offline.'}
                </span>
              </p>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                className="min-h-[48px] w-full rounded-lg bg-[#111318] px-5 py-3 text-sm font-semibold text-[#F5D77F] hover:bg-[#1F2430] transition-colors dark:bg-[#E5BE53] dark:text-[#0B0D12] dark:hover:bg-[#F2D06B]"
              >
                Confirm Chauffeur Reservation
              </button>

              {confirmedRef && (
                <div
                  role="status"
                  aria-live="polite"
                  className="mt-4 flex items-start gap-2.5 rounded-lg border border-[#15803D]/30 bg-[#15803D]/10 p-3 text-xs text-[#14532D] dark:border-[#4ADE80]/30 dark:bg-[#14532D]/30 dark:text-[#BBF7D0]"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="font-semibold">Reservation {confirmedRef} Confirmed</p>
                    <p className="mt-0.5">
                      Cached offline in your Executive Workspace and settled in {currency}.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};
