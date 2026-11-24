import { CheckCircle2, Clock, LogOut, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { AppView, DonorPublic, EmergencyRequest } from '../types';
import { canDonateTo, getDonationEligibility } from '../types';

interface DonorDashboardPageProps {
  donor: DonorPublic;
  authToken: string;
  onDonorUpdated: (donor: DonorPublic) => void;
  onLogout: () => void;
  onNavigate: (view: AppView) => void;
}

export function DonorDashboardPage({
  donor,
  authToken,
  onDonorUpdated,
  onLogout,
  onNavigate,
}: DonorDashboardPageProps) {
  const [city, setCity] = useState(donor.city);
  const [phone, setPhone] = useState(donor.phone || '');
  const [lastDonationDate, setLastDonationDate] = useState(donor.lastDonationDate || '');
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );
  const [compatibleRequests, setCompatibleRequests] = useState<EmergencyRequest[]>([]);

  useEffect(() => {
    setCity(donor.city);
    setPhone(donor.phone || '');
    setLastDonationDate(donor.lastDonationDate || '');
  }, [donor]);

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/requests');
      if (res.ok) {
        const data = (await res.json()) as { requests: EmergencyRequest[] };
        setCompatibleRequests(
          data.requests.filter(
            (r) => r.status === 'Open' && canDonateTo(donor.bloodGroup, r.bloodGroup)
          )
        );
      }
    };
    void load();
  }, [donor.bloodGroup]);

  const eligibility = getDonationEligibility(donor.lastDonationDate);

  const handleToggleAvailability = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/donors/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ available: !donor.available }),
      });
      const payload = (await res.json()) as { error?: string; donor?: DonorPublic };
      if (!res.ok || !payload.donor) {
        setFeedback({ type: 'error', text: payload.error || 'Could not update availability.' });
        return;
      }
      onDonorUpdated(payload.donor);
      setFeedback({
        type: 'success',
        text: payload.donor.available
          ? 'You are now listed as available for emergency blood requests.'
          : 'Your listing is now paused.',
      });
    } catch {
      setFeedback({ type: 'error', text: 'Network error while updating status.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/donors/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          city,
          phone,
          lastDonationDate: lastDonationDate || null,
        }),
      });
      const payload = (await res.json()) as { error?: string; donor?: DonorPublic };
      if (!res.ok || !payload.donor) {
        setFeedback({ type: 'error', text: payload.error || 'Could not save profile updates.' });
        return;
      }
      onDonorUpdated(payload.donor);
      setFeedback({ type: 'success', text: 'Donor profile updated successfully.' });
    } catch {
      setFeedback({ type: 'error', text: 'Network error while saving profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/donors/me', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (res.ok) {
        onLogout();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 border-b border-zinc-200 pb-6 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-[#C81E2E]">
            Donor Portal · Blood Group{' '}
            <span className="font-mono font-bold">{donor.bloodGroup}</span>
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-zinc-900">
            Welcome, {donor.name}
          </h1>
          <p className="mt-1 text-xs text-zinc-600">{eligibility.label}</p>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="inline-flex h-10 shrink-0 items-center gap-2 self-start rounded-lg border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-700 hover:bg-zinc-50 sm:self-auto"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        {/* Profile & Availability Controls */}
        <div className="space-y-6 lg:col-span-6">
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <h2 className="font-display text-lg font-semibold text-zinc-900">
              Emergency Availability
            </h2>
            <p className="mt-1 text-sm text-zinc-600">
              Control whether your profile appears in active emergency donor searches.
            </p>

            <div className="mt-4 flex items-center justify-between gap-4 rounded-lg border border-zinc-200 bg-[#FAFAFA] p-4">
              <div className="flex items-center gap-2.5">
                {donor.available ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-700" aria-hidden="true" />
                ) : (
                  <Clock className="h-5 w-5 text-zinc-500" aria-hidden="true" />
                )}
                <div>
                  <p className="text-sm font-semibold text-zinc-900">
                    {donor.available ? 'Available for Emergencies' : 'Availability Paused'}
                  </p>
                  <p className="text-xs text-zinc-600">
                    {donor.available
                      ? 'Visible to compatible requests'
                      : 'Hidden from active searches'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={saving}
                onClick={handleToggleAvailability}
                className={`h-9 shrink-0 rounded-lg px-4 text-xs font-semibold transition-colors ${
                  donor.available
                    ? 'border border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50'
                    : 'bg-[#C81E2E] text-white hover:bg-[#A31624]'
                }`}
              >
                {donor.available ? 'Pause Listing' : 'Go Available'}
              </button>
            </div>
          </div>

          <form
            onSubmit={handleSaveProfile}
            className="rounded-xl border border-zinc-200 bg-white p-6"
          >
            <h2 className="font-display text-lg font-semibold text-zinc-900">
              Update Contact &amp; Donation Details
            </h2>

            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="dash-city" className="block text-xs font-medium text-zinc-700">
                  City or Campus Area
                </label>
                <input
                  id="dash-city"
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="mt-1 h-10 w-full rounded-lg border border-zinc-300 px-3 text-sm text-zinc-900 focus:border-[#C81E2E] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="dash-phone" className="block text-xs font-medium text-zinc-700">
                  Phone Number
                </label>
                <input
                  id="dash-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 h-10 w-full rounded-lg border border-zinc-300 px-3 text-sm text-zinc-900 focus:border-[#C81E2E] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="dash-date" className="block text-xs font-medium text-zinc-700">
                  Last Donation Date
                </label>
                <input
                  id="dash-date"
                  type="date"
                  value={lastDonationDate}
                  onChange={(e) => setLastDonationDate(e.target.value)}
                  className="mt-1 h-10 w-full rounded-lg border border-zinc-300 px-3 text-sm text-zinc-900 focus:border-[#C81E2E] focus:outline-none"
                />
              </div>
            </div>

            {feedback && (
              <div
                role="status"
                className={`mt-4 rounded-lg border p-3 text-xs ${
                  feedback.type === 'success'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                    : 'border-red-200 bg-red-50 text-red-900'
                }`}
              >
                {feedback.text}
              </div>
            )}

            <div className="mt-5 flex items-center justify-between gap-4">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-10 items-center rounded-lg bg-zinc-900 px-5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>

              {!confirmDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-red-700"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Remove Account</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    className="rounded-md bg-red-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-800"
                  >
                    Confirm Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="text-xs text-zinc-600 hover:text-zinc-900"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Compatible Open Emergency Requests */}
        <div className="lg:col-span-6">
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-lg font-semibold text-zinc-900">
                  Requests Matching Your Blood Group ({donor.bloodGroup})
                </h2>
                <p className="mt-1 text-xs text-zinc-600">
                  Open emergency requests compatible with your blood type.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('requests')}
                className="shrink-0 text-xs font-semibold text-[#C81E2E] hover:underline"
              >
                View All →
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {compatibleRequests.length === 0 ? (
                <p className="rounded-lg border border-zinc-200 bg-[#FAFAFA] p-5 text-sm text-zinc-600">
                  There are currently no open emergency requests matching {donor.bloodGroup}.
                </p>
              ) : (
                compatibleRequests.map((req) => (
                  <div
                    key={req.id}
                    className="rounded-lg border border-zinc-200 bg-[#FAFAFA] p-4"
                  >
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-[#C81E2E]">{req.urgency} Priority</span>
                      <span className="font-mono font-semibold text-zinc-800">
                        Needs {req.bloodGroup} · {req.unitsNeeded} unit
                        {req.unitsNeeded === 1 ? '' : 's'}
                      </span>
                    </div>
                    <p className="mt-1.5 font-display text-sm font-semibold text-zinc-900">
                      {req.hospital} ({req.city})
                    </p>
                    <p className="mt-1 text-xs text-zinc-600">{req.patientName}</p>
                    <button
                      type="button"
                      onClick={() => onNavigate('requests')}
                      className="mt-3 text-xs font-semibold text-[#C81E2E] hover:underline"
                    >
                      Open Request Board to Pledge →
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
