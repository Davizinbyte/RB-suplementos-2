let requests = {};

export default function handler(req, res) {
  const ip = req.headers['x-forwarded-for'] || 'unknown';

  if (!requests[ip]) requests[ip] = 0;
  requests[ip]++;

  if (requests[ip] > 20) {
    return res.status(429).json({ error: "Muitas requisições" });
  }

  setTimeout(() => {
    requests[ip]--;
  }, 60000);

  // resto...
}
export default function handler(req, res) {
  const token = req.headers['x-admin-token'];

  if (token !== process.env.ADMIN_SECRET_TOKEN) {
    return res.status(401).json({ error: "Nao autorizado" });
  }

  // resto do código...
}
// api/save.js - POST /api/save → salva config (requer token admin)
const { getDb, verifyAdminToken, cors } = require('./config');

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!verifyAdminToken(req)) {
    return res.status(401).json({ error: 'Nao autorizado' });
  }

  try {
    const db = getDb();
    const { prods, contact, homeData } = req.body;
    await db.collection('store').doc('config').set({ prods, contact, homeData }, { merge: true });
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
