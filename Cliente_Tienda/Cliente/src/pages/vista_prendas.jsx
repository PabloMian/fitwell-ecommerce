import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Modal,
  Spinner,
  Toast,
  ToastContainer,
  Alert,
} from "react-bootstrap";
import axios from "axios";
import "../css/productos.css";

const defaultImage = "https://placehold.co/600x400?text=Imagen+No+Disponible";

const VistaPrendas = () => {
  const [productos, setProductos] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await axios.get("http://localhost:3005/api/productos");

        const productosProcesados = response.data.map((producto) => {
          let imagenUrl = defaultImage;
          if (producto.imagen) {
            imagenUrl = producto.imagen.startsWith("http")
              ? producto.imagen
              : `http://localhost:3005/imagenes/${producto.imagen}`;
          }
          return { ...producto, imagen: imagenUrl };
        });

        setProductos(productosProcesados.filter(p => p.categoria_id === 2));
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar las prendas.");
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, []);

  const agregarAlCarrito = (producto) => {
    const carrito = JSON.parse(localStorage.getItem("cart")) || [];
    const index = carrito.findIndex((p) => p.id === producto.id);
    if (index !== -1) {
      carrito[index].cantidad += 1;
    } else {
      producto.cantidad = 1;
      carrito.push(producto);
    }
    localStorage.setItem("cart", JSON.stringify(carrito));
    setToastMessage(`"${producto.nombre}" añadido al carrito.`);
    setShowToast(true);
    setSelectedProduct(null);
  };

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Cargando prendas...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h2 className="text-center mb-4">Prendas</h2>
      <Row>
        {productos.map((producto) => (
          <Col lg={4} md={6} key={producto.id} className="mb-4">
            <Card className="card-custom" onClick={() => setSelectedProduct(producto)}>
              <Card.Img
                className="card-img-custom"
                variant="top"
                src={producto.imagen}
                alt={producto.nombre}
                onError={(e) => {
                  e.target.src = defaultImage;
                }}
              />
              <Card.Body className="card-body-custom">
                <Card.Title>{producto.nombre}</Card.Title>
                <div className="card-footer">
                  <strong>Precio:</strong> ${producto.precio}
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Modal de detalle */}
      <Modal show={!!selectedProduct} onHide={() => setSelectedProduct(null)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{selectedProduct?.nombre}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <img
                src={selectedProduct?.imagen || defaultImage}
                alt={selectedProduct?.nombre}
                className="img-fluid rounded mb-3"
                style={{ maxHeight: "400px", objectFit: "contain" }}
              />
            </Col>
            <Col md={6}>
              <h4>Detalles</h4>
              <p>{selectedProduct?.descripcion || "No hay descripción disponible."}</p>
              <h5 className="text-primary">Precio: ${selectedProduct?.precio}</h5>
              <Button variant="primary" className="mt-3 btn-custom" onClick={() => agregarAlCarrito(selectedProduct)}>
                <i className="fas fa-cart-plus me-2"></i>Añadir al carrito
              </Button>
            </Col>
          </Row>
        </Modal.Body>
      </Modal>

      {/* Toast */}
      <ToastContainer position="bottom-end" className="p-3">
        <Toast show={showToast} onClose={() => setShowToast(false)} delay={3000} autohide bg="success">
          <Toast.Header><strong className="me-auto">Carrito</strong></Toast.Header>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
};

export default VistaPrendas;
