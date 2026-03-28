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
