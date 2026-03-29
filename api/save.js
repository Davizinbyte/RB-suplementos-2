const { getDb, verifyAdminToken, cors } = require('./config');

module.exports = async (req, res) => {
  cors(res);

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!verifyAdminToken(req)) {
    return res.status(401).json({ error: 'Nao autorizado' });
  }

  try {
    const db = getDb();
    const { prods, contact, homeData } = req.body;

    // 🔒 VALIDAÇÃO
    if (!Array.isArray(prods)) {
      return res.status(400).json({ error: 'Produtos inválidos' });
    }

    if (typeof contact !== 'object') {
      return res.status(400).json({ error: 'Contato inválido' });
    }

    if (typeof homeData !== 'object') {
      return res.status(400).json({ error: 'Home inválida' });
    }

    await db.collection('store').doc('config').set(
      { prods, contact, homeData },
      { merge: true }
    );

    return res.status(200).json({ ok: true });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
