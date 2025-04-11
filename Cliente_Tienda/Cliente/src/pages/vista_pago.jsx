import React, { useEffect, useState } from "react"; 
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Table,
  Form,
  Spinner,
} from "react-bootstrap";
import { Link } from "react-router-dom";

const VistaPago = () => {
  const [cart, setCart] = useState([]);
  const [alert, setAlert] = useState("");
  const [total, setTotal] = useState(0);
  const [cantidadProductos, setCantidadProductos] = useState(0);
  const [usuarioData, setUsuarioData] = useState({
    id: "",
    nombre: "",
    email: "",
    direccion: "",
    telefono: "",
  });
  const [pagoData, setPagoData] = useState({
    numeroTarjeta: "",
    cvv: "",
    fechaVencimiento: "",
  });
  const [isProcessing, setIsProcessing] = useState(false); // Estado para controlar el procesamiento del pago

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    const totalCantidad = storedCart.reduce(
      (acc, item) => acc + (item.cantidad || 1),
      0
    );
    const totalDinero = storedCart.reduce(
      (acc, item) => acc + Number(item.precio || 0) * (item.cantidad || 1),
      0
    );

    setCart(storedCart);
    setCantidadProductos(totalCantidad);
    setTotal(totalDinero.toFixed(2));

    // Obtener datos del usuario
    const fetchUsuarioData = async () => {
      const token = localStorage.getItem("token"); // Obtén el token del localStorage
      if (!token) {
        setAlert("⚠️ No se encontró el token de usuario.");
        return;
      }

      try {
        const response = await fetch("http://localhost:3005/api/auth/usuario", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`, // Incluye el token en el header
          },
        });

        if (!response.ok) {
          throw new Error("Error al cargar los datos del usuario.");
        }

        const data = await response.json();
        setUsuarioData({
          id: data.id,
          nombre: data.nombre,
          email: data.email,
          direccion: data.direccion,
          telefono: data.telefono,
        });
      } catch (error) {
        console.error(error);
        setAlert("❌ Error al conectar con el servidor.");
      }
    };

    fetchUsuarioData();
  }, []);

  const handlePayment = async (e) => {
    e.preventDefault();
    setIsProcessing(true); // Activar estado de procesamiento

    // Simular el procesamiento de pago
    setTimeout(async () => {
      try {
        const response = await fetch("http://localhost:3005/api/pedidos", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            usuario_id: usuarioData.id, // Enviamos el ID del usuario
            total: total, // Enviamos el total
            productos: cart.map((producto) => ({
              id: producto.id,
              cantidad: producto.cantidad || 1, // Asegúrate de que estás enviando la cantidad correcta
            })),
          }),
        });

        if (!response.ok) {
          const errorData = await response.json(); // Obtener información de error
          throw new Error(errorData.error || "Error al registrar el pedido.");
        }

        const data = await response.json();

        if (data.message) {
          setAlert("✅ Pedido registrado con éxito.");
          localStorage.removeItem("cart");
          setCart([]);
        } else {
          setAlert("❌ Error al registrar el pedido.");
        }
      } catch (error) {
        console.error(error);
        setAlert("❌ Error al conectar con el servidor.");
      } finally {
        setIsProcessing(false); // Desactivar estado de procesamiento
      }
    }, 2000); // Simular un tiempo de espera de 2 segundos para procesar el pago
  };

  return (
    <Container className="my-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Resumen de Pago</h1>
        <Link to="/" className="btn btn-outline-secondary">
          ← Volver al Home
        </Link>
      </div>

      {alert && (
        <Alert variant="info" onClose={() => setAlert("")} dismissible>
          {alert}
        </Alert>
      )}

      {cart.length === 0 ? (
        <h5 className="text-center">Tu carrito está vacío</h5>
      ) : (
        <>
          <Row>
            <Col md={8}>
              <h4>Productos en tu carrito</h4>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Precio</th>
                    <th>Cantidad</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((producto) => (
                    <tr key={producto.id}>
                      <td>
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
                            <strong>{producto.nombre}</strong>
                            <br />
                            <small>{producto.descripcion}</small>
                          </div>
                        </div>
                      </td>
                      <td>${producto.precio}</td>
                      <td>{producto.cantidad || 1}</td>
                      <td>${(producto.precio * (producto.cantidad || 1)).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Col>

            <Col md={4}>
              <div className="border p-3 bg-light rounded">
                <h5>Resumen del Pedido</h5>
                <hr />
                <div className="d-flex justify-content-between">
                  <span>Total de productos:</span>
                  <span>{cantidadProductos}</span>
                </div>
                <div className="d-flex justify-content-between mt-3">
                  <strong>Total a pagar:</strong>
                  <strong>${total}</strong>
                </div>
              </div>
            </Col>
          </Row>

          {/* Formulario de pedido */}
          <Row className="mt-4">
            <Col md={{ span: 6, offset: 3 }}>
              <Card className="p-4">
                <h5>Formulario de Pedido</h5>
                <Form onSubmit={handlePayment}>
                  <Form.Group controlId="nombre" className="mb-3">
                    <Form.Label>Nombre</Form.Label>
                    <Form.Control
                      type="text"
                      value={usuarioData.nombre}
                      onChange={(e) => setUsuarioData({ ...usuarioData, nombre: e.target.value })}
                      placeholder="Ingresa tu nombre"
                      required
                    />
                  </Form.Group>

                  <Form.Group controlId="email" className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={usuarioData.email}
                      onChange={(e) => setUsuarioData({ ...usuarioData, email: e.target.value })}
                      placeholder="Ingresa tu correo electrónico"
                      required
                    />
                  </Form.Group>

                  <Form.Group controlId="direccion" className="mb-3">
                    <Form.Label>Dirección</Form.Label>
                    <Form.Control
                      type="text"
                      value={usuarioData.direccion}
                      onChange={(e) => setUsuarioData({ ...usuarioData, direccion: e.target.value })}
                      placeholder="Ingresa tu dirección"
                      required
                    />
                  </Form.Group>

                  <Form.Group controlId="telefono" className="mb-3">
                    <Form.Label>Teléfono</Form.Label>
                    <Form.Control
                      type="text"
                      value={usuarioData.telefono}
                      onChange={(e) => setUsuarioData({ ...usuarioData, telefono: e.target.value })}
                      placeholder="Ingresa tu número de teléfono"
                      required
                    />
                  </Form.Group>

                  <h5 className="mt-4">Datos de Pago</h5>
                  <Form.Group controlId="numeroTarjeta" className="mb-3">
                    <Form.Label>Número de Tarjeta</Form.Label>
                    <Form.Control
                      type="text"
                      value={pagoData.numeroTarjeta}
                      onChange={(e) => setPagoData({ ...pagoData, numeroTarjeta: e.target.value })}
                      placeholder="Ingresa el número de tarjeta"
                      required
                    />
                  </Form.Group>

                  <Form.Group controlId="cvv" className="mb-3">
                    <Form.Label>CVV</Form.Label>
                    <Form.Control
                      type="text"
                      value={pagoData.cvv}
                      onChange={(e) => setPagoData({ ...pagoData, cvv: e.target.value })}
                      placeholder="Ingresa el CVV"
                      required
                    />
                  </Form.Group>

                  <Form.Group controlId="fechaVencimiento" className="mb-3">
                    <Form.Label>Fecha de Vencimiento (MM/AA)</Form.Label>
                    <Form.Control
                      type="text"
                      value={pagoData.fechaVencimiento}
                      onChange={(e) => setPagoData({ ...pagoData, fechaVencimiento: e.target.value })}
                      placeholder="MM/AA"
                      required
                    />
                  </Form.Group>

                  <Button type="submit" variant="success" className="w-100" disabled={isProcessing}>
                    {isProcessing ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Procesando...
                      </>
                    ) : (
                      "Confirmar Pago"
                    )}
                  </Button>
                </Form>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default VistaPago;
