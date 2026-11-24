import type { AppView } from '../types';

interface FooterProps {
  onNavigate: (view: AppView, opts?: { authTab?: 'login' | 'register'; sectionId?: string }) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-start">
          <div className="max-w-sm">
            <div className="flex items-center gap-2 font-display text-lg font-bold tracking-tight text-zinc-900">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-5 w-5 text-[#C81E2E]"
                fill="currentColor"
              >
                <path d="M12 2.5C12 2.5 5 10.2 5 15a7 7 0 0 0 14 0c0-4.8-7-12.5-7-12.5Zm0 16.5a4 4 0 0 1-4-4c0-1.6 1.4-4 4-7.3 2.6 3.3 4 5.7 4 7.3a4 4 0 0 1-4 4Z" />
              </svg>
              <span>LifeDrop</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600">
              University Emergency Blood Donor Finder connecting patients, hospitals, and eligible,
              consenting donors across compatible blood groups.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
            <div>
              <h3 className="font-display font-semibold text-zinc-900">Directory</h3>
              <ul className="mt-3 space-y-2 text-zinc-600">
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate('find')}
                    className="hover:text-zinc-900"
                  >
                    Find Compatible Donors
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate('requests')}
                    className="hover:text-zinc-900"
                  >
                    Emergency Requests
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-display font-semibold text-zinc-900">Donors</h3>
              <ul className="mt-3 space-y-2 text-zinc-600">
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate('auth', { authTab: 'register' })}
                    className="hover:text-zinc-900"
                  >
                    Register as Donor
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate('auth', { authTab: 'login' })}
                    className="hover:text-zinc-900"
                  >
                    Donor Sign In
                  </button>
                </li>
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <h3 className="font-display font-semibold text-zinc-900">Location &amp; Safety</h3>
              <p className="mt-3 text-xs font-medium text-zinc-800">Bangalore, Karnataka</p>
              <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">
                Always verify blood typing and screening at a licensed hospital blood bank prior to
                transfusion.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-zinc-200 pt-6 text-xs text-zinc-500 sm:flex-row sm:items-center">
          <span>© 2026 LifeDrop · Bangalore, Karnataka · University Project</span>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/sumakdas14-gif/LifeDrop/archive/refs/heads/main.zip"
              className="font-medium text-[#C81E2E] hover:underline"
            >
              Download Project (.zip)
            </a>
            <span aria-hidden="true" className="text-zinc-300">
              ·
            </span>
            <span>24/7 Emergency Donor Coordination</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
