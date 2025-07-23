import express from "express";
import multer from "multer";
import { Readable } from "stream";
import cloudinary from "../config/cloudinary.js";
import pool from "../config/config.db.js";
import cors from "cors";

const router = express.Router();
router.use(cors());

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    allowedTypes.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("Solo se permiten imágenes"), false);
  },
});

const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (err, result) => {
      if (result) resolve(`${result.secure_url}?q=auto,f=webp`); // Optimizar URL
      else reject(err);
    });
    const readable = new Readable();
    readable._read = () => {};
    readable.push(buffer);
    readable.push(null);
    readable.pipe(stream);
  });
};

const validateProduct = async ({ nombre, precio, stock, categoria_id }) => {
  if (!nombre || !precio || !stock || !categoria_id) {
    throw new Error("Faltan campos obligatorios: nombre, precio, stock, categoria_id");
  }
  const [categoria] = await pool.query("SELECT id FROM categorias WHERE id = ?", [categoria_id]);
  if (categoria.length === 0) {
    throw new Error("La categoría especificada no existe");
  }
};

const handleErrors = (res, error, operation) => {
  console.error(`Error al ${operation} producto:`, error);
  res.status(500).json({ error: `Error al ${operation} producto`, details: error.message });
};

const getProductos = async (req, res) => {
  try {
    const [results] = await pool.query(`
      SELECT p.*, c.nombre AS categoria_nombre
      FROM productos p
      JOIN categorias c ON p.categoria_id = c.id
    `);

    const productos = results.map(p => ({
      ...p,
      destacado: p.destacado === 1
    }));

    res.status(200).json(productos);
  } catch (error) {
    handleErrors(res, error, "obtener");
  }
};

const getProductoById = async (req, res) => {
  try {
    const { id } = req.params;
    const [results] = await pool.query(`
      SELECT p.*, c.nombre AS categoria_nombre
      FROM productos p
      JOIN categorias c ON p.categoria_id = c.id
      WHERE p.id = ?
    `, [id]);

    if (results.length === 0) return res.status(404).json({ error: "Producto no encontrado" });

    const producto = {
      ...results[0],
      destacado: results[0].destacado === 1
    };

    res.status(200).json(producto);
  } catch (error) {
    handleErrors(res, error, "obtener");
  }
};

const createProducto = async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock, categoria_id, destacado } = req.body;
    await validateProduct({ nombre, precio, stock, categoria_id });

    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.buffer, "productos");
    }

    const [result] = await pool.query(
      `INSERT INTO productos (nombre, descripcion, precio, stock, categoria_id, imagen, destacado) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nombre, descripcion || null, parseFloat(precio), parseInt(stock), parseInt(categoria_id), imageUrl, destacado ? 1 : 0]
    );

    res.status(201).json({
      message: "Producto creado exitosamente",
      producto: {
        id: result.insertId,
        nombre,
        descripcion,
        precio,
        stock,
        categoria_id,
        imagen: imageUrl,
        destacado: destacado ? 1 : 0,
      },
    });
  } catch (error) {
    handleErrors(res, error, "crear");
  }
};

const updateProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precio, stock, categoria_id, destacado } = req.body;
    await validateProduct({ nombre, precio, stock, categoria_id });

    const [existing] = await pool.query("SELECT imagen FROM productos WHERE id = ?", [id]);
    if (existing.length === 0) return res.status(404).json({ error: "Producto no encontrado" });

    let imageUrl = existing[0].imagen;
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.buffer, "productos");
    }

    await pool.query(
      `UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, stock = ?, categoria_id = ?, imagen = ?, destacado = ? WHERE id = ?`,
      [nombre, descripcion || null, parseFloat(precio), parseInt(stock), parseInt(categoria_id), imageUrl, destacado ? 1 : 0, id]
    );

    res.status(200).json({
      message: "Producto actualizado exitosamente",
      producto: {
        id,
        nombre,
        descripcion,
        precio,
        stock,
        categoria_id,
        imagen: imageUrl,
        destacado: destacado ? 1 : 0,
      },
    });
  } catch (error) {
    handleErrors(res, error, "actualizar");
  }
};

const deleteProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await pool.query("SELECT imagen FROM productos WHERE id = ?", [id]);
    if (existing.length === 0) return res.status(404).json({ error: "Producto no encontrado" });

    // Eliminar imagen de Cloudinary si existe
    if (existing[0].imagen) {
      const publicId = existing[0].imagen.split('/').slice(-2).join('/').split('?')[0].split('.')[0]; // Ejemplo: "productos/abc123"
      await cloudinary.uploader.destroy(publicId);
    }

    await pool.query("DELETE FROM productos WHERE id = ?", [id]);

    res.status(200).json({ message: "Producto eliminado exitosamente" });
  } catch (error) {
    handleErrors(res, error, "eliminar");
  }
};

router.get('/', getProductos);
router.get('/:id', getProductoById);
router.post('/', upload.single('imagen'), createProducto);
router.put('/:id', upload.single('imagen'), updateProducto);
router.delete('/:id', deleteProducto);

export default router;