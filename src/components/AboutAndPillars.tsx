import React from 'react';
import { PhoneCall } from 'lucide-react';
import { ABOUT_CHAUFFEUR_IMAGE, EXECUTIVE_PILLARS } from '../data/catalog';

interface AboutAndPillarsProps {
  onBookClick: () => void;
}

export const AboutAndPillars: React.FC<AboutAndPillarsProps> = ({ onBookClick }) => {
  return (
    <>
      {/* About Split Section (matching Handshake Limo split architecture) */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12">
          <div className="flex flex-col justify-center lg:col-span-6">
            <p className="text-xs font-semibold tracking-wide text-[#9A6F14] dark:text-[#F2D06B]">
              About Link Management Services
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-[#111318] text-balance dark:text-[#F5F6F8] sm:text-4xl">
              Executive ground logistics engineered for global boards and aviation desks
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#4B5563] dark:text-[#CBD5E1]">
              Link Management Services delivers discreet, chauffeur-driven corporate mobility across
              Denver, New York, London, Zurich, Dubai, and Tokyo. From private FBO tarmac transfers
              to multi-day investor roadshows, our career chauffeurs and encrypted itinerary suite
              keep principals moving on schedule—online or off the grid.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={onBookClick}
                className="min-h-[44px] rounded-lg bg-[#111318] px-6 py-2.5 text-sm font-semibold text-[#F5D77F] hover:bg-[#1F2430] transition-colors whitespace-nowrap shrink-0 dark:bg-[#E5BE53] dark:text-[#0B0D12] dark:hover:bg-[#F2D06B]"
              >
                Schedule Transfer
              </button>
              <span className="text-sm text-[#4B5563] dark:text-[#9CA3AF]">
                ISO-aligned security · GDPR Article 32 compliance
              </span>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-[#DFDCD2] bg-[#12151C] lg:col-span-6 dark:border-[#232938]">
            <img
              src={ABOUT_CHAUFFEUR_IMAGE}
              alt="Uniformed Link Management Services chauffeur opening a black Mercedes-Maybach door outside a financial tower"
              referrerPolicy="no-referrer"
              className="h-full min-h-[280px] w-full object-cover object-center lg:h-full"
            />
          </div>
        </div>
      </section>

      {/* 6 Executive Pillars Band (matching Handshake Limo's 6-pillar band) */}
      <section className="border-y border-[#E5E2DA] bg-[#111318] py-14 text-white dark:border-[#1E2330] dark:bg-[#0D1016]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {EXECUTIVE_PILLARS.map((pillar, idx) => (
              <div
                key={pillar.title}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-6"
              >
                <p className="font-mono text-xs font-medium text-[#F2D06B]">
                  0{idx + 1}.
                </p>
                <h3 className="mt-2 font-display text-lg font-semibold text-white">
                  {pillar.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#CBD5E1]">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>

          {/* Why Choose + 24/7 Toll-Free Concierge strip */}
          <div className="mt-10 flex flex-col items-start justify-between gap-6 rounded-xl border border-[#E5BE53]/30 bg-[#171B24] p-6 sm:flex-row sm:items-center sm:p-8">
            <div className="max-w-2xl">
              <h3 className="font-display text-xl font-semibold text-white">
                Why corporate travel desks standardize on Link Management Services
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#CBD5E1]">
                Every reservation pairs guaranteed multi-currency pricing with zero-knowledge
                AES-256 document storage, real-time flight delay rerouting, and full GDPR data
                sovereignty.
              </p>
            </div>
            <a
              href="tel:+18888915529"
              className="inline-flex min-h-[48px] items-center gap-3 rounded-lg bg-[#E5BE53] px-5 py-3 text-sm font-semibold text-[#0B0D12] hover:bg-[#F2D06B] transition-colors whitespace-nowrap shrink-0"
            >
              <PhoneCall className="h-4 w-4" aria-hidden="true" />
              <span>24/7 Dispatch: (888) 891-5529</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
};
