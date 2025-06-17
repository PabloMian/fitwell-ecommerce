import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Importación de rutas
import productosRoutes from "./routes/productos.js";
import usuariosRoutes from "./routes/usuarios.js";
import pedidosRoutes from "./routes/pedidos.js";
import authRoutes from "./routes/auth.js"; // Asegúrate de importar auth.js

// Configuración
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Configuración CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/imagenes", express.static(path.join(__dirname, "public/imagenes")));

// Rutas
app.get("/api", (req, res) => {
  res.json({ mensaje: "¡API funcionando!", status: 200 });
});

// Configuración de rutas
app.use("/api/productos", productosRoutes);
app.use("/api/auth", authRoutes); // Usa solo authRoutes para /api/auth
app.use("/api/pedidos", pedidosRoutes);

// Manejo de errores
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Error interno del servidor" });
});

// Iniciar servidor
const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`
  🚀 Servidor activo en: http://localhost:${PORT}
  Rutas disponibles:
  - POST   http://localhost:${PORT}/api/auth/google
  - GET    http://localhost:${PORT}/api/productos
  - GET    http://localhost:${PORT}/api/pedidos/:usuario_id
  - POST   http://localhost:${PORT}/api/pedidos
  `);
});