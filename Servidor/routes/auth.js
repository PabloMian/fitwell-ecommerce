import { OAuth2Client } from 'google-auth-library';
import express from 'express';
const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'; // Importar jsonwebtoken

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
    console.log('Verificando token de Google con idToken:', idToken);
    if (!process.env.GOOGLE_CLIENT_ID) {
      throw new Error('GOOGLE_CLIENT_ID no está definido en las variables de entorno');
    }
    console.log('Usando GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    console.log('Token verificado exitosamente');
    const payload = ticket.getPayload();
    console.log('Payload recibido:', payload);
    const { email, name, picture } = payload;

    const emailRegex = /@upqroo\.edu\.mx$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Solo se permiten correos con la extensión @upqroo.edu.mx' });
    }

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

    const user = { ...users[0], picture: users[0].picture || picture };
    console.log('Usuario encontrado/actualizado:', user);
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' }); // Generar JWT
    res.json({ token, user });
  } catch (error) {
    console.error('Error en autenticación con Google:', error.message, error.stack);
    res.status(500).json({ error: 'Error en el servidor: ' + error.message });
  }
});

router.post('/registro', async (req, res) => {
  const { nombre, email, password, direccion, telefono } = req.body;
  try {
    console.log('Procesando registro manual:', { nombre, email, password, direccion, telefono });
    const emailRegex = /@upqroo\.edu\.mx$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Solo se permiten correos con la extensión @upqroo.edu.mx' });
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres, una mayúscula y un carácter especial (!@#$%^&*)' });
    }

    let [users] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (users.length) {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await db.query(
      'INSERT INTO usuarios (nombre, email, password, direccion, telefono, rol) VALUES (?, ?, ?, ?, ?, ?)',
      [nombre, email, hashedPassword, direccion || null, telefono || null, 'cliente']
    );
    [users] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    const user = users[0];
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' }); // Generar JWT
    res.json({ token, user });
  } catch (error) {
    console.error('Error en registro manual:', error.message, error.stack);
    res.status(500).json({ error: 'Error en el servidor: ' + error.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    console.log('Procesando login manual:', { email, password });
    const emailRegex = /@upqroo\.edu\.mx$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Solo se permiten correos con la extensión @upqroo.edu.mx' });
    }

    const [users] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (!users.length || !(await bcrypt.compare(password, users[0].password))) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = users[0];
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' }); // Generar JWT
    res.json({ token, user });
  } catch (error) {
    console.error('Error en login manual:', error.message, error.stack);
    res.status(500).json({ error: 'Error en el servidor: ' + error.message });
  }
});

export default router;