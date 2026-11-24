import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import express from 'express';
import type { NextFunction, Request, Response } from 'express';

const PORT = Number(process.env.PORT) || 3000;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'lifedrop.json');

// Session signing secret: uses env var when provided, otherwise an ephemeral 32-byte key in memory
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

const VALID_BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;
type BloodGroup = (typeof VALID_BLOOD_GROUPS)[number];

const VALID_URGENCIES = ['Critical', 'Urgent', 'Scheduled'] as const;
type UrgencyLevel = (typeof VALID_URGENCIES)[number];

const COMPATIBLE_DONORS: Record<BloodGroup, BloodGroup[]> = {
  'O-': ['O-'],
  'O+': ['O-', 'O+'],
  'A-': ['O-', 'A-'],
  'A+': ['O-', 'O+', 'A-', 'A+'],
  'B-': ['O-', 'B-'],
  'B+': ['O-', 'O+', 'B-', 'B+'],
  'AB-': ['O-', 'A-', 'B-', 'AB-'],
  'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
};

interface StoredDonor {
  id: string;
  name: string;
  email: string | null;
  passwordHash: string | null;
  bloodGroup: BloodGroup;
  city: string;
  phone: string;
  available: boolean;
  lastDonationDate: string | null;
  donationsCount: number;
  consentGiven: boolean;
  createdAt: string;
}

interface StoredRequest {
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
  createdByDonorId: string | null;
}

interface DatabaseSchema {
  donors: StoredDonor[];
  requests: StoredRequest[];
}

function createSeedDatabase(): DatabaseSchema {
  const now = Date.now();
  const daysAgo = (d: number) => new Date(now - d * 86_400_000).toISOString().slice(0, 10);
  const hoursAgo = (h: number) => new Date(now - h * 3_600_000).toISOString();

  return {
    donors: [
      {
        id: 'donor-seed-1',
        name: 'Maya Lin',
        email: null,
        passwordHash: null,
        bloodGroup: 'O-',
        city: 'Indiranagar, Bangalore, Karnataka',
        phone: '+91 98450 11890',
        available: true,
        lastDonationDate: daysAgo(92),
        donationsCount: 6,
        consentGiven: true,
        createdAt: hoursAgo(720),
      },
      {
        id: 'donor-seed-2',
        name: 'Karthik Rao',
        email: null,
        passwordHash: null,
        bloodGroup: 'A+',
        city: 'Koramangala, Bangalore, Karnataka',
        phone: '+91 98451 24421',
        available: true,
        lastDonationDate: daysAgo(110),
        donationsCount: 4,
        consentGiven: true,
        createdAt: hoursAgo(640),
      },
      {
        id: 'donor-seed-3',
        name: 'Priya Sharma',
        email: null,
        passwordHash: null,
        bloodGroup: 'B+',
        city: 'Jayanagar, Bangalore, Karnataka',
        phone: '+91 99001 47734',
        available: true,
        lastDonationDate: daysAgo(74),
        donationsCount: 3,
        consentGiven: true,
        createdAt: hoursAgo(510),
      },
      {
        id: 'donor-seed-4',
        name: 'Lucas Reyes',
        email: null,
        passwordHash: null,
        bloodGroup: 'O+',
        city: 'Bangalore, Karnataka',
        phone: '+91 98802 69205',
        available: true,
        lastDonationDate: daysAgo(140),
        donationsCount: 8,
        consentGiven: true,
        createdAt: hoursAgo(480),
      },
      {
        id: 'donor-seed-5',
        name: 'Ananya Nair',
        email: null,
        passwordHash: null,
        bloodGroup: 'AB-',
        city: 'Malleshwaram, Bangalore, Karnataka',
        phone: '+91 97410 71156',
        available: true,
        lastDonationDate: daysAgo(88),
        donationsCount: 2,
        consentGiven: true,
        createdAt: hoursAgo(320),
      },
      {
        id: 'donor-seed-6',
        name: 'Samuel Mensah',
        email: null,
        passwordHash: null,
        bloodGroup: 'A-',
        city: 'Whitefield, Bangalore, Karnataka',
        phone: '+91 98455 83902',
        available: true,
        lastDonationDate: daysAgo(180),
        donationsCount: 5,
        consentGiven: true,
        createdAt: hoursAgo(240),
      },
      {
        id: 'donor-seed-7',
        name: 'Divya Hegde',
        email: null,
        passwordHash: null,
        bloodGroup: 'B-',
        city: 'Yelahanka, Bangalore, Karnataka',
        phone: '+91 99804 96618',
        available: false,
        lastDonationDate: daysAgo(21),
        donationsCount: 4,
        consentGiven: true,
        createdAt: hoursAgo(180),
      },
      {
        id: 'donor-seed-8',
        name: 'Arjun Patel',
        email: null,
        passwordHash: null,
        bloodGroup: 'AB+',
        city: 'Bangalore, Karnataka',
        phone: '+91 98459 35047',
        available: true,
        lastDonationDate: null,
        donationsCount: 1,
        consentGiven: true,
        createdAt: hoursAgo(96),
      },
    ],
    requests: [
      {
        id: 'req-seed-1',
        patientName: 'Emergency Trauma Ward B',
        bloodGroup: 'O-',
        unitsNeeded: 2,
        urgency: 'Critical',
        hospital: 'Victoria Hospital',
        city: 'Bangalore, Karnataka',
        contactPhone: '+91 80 2670 1150',
        notes: 'Urgent surgical standby; coordinate directly with Blood Bank Desk #2.',
        status: 'Open',
        createdAt: hoursAgo(2),
        pledgedDonorIds: ['donor-seed-1'],
        pledgedDonorNames: ['Maya Lin'],
        createdByDonorId: null,
      },
      {
        id: 'req-seed-2',
        patientName: 'Maternity Care Unit',
        bloodGroup: 'A+',
        unitsNeeded: 3,
        urgency: 'Urgent',
        hospital: "St. John's Medical College Hospital",
        city: 'Koramangala, Bangalore, Karnataka',
        contactPhone: '+91 80 2206 5000',
        notes: 'Compatible A+ or O- / O+ donors requested before 6:00 PM today.',
        status: 'Open',
        createdAt: hoursAgo(5),
        pledgedDonorIds: [],
        pledgedDonorNames: [],
        createdByDonorId: null,
      },
      {
        id: 'req-seed-3',
        patientName: 'Pediatric Hematology',
        bloodGroup: 'B+',
        unitsNeeded: 1,
        urgency: 'Scheduled',
        hospital: 'Manipal Hospital',
        city: 'Old Airport Road, Bangalore, Karnataka',
        contactPhone: '+91 80 2502 4444',
        notes: 'Scheduled outpatient transfusion within 48 hours.',
        status: 'Open',
        createdAt: hoursAgo(14),
        pledgedDonorIds: [],
        pledgedDonorNames: [],
        createdByDonorId: null,
      },
    ],
  };
}

function ensureDbExists(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const initial = createSeedDatabase();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }
  const raw = fs.readFileSync(DB_FILE, 'utf8');
  return JSON.parse(raw) as DatabaseSchema;
}

function readDb(): DatabaseSchema {
  return ensureDbExists();
}

function writeDb(db: DatabaseSchema): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const tempPath = `${DB_FILE}.${crypto.randomUUID()}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(db, null, 2), 'utf8');
  fs.renameSync(tempPath, DB_FILE);
}

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, keyHex] = parts;
  const derived = crypto.scryptSync(password, salt, 64);
  const keyBuffer = Buffer.from(keyHex, 'hex');
  if (derived.length !== keyBuffer.length) return false;
  return crypto.timingSafeEqual(derived, keyBuffer);
}

function signToken(donorId: string): string {
  const payload = Buffer.from(
    JSON.stringify({
      sub: donorId,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
    })
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function verifyToken(token: string): string | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payload, sig] = parts;
  const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      sub?: string;
      exp?: number;
    };
    if (!parsed.sub || !parsed.exp || parsed.exp < Date.now()) {
      return null;
    }
    return parsed.sub;
  } catch {
    return null;
  }
}

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  const last4 = digits.slice(-4) || '0000';
  return `••••-${last4}`;
}

function toPublicDonor(donor: StoredDonor, includePrivate: boolean) {
  return {
    id: donor.id,
    name: donor.name,
    bloodGroup: donor.bloodGroup,
    city: donor.city,
    available: donor.available,
    lastDonationDate: donor.lastDonationDate,
    donationsCount: donor.donationsCount,
    contactPreview: maskPhone(donor.phone),
    createdAt: donor.createdAt,
    ...(includePrivate
      ? {
          phone: donor.phone,
          email: donor.email ?? undefined,
        }
      : {}),
  };
}

function isValidBloodGroup(value: unknown): value is BloodGroup {
  return typeof value === 'string' && (VALID_BLOOD_GROUPS as readonly string[]).includes(value);
}

function isValidUrgency(value: unknown): value is UrgencyLevel {
  return typeof value === 'string' && (VALID_URGENCIES as readonly string[]).includes(value);
}

function cleanText(value: unknown, maxLen: number): string {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/\s+/g, ' ').slice(0, maxLen);
}

function extractBearerToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.slice(7).trim() || null;
}

interface AuthenticatedRequest extends Request {
  donorId?: string;
}

function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const token = extractBearerToken(req);
  if (!token) {
    res.status(401).json({ error: 'Sign in required to perform this action.' });
    return;
  }
  const donorId = verifyToken(token);
  if (!donorId) {
    res.status(401).json({ error: 'Your session has expired. Please sign in again.' });
    return;
  }
  req.donorId = donorId;
  next();
}

async function startServer() {
  ensureDbExists();

  const app = express();
  app.use(express.json({ limit: '100kb' }));

  // Public overview statistics + donor directory
  app.get('/api/donors', (req: Request, res: Response) => {
    const db = readDb();
    const token = extractBearerToken(req);
    const authedId = token ? verifyToken(token) : null;

    const bloodGroupParam = typeof req.query.bloodGroup === 'string' ? req.query.bloodGroup.trim() : '';
    const mode = req.query.mode === 'exact' ? 'exact' : 'compatible';
    const cityQuery = typeof req.query.city === 'string' ? req.query.city.trim().toLowerCase() : '';
    const availableOnly = req.query.availableOnly === 'true';

    let donors = db.donors;

    if (bloodGroupParam && isValidBloodGroup(bloodGroupParam)) {
      if (mode === 'exact') {
        donors = donors.filter((d) => d.bloodGroup === bloodGroupParam);
      } else {
        const compatible = COMPATIBLE_DONORS[bloodGroupParam];
        donors = donors.filter((d) => compatible.includes(d.bloodGroup));
      }
    }

    if (cityQuery) {
      donors = donors.filter((d) => d.city.toLowerCase().includes(cityQuery));
    }

    if (availableOnly) {
      donors = donors.filter((d) => d.available);
    }

    const sorted = [...donors].sort((a, b) => {
      if (a.available !== b.available) return a.available ? -1 : 1;
      return b.createdAt.localeCompare(a.createdAt);
    });

    res.json({
      donors: sorted.map((d) => toPublicDonor(d, Boolean(authedId))),
      stats: {
        totalDonors: db.donors.length,
        availableDonors: db.donors.filter((d) => d.available).length,
        openRequests: db.requests.filter((r) => r.status === 'Open').length,
      },
    });
  });

  // Register a new donor account
  app.post('/api/auth/register', (req: Request, res: Response) => {
    const body = req.body as Record<string, unknown>;
    const name = cleanText(body.name, 80);
    const email = cleanText(body.email, 120).toLowerCase();
    const password = typeof body.password === 'string' ? body.password : '';
    const bloodGroup = body.bloodGroup;
    const city = cleanText(body.city, 80);
    const phone = cleanText(body.phone, 30);
    const lastDonationDate =
      typeof body.lastDonationDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.lastDonationDate)
        ? body.lastDonationDate
        : null;
    const consentGiven = body.consentGiven === true;

    if (name.length < 2) {
      res.status(400).json({ error: 'Please enter your full name (at least 2 characters).' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ error: 'Please enter a valid email address.' });
      return;
    }
    if (password.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters long.' });
      return;
    }
    if (!isValidBloodGroup(bloodGroup)) {
      res.status(400).json({ error: 'Please select a valid blood group.' });
      return;
    }
    if (city.length < 2) {
      res.status(400).json({ error: 'Please enter your city or campus area.' });
      return;
    }
    if (phone.replace(/\D/g, '').length < 7) {
      res.status(400).json({ error: 'Please enter a valid contact phone number.' });
      return;
    }
    if (!consentGiven) {
      res.status(400).json({ error: 'Consent is required to join the emergency donor directory.' });
      return;
    }

    const db = readDb();
    const existing = db.donors.find((d) => d.email && d.email.toLowerCase() === email);
    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists. Please sign in instead.' });
      return;
    }

    const newDonor: StoredDonor = {
      id: `donor-${crypto.randomUUID()}`,
      name,
      email,
      passwordHash: hashPassword(password),
      bloodGroup,
      city,
      phone,
      available: true,
      lastDonationDate,
      donationsCount: 0,
      consentGiven: true,
      createdAt: new Date().toISOString(),
    };

    db.donors.unshift(newDonor);
    writeDb(db);

    const token = signToken(newDonor.id);
    res.status(201).json({
      token,
      donor: toPublicDonor(newDonor, true),
    });
  });

  // Sign in an existing donor
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const body = req.body as Record<string, unknown>;
    const email = cleanText(body.email, 120).toLowerCase();
    const password = typeof body.password === 'string' ? body.password : '';

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const db = readDb();
    const donor = db.donors.find((d) => d.email && d.email.toLowerCase() === email);
    if (!donor || !donor.passwordHash || !verifyPassword(password, donor.passwordHash)) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = signToken(donor.id);
    res.json({
      token,
      donor: toPublicDonor(donor, true),
    });
  });

  // Get current authenticated donor
  app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const db = readDb();
    const donor = db.donors.find((d) => d.id === req.donorId);
    if (!donor) {
      res.status(404).json({ error: 'Donor profile not found.' });
      return;
    }
    res.json({ donor: toPublicDonor(donor, true) });
  });

  // Update authenticated donor profile & availability
  app.patch('/api/donors/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const db = readDb();
    const donorIndex = db.donors.findIndex((d) => d.id === req.donorId);
    if (donorIndex === -1) {
      res.status(404).json({ error: 'Donor profile not found.' });
      return;
    }

    const body = req.body as Record<string, unknown>;
    const donor = db.donors[donorIndex];

    if (typeof body.available === 'boolean') {
      donor.available = body.available;
    }
    if (typeof body.city === 'string') {
      const cleanedCity = cleanText(body.city, 80);
      if (cleanedCity.length < 2) {
        res.status(400).json({ error: 'City or area must be at least 2 characters.' });
        return;
      }
      donor.city = cleanedCity;
    }
    if (typeof body.phone === 'string') {
      const cleanedPhone = cleanText(body.phone, 30);
      if (cleanedPhone.replace(/\D/g, '').length < 7) {
        res.status(400).json({ error: 'Please provide a valid phone number.' });
        return;
      }
      donor.phone = cleanedPhone;
    }
    if (body.lastDonationDate === null || body.lastDonationDate === '') {
      donor.lastDonationDate = null;
    } else if (typeof body.lastDonationDate === 'string') {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(body.lastDonationDate)) {
        res.status(400).json({ error: 'Last donation date must be formatted YYYY-MM-DD.' });
        return;
      }
      donor.lastDonationDate = body.lastDonationDate;
    }

    db.donors[donorIndex] = donor;
    writeDb(db);
    res.json({ donor: toPublicDonor(donor, true) });
  });

  // Delete authenticated donor account
  app.delete('/api/donors/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const db = readDb();
    const before = db.donors.length;
    db.donors = db.donors.filter((d) => d.id !== req.donorId);
    if (db.donors.length === before) {
      res.status(404).json({ error: 'Donor profile not found.' });
      return;
    }
    writeDb(db);
    res.json({ deleted: true });
  });

  // List emergency blood requests
  app.get('/api/requests', (_req: Request, res: Response) => {
    const db = readDb();
    const urgencyRank: Record<UrgencyLevel, number> = {
      Critical: 0,
      Urgent: 1,
      Scheduled: 2,
    };

    const sorted = [...db.requests].sort((a, b) => {
      if (a.status !== b.status) return a.status === 'Open' ? -1 : 1;
      if (urgencyRank[a.urgency] !== urgencyRank[b.urgency]) {
        return urgencyRank[a.urgency] - urgencyRank[b.urgency];
      }
      return b.createdAt.localeCompare(a.createdAt);
    });

    res.json({ requests: sorted });
  });

  // Submit an emergency blood request
  app.post('/api/requests', (req: Request, res: Response) => {
    const body = req.body as Record<string, unknown>;
    const token = extractBearerToken(req);
    const authedId = token ? verifyToken(token) : null;

    const patientName = cleanText(body.patientName, 80);
    const bloodGroup = body.bloodGroup;
    const unitsNeeded = Number(body.unitsNeeded);
    const urgency = body.urgency;
    const hospital = cleanText(body.hospital, 100);
    const city = cleanText(body.city, 80);
    const contactPhone = cleanText(body.contactPhone, 30);
    const notes = cleanText(body.notes, 300);

    if (patientName.length < 2) {
      res.status(400).json({ error: 'Please enter the patient or department name.' });
      return;
    }
    if (!isValidBloodGroup(bloodGroup)) {
      res.status(400).json({ error: 'Please select a valid required blood group.' });
      return;
    }
    if (!Number.isInteger(unitsNeeded) || unitsNeeded < 1 || unitsNeeded > 10) {
      res.status(400).json({ error: 'Units needed must be between 1 and 10.' });
      return;
    }
    if (!isValidUrgency(urgency)) {
      res.status(400).json({ error: 'Please select a valid urgency level.' });
      return;
    }
    if (hospital.length < 2) {
      res.status(400).json({ error: 'Please enter the hospital or clinic name.' });
      return;
    }
    if (city.length < 2) {
      res.status(400).json({ error: 'Please enter the city or campus area.' });
      return;
    }
    if (contactPhone.replace(/\D/g, '').length < 7) {
      res.status(400).json({ error: 'Please provide a valid contact phone number.' });
      return;
    }

    const db = readDb();
    const newRequest: StoredRequest = {
      id: `req-${crypto.randomUUID()}`,
      patientName,
      bloodGroup,
      unitsNeeded,
      urgency,
      hospital,
      city,
      contactPhone,
      notes,
      status: 'Open',
      createdAt: new Date().toISOString(),
      pledgedDonorIds: [],
      pledgedDonorNames: [],
      createdByDonorId: authedId,
    };

    db.requests.unshift(newRequest);
    writeDb(db);

    const compatibleGroups = COMPATIBLE_DONORS[bloodGroup];
    const matchingAvailableDonors = db.donors.filter(
      (d) => d.available && compatibleGroups.includes(d.bloodGroup)
    ).length;

    res.status(201).json({
      request: newRequest,
      matchingAvailableDonors,
    });
  });

  // Pledge to donate for an emergency request
  app.post('/api/requests/:id/pledge', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const db = readDb();
    const donor = db.donors.find((d) => d.id === req.donorId);
    if (!donor) {
      res.status(404).json({ error: 'Donor account not found.' });
      return;
    }

    const reqIndex = db.requests.findIndex((r) => r.id === req.params.id);
    if (reqIndex === -1) {
      res.status(404).json({ error: 'Emergency request not found.' });
      return;
    }

    const target = db.requests[reqIndex];
    if (target.status !== 'Open') {
      res.status(400).json({ error: 'This request has already been fulfilled.' });
      return;
    }

    if (!COMPATIBLE_DONORS[target.bloodGroup].includes(donor.bloodGroup)) {
      res.status(400).json({
        error: `Your blood group (${donor.bloodGroup}) is not medically compatible with a ${target.bloodGroup} recipient.`,
      });
      return;
    }

    if (target.pledgedDonorIds.includes(donor.id)) {
      res.status(409).json({ error: 'You have already pledged to donate for this request.' });
      return;
    }

    target.pledgedDonorIds.push(donor.id);
    target.pledgedDonorNames.push(donor.name);
    db.requests[reqIndex] = target;
    writeDb(db);

    res.json({ request: target });
  });

  // Mark a request as fulfilled
  app.patch('/api/requests/:id/fulfill', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const db = readDb();
    const reqIndex = db.requests.findIndex((r) => r.id === req.params.id);
    if (reqIndex === -1) {
      res.status(404).json({ error: 'Emergency request not found.' });
      return;
    }
    const target = db.requests[reqIndex];
    if (target.createdByDonorId && target.createdByDonorId !== req.donorId) {
      res.status(403).json({ error: 'Only the requester who created this alert can close it.' });
      return;
    }
    target.status = 'Fulfilled';
    db.requests[reqIndex] = target;
    writeDb(db);
    res.json({ request: target });
  });

  // Safe source-code ZIP export (excludes .env secrets, data/, node_modules/, dist/)
  app.get('/api/project.zip', (_req: Request, res: Response) => {
    const zipBuffer = buildProjectZipBuffer(process.cwd());
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="lifedrop-project.zip"');
    res.setHeader('Content-Length', String(zipBuffer.length));
    res.send(zipBuffer);
  });

  if (IS_PRODUCTION) {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LifeDrop server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start LifeDrop server:', err);
  process.exit(1);
});
