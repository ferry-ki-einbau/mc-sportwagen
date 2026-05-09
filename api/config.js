import { list, put } from '@vercel/blob';

const BLOB_KEY = 'mc-config.json';

// Default config — used on first load
const DEFAULT_CONFIG = {
  cars: {
    m4: {
      id: 'm4',
      name: 'BMW M4 Competition',
      shortName: 'M4 Competition',
      brand: 'BMW',
      spec: '510 PS · 0–100 in 3,9s · RWD · Ab 20 J.',
      mobileSpec: '510 PS · 0–100 in 3,9s · Ab 20 J. · mind. 1,5 J. Führerschein',
      tag: '⭐ Featured',
      visible: true,
      prices: { wd: 250, we_d: 300, we: 700, week: 1350 },
      km: { day: 200, weekend: 600, week: 1100 }
    },
    c63: {
      id: 'c63',
      name: 'Mercedes C63s AMG',
      shortName: 'C63s AMG Coupé',
      brand: 'Mercedes',
      spec: '510 PS · V8 Biturbo · AMG Performance · Ab 20 J.',
      mobileSpec: '510 PS · V8 Biturbo · Ab 20 J. · mind. 1,5 J. Führerschein',
      tag: '',
      visible: true,
      prices: { wd: 250, we_d: 300, we: 700, week: 1350 },
      km: { day: 200, weekend: 600, week: 1100 }
    },
    rs3: {
      id: 'rs3',
      name: 'Audi RS3 Limousine',
      shortName: 'RS3 Limousine',
      brand: 'Audi',
      spec: '400 PS · RS Torque Splitter · Quattro · Ab 18 J.',
      mobileSpec: '400 PS · Quattro · Ab 18 J. · mind. 1 J. Führerschein',
      tag: '',
      visible: true,
      prices: { wd: 180, we_d: 210, we: 500, week: 1100 },
      km: { day: 200, weekend: 500, week: 1000 }
    },
    r8: {
      id: 'r8',
      name: 'Audi R8 V10',
      shortName: 'R8 V10',
      brand: 'Audi',
      spec: 'Mittelmotor Supersportwagen · V10 · Quattro',
      mobileSpec: 'V10 Saugmotor · Quattro · Mittelmotor Supersportwagen',
      tag: '🆕 Neuzugang',
      visible: true,
      prices: { wd: 400, we_d: 450, we: null, week: null },
      km: { day: 200, weekend: null, week: null }
    }
  },
  contact: {
    phone: '017664872989',
    whatsapp: '4917664872989'
  },
  banner: {
    active: false,
    text: ''
  }
};

async function getConfig() {
  try {
    const { blobs } = await list({ prefix: BLOB_KEY });
    if (blobs.length > 0) {
      const res = await fetch(blobs[0].url);
      return await res.json();
    }
  } catch (e) {
    console.error('Blob read error:', e);
  }
  return DEFAULT_CONFIG;
}

async function saveConfig(config) {
  await put(BLOB_KEY, JSON.stringify(config, null, 2), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const config = await getConfig();
    return res.status(200).json(config);
  }

  if (req.method === 'POST') {
    // Auth check
    const auth = req.headers.authorization;
    if (!auth || auth !== `Bearer ${process.env.ADMIN_SECRET}`) {
      return res.status(401).json({ error: 'Nicht autorisiert' });
    }

    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!body || !body.cars) {
        return res.status(400).json({ error: 'Ungültige Daten' });
      }
      await saveConfig(body);
      return res.status(200).json({ success: true });
    } catch (e) {
      return res.status(500).json({ error: 'Speichern fehlgeschlagen: ' + e.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
