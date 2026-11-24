export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export type UrgencyLevel = 'Critical' | 'Urgent' | 'Scheduled';

export interface DonorPublic {
  id: string;
  name: string;
  bloodGroup: BloodGroup;
  city: string;
  available: boolean;
  lastDonationDate: string | null;
  donationsCount: number;
  contactPreview: string;
  phone?: string;
  email?: string;
  createdAt: string;
}

export interface EmergencyRequest {
  id: string;
  patientName: string;
  bloodGroup: BloodGroup;
  unitsNeeded: number;
  urgency: UrgencyLevel;
  hospital: string;
  city: string;
  contactPhone: string;
  notes: string;
  status: 'Open' | 'Fulfilled';
  createdAt: string;
  pledgedDonorIds: string[];
  pledgedDonorNames: string[];
  createdByDonorId?: string | null;
}

export type AppView = 'home' | 'find' | 'requests' | 'auth' | 'dashboard';

/**
 * Red blood cell compatibility matrix:
 * Key = recipient blood group
 * Value = array of donor blood groups that can safely donate to that recipient
 */
export const COMPATIBLE_DONORS_FOR_RECIPIENT: Record<BloodGroup, BloodGroup[]> = {
  'O-': ['O-'],
  'O+': ['O-', 'O+'],
  'A-': ['O-', 'A-'],
  'A+': ['O-', 'O+', 'A-', 'A+'],
  'B-': ['O-', 'B-'],
  'B+': ['O-', 'O+', 'B-', 'B+'],
  'AB-': ['O-', 'A-', 'B-', 'AB-'],
  'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
};

export function canDonateTo(donorGroup: BloodGroup, recipientGroup: BloodGroup): boolean {
  return COMPATIBLE_DONORS_FOR_RECIPIENT[recipientGroup].includes(donorGroup);
}

export function getDaysSinceDonation(lastDonationDate: string | null): number | null {
  if (!lastDonationDate) return null;
  const parsed = Date.parse(lastDonationDate);
  if (Number.isNaN(parsed)) return null;
  const diffMs = Date.now() - parsed;
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

export function getDonationEligibility(lastDonationDate: string | null): {
  eligible: boolean;
  daysRemaining: number;
  label: string;
} {
  const days = getDaysSinceDonation(lastDonationDate);
  if (days === null) {
    return { eligible: true, daysRemaining: 0, label: 'Ready to donate' };
  }
  const minInterval = 56;
  if (days >= minInterval) {
    return { eligible: true, daysRemaining: 0, label: `Eligible (${days} days since last donation)` };
  }
  const remaining = minInterval - days;
  return {
    eligible: false,
    daysRemaining: remaining,
    label: `Wait ${remaining} more day${remaining === 1 ? '' : 's'} (56-day interval)`,
  };
}
