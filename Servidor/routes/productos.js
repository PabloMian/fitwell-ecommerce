import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import pool from "../config/config.db.js";
import cors from "cors"; // Añadido para manejar CORS

const router = express.Router();

// Configuración de CORS
router.use(cors());

// Configuración del directorio de imágenes
const uploadDir = path.join(process.cwd(), "public", "imagenes");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración mejorada de Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, uniqueSuffix + ext);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten imágenes (JPEG, PNG, GIF, WEBP)'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

// Helper para construir URL de imagen
const buildImageUrl = (req, filename) => {
    return `${req.protocol}://${req.get('host')}/imagenes/${filename}`;
};

// Middleware para manejo de errores
const handleErrors = (res, error, operation) => {
    console.error(`Error al ${operation} producto:`, error);
    res.status(500).json({ 
        error: `Error al ${operation} producto`,
        details: error.message
    });
};

// Validación de campos obligatorios
const validateProduct = (productData) => {
    const { nombre, precio, stock, categoria_id } = productData;
    if (!nombre || !precio || !stock || !categoria_id) {
        throw new Error("Faltan campos obligatorios: nombre, precio, stock, categoria_id");
    }
};

// Obtener todos los productos
const getProductos = async (req, res) => {
    try {
        const [results] = await pool.query(`
            SELECT p.*, c.nombre as categoria_nombre 
            FROM productos p
            JOIN categorias c ON p.categoria_id = c.id
        `);

        const productos = results.map(producto => ({
            ...producto,
            imagen: producto.imagen ? buildImageUrl(req, producto.imagen) : null,
            destacado: producto.destacado === 1
        }));

        res.status(200).json(productos);
    } catch (error) {
        handleErrors(res, error, "obtener");
    }
};

// Obtener producto por ID
const getProductoById = async (req, res) => {
    try {
        const { id } = req.params;
        const [results] = await pool.query(`
            SELECT p.*, c.nombre as categoria_nombre 
            FROM productos p
            JOIN categorias c ON p.categoria_id = c.id
            WHERE p.id = ?
        `, [id]);

        if (results.length === 0) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }

        const producto = {
            ...results[0],
            imagen: results[0].imagen ? buildImageUrl(req, results[0].imagen) : null,
            destacado: results[0].destacado === 1
        };

        res.status(200).json(producto);
    } catch (error) {
        handleErrors(res, error, "obtener");
    }
};

// Crear nuevo producto
const createProducto = async (req, res) => {
    try {
        const { nombre, descripcion, precio, stock, categoria_id, destacado } = req.body;
        const imagen = req.file?.filename || null;

        // Validación
        validateProduct({ nombre, precio, stock, categoria_id });

        const [result] = await pool.query(
            `INSERT INTO productos 
            (nombre, descripcion, precio, stock, categoria_id, imagen, destacado) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                nombre,
                descripcion || null,
                parseFloat(precio),
                parseInt(stock),
                parseInt(categoria_id),
                imagen,
                destacado ? 1 : 0
            ]
        );

        const nuevoProducto = {
            id: result.insertId,
            nombre,
            descripcion,
            precio: parseFloat(precio),
            stock: parseInt(stock),
            categoria_id: parseInt(categoria_id),
            imagen: imagen ? buildImageUrl(req, imagen) : null,
            destacado: destacado ? 1 : 0
        };

        res.status(201).json({
            message: "Producto creado exitosamente",
            producto: nuevoProducto
        });
    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path);
        handleErrors(res, error, "crear");
    }
};

// Actualizar producto
const updateProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, precio, stock, categoria_id, destacado } = req.body;
        const nuevaImagen = req.file?.filename || null;

        // Validación
        validateProduct({ nombre, precio, stock, categoria_id });

        // Obtener producto actual
        const [existing] = await pool.query(
            "SELECT imagen FROM productos WHERE id = ?", 
            [id]
        );

        if (existing.length === 0) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(404).json({ error: "Producto no encontrado" });
        }

        // Eliminar imagen anterior si existe y se subió una nueva
        if (nuevaImagen && existing[0].imagen) {
            try {
                fs.unlinkSync(path.join(uploadDir, existing[0].imagen));
            } catch (error) {
                console.warn("No se pudo eliminar la imagen anterior:", error.message);
            }
        }

        // Actualizar producto
        const [result] = await pool.query(
            `UPDATE productos SET 
            nombre = ?, 
            descripcion = ?, 
            precio = ?, 
            stock = ?, 
            categoria_id = ?, 
            imagen = ?, 
            destacado = ? 
            WHERE id = ?`,
            [
                nombre,
                descripcion || null,
                parseFloat(precio),
                parseInt(stock),
                parseInt(categoria_id),
                nuevaImagen || existing[0].imagen,
                destacado ? 1 : 0,
                id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }

        const productoActualizado = {
            id,
            nombre,
            descripcion,
            precio: parseFloat(precio),
            stock: parseInt(stock),
            categoria_id: parseInt(categoria_id),
            imagen: nuevaImagen ? buildImageUrl(req, nuevaImagen) : 
                  existing[0].imagen ? buildImageUrl(req, existing[0].imagen) : null,
            destacado: destacado ? 1 : 0
        };

        res.status(200).json({
            message: "Producto actualizado exitosamente",
            producto: productoActualizado
        });
    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path);
        handleErrors(res, error, "actualizar");
    }
};

// Eliminar producto
const deleteProducto = async (req, res) => {
    try {
        const { id } = req.params;

        // Obtener producto para eliminar su imagen
        const [existing] = await pool.query(
            "SELECT imagen FROM productos WHERE id = ?", 
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }

        // Eliminar imagen asociada si existe
        if (existing[0].imagen) {
            try {
                fs.unlinkSync(path.join(uploadDir, existing[0].imagen));
            } catch (error) {
                console.warn("No se pudo eliminar la imagen:", error.message);
            }
        }

        // Eliminar producto
        const [result] = await pool.query(
            "DELETE FROM productos WHERE id = ?", 
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }

        res.status(200).json({ 
            message: "Producto eliminado exitosamente" 
        });
    } catch (error) {
        handleErrors(res, error, "eliminar");
    }
};

// Configuración de rutas con el prefijo /api/productos
router.get('/', getProductos);
router.get('/:id', getProductoById);
router.post('/', upload.single('imagen'), createProducto); // Multer como middleware
router.put('/:id', upload.single('imagen'), updateProducto);
router.delete('/:id', deleteProducto);

export default router;