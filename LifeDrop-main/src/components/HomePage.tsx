import { ArrowRight, Search } from 'lucide-react';
import { useState } from 'react';
import type { AppView, BloodGroup } from '../types';
import { BLOOD_GROUPS, COMPATIBLE_DONORS_FOR_RECIPIENT } from '../types';
import { ImageWithFallback } from './ImageWithFallback';
import heroImage from '../assets/images/lifedrop_hero_clinic_1795506487219.jpg';
import communityImage from '../assets/images/lifedrop_community_drive_1795506486926.jpg';

interface HomePageProps {
  stats: {
    totalDonors: number;
    availableDonors: number;
    openRequests: number;
  };
  onNavigate: (
    view: AppView,
    opts?: {
      authTab?: 'login' | 'register';
      sectionId?: string;
      prefillBloodGroup?: BloodGroup | '';
      prefillCity?: string;
    }
  ) => void;
}

export function HomePage({ stats, onNavigate }: HomePageProps) {
  const [quickGroup, setQuickGroup] = useState<BloodGroup>('O+');
  const [quickCity, setQuickCity] = useState('');
  const [selectedMatrixGroup, setSelectedMatrixGroup] = useState<BloodGroup>('A+');

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('find', {
      prefillBloodGroup: quickGroup,
      prefillCity: quickCity.trim(),
    });
  };

  const compatibleForSelected = COMPATIBLE_DONORS_FOR_RECIPIENT[selectedMatrixGroup];

  return (
    <div>
      {/* Hero Section */}
      <section id="home" className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="grid items-stretch gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="flex flex-col justify-center lg:col-span-7">
              <p className="text-sm font-medium tracking-wide text-[#C81E2E]">
                Every Drop Counts · Emergency Blood Donor Network
              </p>

              <h1 className="mt-4 max-w-2xl font-display text-[clamp(2.25rem,4vw,3.75rem)] font-bold leading-[1.08] tracking-tight text-zinc-900 text-balance">
                Your One Donation{' '}
                <span className="text-[#C81E2E]">Can Save a Life.</span>
              </h1>

              <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-600 sm:text-lg">
                Find compatible, consenting blood donors near you during medical emergencies.
                Connect hospitals, families, and registered volunteer donors without delay.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => onNavigate('find')}
                  className="inline-flex min-h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-[#C81E2E] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#A31624] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C81E2E]"
                >
                  <span>Find Blood Now</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('auth', { authTab: 'register' })}
                  className="inline-flex min-h-11 shrink-0 items-center whitespace-nowrap rounded-lg border border-zinc-300 bg-white px-6 py-3 text-sm font-semibold text-zinc-800 transition-colors hover:border-zinc-400 hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-700"
                >
                  Become a Donor
                </button>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative h-72 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 sm:h-88 lg:h-full lg:min-h-[380px]">
                <ImageWithFallback
                  src={heroImage}
                  alt="Nurse assisting a blood donor inside a sunlit community blood donation clinic"
                  fallbackTitle="Community Blood Donation Clinic"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 text-white">
                  <p className="font-display text-lg font-semibold">Be Someone&apos;s Hero</p>
                  <p className="mt-1 text-sm text-zinc-200">
                    One whole-blood donation can help up to three patients in emergency care.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 4-column metric strip below hero split */}
          <div className="mt-12 grid grid-cols-2 gap-6 border-t border-zinc-200 pt-8 sm:grid-cols-4">
            <div>
              <p className="font-mono text-2xl font-semibold tabular-nums text-zinc-900">24/7</p>
              <p className="mt-1 text-sm text-zinc-600">Emergency Access</p>
            </div>
            <div>
              <p className="font-mono text-2xl font-semibold tabular-nums text-zinc-900">8</p>
              <p className="mt-1 text-sm text-zinc-600">Blood Groups Matched</p>
            </div>
            <div>
              <p className="font-mono text-2xl font-semibold tabular-nums text-[#C81E2E]">
                {stats.availableDonors}
              </p>
              <p className="mt-1 text-sm text-zinc-600">Available Donors Online</p>
            </div>
            <div>
              <p className="font-mono text-2xl font-semibold tabular-nums text-zinc-900">
                {stats.openRequests}
              </p>
              <p className="mt-1 text-sm text-zinc-600">Active Blood Requests</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Donor Finder Strip */}
      <section className="border-b border-zinc-200 bg-[#FAFAFA] py-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <form
            onSubmit={handleQuickSearch}
            className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-5 sm:p-6 lg:flex-row lg:items-end"
          >
            <div className="flex-1">
              <label
                htmlFor="quick-blood-group"
                className="block text-xs font-medium text-zinc-600"
              >
                Patient Blood Group Needed
              </label>
              <div className="mt-2 flex flex-wrap gap-1.5" id="quick-blood-group">
                {BLOOD_GROUPS.map((group) => (
                  <button
                    key={group}
                    type="button"
                    onClick={() => setQuickGroup(group)}
                    className={`min-h-10 min-w-12 rounded-lg px-3 py-2 font-mono text-sm font-semibold tabular-nums transition-colors ${
                      quickGroup === group
                        ? 'bg-[#C81E2E] text-white'
                        : 'border border-zinc-200 bg-zinc-50 text-zinc-800 hover:bg-zinc-100'
                    }`}
                  >
                    {group}
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:w-64">
              <label htmlFor="quick-city" className="block text-xs font-medium text-zinc-600">
                City or Area (Address)
              </label>
              <input
                id="quick-city"
                type="text"
                value={quickCity}
                onChange={(e) => setQuickCity(e.target.value)}
                placeholder="e.g. Bangalore, Karnataka"
                className="mt-2 h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#C81E2E] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-zinc-900 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              <span>Search Compatible Donors</span>
            </button>
          </form>
        </div>
      </section>

      {/* About LifeDrop (Asymmetric Editorial Section) */}
      <section id="about" className="border-b border-zinc-200 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-6">
              <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
                <ImageWithFallback
                  src={communityImage}
                  alt="University campus health and blood donation check-in desk"
                  fallbackTitle="Campus Health & Donation Center"
                  className="aspect-video w-full object-cover"
                />
              </div>
            </div>

            <div className="lg:col-span-6">
              <p className="text-sm font-medium text-[#C81E2E]">About LifeDrop</p>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-zinc-900 text-balance">
                Connecting Donors With Those in Urgent Need
              </h2>
              <p className="mt-3 text-base leading-relaxed text-zinc-600">
                Built to bridge the gap between emergency departments, families, and local
                registered volunteers with transparent compatibility matching.
              </p>

              <div className="mt-8 divide-y divide-zinc-200 border-t border-zinc-200">
                <div className="py-4">
                  <h3 className="font-display text-base font-semibold text-zinc-900">
                    01. Compatible Blood Group Matching
                  </h3>
                  <p className="mt-1 text-sm text-zinc-600">
                    Automatically surfaces both exact-type and medically compatible ABO/Rh donors
                    for every emergency search.
                  </p>
                </div>
                <div className="py-4">
                  <h3 className="font-display text-base font-semibold text-zinc-900">
                    02. Nearby Campus &amp; City Connections
                  </h3>
                  <p className="mt-1 text-sm text-zinc-600">
                    Filter available donors by neighborhood, campus district, or hospital area for
                    faster response times.
                  </p>
                </div>
                <div className="py-4">
                  <h3 className="font-display text-base font-semibold text-zinc-900">
                    03. Consent-First Availability &amp; 56-Day Guidance
                  </h3>
                  <p className="mt-1 text-sm text-zinc-600">
                    Donors control their own availability status and see safe 56-day donation
                    interval tracking in their portal.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Blood Compatibility Reference */}
      <section className="border-b border-zinc-200 bg-[#FAFAFA] py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm font-medium text-[#C81E2E]">Compatibility Guide</p>
              <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
                Check Who Can Donate to Each Blood Group
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('find', { prefillBloodGroup: selectedMatrixGroup })}
              className="inline-flex shrink-0 items-center gap-2 self-start whitespace-nowrap rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
            >
              <span>Find {selectedMatrixGroup} Compatible Donors</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-medium text-zinc-500">Select Recipient Blood Group</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {BLOOD_GROUPS.map((group) => (
                    <button
                      key={group}
                      type="button"
                      onClick={() => setSelectedMatrixGroup(group)}
                      className={`min-h-10 min-w-12 rounded-lg px-3 py-2 font-mono text-sm font-semibold tabular-nums transition-colors ${
                        selectedMatrixGroup === group
                          ? 'bg-[#C81E2E] text-white'
                          : 'border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
                      }`}
                    >
                      {group}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-zinc-200 pt-4 md:border-t-0 md:border-l md:pl-8 md:pt-0">
                <p className="text-xs font-medium text-zinc-500">
                  Compatible Donor Groups for{' '}
                  <span className="font-mono font-semibold text-zinc-900">
                    {selectedMatrixGroup}
                  </span>{' '}
                  Recipient
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {compatibleForSelected.map((donorGroup) => (
                    <span
                      key={donorGroup}
                      className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1.5 font-mono text-sm font-semibold tabular-nums text-zinc-900"
                    >
                      {donorGroup}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-[#C81E2E]">Simple Process</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-zinc-900">
              How LifeDrop Works
            </h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-zinc-200 bg-[#FAFAFA] p-6">
              <p className="font-mono text-2xl font-semibold tabular-nums text-[#C81E2E]">01</p>
              <h3 className="mt-4 font-display text-lg font-semibold text-zinc-900">
                Register as a Donor
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                Create your donor account with your blood group, area, and emergency consent.
                Pause or resume availability anytime.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('auth', { authTab: 'register' })}
                className="mt-5 text-sm font-semibold text-[#C81E2E] hover:text-[#A31624]"
              >
                Create Donor Account →
              </button>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-[#FAFAFA] p-6">
              <p className="font-mono text-2xl font-semibold tabular-nums text-[#C81E2E]">02</p>
              <h3 className="mt-4 font-display text-lg font-semibold text-zinc-900">
                Search or Post a Request
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                Enter the patient&apos;s blood group, units needed, and hospital location to find
                compatible donors right away.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('find')}
                className="mt-5 text-sm font-semibold text-[#C81E2E] hover:text-[#A31624]"
              >
                Search Donors →
              </button>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-[#FAFAFA] p-6">
              <p className="font-mono text-2xl font-semibold tabular-nums text-[#C81E2E]">03</p>
              <h3 className="mt-4 font-display text-lg font-semibold text-zinc-900">
                Pledge &amp; Coordinate Safely
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                Compatible donors review open emergency alerts and pledge directly, coordinating
                screening with the hospital blood bank.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('requests')}
                className="mt-5 text-sm font-semibold text-[#C81E2E] hover:text-[#A31624]"
              >
                View Open Requests →
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
