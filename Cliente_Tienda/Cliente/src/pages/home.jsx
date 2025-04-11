import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Carousel,
  Modal,
  Alert,
  Spinner,
  Toast,
  ToastContainer,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/productos.css";

// Importar imágenes del carrusel
import img1 from "../components/images/carrusel1.webp";
import img2 from "../components/images/carrusel2.webp";
import img3 from "../components/images/carrusel3.webp";
import img4 from "../components/images/carrusel4.webp";
import img5 from "../components/images/carrusel5.webp";
import img6 from "../components/images/carrusel6.webp";
import img7 from "../components/images/carrusel7.webp";

const carruselImages = [img1, img2, img3, img4, img5, img6, img7];

const defaultImage = "https://placehold.co/600x400?text=Imagen+No+Disponible";

const Home = () => {
  const [productos, setProductos] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await axios.get("http://localhost:3005/api/productos");

        const productosProcesados = response.data.map((producto) => {
          let imagenUrl = defaultImage;

          if (producto.imagen) {
            if (producto.imagen.startsWith("http")) {
              imagenUrl = producto.imagen;
            } else {
              imagenUrl = `http://localhost:3005/imagenes/${producto.imagen}`;
            }
          }

          return {
            ...producto,
            imagen: imagenUrl,
          };
        });

        setProductos(productosProcesados);
      } catch (error) {
        console.error("Error al cargar productos:", error);
        setError("Error al cargar los productos. Intenta recargar la página.");
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, []);

  const filtrarPorCategoria = (categoriaId, cantidad) => {
    return productos
      .filter((producto) => producto.categoria_id === categoriaId)
      .slice(0, cantidad);
  };

  const agregarAlCarrito = (producto) => {
    const carritoExistente = JSON.parse(localStorage.getItem("cart")) || [];
    const index = carritoExistente.findIndex((p) => p.id === producto.id);

    if (index !== -1) {
      carritoExistente[index].cantidad += 1; // Aumentar cantidad
    } else {
      producto.cantidad = 1; // Establecer cantidad inicial
      carritoExistente.push(producto);
    }

    localStorage.setItem("cart", JSON.stringify(carritoExistente));
    setToastMessage(`"${producto.nombre}" añadido al carrito.`);
    setShowToast(true);
    setSelectedProduct(null);
  };

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Cargando productos...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-5">
        <Alert variant="danger">
          {error}
          <div className="mt-3">
            <Button variant="primary" onClick={() => window.location.reload()}>
              Recargar página
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h2 className="text-center mb-4">Bienvenido a FitWell</h2>

      <Carousel className="mb-5">
        {carruselImages.map((img, index) => (
          <Carousel.Item key={index}>
            <img
              className="d-block w-100 rounded"
              src={img}
              alt={`Slide ${index + 1}`}
              style={{ height: "400px", objectFit: "cover" }}
              onError={(e) => (e.target.src = defaultImage)}
            />
          </Carousel.Item>
        ))}
      </Carousel>

      {[
        { id: 1, nombre: "Equipos", ruta: "/equipos" },
        { id: 2, nombre: "Prendas", ruta: "/prendas" },
        { id: 3, nombre: "Suplementos", ruta: "/suplementos" },
      ].map((categoria) => (
        <div key={categoria.id} className="mb-5">
          <h3 className="mb-4">{categoria.nombre}</h3>
          <Row>
            {filtrarPorCategoria(categoria.id, 6).map((producto) => (
              <Col lg={4} md={6} key={producto.id} className="mb-4">
                <Card
                  className="card-custom"
                  onClick={() => setSelectedProduct(producto)}
                >
                  <Card.Img
                    className="card-img-custom"
                    variant="top"
                    src={producto.imagen}
                    alt={producto.nombre}
                    onError={(e) => {
                      e.target.src = defaultImage;
                      e.target.onerror = null;
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
          <div className="text-center mt-3">
            <Button
              variant="primary"
              className="btn-ver-mas"
              onClick={() => navigate(categoria.ruta)}
            >
              Ver más {categoria.nombre.toLowerCase()}
            </Button>
          </div>
        </div>
      ))}

      {/* Modal de detalle */}
      <Modal
        show={!!selectedProduct}
        onHide={() => setSelectedProduct(null)}
        size="lg"
        centered
      >
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
                onError={(e) => {
                  e.target.src = defaultImage;
                  e.target.onerror = null;
                }}
              />
            </Col>
            <Col md={6}>
              <h4>Detalles</h4>
              <p>{selectedProduct?.descripcion || "No hay descripción disponible."}</p>
              <h5 className="text-primary">
                Precio: ${selectedProduct?.precio}
              </h5>
              <Button
                variant="primary"
                className="mt-3 btn-custom"
                onClick={() => agregarAlCarrito(selectedProduct)}
              >
                <i className="fas fa-cart-plus me-2"></i>
                Añadir al carrito
              </Button>
            </Col>
          </Row>
        </Modal.Body>
      </Modal>

      {/* Toast de confirmación */}
      <ToastContainer position="bottom-end" className="p-3">
        <Toast
          show={showToast}
          onClose={() => setShowToast(false)}
          delay={3000}
          autohide
          bg="success"
        >
          <Toast.Header>
            <strong className="me-auto">Carrito</strong>
          </Toast.Header>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
};

export default Home;
