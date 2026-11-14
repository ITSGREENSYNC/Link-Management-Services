import React from 'react';
import { Mail, MapPin, Phone, Clock } from 'lucide-react';

interface FooterProps {
  onJumpToPrivacy: () => void;
  onJumpToEstimator: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onJumpToPrivacy, onJumpToEstimator }) => {
  return (
    <footer className="border-t border-[#E5E2DA] bg-[#0B0D12] text-[#E5E7EB] dark:border-[#1E2330]">
      <div className="border-b border-white/10 bg-[#12151C]">
        <div className="mx-auto max-w-7xl px-4 py-3 text-center text-xs font-medium tracking-wide text-[#F2D06B] sm:px-6 lg:px-8">
          Global Executive Hubs: Denver · New York · Washington DC · London · Zurich · Dubai · Tokyo
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4 sm:px-6 lg:px-8">
        <div>
          <p className="font-display text-lg font-semibold text-white">
            Link Management Services
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[#9CA3AF]">
            Executive chauffeured transport, private FBO tarmac coordination, multi-currency
            corporate settlement, and GDPR-compliant encrypted travel logistics.
          </p>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#F2D06B]">
            Executive Services
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-[#CBD5E1]">
            <li>
              <a href="#services" className="hover:text-[#F2D06B] transition-colors">
                Private Aviation &amp; FBO Transfers
              </a>
            </li>
            <li>
              <a href="#services" className="hover:text-[#F2D06B] transition-colors">
                Financial Roadshows &amp; Board Mobility
              </a>
            </li>
            <li>
              <a href="#services" className="hover:text-[#F2D06B] transition-colors">
                Alpine &amp; Mountain Resort Charters
              </a>
            </li>
            <li>
              <a href="#fleet" className="hover:text-[#F2D06B] transition-colors">
                Diplomatic &amp; VIP Fleet
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#F2D06B]">
            Primary FBO &amp; Airport Hubs
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-[#CBD5E1]">
            <li>
              <button
                type="button"
                onClick={onJumpToEstimator}
                className="text-left hover:text-[#F2D06B] transition-colors"
              >
                Denver International (DEN) &amp; Eagle (EGE)
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={onJumpToEstimator}
                className="text-left hover:text-[#F2D06B] transition-colors"
              >
                Teterboro (TEB) &amp; JFK International
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={onJumpToEstimator}
                className="text-left hover:text-[#F2D06B] transition-colors"
              >
                London Heathrow (LHR) &amp; Farnborough (FAB)
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={onJumpToEstimator}
                className="text-left hover:text-[#F2D06B] transition-colors"
              >
                Zurich General Aviation (ZRH)
              </button>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#F2D06B]">
            24/7 Dispatch &amp; DPO Contact
          </h2>
          <ul className="mt-3 space-y-2.5 text-sm text-[#CBD5E1]">
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-[#F2D06B]" aria-hidden="true" />
              <a href="tel:+18888915529" className="hover:text-[#F2D06B]">
                (888) 891-5529
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-[#F2D06B]" aria-hidden="true" />
              <a href="mailto:dispatch@linkmanagement.com" className="hover:text-[#F2D06B]">
                dispatch@linkmanagement.com
              </a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#F2D06B]" aria-hidden="true" />
              <span>12010 East Lake Cir, Greenwood Village, CO 80111</span>
            </li>
            <li className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#F2D06B]" aria-hidden="true" />
              <span>24/7 Global Operations · GDPR Art. 32 Compliant</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-[#9CA3AF] sm:flex-row sm:px-6 lg:px-8">
          <p>© 2026 Link Management Services Ltd. All Rights Reserved.</p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onJumpToPrivacy}
              className="hover:text-[#F2D06B] transition-colors"
            >
              GDPR Privacy &amp; Data Rights
            </button>
            <span aria-hidden="true">·</span>
            <a href="mailto:dpo@linkmanagement.com" className="hover:text-[#F2D06B] transition-colors">
              DPO: dpo@linkmanagement.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
