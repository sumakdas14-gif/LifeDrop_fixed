import { CheckCircle2, Clock, MapPin, Phone, Search, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { AppView, BloodGroup, DonorPublic, UrgencyLevel } from '../types';
import {
  BLOOD_GROUPS,
  COMPATIBLE_DONORS_FOR_RECIPIENT,
  getDonationEligibility,
} from '../types';

interface FindBloodPageProps {
  initialBloodGroup: BloodGroup | '';
  initialCity: string;
  currentDonor: DonorPublic | null;
  authToken: string | null;
  onRequestCreated: () => void;
  onNavigate: (view: AppView, opts?: { authTab?: 'login' | 'register' }) => void;
}

export function FindBloodPage({
  initialBloodGroup,
  initialCity,
  currentDonor,
  authToken,
  onRequestCreated,
  onNavigate,
}: FindBloodPageProps) {
  const [selectedGroup, setSelectedGroup] = useState<BloodGroup | ''>(initialBloodGroup);
  const [matchMode, setMatchMode] = useState<'compatible' | 'exact'>('compatible');
  const [cityFilter, setCityFilter] = useState(initialCity);
  const [availableOnly, setAvailableOnly] = useState(true);
  const [donors, setDonors] = useState<DonorPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Emergency request submission form state
  const [patientName, setPatientName] = useState('');
  const [reqBloodGroup, setReqBloodGroup] = useState<BloodGroup>(initialBloodGroup || 'O-');
  const [unitsNeeded, setUnitsNeeded] = useState(2);
  const [urgency, setUrgency] = useState<UrgencyLevel>('Critical');
  const [hospital, setHospital] = useState('');
  const [reqCity, setReqCity] = useState(initialCity || 'Bangalore, Karnataka');
  const [contactPhone, setContactPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [submittingReq, setSubmittingReq] = useState(false);
  const [reqFeedback, setReqFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    setSelectedGroup(initialBloodGroup);
    if (initialBloodGroup) setReqBloodGroup(initialBloodGroup);
  }, [initialBloodGroup]);

  useEffect(() => {
    setCityFilter(initialCity);
    if (initialCity) setReqCity(initialCity);
  }, [initialCity]);

  useEffect(() => {
    let active = true;
    const fetchDonors = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (selectedGroup) {
          params.set('bloodGroup', selectedGroup);
          params.set('mode', matchMode);
        }
        if (cityFilter.trim()) {
          params.set('city', cityFilter.trim());
        }
        if (availableOnly) {
          params.set('availableOnly', 'true');
        }

        const headers: HeadersInit = authToken ? { Authorization: `Bearer ${authToken}` } : {};
        const res = await fetch(`/api/donors?${params.toString()}`, { headers });
        if (!res.ok) throw new Error('Unable to load donor directory.');
        const data = (await res.json()) as { donors: DonorPublic[] };
        if (active) {
          setDonors(data.donors);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Unable to load donor directory.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    void fetchDonors();
    return () => {
      active = false;
    };
  }, [selectedGroup, matchMode, cityFilter, availableOnly, authToken]);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReq(true);
    setReqFeedback(null);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }

      const res = await fetch('/api/requests', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          patientName,
          bloodGroup: reqBloodGroup,
          unitsNeeded,
          urgency,
          hospital,
          city: reqCity,
          contactPhone,
          notes,
        }),
      });

      const payload = (await res.json()) as {
        error?: string;
        matchingAvailableDonors?: number;
      };

      if (!res.ok) {
        setReqFeedback({
          type: 'error',
          message: payload.error || 'Could not submit emergency request.',
        });
        return;
      }

      setReqFeedback({
        type: 'success',
        message: `Emergency request posted. ${payload.matchingAvailableDonors ?? 0} compatible donor${
          payload.matchingAvailableDonors === 1 ? '' : 's'
        } currently available.`,
      });
      setPatientName('');
      setHospital('');
      setContactPhone('');
      setNotes('');
      setSelectedGroup(reqBloodGroup);
      onRequestCreated();
    } catch {
      setReqFeedback({
        type: 'error',
        message: 'Network error while posting emergency request.',
      });
    } finally {
      setSubmittingReq(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="border-b border-zinc-200 pb-6">
        <p className="text-sm font-medium text-[#C81E2E]">Donor Directory &amp; Request Dispatch</p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-zinc-900">
          Find Compatible Blood Donors
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-600">
          Filter registered donors by patient blood group compatibility and city, or submit an
          emergency request to the active board.
        </p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        {/* Left: Donor Search & Results */}
        <div className="lg:col-span-7">
          <div className="rounded-xl border border-zinc-200 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <span className="text-xs font-medium text-zinc-600">Recipient Blood Group</span>
              <div className="flex items-center gap-1 rounded-lg bg-zinc-100 p-1">
                <button
                  type="button"
                  onClick={() => setMatchMode('compatible')}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    matchMode === 'compatible'
                      ? 'bg-white text-zinc-900 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  All Compatible
                </button>
                <button
                  type="button"
                  onClick={() => setMatchMode('exact')}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    matchMode === 'exact'
                      ? 'bg-white text-zinc-900 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  Exact Group Only
                </button>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedGroup('')}
                className={`min-h-10 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  selectedGroup === ''
                    ? 'bg-zinc-900 text-white'
                    : 'border border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                All Groups
              </button>
              {BLOOD_GROUPS.map((group) => (
                <button
                  key={group}
                  type="button"
                  onClick={() => setSelectedGroup(group)}
                  className={`min-h-10 min-w-11 rounded-lg px-3 py-1.5 font-mono text-xs font-semibold tabular-nums transition-colors ${
                    selectedGroup === group
                      ? 'bg-[#C81E2E] text-white'
                      : 'border border-zinc-200 bg-zinc-50 text-zinc-800 hover:bg-zinc-100'
                  }`}
                >
                  {group}
                </button>
              ))}
            </div>

            {selectedGroup && matchMode === 'compatible' && (
              <p className="mt-3 text-xs text-zinc-500">
                Showing donor blood groups compatible with{' '}
                <span className="font-mono font-semibold text-zinc-800">{selectedGroup}</span>:{' '}
                <span className="font-mono text-zinc-700">
                  {COMPATIBLE_DONORS_FOR_RECIPIENT[selectedGroup].join(', ')}
                </span>
              </p>
            )}

            <div className="mt-4 flex flex-col gap-3 border-t border-zinc-200 pt-4 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search
                  className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  placeholder="Filter by address (e.g. Bangalore, Karnataka)"
                  aria-label="Filter by city or address"
                  className="h-10 w-full rounded-lg border border-zinc-300 bg-white pr-3 pl-9 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#C81E2E] focus:outline-none"
                />
              </div>

              <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700">
                <input
                  type="checkbox"
                  checked={availableOnly}
                  onChange={(e) => setAvailableOnly(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-300 accent-[#C81E2E]"
                />
                <span>Available now only</span>
              </label>
            </div>
          </div>

          {/* Results List */}
          <div className="mt-5 space-y-3">
            {loading && (
              <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500">
                Loading compatible donors...
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                {error}
              </div>
            )}

            {!loading && !error && donors.length === 0 && (
              <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center">
                <p className="font-display text-base font-semibold text-zinc-900">
                  No matching donors found
                </p>
                <p className="mt-1 text-sm text-zinc-600">
                  Try switching to &ldquo;All Compatible&rdquo;, clearing the city filter, or
                  posting an emergency request on the right.
                </p>
              </div>
            )}

            {!loading &&
              !error &&
              donors.map((donor) => {
                const eligibility = getDonationEligibility(donor.lastDonationDate);
                return (
                  <div
                    key={donor.id}
                    className="flex flex-col justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-5 sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-10 w-12 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-[#FAFAFA] font-mono text-sm font-bold tabular-nums text-[#C81E2E]">
                          {donor.bloodGroup}
                        </span>
                        <div>
                          <h3 className="font-display text-base font-semibold text-zinc-900">
                            {donor.name}
                          </h3>
                          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-600">
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 text-zinc-400" aria-hidden="true" />
                              {donor.city}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="tabular-nums">
                              {donor.donationsCount} prior donation
                              {donor.donationsCount === 1 ? '' : 's'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                        {donor.available ? (
                          <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
                            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                            Available for emergency calls
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-medium text-zinc-500">
                            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                            Temporarily paused
                          </span>
                        )}
                        <span aria-hidden="true" className="text-zinc-300">
                          ·
                        </span>
                        <span className={eligibility.eligible ? 'text-zinc-600' : 'text-amber-700'}>
                          {eligibility.label}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 sm:text-right">
                      {currentDonor && donor.phone ? (
                        <a
                          href={`tel:${donor.phone.replace(/[^\d+]/g, '')}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3.5 py-2 font-mono text-xs font-medium tabular-nums text-zinc-900 hover:bg-zinc-50"
                        >
                          <Phone className="h-3.5 w-3.5 text-[#C81E2E]" aria-hidden="true" />
                          <span>{donor.phone}</span>
                        </a>
                      ) : (
                        <div className="text-xs text-zinc-500">
                          <p className="font-mono tabular-nums text-zinc-700">
                            Tel {donor.contactPreview}
                          </p>
                          <button
                            type="button"
                            onClick={() => onNavigate('auth', { authTab: 'login' })}
                            className="mt-1 font-medium text-[#C81E2E] hover:underline"
                          >
                            Sign in for full number
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Right: Emergency Blood Request Form */}
        <div className="lg:col-span-5">
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <div className="flex items-center gap-2 text-sm font-medium text-[#C81E2E]">
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
              <span>Submit Emergency Request</span>
            </div>
            <h2 className="mt-1 font-display text-xl font-bold text-zinc-900">
              Request Blood Units
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-zinc-600">
              Post a verified hospital or family request to notify eligible donors on the live
              requests board.
            </p>

            <form onSubmit={handleSubmitRequest} className="mt-5 space-y-4">
              <div>
                <label htmlFor="req-patient" className="block text-xs font-medium text-zinc-700">
                  Patient Name or Hospital Ward
                </label>
                <input
                  id="req-patient"
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. Surgical Ward 3 / A. Rivera"
                  className="mt-1 h-10 w-full rounded-lg border border-zinc-300 px-3 text-sm text-zinc-900 focus:border-[#C81E2E] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="req-group" className="block text-xs font-medium text-zinc-700">
                    Blood Group Needed
                  </label>
                  <select
                    id="req-group"
                    value={reqBloodGroup}
                    onChange={(e) => setReqBloodGroup(e.target.value as BloodGroup)}
                    className="mt-1 h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 font-mono text-sm text-zinc-900 focus:border-[#C81E2E] focus:outline-none"
                  >
                    {BLOOD_GROUPS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="req-units" className="block text-xs font-medium text-zinc-700">
                    Units Needed
                  </label>
                  <input
                    id="req-units"
                    type="number"
                    min={1}
                    max={10}
                    required
                    value={unitsNeeded}
                    onChange={(e) => setUnitsNeeded(Number(e.target.value))}
                    className="mt-1 h-10 w-full rounded-lg border border-zinc-300 px-3 font-mono text-sm tabular-nums text-zinc-900 focus:border-[#C81E2E] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="req-urgency" className="block text-xs font-medium text-zinc-700">
                  Urgency Level
                </label>
                <select
                  id="req-urgency"
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
                  className="mt-1 h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 focus:border-[#C81E2E] focus:outline-none"
                >
                  <option value="Critical">Critical (Immediate / Within 2 hours)</option>
                  <option value="Urgent">Urgent (Needed today)</option>
                  <option value="Scheduled">Scheduled (Within 48 hours)</option>
                </select>
              </div>

              <div>
                <label htmlFor="req-hospital" className="block text-xs font-medium text-zinc-700">
                  Hospital / Blood Bank
                </label>
                <input
                  id="req-hospital"
                  type="text"
                  required
                  value={hospital}
                  onChange={(e) => setHospital(e.target.value)}
                  placeholder="e.g. Victoria Hospital"
                  className="mt-1 h-10 w-full rounded-lg border border-zinc-300 px-3 text-sm text-zinc-900 focus:border-[#C81E2E] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="req-city" className="block text-xs font-medium text-zinc-700">
                    City / Address
                  </label>
                  <input
                    id="req-city"
                    type="text"
                    required
                    value={reqCity}
                    onChange={(e) => setReqCity(e.target.value)}
                    placeholder="Bangalore, Karnataka"
                    className="mt-1 h-10 w-full rounded-lg border border-zinc-300 px-3 text-sm text-zinc-900 focus:border-[#C81E2E] focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="req-phone" className="block text-xs font-medium text-zinc-700">
                    Contact Phone
                  </label>
                  <input
                    id="req-phone"
                    type="tel"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+91 98450 12345"
                    className="mt-1 h-10 w-full rounded-lg border border-zinc-300 px-3 text-sm text-zinc-900 focus:border-[#C81E2E] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="req-notes" className="block text-xs font-medium text-zinc-700">
                  Clinical / Blood Bank Instructions (Optional)
                </label>
                <textarea
                  id="req-notes"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ward floor, blood bank reference, or visiting hours"
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-[#C81E2E] focus:outline-none"
                />
              </div>

              {reqFeedback && (
                <div
                  role="status"
                  className={`rounded-lg border p-3 text-xs leading-relaxed ${
                    reqFeedback.type === 'success'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                      : 'border-red-200 bg-red-50 text-red-900'
                  }`}
                >
                  {reqFeedback.message}
                </div>
              )}

              <button
                type="submit"
                disabled={submittingReq}
                className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-[#C81E2E] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#A31624] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submittingReq ? 'Posting Request...' : 'Post Emergency Request'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
