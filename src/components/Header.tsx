import React, { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';

interface HeaderProps {
  onBookClick: () => void;
  onSelectSection: (sectionId: string) => void;
}

const NAV_LINKS = [
  { label: 'Services', href: '#services', id: 'services' },
  { label: 'Fleet', href: '#fleet', id: 'fleet' },
  { label: 'Corridors', href: '#corridors', id: 'corridors' },
  { label: 'Workspace', href: '#workspace', id: 'workspace' },
  { label: 'Privacy', href: '#workspace', id: 'privacy' },
];

export const Header: React.FC<HeaderProps> = ({ onBookClick, onSelectSection }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setMobileOpen(false);
    onSelectSection(id);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#E5E2DA] bg-[#FAF9F6]/95 backdrop-blur-sm dark:border-[#1E2330] dark:bg-[#090B0F]/95">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Zone 1: Single clean wordmark */}
        <a
          href="#top"
          className="font-display text-lg font-semibold tracking-tight text-[#111318] whitespace-nowrap shrink-0 dark:text-[#F5F6F8] sm:text-xl"
        >
          Link Management Services
        </a>

        {/* Zone 2: 5 concise single-line text nav links */}
        <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map((item) => (
            <a
              key={item.id}
              href={item.href}
              onClick={(e) => handleLinkClick(e, item.id)}
              className="text-sm font-medium text-[#374151] hover:text-[#111318] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 dark:text-[#CBD5E1] dark:hover:text-[#F2D06B]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: 1 primary CTA (+ mobile menu button) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onBookClick}
            className="hidden sm:inline-flex min-h-[40px] items-center justify-center rounded-lg bg-[#111318] px-5 py-2 text-sm font-semibold text-[#F5D77F] hover:bg-[#1F2430] transition-colors whitespace-nowrap shrink-0 dark:bg-[#E5BE53] dark:text-[#0B0D12] dark:hover:bg-[#F2D06B]"
          >
            Book Chauffeur
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation-drawer"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[#D6D3CB] text-[#111318] hover:bg-[#EFECE4] md:hidden dark:border-[#2A3040] dark:text-[#F5F6F8] dark:hover:bg-[#161A23]"
          >
            {mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          id="mobile-navigation-drawer"
          aria-label="Mobile navigation"
          className="border-t border-[#E5E2DA] bg-[#FAF9F6] px-4 py-4 md:hidden dark:border-[#1E2330] dark:bg-[#090B0F]"
        >
          <div className="flex flex-col gap-2">
            {NAV_LINKS.map((item) => (
              <a
                key={item.id}
                href={item.href}
                onClick={(e) => handleLinkClick(e, item.id)}
                className="flex min-h-[44px] items-center rounded-md px-3 text-base font-medium text-[#111318] hover:bg-[#EFECE4] dark:text-[#F5F6F8] dark:hover:bg-[#151922]"
              >
                {item.label}
              </a>
            ))}
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                onBookClick();
              }}
              className="mt-2 flex min-h-[44px] w-full items-center justify-center rounded-lg bg-[#111318] px-4 py-2.5 text-sm font-semibold text-[#F5D77F] dark:bg-[#E5BE53] dark:text-[#0B0D12]"
            >
              Book Chauffeur
            </button>
          </div>
        </nav>
      )}
    </header>
  );
};
