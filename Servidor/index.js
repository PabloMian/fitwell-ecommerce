import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import mysql from "mysql2/promise";
import ExcelJS from "exceljs";
import pool from "./config/config.db.js"; // Ajusta la ruta según tu estructura

// Importación de rutas
import productosRoutes from "./routes/productos.js";
import usuariosRoutes from "./routes/usuarios.js";
import pedidosRoutes from "./routes/pedidos.js";
import authRoutes from "./routes/auth.js";

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

// Endpoint para exportar productos a Excel
app.get("/api/exportar-productos", async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT id, nombre, descripcion, precio, stock, 
                   categoria_id AS categoria, imagen, destacado, created_at
            FROM productos
        `);

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Productos');

        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Nombre', key: 'nombre', width: 30 },
            { header: 'Descripción', key: 'descripcion', width: 40 },
            { header: 'Precio', key: 'precio', width: 15 },
            { header: 'Stock', key: 'stock', width: 10 },
            { header: 'Categoría ID', key: 'categoria', width: 20 },
            { header: 'Imagen', key: 'imagen', width: 30 },
            { header: 'Destacado', key: 'destacado', width: 12 },
            { header: 'Creado', key: 'created_at', width: 20 }
        ];

        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4F81BD' }
        };
        worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' } };

        rows.forEach(row => {
            worksheet.addRow({
                id: row.id,
                nombre: row.nombre,
                descripcion: row.descripcion,
                precio: row.precio,
                stock: row.stock,
                categoria: row.categoria,
                imagen: row.imagen,
                destacado: row.destacado ? 'Sí' : 'No',
                created_at: new Date(row.created_at).toLocaleString()
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=productos.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al exportar productos' });
    }
});

// Configuración de rutas
app.use("/api/productos", productosRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/pedidos", pedidosRoutes);
app.use("/api/usuarios", usuariosRoutes);

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
    - POST   http://localhost:${PORT}/api/auth/registro
    - GET    http://localhost:${PORT}/api/productos
    - GET    http://localhost:${PORT}/api/exportar-productos
    - GET    http://localhost:${PORT}/api/pedidos/:usuario_id
    - POST   http://localhost:${PORT}/api/pedidos
    `);
});