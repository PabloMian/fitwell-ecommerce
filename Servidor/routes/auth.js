import { OAuth2Client } from 'google-auth-library';
import express from 'express';
const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

import mysql from 'mysql2/promise';
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'fitwell_db',
  port: process.env.DB_PORT || 3306,
});

router.post('/google', async (req, res) => {
  const { idToken } = req.body;
  try {
    console.log('Verificando token de Google...');
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    console.log('Payload recibido:', { email, name, picture });
    let [users] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (!users.length) {
      await db.query(
        'INSERT INTO usuarios (nombre, email, rol, picture) VALUES (?, ?, ?, ?)',
        [name, email, 'cliente', picture || null]
      );
      [users] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    } else {
      await db.query(
        'UPDATE usuarios SET nombre = ?, picture = ? WHERE email = ?',
        [name, picture || users[0].picture, email]
      );
      [users] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    }

    const user = { ...users[0], picture: users[0].picture || picture }; // Aseguramos que picture se incluya
    console.log('Usuario encontrado/actualizado:', user);
    const token = 'genera_token_jwt_aqui'; // Implementa JWT aquí
    res.json({ token, user });
  } catch (error) {
    console.error('Error en autenticación con Google:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

export default router;