// api/config.js - Configuracao compartilhada (roda no servidor, nunca exposta)
const admin = require('firebase-admin');

let app;
function getApp() {
  if (!app) {
    app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
  return app;
}

function getDb() {
  getApp();
  return admin.firestore();
}

// Verifica se o token de admin eh valido
function verifyAdminToken(req) {
  const token = req.headers['x-admin-token'];
  return token && token === process.env.ADMIN_SECRET_TOKEN;
}

// Headers CORS para todas as respostas
function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-token');
}

module.exports = { getDb, verifyAdminToken, cors };
