import React, { useState } from 'react';
import {
  Download,
  Eye,
  Moon,
  Phone,
  ShieldCheck,
  Sun,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { HERO_TARMAC_IMAGE } from '../data/catalog';
import { CURRENCY_LIST } from '../utils/currency';
import type { AccessibilitySettings, CurrencyCode } from '../types/travel';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface HeroSectionProps {
  currency: CurrencyCode;
  onCurrencyChange: (currency: CurrencyCode) => void;
  isDark: boolean;
  onToggleDark: () => void;
  isOnline: boolean;
  simulatedOffline: boolean;
  onToggleSimulatedOffline: () => void;
  accessibility: AccessibilitySettings;
  onUpdateAccessibility: (next: AccessibilitySettings) => void;
  onJumpToEstimator: () => void;
  onJumpToWorkspace: (tab: 'trips' | 'vault' | 'gdpr' | 'offline') => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  currency,
  onCurrencyChange,
  isDark,
  onToggleDark,
  isOnline,
  simulatedOffline,
  onToggleSimulatedOffline,
  accessibility,
  onUpdateAccessibility,
  onJumpToEstimator,
  onJumpToWorkspace,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showA11yMenu, setShowA11yMenu] = useState(false);

  return (
    <section id="top" className="relative">
      {/* Full-width cinematic hero replicating Handshake Limo tarmac composition */}
      <div className="relative min-h-[540px] lg:min-h-[600px] w-full overflow-hidden bg-[#0B0D12]">
        <img
          src={HERO_TARMAC_IMAGE}
          alt="Black Cadillac Escalade ESV executive SUV staged beside a private business jet on a twilight tarmac"
          referrerPolicy="no-referrer"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[#07090E]/92 via-[#07090E]/72 to-[#07090E]/35"
        />

        <div className="relative mx-auto flex max-w-7xl flex-col justify-center px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <p className="text-sm font-medium tracking-wide text-[#F2D06B]">
            Denver · New York · London · Zurich · Dubai · Tokyo
          </p>

          <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold tracking-tight text-white text-balance sm:text-5xl lg:text-6xl">
            Global Executive <span className="text-[#F2D06B]">Chauffeur Service</span>
          </h1>

          <p className="mt-4 max-w-2xl font-display text-xl font-medium text-[#E5E7EB] sm:text-2xl">
            Precision Corporate Travel &amp; Private FBO Transfers
          </p>

          <p className="mt-4 max-w-xl text-base leading-relaxed text-[#D1D5DB]">
            Dedicated 24/7 dispatch, multi-currency fixed corporate billing, AES-256 encrypted travel
            document storage, and offline-ready itinerary access across major global financial hubs.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={onJumpToEstimator}
              className="inline-flex min-h-[48px] items-center justify-center rounded-lg bg-[#E5BE53] px-7 py-3 text-sm font-semibold text-[#0B0D12] hover:bg-[#F2D06B] transition-colors whitespace-nowrap shrink-0"
            >
              Get Instant Quote
            </button>

            <a
              href="tel:+18888915529"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg border border-white/40 bg-black/35 px-6 py-3 text-sm font-semibold text-white hover:bg-black/55 transition-colors whitespace-nowrap shrink-0"
            >
              <Phone className="h-4 w-4 text-[#F2D06B]" aria-hidden="true" />
              <span>(888) 891-5529</span>
            </a>
          </div>
        </div>
      </div>

      {/* Executive Preference & Connectivity Bar (below fold / hero edge, keeping Top Bar clean) */}
      <div className="border-b border-[#E5E2DA] bg-white dark:border-[#1E2330] dark:bg-[#11141B]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm">
            <span className="inline-flex items-center gap-2 font-medium text-[#111318] dark:text-[#E5E7EB]">
              {isOnline ? (
                <Wifi className="h-4 w-4 text-[#15803D] dark:text-[#4ADE80]" aria-hidden="true" />
              ) : (
                <WifiOff className="h-4 w-4 text-[#B45309] dark:text-[#FBBF24]" aria-hidden="true" />
              )}
              <span>
                {isOnline ? 'Dispatch Sync Active' : 'Offline Mode — Cached Itineraries Active'}
              </span>
            </span>

            <span aria-hidden="true" className="hidden text-[#9CA3AF] sm:inline">
              |
            </span>

            <button
              type="button"
              onClick={onToggleSimulatedOffline}
              aria-pressed={simulatedOffline}
              className="min-h-[36px] rounded-md border border-[#D6D3CB] px-3 py-1 text-xs font-medium text-[#1F2937] hover:bg-[#F3F1EA] transition-colors whitespace-nowrap shrink-0 dark:border-[#2A3040] dark:text-[#E5E7EB] dark:hover:bg-[#1B202C]"
            >
              {simulatedOffline ? 'Go Back Online' : 'Test Offline Mode'}
            </button>

            <button
              type="button"
              onClick={() => onJumpToWorkspace('gdpr')}
              className="inline-flex min-h-[36px] items-center gap-1.5 text-xs font-medium text-[#374151] hover:text-[#111318] hover:underline underline-offset-4 whitespace-nowrap shrink-0 dark:text-[#CBD5E1] dark:hover:text-[#F2D06B]"
            >
              <ShieldCheck className="h-4 w-4 text-[#9A6F14] dark:text-[#F2D06B]" aria-hidden="true" />
              <span>GDPR &amp; AES-256 Vault</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Multi-Currency Selector */}
            <div className="flex items-center gap-2">
              <label
                htmlFor="global-currency-select"
                className="text-xs font-medium text-[#4B5563] dark:text-[#CBD5E1]"
              >
                Currency
              </label>
              <select
                id="global-currency-select"
                value={currency}
                onChange={(e) => onCurrencyChange(e.target.value as CurrencyCode)}
                className="min-h-[40px] rounded-md border border-[#D6D3CB] bg-[#FAF9F6] px-3 py-1.5 font-mono text-xs font-medium text-[#111318] dark:border-[#2A3040] dark:bg-[#0B0D12] dark:text-[#F5F6F8]"
              >
                {CURRENCY_LIST.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({c.symbol.trim()})
                  </option>
                ))}
              </select>
            </div>

            {/* Dark / Light Mode Toggle */}
            <button
              type="button"
              onClick={onToggleDark}
              aria-pressed={isDark}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to nighttime dark mode'}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-md border border-[#D6D3CB] bg-[#FAF9F6] px-3.5 py-1.5 text-xs font-medium text-[#111318] hover:bg-[#EFECE4] transition-colors whitespace-nowrap shrink-0 dark:border-[#2A3040] dark:bg-[#0B0D12] dark:text-[#F5F6F8] dark:hover:bg-[#1B202C]"
            >
              {isDark ? (
                <>
                  <Sun className="h-4 w-4 text-[#F2D06B]" aria-hidden="true" />
                  <span>Day Mode</span>
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 text-[#374151]" aria-hidden="true" />
                  <span>Night Mode</span>
                </>
              )}
            </button>

            {/* Accessibility Display Controls */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowA11yMenu((prev) => !prev)}
                aria-expanded={showA11yMenu}
                aria-controls="a11y-popover"
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-md border border-[#D6D3CB] bg-[#FAF9F6] px-3.5 py-1.5 text-xs font-medium text-[#111318] hover:bg-[#EFECE4] transition-colors whitespace-nowrap shrink-0 dark:border-[#2A3040] dark:bg-[#0B0D12] dark:text-[#F5F6F8] dark:hover:bg-[#1B202C]"
              >
                <Eye className="h-4 w-4" aria-hidden="true" />
                <span>Accessibility</span>
              </button>

              {showA11yMenu && (
                <div
                  id="a11y-popover"
                  role="region"
                  aria-label="Accessibility preferences"
                  className="absolute right-0 z-30 mt-2 w-72 rounded-xl border border-[#D6D3CB] bg-white p-4 shadow-lg dark:border-[#2A3040] dark:bg-[#12151C]"
                >
                  <p className="text-sm font-semibold text-[#111318] dark:text-[#F5F6F8]">
                    WCAG Display Preferences
                  </p>
                  <div className="mt-3 space-y-3">
                    <label className="flex items-center justify-between gap-3 text-sm text-[#374151] dark:text-[#D1D5DB]">
                      <span>Larger Body Text (18px)</span>
                      <input
                        type="checkbox"
                        checked={accessibility.largeText}
                        onChange={(e) =>
                          onUpdateAccessibility({ ...accessibility, largeText: e.target.checked })
                        }
                        className="h-5 w-5 accent-[#111318] dark:accent-[#E5BE53]"
                      />
                    </label>
                    <label className="flex items-center justify-between gap-3 text-sm text-[#374151] dark:text-[#D1D5DB]">
                      <span>High Contrast Boost</span>
                      <input
                        type="checkbox"
                        checked={accessibility.highContrast}
                        onChange={(e) =>
                          onUpdateAccessibility({ ...accessibility, highContrast: e.target.checked })
                        }
                        className="h-5 w-5 accent-[#111318] dark:accent-[#E5BE53]"
                      />
                    </label>
                    <label className="flex items-center justify-between gap-3 text-sm text-[#374151] dark:text-[#D1D5DB]">
                      <span>Reduce Motion</span>
                      <input
                        type="checkbox"
                        checked={accessibility.reducedMotion}
                        onChange={(e) =>
                          onUpdateAccessibility({
                            ...accessibility,
                            reducedMotion: e.target.checked,
                          })
                        }
                        className="h-5 w-5 accent-[#111318] dark:accent-[#E5BE53]"
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* In-App PWA Install Button */}
            {!isInstalled && isInstallable && (
              <button
                type="button"
                onClick={install}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-md bg-[#111318] px-3.5 py-1.5 text-xs font-semibold text-[#F5D77F] hover:bg-[#1F2430] transition-colors whitespace-nowrap shrink-0 dark:bg-[#E5BE53] dark:text-[#0B0D12]"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                <span>Install App</span>
              </button>
            )}

            {!isInstalled && !isInstallable && isIOS && (
              <button
                type="button"
                onClick={() => setShowIOSGuide(true)}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-md border border-[#D6D3CB] px-3.5 py-1.5 text-xs font-medium text-[#111318] whitespace-nowrap shrink-0 dark:border-[#2A3040] dark:text-[#F5F6F8]"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                <span>Install on iOS</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {showIOSGuide && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="ios-install-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        >
          <div className="w-full max-w-sm rounded-xl border border-[#D6D3CB] bg-white p-6 dark:border-[#2A3040] dark:bg-[#12151C]">
            <h2 id="ios-install-title" className="font-display text-lg font-semibold text-[#111318] dark:text-white">
              Install Link Management Services
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#4B5563] dark:text-[#CBD5E1]">
              1. Tap the <strong>Share</strong> button in the Safari toolbar.
              <br />
              2. Scroll down and select <strong>Add to Home Screen</strong> for offline itinerary access.
            </p>
            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 min-h-[44px] w-full rounded-lg bg-[#111318] py-2.5 text-sm font-semibold text-[#F5D77F] dark:bg-[#E5BE53] dark:text-[#0B0D12]"
            >
              Close Guide
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
