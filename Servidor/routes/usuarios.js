import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/config.db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

// Registro de usuario (versión mejorada)
router.post('/registro', async (req, res) => {
  try {
    const { nombre, email, password, direccion, telefono } = req.body;

    // Validaciones mejoradas
    if (!nombre || !email || !password) {
      return res.status(400).json({ 
        success: false,
        error: "Nombre, email y contraseña son obligatorios" 
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: "La contraseña debe tener al menos 8 caracteres"
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        error: "El formato del email no es válido"
      });
    }

    // Verificar email existente
    const [existingUsers] = await pool.query(
      "SELECT id FROM usuarios WHERE email = ?", 
      [email]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        error: "El email ya está registrado"
      });
    }

    // Hash de contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear usuario con todos los campos
    const [result] = await pool.query(
      `INSERT INTO usuarios 
      (nombre, email, password, direccion, telefono, rol) 
      VALUES (?, ?, ?, ?, ?, ?)`,

      [
        nombre, 
        email, 
        hashedPassword, 
        direccion || null, 
        telefono || null, 
        'cliente'
      ]
    );

    // Generar token JWT
    const token = jwt.sign(
      { 
        id: result.insertId, 
        email, 
        rol: 'cliente',
        nombre,
        direccion,
        telefono
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Obtener usuario recién creado
    const [newUser] = await pool.query(
      "SELECT id, nombre, email, direccion, telefono, rol FROM usuarios WHERE id = ?",
      [result.insertId]
    );

    // Respuesta exitosa mejorada
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.status(201).json({
      success: true,
      message: "¡Registro exitoso! Redirigiendo al login...",
      token,
      usuario: newUser[0],
      redirectToLogin: true // Nueva propiedad para manejar redirección
    });

  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({ 
      success: false,
      error: "Error interno del servidor",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Login de usuario (versión mejorada)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar credenciales
    const [users] = await pool.query(
      "SELECT * FROM usuarios WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        error: "Credenciales inválidas"
      });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Credenciales inválidas"
      });
    }

    // Generar token con más datos del usuario
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        rol: user.rol,
        nombre: user.nombre,
        direccion: user.direccion,
        telefono: user.telefono
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Eliminar password de la respuesta
    const { password: _, ...userData } = user;

    // Respuesta exitosa
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.json({
      success: true,
      token,
      usuario: userData
    });

  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({
      success: false,
      error: "Error interno del servidor",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Obtener datos del usuario (requiere autenticación)
router.get('/usuario', async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1]; // Obtener el token del header

    if (!token) {
      return res.status(401).json({ error: "Token no proporcionado." });
    }

    // Verificar y decodificar el token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Obtener el usuario basado en el ID del token
    const [user] = await pool.query("SELECT id, nombre, email, direccion, telefono FROM usuarios WHERE id = ?", [decoded.id]);

    if (user.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    res.json(user[0]);
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

// Exportar las rutas
export default router;
