import type {
  CorporateCorridor,
  CorporateService,
  DispatchAlert,
  FleetVehicle,
  Reservation,
} from '../types/travel';

export const HERO_TARMAC_IMAGE = '/src/assets/images/hero_executive_tarmac_1794657058171.jpg';
export const ABOUT_CHAUFFEUR_IMAGE = '/src/assets/images/about_chauffeur_sedan_1794657057844.jpg';

export const FLEET_VEHICLES: FleetVehicle[] = [
  {
    id: 'cadillac-escalade-esv',
    name: 'Cadillac Escalade ESV Executive',
    category: 'suv',
    tagline: 'Extended-wheelbase all-weather command SUV for board teams & mountain FBOs',
    passengers: 6,
    luggage: 6,
    baseFareUsd: 165,
    perMileUsd: 5.5,
    hourlyRateUsd: 145,
    image: '/src/assets/images/fleet_escalade_suv_1794657058707.jpg',
    features: ['Starlink Cabin Wi-Fi', 'Acoustic Privacy Glass', 'Winter AWD Package'],
  },
  {
    id: 'mercedes-maybach-s680',
    name: 'Mercedes-Maybach S680',
    category: 'sedan',
    tagline: 'Flagship V12 diplomatic & C-suite sanctuary with reclining executive lounge',
    passengers: 3,
    luggage: 3,
    baseFareUsd: 210,
    perMileUsd: 6.8,
    hourlyRateUsd: 195,
    image: '/src/assets/images/fleet_maybach_sedan_1794657058364.jpg',
    features: ['Executive Rear Tables', 'Active Road-Noise Cancellation', 'Chilled Refreshments'],
  },
  {
    id: 'mercedes-executive-sprinter',
    name: 'Mercedes-Benz Executive Jet Cabin',
    category: 'van',
    tagline: 'Bespoke mobile boardroom for financial roadshows & diplomatic delegations',
    passengers: 9,
    luggage: 10,
    baseFareUsd: 260,
    perMileUsd: 7.5,
    hourlyRateUsd: 230,
    image: '/src/assets/images/fleet_executive_cabin_1794657059653.jpg',
    features: ['4K Conference Display', 'Dual 5G Encrypted Router', 'Walnut Workstations'],
  },
  {
    id: 'range-rover-autobiography',
    name: 'Range Rover Autobiography LWB',
    category: 'suv',
    tagline: 'Discreet alpine & metropolitan executive transfer with air-suspension poise',
    passengers: 4,
    luggage: 4,
    baseFareUsd: 185,
    perMileUsd: 6.1,
    hourlyRateUsd: 165,
    image: '/src/assets/images/fleet_escalade_suv_1794657058707.jpg',
    features: ['Rear Executive Class Seating', 'Terrain Response 2', 'Privacy Blinds'],
  },
];

export const EXECUTIVE_PILLARS = [
  {
    title: 'Executive Fleet Selection',
    description: 'Late-model Maybach sedans, extended Escalade ESVs, and mobile conference vans maintained to aviation standards.',
  },
  {
    title: '24/7 Global Dispatch',
    description: 'Dedicated operations desks across Denver, New York, London, and Zurich monitoring every leg around the clock.',
  },
  {
    title: 'Guaranteed On-Time SLA',
    description: 'Chauffeurs stage 20 minutes prior to pickup with automated flight-tail and commercial runway tracking.',
  },
  {
    title: 'Diplomatic-Grade Security',
    description: 'Background-vetted career chauffeurs, NDA-bound roadshow protocols, and AES-256 encrypted travel dossiers.',
  },
  {
    title: 'Multi-Currency Fixed Billing',
    description: 'Transparent all-inclusive quotes settled in USD, EUR, GBP, CHF, AED, or JPY with consolidated VAT invoicing.',
  },
  {
    title: 'Offline-Ready Operations',
    description: 'Itineraries, chauffeur credentials, and encrypted boarding documents remain accessible without cellular signal.',
  },
];

export const CORPORATE_SERVICES: CorporateService[] = [
  {
    id: 'fbo-aviation',
    number: '01.',
    title: 'Private Aviation & FBO Transfers',
    description:
      'Direct ramp-side tarmac access at Centennial (APA), Teterboro (TEB), Farnborough (FAB), and Zurich General Aviation.',
    slaHighlight: 'Tail-number sync',
  },
  {
    id: 'roadshows',
    number: '02.',
    title: 'Financial Roadshows & Board Mobility',
    description:
      'Dedicated standby chauffeurs and route strategists coordinating multi-stop investor days with real-time schedule adjustments.',
    slaHighlight: 'Dedicated coordinator',
  },
  {
    id: 'airport-transfers',
    number: '03.',
    title: 'Executive Airport Meet & Greet',
    description:
      'Priority customs fast-track escort and curbside dispatch across DEN, JFK, LHR, ZRH, DXB, and HND terminals.',
    slaHighlight: '60 min complimentary wait',
  },
  {
    id: 'alpine-resorts',
    number: '04.',
    title: 'Alpine & Mountain Resort Charters',
    description:
      'Winter-certified AWD executive SUVs connecting Denver and Eagle County airports directly to Vail, Aspen, Davos, and St. Moritz.',
    slaHighlight: 'Winter-certified fleet',
  },
  {
    id: 'diplomatic-vip',
    number: '05.',
    title: 'Diplomatic & High-Profile Protocol',
    description:
      'Discreet unbadged vehicles, encrypted manifest storage, and GDPR-strict data minimization for sovereign and board principals.',
    slaHighlight: 'NDA & GDPR Article 32',
  },
  {
    id: 'summit-logistics',
    number: '06.',
    title: 'Global Summit & Conference Logistics',
    description:
      'Coordinated fleet manifests for World Economic Forum, G20 delegations, and multinational executive retreats.',
    slaHighlight: 'Multi-vehicle manifest',
  },
];

export const CORPORATE_CORRIDORS: CorporateCorridor[] = [
  {
    id: 'den-vail',
    region: 'Colorado Rockies',
    title: 'Denver International (DEN) → Vail',
    pickupDefault: 'Denver International Airport (DEN) — Private FBO',
    dropoffDefault: 'Four Seasons Resort Vail, CO',
    distanceMiles: 120,
    estimatedMinutes: 135,
    summary: 'All-weather I-70 mountain executive corridor with winter-equipped Escalade ESV fleet.',
  },
  {
    id: 'teb-manhattan',
    region: 'New York Metro',
    title: 'Teterboro FBO (TEB) → Midtown Manhattan',
    pickupDefault: 'Teterboro Airport (TEB) — Signature FBO',
    dropoffDefault: '550 Madison Ave, Midtown Manhattan, NY',
    distanceMiles: 14,
    estimatedMinutes: 35,
    summary: 'Rapid tarmac-to-boardroom transit with live Hudson tunnel congestion routing.',
  },
  {
    id: 'lhr-canary',
    region: 'London Financial',
    title: 'London Heathrow (LHR) → Canary Wharf',
    pickupDefault: 'London Heathrow Airport (LHR) — Windsor Suite',
    dropoffDefault: 'One Canada Square, Canary Wharf, London',
    distanceMiles: 24,
    estimatedMinutes: 55,
    summary: 'VIP terminal meet-and-greet with consolidated GBP/EUR corporate VAT invoicing.',
  },
  {
    id: 'zrh-davos',
    region: 'Swiss Alps',
    title: 'Zurich Airport (ZRH) → Davos Congress',
    pickupDefault: 'Zurich Airport (ZRH) — General Aviation Center',
    dropoffDefault: 'Davos Congress Centre, Switzerland',
    distanceMiles: 96,
    estimatedMinutes: 115,
    summary: 'Cross-canton executive roadshow & WEF corridor settled in CHF or EUR.',
  },
];

export const SEED_RESERVATIONS: Reservation[] = [
  {
    id: 'res-seed-1',
    referenceCode: 'LMS-88412',
    tripType: 'airport',
    pickup: 'Denver International Airport (DEN) — Signature FBO',
    dropoff: 'Four Seasons Resort Vail, CO',
    pickupDateTime: '2026-11-16T09:30',
    flightNumber: 'N718GA (Private)',
    passengers: 3,
    distanceMiles: 120,
    vehicleId: 'cadillac-escalade-esv',
    vehicleName: 'Cadillac Escalade ESV Executive',
    currency: 'USD',
    subtotalUsd: 825,
    conciergeFeeUsd: 66,
    taxUsd: 57.92,
    totalUsd: 948.92,
    totalInCurrency: 948.92,
    paymentMethod: 'corporate_invoice',
    passengerName: 'Marcus Vance',
    corporateEmail: 'm.vance@apexglobal.com',
    status: 'Confirmed',
    chauffeurName: 'Henrik Lindqvist',
    createdAt: '2026-11-14T08:15:00.000Z',
    cachedOffline: true,
  },
  {
    id: 'res-seed-2',
    referenceCode: 'LMS-88439',
    tripType: 'point_to_point',
    pickup: 'Zurich Airport (ZRH) — VIP Apron',
    dropoff: 'Paradeplatz 8, 8001 Zurich',
    pickupDateTime: '2026-11-17T14:15',
    flightNumber: 'LX 161',
    passengers: 2,
    distanceMiles: 10,
    vehicleId: 'mercedes-maybach-s680',
    vehicleName: 'Mercedes-Maybach S680',
    currency: 'CHF',
    subtotalUsd: 246.5,
    conciergeFeeUsd: 19.72,
    taxUsd: 17.3,
    totalUsd: 283.52,
    totalInCurrency: 249.5,
    paymentMethod: 'multi_currency_card',
    passengerName: 'Claire Beaumont',
    corporateEmail: 'c.beaumont@helvetiawealth.ch',
    status: 'Chauffeur En Route',
    chauffeurName: 'Lukas Meier',
    createdAt: '2026-11-14T09:00:00.000Z',
    cachedOffline: true,
  },
];

export const SEED_ALERTS: DispatchAlert[] = [
  {
    id: 'alert-seed-1',
    reservationRef: 'LMS-88439',
    severity: 'info',
    title: 'Chauffeur Staged at ZRH VIP Apron',
    message: 'Lukas Meier (Mercedes-Maybach S680) is staged at Gate A2 20 minutes prior to arrival.',
    timestamp: '2026-11-14T09:20:00.000Z',
    read: false,
  },
  {
    id: 'alert-seed-2',
    reservationRef: 'LMS-88412',
    severity: 'warning',
    title: 'I-70 Vail Pass Winter Advisory Monitored',
    message: 'Dispatch has pre-allocated traction-equipped Escalade ESV and +15 min buffer for DEN → Vail.',
    timestamp: '2026-11-14T08:45:00.000Z',
    read: true,
  },
];

export const SEED_SAMPLE_PLAIN_DOCS = [
  {
    id: 'doc-seed-1',
    title: 'Q4 Zurich–Denver FBO Flight & Tarmac Manifest',
    category: 'FBO Flight Manifest' as const,
    fileName: 'ZRH_DEN_Manifest_N718GA.txt',
    content:
      'TAIL: N718GA | OPERATOR: Link Aviation Desk\nPAX: Marcus Vance (CEO), Elena Rostova (CFO)\nARRIVAL: DEN Signature FBO 09:30 MST\nCHAUFFEUR: Henrik Lindqvist (+1-303-555-0194)\nCLEARANCE CODE: LMS-VIP-4490',
  },
  {
    id: 'doc-seed-2',
    title: 'Corporate Master Service & NDA Protocol (EU/US)',
    category: 'Corporate NDA / SLA' as const,
    fileName: 'LMS_Enterprise_SLA_2026.txt',
    content:
      'AGREEMENT: Link Management Services Enterprise Mobility SLA\nMULTI-CURRENCY SETTLEMENT: Net-30 USD/EUR/GBP/CHF/AED/JPY\nGDPR DATA CONTROLLER: Link Management Services Ltd. (dpo@linkmanagement.com)\nRETENTION: Encrypted local vault purged automatically upon Article 17 request.',
  },
];
