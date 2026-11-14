import React, { useState } from 'react';
import { CORPORATE_SERVICES, FLEET_VEHICLES } from '../data/catalog';
import type { CurrencyCode, VehicleCategory } from '../types/travel';
import { formatUsdAsCurrency } from '../utils/currency';

interface ServicesAndFleetProps {
  currency: CurrencyCode;
  selectedVehicleId: string;
  onSelectVehicleForBooking: (vehicleId: string) => void;
}

const FILTER_TABS: Array<{ id: VehicleCategory; label: string }> = [
  { id: 'all', label: 'All Fleet' },
  { id: 'suv', label: 'Executive SUVs' },
  { id: 'sedan', label: 'Flagship Sedans' },
  { id: 'van', label: 'Conference Vans' },
];

export const ServicesAndFleet: React.FC<ServicesAndFleetProps> = ({
  currency,
  selectedVehicleId,
  onSelectVehicleForBooking,
}) => {
  const [filter, setFilter] = useState<VehicleCategory>('all');

  const visibleFleet =
    filter === 'all'
      ? FLEET_VEHICLES
      : FLEET_VEHICLES.filter((vehicle) => vehicle.category === filter);

  return (
    <>
      {/* Top Services of Link Management Services */}
      <section
        id="services"
        aria-labelledby="services-heading"
        className="scroll-mt-20 mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"
      >
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-wide text-[#9A6F14] dark:text-[#F2D06B]">
            Executive Capabilities
          </p>
          <h2
            id="services-heading"
            className="mt-1.5 font-display text-3xl font-semibold tracking-tight text-[#111318] text-balance dark:text-[#F5F6F8]"
          >
            Top Services of Link Management Services
          </h2>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {CORPORATE_SERVICES.map((service) => (
            <article
              key={service.id}
              className="flex flex-col justify-between rounded-xl border border-[#E5E2DA] bg-white p-6 dark:border-[#232938] dark:bg-[#12151C]"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF]">
                  <span className="font-mono text-[#9A6F14] dark:text-[#F2D06B]">
                    {service.number}
                  </span>
                  <span>{service.slaHighlight}</span>
                </div>
                <h3 className="mt-3 font-display text-xl font-semibold text-[#111318] dark:text-[#F5F6F8]">
                  {service.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#4B5563] dark:text-[#CBD5E1]">
                  {service.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Luxury Fleet Showcase */}
      <section
        id="fleet"
        aria-labelledby="fleet-heading"
        className="scroll-mt-20 border-t border-[#E5E2DA] bg-[#F3F1EA]/70 py-14 dark:border-[#1E2330] dark:bg-[#0D1016]"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-wide text-[#9A6F14] dark:text-[#F2D06B]">
                Inspected Daily · Encrypted Wi-Fi Equipped
              </p>
              <h2
                id="fleet-heading"
                className="mt-1.5 font-display text-3xl font-semibold tracking-tight text-[#111318] text-balance dark:text-[#F5F6F8]"
              >
                Luxury Fleet of Link Management Services
              </h2>
            </div>

            {/* Interactive vehicle filter tabs */}
            <div
              role="group"
              aria-label="Filter fleet by vehicle category"
              className="flex flex-wrap items-center gap-1.5 rounded-lg border border-[#DFDCD2] bg-white p-1 dark:border-[#252B3B] dark:bg-[#12151C]"
            >
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilter(tab.id)}
                  aria-pressed={filter === tab.id}
                  className={`min-h-[38px] rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    filter === tab.id
                      ? 'bg-[#111318] text-[#F5D77F] dark:bg-[#E5BE53] dark:text-[#0B0D12]'
                      : 'text-[#4B5563] hover:text-[#111318] dark:text-[#CBD5E1] dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            {visibleFleet.map((vehicle) => {
              const isSelected = vehicle.id === selectedVehicleId;
              return (
                <article
                  key={vehicle.id}
                  className={`flex flex-col overflow-hidden rounded-xl border bg-white transition-colors dark:bg-[#12151C] ${
                    isSelected
                      ? 'border-[#9A6F14] dark:border-[#E5BE53]'
                      : 'border-[#DFDCD2] dark:border-[#232938]'
                  }`}
                >
                  <div className="aspect-[16/10] w-full overflow-hidden bg-[#161922]">
                    <img
                      src={vehicle.image}
                      alt={vehicle.name}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover object-center"
                    />
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-6">
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#4B5563] dark:text-[#9CA3AF]">
                        <span>
                          Up to {vehicle.passengers} Guests · {vehicle.luggage} Suitcases
                        </span>
                        <span className="font-mono font-semibold tabular-nums text-[#111318] dark:text-[#F2D06B]">
                          From {formatUsdAsCurrency(vehicle.hourlyRateUsd, currency)} / hr
                        </span>
                      </div>

                      <h3 className="mt-2 font-display text-xl font-semibold text-[#111318] dark:text-[#F5F6F8]">
                        {vehicle.name}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-[#4B5563] dark:text-[#CBD5E1]">
                        {vehicle.tagline}
                      </p>

                      <p className="mt-3 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                        {vehicle.features.join(' · ')}
                      </p>
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-[#ECE9E0] pt-4 dark:border-[#232938]">
                      <span className="font-mono text-xs tabular-nums text-[#4B5563] dark:text-[#CBD5E1]">
                        Base FBO Transfer: {formatUsdAsCurrency(vehicle.baseFareUsd, currency)}
                      </span>
                      <button
                        type="button"
                        onClick={() => onSelectVehicleForBooking(vehicle.id)}
                        className="min-h-[40px] rounded-lg bg-[#111318] px-4 py-2 text-xs font-semibold text-[#F5D77F] hover:bg-[#1F2430] transition-colors whitespace-nowrap shrink-0 dark:bg-[#E5BE53] dark:text-[#0B0D12] dark:hover:bg-[#F2D06B]"
                      >
                        {isSelected ? 'Selected in Quote' : 'Select for Quote'}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
};
