import express from "express";
import pool from "../config/config.db.js"; // Asegúrate de que la conexión a la base de datos esté configurada correctamente
import cors from "cors";

const router = express.Router();
router.use(cors());

// Crear un nuevo pedido
const crearPedido = async (req, res) => {
    try {
        const { usuario_id, total, productos } = req.body;

        // Validaciones básicas
        if (!usuario_id || !total || !productos) {
            return res.status(400).json({ error: "Faltan datos: usuario_id, total o productos" });
        }

        // Iniciar transacción
        await pool.query("START TRANSACTION");

        // Insertar el pedido
        const [result] = await pool.query(
            `INSERT INTO pedidos (usuario_id, total) VALUES (?, ?)`,
            [usuario_id, parseFloat(total)]
        );

        const nuevoPedidoId = result.insertId;

        // Actualizar stock de los productos
        for (const item of productos) {
            const { id, cantidad } = item;

            // Restar stock del producto
            await pool.query(
                `UPDATE productos SET stock = stock - ? WHERE id = ?`,
                [cantidad, id]
            );
        }

        await pool.query("COMMIT");

        const nuevoPedido = {
            id: nuevoPedidoId,
            usuario_id,
            total: parseFloat(total),
            estado: "pendiente", // Estado inicial del pedido
            fecha: new Date().toISOString(), // Fecha del pedido
        };

        res.status(201).json({
            message: "Pedido registrado correctamente",
            pedido: nuevoPedido,
        });
    } catch (error) {
        await pool.query("ROLLBACK");
        console.error("Error al crear el pedido:", error);
        res.status(500).json({ error: "Error del servidor", detalle: error.message });
    }
};

// Obtener todos los pedidos de un usuario
const obtenerPedidos = async (req, res) => {
    const { usuario_id } = req.params; // Obtener el id del usuario desde los parámetros de la ruta

    try {
        const [result] = await pool.query(
            `SELECT * FROM pedidos WHERE usuario_id = ?`,
            [usuario_id]
        );

        // Verificar si se encontraron pedidos
        if (result.length === 0) {
            return res.status(404).json({ message: "No se encontraron pedidos para este usuario." });
        }

        // Convertir el total a número
        const pedidosConTotalNumerico = result.map(pedido => ({
            ...pedido,
            total: parseFloat(pedido.total), // Asegurarse de que total sea un número
        }));

        res.status(200).json(pedidosConTotalNumerico);
    } catch (error) {
        console.error("Error al obtener los pedidos:", error);
        res.status(500).json({ error: "Error del servidor", detalle: error.message });
    }
};

// Rutas
router.post("/", crearPedido);
router.get("/:usuario_id", obtenerPedidos); // Ruta para obtener los pedidos de un usuario

export default router;
