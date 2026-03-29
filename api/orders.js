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
// api/orders.js - GET/POST /api/orders
const { getDb, verifyAdminToken, cors } = require('./config');

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const db = getDb();

    if (req.method === 'GET') {
      // Admin: retorna todos os pedidos
      if (verifyAdminToken(req)) {
        const snap = await db.collection('store').doc('orders').get();
        return res.status(200).json(snap.exists ? snap.data().d || [] : []);
      }
      // Cliente: retorna seus pedidos
      const email = req.query.email;
      const token = req.headers['x-client-token'];
      if (!email || !token) return res.status(401).json({ error: 'Nao autorizado' });
      const clientSnap = await db.collection('clients').doc(email).get();
      if (!clientSnap.exists || clientSnap.data().token !== token) return res.status(401).json({ error: 'Token invalido' });
      const ordersSnap = await db.collection('store').doc('orders').get();
      const all = ordersSnap.exists ? ordersSnap.data().d || [] : [];
      return res.status(200).json(all.filter(o => o.clientEmail === email));
    }

    if (req.method === 'POST') {
      const { order, status, id } = req.body;

      // Admin atualizando status
      if (verifyAdminToken(req) && id && status) {
        const snap = await db.collection('store').doc('orders').get();
        const orders = snap.exists ? snap.data().d || [] : [];
        const idx = orders.findIndex(o => o.id === id);
        if (idx > -1) orders[idx].status = status;
        await db.collection('store').doc('orders').set({ d: orders });
        return res.status(200).json({ ok: true });
      }

      // Cliente criando pedido
      if (order) {
        const snap = await db.collection('store').doc('orders').get();
        const orders = snap.exists ? snap.data().d || [] : [];
        orders.push(order);
        await db.collection('store').doc('orders').set({ d: orders });
        return res.status(200).json({ ok: true });
      }

      res.status(400).json({ error: 'Dados invalidos' });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
