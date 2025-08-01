import express from "express";
import pool from "../config/config.db.js";
import cors from "cors";

const router = express.Router();
router.use(cors());

// Validación de los datos de la rutina
const validateRutina = ({ muscle, description, video_url }) => {
  if (!muscle || !description || !video_url) {
    throw new Error("Faltan campos obligatorios: muscle, description, video_url");
  }
  if (muscle.length > 50) {
    throw new Error("El campo muscle no puede exceder los 50 caracteres");
  }
  if (!video_url.startsWith("https://res.cloudinary.com")) {
    throw new Error("La URL del video debe ser de Cloudinary");
  }
};

// Manejo de errores
const handleErrors = (res, error, operation) => {
  console.error(`Error al ${operation} rutina:`, error);
  res.status(500).json({ error: `Error al ${operation} rutina`, details: error.message });
};

// GET: Obtener todas las rutinas
const getRutinas = async (req, res) => {
  try {
    const [results] = await pool.query("SELECT * FROM rutinas");
    res.status(200).json(results);
  } catch (error) {
    handleErrors(res, error, "obtener");
  }
};

// GET: Obtener una rutina por ID
const getRutinaById = async (req, res) => {
  try {
    const { id } = req.params;
    const [results] = await pool.query("SELECT * FROM rutinas WHERE id = ?", [id]);
    if (results.length === 0) {
      return res.status(404).json({ error: "Rutina no encontrada" });
    }
    res.status(200).json(results[0]);
  } catch (error) {
    handleErrors(res, error, "obtener");
  }
};

// POST: Crear una nueva rutina
const createRutina = async (req, res) => {
  try {
    const { muscle, description, video_url } = req.body;
    await validateRutina({ muscle, description, video_url });

    const [result] = await pool.query(
      "INSERT INTO rutinas (muscle, description, video_url) VALUES (?, ?, ?)",
      [muscle, description, video_url]
    );

    res.status(201).json({
      message: "Rutina creada exitosamente",
      rutina: {
        id: result.insertId,
        muscle,
        description,
        video_url,
      },
    });
  } catch (error) {
    handleErrors(res, error, "crear");
  }
};

// PUT: Actualizar una rutina
const updateRutina = async (req, res) => {
  try {
    const { id } = req.params;
    const { muscle, description, video_url } = req.body;
    await validateRutina({ muscle, description, video_url });

    const [existing] = await pool.query("SELECT * FROM rutinas WHERE id = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: "Rutina no encontrada" });
    }

    await pool.query(
      "UPDATE rutinas SET muscle = ?, description = ?, video_url = ? WHERE id = ?",
      [muscle, description, video_url, id]
    );

    res.status(200).json({
      message: "Rutina actualizada exitosamente",
      rutina: {
        id,
        muscle,
        description,
        video_url,
      },
    });
  } catch (error) {
    handleErrors(res, error, "actualizar");
  }
};

// DELETE: Eliminar una rutina
const deleteRutina = async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await pool.query("SELECT * FROM rutinas WHERE id = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: "Rutina no encontrada" });
    }

    await pool.query("DELETE FROM rutinas WHERE id = ?", [id]);

    res.status(200).json({ message: "Rutina eliminada exitosamente" });
  } catch (error) {
    handleErrors(res, error, "eliminar");
  }
};

// Definir las rutas
router.get("/", getRutinas);
router.get("/:id", getRutinaById);
router.post("/", createRutina);
router.put("/:id", updateRutina);
router.delete("/:id", deleteRutina);

export default router;