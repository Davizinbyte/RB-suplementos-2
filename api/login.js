// api/login.js
const { cors } = require('./config');

module.exports = async (req, res) => {
  cors(res);

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { user, pass } = req.body;

  if (!user || !pass) {
    return res.status(400).json({ error: 'Campos obrigatorios' });
  }

  // 🔐 Validação REAL
  if (
    user === process.env.ADMIN_USER &&
    pass === process.env.ADMIN_PASS
  ) {
    return res.status(200).json({
      ok: true,
      token: process.env.ADMIN_SECRET_TOKEN,
      user: user,
    });
  }

  // ❌ Se errar
  return res.status(401).json({
    error: 'Usuario ou senha incorretos',
  });
};
