import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import type { AppView, DonorPublic } from '../types';

interface NavbarProps {
  currentView: AppView;
  currentDonor: DonorPublic | null;
  onNavigate: (view: AppView, opts?: { authTab?: 'login' | 'register'; sectionId?: string }) => void;
}

export function Navbar({ currentView, currentDonor, onNavigate }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (view: AppView, opts?: { authTab?: 'login' | 'register'; sectionId?: string }) => {
    setMobileMenuOpen(false);
    onNavigate(view, opts);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            handleNav('home');
          }}
          className="flex shrink-0 items-center gap-2 whitespace-nowrap font-display text-lg font-bold tracking-tight text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C81E2E]"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-5 w-5 text-[#C81E2E]"
            fill="currentColor"
          >
            <path d="M12 2.5C12 2.5 5 10.2 5 15a7 7 0 0 0 14 0c0-4.8-7-12.5-7-12.5Zm0 16.5a4 4 0 0 1-4-4c0-1.6 1.4-4 4-7.3 2.6 3.3 4 5.7 4 7.3a4 4 0 0 1-4 4Z" />
          </svg>
          <span>LifeDrop</span>
        </a>

        {/* Zone 2: Concise single-line navigation links */}
        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-7 text-sm font-medium text-zinc-600 md:flex"
        >
          <button
            type="button"
            onClick={() => handleNav('home')}
            className={`shrink-0 whitespace-nowrap py-1 transition-colors hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C81E2E] ${
              currentView === 'home' ? 'border-b-2 border-[#C81E2E] text-zinc-900' : ''
            }`}
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => handleNav('find')}
            className={`shrink-0 whitespace-nowrap py-1 transition-colors hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C81E2E] ${
              currentView === 'find' ? 'border-b-2 border-[#C81E2E] text-zinc-900' : ''
            }`}
          >
            Find Blood
          </button>
          <button
            type="button"
            onClick={() => handleNav('requests')}
            className={`shrink-0 whitespace-nowrap py-1 transition-colors hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C81E2E] ${
              currentView === 'requests' ? 'border-b-2 border-[#C81E2E] text-zinc-900' : ''
            }`}
          >
            Requests
          </button>
          <button
            type="button"
            onClick={() => handleNav('home', { sectionId: 'how-it-works' })}
            className="shrink-0 whitespace-nowrap py-1 transition-colors hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C81E2E]"
          >
            How It Works
          </button>
          {!currentDonor && (
            <button
              type="button"
              onClick={() => handleNav('auth', { authTab: 'login' })}
              className={`shrink-0 whitespace-nowrap py-1 transition-colors hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C81E2E] ${
                currentView === 'auth' ? 'border-b-2 border-[#C81E2E] text-zinc-900' : ''
              }`}
            >
              Sign In
            </button>
          )}
        </nav>

        {/* Zone 3: Single primary action button */}
        <div className="flex shrink-0 items-center gap-3">
          {currentDonor ? (
            <button
              type="button"
              onClick={() => handleNav('dashboard')}
              className="hidden shrink-0 whitespace-nowrap rounded-lg bg-[#C81E2E] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#A31624] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C81E2E] md:inline-flex"
            >
              Donor Portal
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleNav('auth', { authTab: 'register' })}
              className="hidden shrink-0 whitespace-nowrap rounded-lg bg-[#C81E2E] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#A31624] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C81E2E] md:inline-flex"
            >
              Become a Donor
            </button>
          )}

          <button
            type="button"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-50 md:hidden"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-zinc-200 bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => handleNav('home')}
              className="min-h-11 rounded-lg px-3 py-2 text-left text-sm font-medium text-zinc-800 hover:bg-zinc-50"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => handleNav('find')}
              className="min-h-11 rounded-lg px-3 py-2 text-left text-sm font-medium text-zinc-800 hover:bg-zinc-50"
            >
              Find Blood
            </button>
            <button
              type="button"
              onClick={() => handleNav('requests')}
              className="min-h-11 rounded-lg px-3 py-2 text-left text-sm font-medium text-zinc-800 hover:bg-zinc-50"
            >
              Emergency Requests
            </button>
            <button
              type="button"
              onClick={() => handleNav('home', { sectionId: 'how-it-works' })}
              className="min-h-11 rounded-lg px-3 py-2 text-left text-sm font-medium text-zinc-800 hover:bg-zinc-50"
            >
              How It Works
            </button>
            {currentDonor ? (
              <button
                type="button"
                onClick={() => handleNav('dashboard')}
                className="mt-1 min-h-11 rounded-lg bg-[#C81E2E] px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-[#A31624]"
              >
                Donor Portal
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handleNav('auth', { authTab: 'login' })}
                  className="min-h-11 rounded-lg px-3 py-2 text-left text-sm font-medium text-zinc-800 hover:bg-zinc-50"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => handleNav('auth', { authTab: 'register' })}
                  className="mt-1 min-h-11 rounded-lg bg-[#C81E2E] px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-[#A31624]"
                >
                  Become a Donor
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
