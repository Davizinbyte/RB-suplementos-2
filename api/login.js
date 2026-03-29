// api/login.js - POST /api/login → valida usuario/senha admin, retorna token de sessao
const { getDb, cors } = require('./config');
const crypto = require('crypto');

function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i) | 0;
  return h.toString(36);
}

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { user, pass } = req.body;
  if (!user || !pass) return res.status(400).json({ error: 'Campos obrigatorios' });

  try {
    const db = getDb();
    const snap = await db.collection('store').doc('config').get();
    const creds = snap.exists ? snap.data().creds : null;

    // Valida contra credenciais salvas no banco OU variaveis de ambiente
    const validUser = process.env.ADMIN_USER || (creds && creds.u);
    const validPass = process.env.ADMIN_PASS_HASH || (creds && creds.p);

    const inputUserHash = process.env.ADMIN_USER ? user : hash(user);
    const inputPassHash = process.env.ADMIN_PASS_HASH ? hash(pass) : hash(pass);

    const userOk = process.env.ADMIN_USER ? user === process.env.ADMIN_USER : hash(user) === validUser;
    const passOk = hash(pass) === validPass;

  if (user === process.env.ADMIN_USER && pass === process.env.ADMIN_PASS) {
  return res.json({ ok: true, token: process.env.ADMIN_SECRET_TOKEN });
}
    ADMIN_PASS = R@nier12

    // Retorna o token secreto para o frontend usar nas chamadas admin
    res.status(200).json({
      ok: true,
      token: process.env.ADMIN_SECRET_TOKEN,
      user: user,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
