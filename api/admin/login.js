export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { password } = body || {};

    if (!password) {
      return res.status(400).json({ error: 'Passwort fehlt' });
    }

    if (password !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ error: 'Falsches Passwort' });
    }

    return res.status(200).json({ token: process.env.ADMIN_SECRET });
  } catch (e) {
    return res.status(500).json({ error: 'Server error' });
  }
}
