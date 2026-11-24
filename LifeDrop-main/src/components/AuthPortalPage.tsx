import { useEffect, useState } from 'react';
import type { BloodGroup, DonorPublic } from '../types';
import { BLOOD_GROUPS } from '../types';

interface AuthPortalPageProps {
  initialTab: 'login' | 'register';
  onAuthSuccess: (token: string, donor: DonorPublic) => void;
}

export function AuthPortalPage({ initialTab, onAuthSuccess }: AuthPortalPageProps) {
  const [tab, setTab] = useState<'login' | 'register'>(initialTab);

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O+');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [lastDonationDate, setLastDonationDate] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTab(initialTab);
    setError(null);
  }, [initialTab]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const payload = (await res.json()) as {
        error?: string;
        token?: string;
        donor?: DonorPublic;
      };
      if (!res.ok || !payload.token || !payload.donor) {
        setError(payload.error || 'Unable to sign in.');
        return;
      }
      onAuthSuccess(payload.token, payload.donor);
    } catch {
      setError('Network error while signing in.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          bloodGroup,
          city,
          phone,
          lastDonationDate: lastDonationDate || null,
          consentGiven,
        }),
      });
      const payload = (await res.json()) as {
        error?: string;
        token?: string;
        donor?: DonorPublic;
      };
      if (!res.ok || !payload.token || !payload.donor) {
        setError(payload.error || 'Could not complete donor registration.');
        return;
      }
      onAuthSuccess(payload.token, payload.donor);
    } catch {
      setError('Network error while registering donor account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
      <div className="rounded-xl border border-zinc-200 bg-white p-6 sm:p-8">
        <div className="flex items-center gap-1 rounded-lg bg-zinc-100 p-1">
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setError(null);
            }}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              tab === 'register'
                ? 'bg-white text-zinc-900 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Become a Donor
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setError(null);
            }}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              tab === 'login'
                ? 'bg-white text-zinc-900 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Donor Sign In
          </button>
        </div>

        {tab === 'login' ? (
          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <h1 className="font-display text-2xl font-bold text-zinc-900">
                Sign In to Your Donor Portal
              </h1>
              <p className="mt-1 text-sm text-zinc-600">
                Update your emergency availability, view compatible requests, and manage your
                contact details.
              </p>
            </div>

            <div>
              <label htmlFor="login-email" className="block text-xs font-medium text-zinc-700">
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="you@university.edu"
                className="mt-1 h-10 w-full rounded-lg border border-zinc-300 px-3 text-sm text-zinc-900 focus:border-[#C81E2E] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="block text-xs font-medium text-zinc-700">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter your password"
                className="mt-1 h-10 w-full rounded-lg border border-zinc-300 px-3 text-sm text-zinc-900 focus:border-[#C81E2E] focus:outline-none"
              />
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-900"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-[#C81E2E] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#A31624] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="mt-6 space-y-4">
            <div>
              <h1 className="font-display text-2xl font-bold text-zinc-900">
                Register as a Blood Donor
              </h1>
              <p className="mt-1 text-sm text-zinc-600">
                Join the emergency donor directory. Your contact information is saved securely and
                only visible to authenticated coordinators.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="reg-name" className="block text-xs font-medium text-zinc-700">
                  Full Name
                </label>
                <input
                  id="reg-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Morgan"
                  className="mt-1 h-10 w-full rounded-lg border border-zinc-300 px-3 text-sm text-zinc-900 focus:border-[#C81E2E] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="reg-email" className="block text-xs font-medium text-zinc-700">
                  Email Address
                </label>
                <input
                  id="reg-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@university.edu"
                  className="mt-1 h-10 w-full rounded-lg border border-zinc-300 px-3 text-sm text-zinc-900 focus:border-[#C81E2E] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="reg-password" className="block text-xs font-medium text-zinc-700">
                  Password (8+ characters)
                </label>
                <input
                  id="reg-password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="mt-1 h-10 w-full rounded-lg border border-zinc-300 px-3 text-sm text-zinc-900 focus:border-[#C81E2E] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="reg-blood" className="block text-xs font-medium text-zinc-700">
                  Blood Group
                </label>
                <select
                  id="reg-blood"
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                  className="mt-1 h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 font-mono text-sm text-zinc-900 focus:border-[#C81E2E] focus:outline-none"
                >
                  {BLOOD_GROUPS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="reg-city" className="block text-xs font-medium text-zinc-700">
                  Address (City, State)
                </label>
                <input
                  id="reg-city"
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Bangalore, Karnataka"
                  className="mt-1 h-10 w-full rounded-lg border border-zinc-300 px-3 text-sm text-zinc-900 focus:border-[#C81E2E] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="reg-phone" className="block text-xs font-medium text-zinc-700">
                  Phone Number
                </label>
                <input
                  id="reg-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98450 12345"
                  className="mt-1 h-10 w-full rounded-lg border border-zinc-300 px-3 text-sm text-zinc-900 focus:border-[#C81E2E] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-last-date" className="block text-xs font-medium text-zinc-700">
                Last Whole-Blood Donation Date (Optional)
              </label>
              <input
                id="reg-last-date"
                type="date"
                value={lastDonationDate}
                onChange={(e) => setLastDonationDate(e.target.value)}
                className="mt-1 h-10 w-full rounded-lg border border-zinc-300 px-3 text-sm text-zinc-900 focus:border-[#C81E2E] focus:outline-none"
              />
            </div>

            <label className="flex cursor-pointer items-start gap-2.5 pt-1 text-xs leading-relaxed text-zinc-600">
              <input
                type="checkbox"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-zinc-300 accent-[#C81E2E]"
              />
              <span>
                I consent to list my blood group, city, and emergency availability on LifeDrop so
                patients and medical coordinators can contact me during urgent blood requests.
              </span>
            </label>

            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-900"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-[#C81E2E] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#A31624] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Creating Donor Account...' : 'Create Donor Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
