import { OAuth2Client } from 'google-auth-library';
import express from 'express';
const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

import mysql from 'mysql2/promise';
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'tu_usuario',
  password: process.env.DB_PASSWORD || 'tu_contraseña',
  database: process.env.DB_NAME || 'tu_base_de_datos',
});

router.post('/api/auth/google', async (req, res) => {
  const { idToken } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    let [users] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (!users.length) {
      await db.query(
        'INSERT INTO usuarios (nombre, email, rol) VALUES (?, ?, ?)',
        [name, email, 'cliente']
      );
      [users] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    } else {
      await db.query(
        'UPDATE usuarios SET nombre = ? WHERE email = ?',
        [name, email]
      );
      [users] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    }

    const user = users[0]; // Primer resultado
    const token = 'genera_token_jwt_aqui'; // Implementa JWT
    res.json({ token, user });
  } catch (error) {
    console.error('Error en autenticación con Google:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

export default router;