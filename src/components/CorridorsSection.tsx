import React from 'react';
import { ArrowRight } from 'lucide-react';
import { CORPORATE_CORRIDORS } from '../data/catalog';
import type { CorporateCorridor } from '../types/travel';

interface CorridorsSectionProps {
  onSelectCorridor: (corridor: CorporateCorridor) => void;
}

export const CorridorsSection: React.FC<CorridorsSectionProps> = ({ onSelectCorridor }) => {
  return (
    <section
      id="corridors"
      aria-labelledby="corridors-heading"
      className="scroll-mt-20 mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wide text-[#9A6F14] dark:text-[#F2D06B]">
            Global Hubs &amp; Colorado Mountain Corridors
          </p>
          <h2
            id="corridors-heading"
            className="mt-1.5 font-display text-3xl font-semibold tracking-tight text-[#111318] text-balance dark:text-[#F5F6F8]"
          >
            Popular Executive Transfer Routes
          </h2>
        </div>
        <p className="text-sm text-[#4B5563] dark:text-[#9CA3AF]">
          Select any corridor to pre-fill the instant quote estimator.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {CORPORATE_CORRIDORS.map((corridor) => (
          <article
            key={corridor.id}
            className="flex flex-col justify-between rounded-xl border border-[#DFDCD2] bg-white p-6 dark:border-[#232938] dark:bg-[#12151C]"
          >
            <div>
              <p className="text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF]">
                {corridor.region} · {corridor.distanceMiles} mi · ~{corridor.estimatedMinutes} min
              </p>
              <h3 className="mt-2 font-display text-lg font-semibold text-[#111318] dark:text-[#F5F6F8]">
                {corridor.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#4B5563] dark:text-[#CBD5E1]">
                {corridor.summary}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onSelectCorridor(corridor)}
              className="mt-5 inline-flex min-h-[40px] items-center justify-between gap-2 rounded-lg border border-[#D6D3CB] px-3.5 py-2 text-xs font-semibold text-[#111318] hover:bg-[#F3F1EA] transition-colors dark:border-[#2A3040] dark:text-[#F2D06B] dark:hover:bg-[#1B202C]"
            >
              <span>Load Route in Estimator</span>
              <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            </button>
          </article>
        ))}
      </div>
    </section>
  );
};
