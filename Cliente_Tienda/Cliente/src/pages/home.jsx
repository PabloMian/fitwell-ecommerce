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
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../css/productos.css";

// Imágenes del carrusel desde Cloudinary (Usando la última versión de cada public_id)
const carruselImages = [
  "https://res.cloudinary.com/ddps7gqvl/image/upload/v1710000000/carrusel1_nyckoy.webp",
  "https://res.cloudinary.com/ddps7gqvl/image/upload/v1710000000/carrusel2_n0vsze.webp",
  "https://res.cloudinary.com/ddps7gqvl/image/upload/v1710000000/carrusel3_vj3lvq.webp",
  "https://res.cloudinary.com/ddps7gqvl/image/upload/v1710000000/carrusel4_ziknuu.webp",
  "https://res.cloudinary.com/ddps7gqvl/image/upload/v1710000000/carrusel5_pwr7sf.webp",
  "https://res.cloudinary.com/ddps7gqvl/image/upload/v1710000000/carrusel6_zwzzdr.webp",
  "https://res.cloudinary.com/ddps7gqvl/image/upload/v1710000000/carrusel7_irirpp.webp",
];


const defaultImage = "https://placehold.co/600x400?text=Imagen+No+Disponible";

const Home = ({ user }) => {
  const [productos, setProductos] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const token = localStorage.getItem("token") || "";
        const response = await axios.get("http://localhost:3005/api/productos", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const productosProcesados = response.data.map((producto) => ({
          ...producto,
          imagen: producto.imagen || defaultImage,
        }));

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

  const getUserFallback = () => {
    if (!user && localStorage.getItem("user")) {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        return storedUser || null;
      } catch (e) {
        console.error("Error parsing stored user:", e);
        localStorage.removeItem("user");
        return null;
      }
    }
    return user;
  };

  const filtrarPorCategoria = (categoriaId, cantidad) => {
    return productos
      .filter((producto) => producto.categoria_id === categoriaId)
      .slice(0, cantidad);
  };

  const agregarAlCarrito = (producto) => {
    const carritoExistente = JSON.parse(localStorage.getItem("cart")) || [];
    const index = carritoExistente.findIndex((p) => p.id === producto.id);

    if (index !== -1) {
      carritoExistente[index].cantidad += 1;
    } else {
      producto.cantidad = 1;
      carritoExistente.push(producto);
    }

    localStorage.setItem("cart", JSON.stringify(carritoExistente));
    toast.success(`"${producto.nombre}" añadido al carrito.`, {
      position: "bottom-right",
      autoClose: 3000,
    });
    setSelectedProduct(null);
  };

  const currentUser = getUserFallback();

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
      <h2 className="text-center mb-4">
        Bienvenido a FitWell{currentUser ? `, ${currentUser.nombre}` : ""}
      </h2>

      <Carousel className="mb-5">
        {carruselImages.map((img, index) => (
          <Carousel.Item key={index}>
            <img
              className="d-block w-100 rounded"
              src={img}
              alt={`Slide ${index + 1}`}
              style={{ height: "400px", objectFit: "cover" }}
              onError={(e) => {
                e.target.src = defaultImage;
                e.target.onerror = null;
                console.error("Error al cargar imagen del carrusel. URL fallida:", img);
              }}
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
              className="btn-ver-mas"
              onClick={() => navigate(categoria.ruta)}
            >
              Ver más {categoria.nombre.toLowerCase()}
            </Button>
          </div>
        </div>
      ))}

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
              <h5 className="text-primary">Precio: ${selectedProduct?.precio}</h5>
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

      <ToastContainer />
    </Container>
  );
};

export default Home;