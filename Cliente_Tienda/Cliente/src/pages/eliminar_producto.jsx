import React, { useEffect, useState } from "react";
import {
  Container,
  ListGroup,
  Button,
  Alert,
  Modal,
  Row,
  Col,
  Accordion,
} from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const EliminarProducto = () => {
  const [productos, setProductos] = useState([]); // Estado para los productos
  const [productoSeleccionado, setProductoSeleccionado] = useState(null); // Estado para el producto seleccionado
  const [error, setError] = useState(""); // Estado para errores
  const [success, setSuccess] = useState(""); // Estado para mensajes de éxito
  const [showConfirmation, setShowConfirmation] = useState(false); // Estado para mostrar el modal de confirmación
  const navigate = useNavigate(); // Hook para redirección

  // Obtener todos los productos al montar el componente
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await axios.get("http://localhost:3005/api/productos");
        const productosConPrecioNumerico = response.data.map((producto) => ({
          ...producto,
          precio: parseFloat(producto.precio),
        }));
        setProductos(productosConPrecioNumerico);
      } catch (err) {
        setError("Error al cargar los productos");
        console.error(err);
      }
    };

    fetchProductos();
  }, []);

  const handleProductoSelect = (producto) => {
    setProductoSeleccionado(producto);
    setShowConfirmation(false); // Resetear el estado de confirmación al seleccionar un nuevo producto
  };

  const handleDelete = async () => {
    if (!productoSeleccionado) return;

    try {
      await axios.delete(`http://localhost:3005/api/productos/${productoSeleccionado.id}`);
      setProductos(productos.filter((producto) => producto.id !== productoSeleccionado.id));
      setSuccess(`Producto "${productoSeleccionado.nombre}" eliminado exitosamente!`);
      setProductoSeleccionado(null); // Resetear la selección del producto
      toast.success("Producto eliminado exitosamente!");

      // Redirigir al home después de eliminar
      navigate("/"); // Redirección al home
    } catch (err) {
      setError("Error al eliminar el producto");
      console.error(err);
    } finally {
      setShowConfirmation(false); // Cerrar el modal de confirmación
    }
  };

  // Agrupar productos por categoría con nombres
  const categorias = {
    1: "Equipos",
    2: "Prendas",
    3: "Suplementos"
  };

  const productosPorCategoria = productos.reduce((acc, producto) => {
    const categoria = producto.categoria_id;
    if (!acc[categoria]) {
      acc[categoria] = [];
    }
    acc[categoria].push(producto);
    return acc;
  }, {});

  return (
    <Container className="mt-4">
      <h2 className="mb-4 text-center">Eliminar Producto</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Row className="justify-content-center">
        <Col md={8}>
          {/* Lista de productos por categorías en un Accordion */}
          <Accordion defaultActiveKey="0">
            {Object.entries(productosPorCategoria).map(([categoriaId, productosCategoria]) => (
              <Accordion.Item eventKey={categoriaId} key={categoriaId}>
                <Accordion.Header>{categorias[categoriaId]}</Accordion.Header>
                <Accordion.Body>
                  <ListGroup className="mb-4">
                    {productosCategoria.map((producto) => (
                      <ListGroup.Item
                        key={producto.id}
                        action
                        onClick={() => handleProductoSelect(producto)}
                        className={productoSeleccionado?.id === producto.id ? 'active' : ''}
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center">
                            <img
                              src={producto.imagen || "https://via.placeholder.com/50"}
                              alt={producto.nombre}
                              style={{
                                width: "50px",
                                height: "50px",
                                objectFit: "contain",
                                marginRight: "10px",
                              }}
                            />
                            <div>
                              <span>{producto.nombre} - ${(producto.precio).toFixed(2)}</span>
                              <br />
                              <small className="text-muted">Stock: {producto.stock}</small>
                            </div>
                          </div>
                          
                          {/* Botón de eliminar al lado del producto seleccionado */}
                          {productoSeleccionado?.id === producto.id && (
                            <Button 
                              variant="danger" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation(); // Evitar que se seleccione el producto
                                setShowConfirmation(true);
                              }}
                            >
                              Eliminar
                            </Button>
                          )}
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        </Col>
      </Row>

      {/* Confirmación de eliminación como modal */}
      <Modal show={showConfirmation} onHide={() => setShowConfirmation(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmación de Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro de que deseas eliminar el producto <strong>{productoSeleccionado?.nombre}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={handleDelete}>
            Confirmar Eliminación
          </Button>
          <Button variant="secondary" onClick={() => setShowConfirmation(false)}>
            Cancelar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default EliminarProducto;
