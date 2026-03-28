// api/data.js - GET /api/data → retorna produtos, contato e homeData publicamente
const { getDb, cors } = require('./config');

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const db = getDb();
    const snap = await db.collection('store').doc('config').get();
    if (!snap.exists) {
      return res.status(200).json({ prods: [], contact: {}, homeData: {} });
    }
    const d = snap.data();
    // Retorna apenas dados publicos — SEM creds de admin
    res.status(200).json({
      prods: d.prods || [],
      contact: d.contact || {},
      homeData: d.homeData || {},
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
