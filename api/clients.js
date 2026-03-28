// api/clients.js - GET/POST /api/clients
const { getDb, cors } = require('./config');
const crypto = require('crypto');

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const db = getDb();

    if (req.method === 'GET') {
      // Requer token de cliente (email+token)
      const email = req.query.email;
      const token = req.headers['x-client-token'];
      if (!email || !token) return res.status(401).json({ error: 'Nao autorizado' });

      const snap = await db.collection('clients').doc(email).get();
      if (!snap.exists) return res.status(404).json({ error: 'Cliente nao encontrado' });

      const data = snap.data();
      if (data.token !== token) return res.status(401).json({ error: 'Token invalido' });

      // Retorna dados sem o hash da senha
      const { passHash, token: t, ...safe } = data;
      res.status(200).json(safe);

    } else if (req.method === 'POST') {
      const { action, email, pass, name, ...rest } = req.body;

      if (action === 'register') {
        const existing = await db.collection('clients').doc(email).get();
        if (existing.exists) return res.status(409).json({ error: 'Email ja cadastrado' });
        const passHash = crypto.createHash('sha256').update(pass).digest('hex');
        await db.collection('clients').doc(email).set({ name, email, passHash, favorites: [], addresses: [], orders: [] });
        return res.status(200).json({ ok: true });
      }

      if (action === 'login') {
        const snap = await db.collection('clients').doc(email).get();
        if (!snap.exists) return res.status(401).json({ error: 'Email ou senha incorretos' });
        const data = snap.data();
        const passHash = crypto.createHash('sha256').update(pass).digest('hex');
        if (data.passHash !== passHash) return res.status(401).json({ error: 'Email ou senha incorretos' });
        // Gera token de sessao
        const token = crypto.randomBytes(32).toString('hex');
        await db.collection('clients').doc(email).update({ token });
        const { passHash: ph, ...safe } = data;
        res.status(200).json({ ok: true, token, ...safe });
        return;
      }

      if (action === 'update') {
        const token = req.headers['x-client-token'];
        const snap = await db.collection('clients').doc(email).get();
        if (!snap.exists || snap.data().token !== token) return res.status(401).json({ error: 'Nao autorizado' });
        await db.collection('clients').doc(email).update(rest);
        return res.status(200).json({ ok: true });
      }

      res.status(400).json({ error: 'Acao invalida' });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
