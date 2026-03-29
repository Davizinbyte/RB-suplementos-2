const { getDb, verifyAdminToken, cors } = require('./config');

module.exports = async (req, res) => {
  cors(res);

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const db = getDb();

    // =========================
    // GET (listar pedidos)
    // =========================
    if (req.method === 'GET') {

      // ADMIN
      if (verifyAdminToken(req)) {
        const snap = await db.collection('store').doc('orders').get();
        return res.status(200).json(snap.exists ? snap.data().d || [] : []);
      }

      // CLIENTE
      const email = req.query.email;
      const token = req.headers['x-client-token'];

      if (!email || !token) {
        return res.status(401).json({ error: 'Nao autorizado' });
      }

      const clientSnap = await db.collection('clients').doc(email).get();

      if (!clientSnap.exists || clientSnap.data().token !== token) {
        return res.status(401).json({ error: 'Token invalido' });
      }

      const ordersSnap = await db.collection('store').doc('orders').get();
      const all = ordersSnap.exists ? ordersSnap.data().d || [] : [];

      return res.status(200).json(all.filter(o => o.clientEmail === email));
    }

    // =========================
    // POST (criar ou atualizar)
    // =========================
    if (req.method === 'POST') {

      const { order, status, id } = req.body;

      // 🔒 ADMIN atualizando status
      if (verifyAdminToken(req) && id && status) {
        const snap = await db.collection('store').doc('orders').get();
        const orders = snap.exists ? snap.data().d || [] : [];

        const idx = orders.findIndex(o => o.id === id);
        if (idx > -1) {
          orders[idx].status = status;
        }

        await db.collection('store').doc('orders').set({ d: orders });

        return res.status(200).json({ ok: true });
      }

      // 🔒 CLIENTE criando pedido (COM VALIDAÇÃO)
      if (order) {

        // valida estrutura básica
        if (
          !order.clientEmail ||
          !order.items ||
          !Array.isArray(order.items)
        ) {
          return res.status(400).json({ error: 'Pedido inválido' });
        }

        const snap = await db.collection('store').doc('orders').get();
        const orders = snap.exists ? snap.data().d || [] : [];

        orders.push(order);

        await db.collection('store').doc('orders').set({ d: orders });

        return res.status(200).json({ ok: true });
      }

      return res.status(400).json({ error: 'Dados invalidos' });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
