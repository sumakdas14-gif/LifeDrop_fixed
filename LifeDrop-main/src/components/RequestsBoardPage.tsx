import { AlertCircle, CheckCircle2, Clock, MapPin, Phone, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { AppView, BloodGroup, DonorPublic, EmergencyRequest } from '../types';
import { BLOOD_GROUPS, canDonateTo } from '../types';

interface RequestsBoardPageProps {
  currentDonor: DonorPublic | null;
  authToken: string | null;
  refreshSignal: number;
  onNavigate: (view: AppView, opts?: { authTab?: 'login' | 'register' }) => void;
}

export function RequestsBoardPage({
  currentDonor,
  authToken,
  refreshSignal,
  onNavigate,
}: RequestsBoardPageProps) {
  const [requests, setRequests] = useState<EmergencyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'Open' | 'Fulfilled' | 'All'>('Open');
  const [groupFilter, setGroupFilter] = useState<BloodGroup | ''>('');
  const [actionMessage, setActionMessage] = useState<{
    id: string;
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/requests');
      if (res.ok) {
        const data = (await res.json()) as { requests: EmergencyRequest[] };
        setRequests(data.requests);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRequests();
  }, [refreshSignal]);

  const handlePledge = async (reqItem: EmergencyRequest) => {
    if (!currentDonor || !authToken) {
      onNavigate('auth', { authTab: 'login' });
      return;
    }

    setActionMessage(null);
    try {
      const res = await fetch(`/api/requests/${reqItem.id}/pledge`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const payload = (await res.json()) as { error?: string; request?: EmergencyRequest };
      if (!res.ok) {
        setActionMessage({
          id: reqItem.id,
          type: 'error',
          text: payload.error || 'Could not record pledge.',
        });
        return;
      }
      if (payload.request) {
        setRequests((prev) =>
          prev.map((item) => (item.id === payload.request!.id ? payload.request! : item))
        );
      }
      setActionMessage({
        id: reqItem.id,
        type: 'success',
        text: 'Thank you. Your pledge has been recorded on this emergency request.',
      });
    } catch {
      setActionMessage({
        id: reqItem.id,
        type: 'error',
        text: 'Network error while recording pledge.',
      });
    }
  };

  const handleFulfill = async (reqId: string) => {
    if (!authToken) return;
    setActionMessage(null);
    try {
      const res = await fetch(`/api/requests/${reqId}/fulfill`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const payload = (await res.json()) as { error?: string; request?: EmergencyRequest };
      if (!res.ok) {
        setActionMessage({
          id: reqId,
          type: 'error',
          text: payload.error || 'Unable to close this request.',
        });
        return;
      }
      if (payload.request) {
        setRequests((prev) =>
          prev.map((item) => (item.id === payload.request!.id ? payload.request! : item))
        );
      }
    } catch {
      setActionMessage({
        id: reqId,
        type: 'error',
        text: 'Network error while updating request.',
      });
    }
  };

  const filtered = requests.filter((reqItem) => {
    if (statusFilter !== 'All' && reqItem.status !== statusFilter) return false;
    if (groupFilter && reqItem.bloodGroup !== groupFilter) return false;
    return true;
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 border-b border-zinc-200 pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-[#C81E2E]">Live Emergency Dispatch</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-zinc-900">
            Emergency Blood Requests
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-600">
            Active blood needs submitted by hospitals, clinics, and families. Registered compatible
            donors can pledge directly.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('find')}
          className="inline-flex h-10 shrink-0 items-center whitespace-nowrap rounded-lg bg-[#C81E2E] px-4 text-sm font-semibold text-white hover:bg-[#A31624]"
        >
          Post New Request
        </button>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-col justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-1 rounded-lg bg-zinc-100 p-1 self-start">
          {(['Open', 'Fulfilled', 'All'] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setGroupFilter('')}
            className={`rounded-md px-2.5 py-1.5 text-xs font-medium ${
              groupFilter === ''
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
              onClick={() => setGroupFilter(group)}
              className={`rounded-md px-2.5 py-1.5 font-mono text-xs font-semibold tabular-nums ${
                groupFilter === group
                  ? 'bg-[#C81E2E] text-white'
                  : 'border border-zinc-200 bg-zinc-50 text-zinc-800 hover:bg-zinc-100'
              }`}
            >
              {group}
            </button>
          ))}
        </div>
      </div>

      {/* Requests Grid */}
      <div className="mt-6 space-y-4">
        {loading && (
          <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500">
            Loading emergency requests...
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center">
            <p className="font-display text-base font-semibold text-zinc-900">
              No requests match the selected filters
            </p>
            <p className="mt-1 text-sm text-zinc-600">
              Adjust your blood group or status filter to view other emergency requests.
            </p>
          </div>
        )}

        {!loading &&
          filtered.map((item) => {
            const isCompatible = currentDonor
              ? canDonateTo(currentDonor.bloodGroup, item.bloodGroup)
              : null;
            const alreadyPledged = currentDonor
              ? item.pledgedDonorIds.includes(currentDonor.id)
              : false;
            const isOwner = Boolean(
              currentDonor && item.createdByDonorId && item.createdByDonorId === currentDonor.id
            );

            return (
              <article
                key={item.id}
                className="rounded-xl border border-zinc-200 bg-white p-6"
              >
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                      <span
                        className={`inline-flex items-center gap-1 font-semibold ${
                          item.urgency === 'Critical'
                            ? 'text-[#C81E2E]'
                            : item.urgency === 'Urgent'
                              ? 'text-amber-700'
                              : 'text-zinc-700'
                        }`}
                      >
                        <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                        {item.urgency} Priority
                      </span>
                      <span aria-hidden="true" className="text-zinc-300">
                        ·
                      </span>
                      <span className="inline-flex items-center gap-1 text-zinc-600">
                        <Clock className="h-3.5 w-3.5 text-zinc-400" aria-hidden="true" />
                        {new Date(item.createdAt).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span aria-hidden="true" className="text-zinc-300">
                        ·
                      </span>
                      <span
                        className={`font-medium ${
                          item.status === 'Open' ? 'text-emerald-700' : 'text-zinc-500'
                        }`}
                      >
                        {item.status === 'Open' ? 'Open Request' : 'Fulfilled'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-baseline gap-3">
                      <span className="font-mono text-2xl font-bold tabular-nums text-[#C81E2E]">
                        {item.bloodGroup}
                      </span>
                      <h2 className="font-display text-lg font-semibold text-zinc-900">
                        {item.patientName} — {item.unitsNeeded} unit
                        {item.unitsNeeded === 1 ? '' : 's'} needed
                      </h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-600">
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-zinc-400" aria-hidden="true" />
                        {item.hospital}, {item.city}
                      </span>
                      <span className="inline-flex items-center gap-1.5 font-mono text-xs tabular-nums text-zinc-700">
                        <Phone className="h-3.5 w-3.5 text-zinc-400" aria-hidden="true" />
                        {item.contactPhone}
                      </span>
                    </div>

                    {item.notes && (
                      <p className="pt-1 text-sm leading-relaxed text-zinc-600">{item.notes}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-zinc-600">
                      <Users className="h-3.5 w-3.5 text-zinc-400" aria-hidden="true" />
                      <span className="tabular-nums">
                        {item.pledgedDonorIds.length} donor
                        {item.pledgedDonorIds.length === 1 ? '' : 's'} pledged
                        {item.pledgedDonorNames.length > 0
                          ? `: ${item.pledgedDonorNames.join(', ')}`
                          : ''}
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col items-start gap-2 lg:items-end">
                    {item.status === 'Open' && (
                      <>
                        {!currentDonor ? (
                          <button
                            type="button"
                            onClick={() => onNavigate('auth', { authTab: 'login' })}
                            className="inline-flex h-10 items-center whitespace-nowrap rounded-lg bg-[#C81E2E] px-4 text-xs font-semibold text-white hover:bg-[#A31624]"
                          >
                            Sign In to Pledge
                          </button>
                        ) : alreadyPledged ? (
                          <span className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 text-xs font-semibold text-emerald-800">
                            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                            You Pledged
                          </span>
                        ) : isCompatible ? (
                          <button
                            type="button"
                            onClick={() => handlePledge(item)}
                            className="inline-flex h-10 items-center whitespace-nowrap rounded-lg bg-[#C81E2E] px-4 text-xs font-semibold text-white hover:bg-[#A31624]"
                          >
                            Pledge to Donate ({currentDonor.bloodGroup})
                          </button>
                        ) : (
                          <span className="text-xs text-zinc-500">
                            Your group ({currentDonor.bloodGroup}) is not compatible
                          </span>
                        )}

                        {isOwner && (
                          <button
                            type="button"
                            onClick={() => handleFulfill(item.id)}
                            className="text-xs font-medium text-zinc-600 underline hover:text-zinc-900"
                          >
                            Mark as Fulfilled
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {actionMessage && actionMessage.id === item.id && (
                  <div
                    role="status"
                    className={`mt-4 rounded-lg border p-3 text-xs ${
                      actionMessage.type === 'success'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                        : 'border-red-200 bg-red-50 text-red-900'
                    }`}
                  >
                    {actionMessage.text}
                  </div>
                )}
              </article>
            );
          })}
      </div>
    </div>
  );
}
