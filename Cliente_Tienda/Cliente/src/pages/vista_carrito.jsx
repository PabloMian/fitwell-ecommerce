import { Container, ListGroup, Button, Alert, Row, Col, Form } from "react-bootstrap";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const VistaCarrito = () => {
  const [cart, setCart] = useState([]);
  const [alert, setAlert] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(storedCart);
  }, []);

  // Función para eliminar una cantidad de un producto del carrito
  const removeFromCart = (productoId, cantidad) => {
    const updatedCart = cart.map((producto) => {
      if (producto.id === productoId) {
        const nuevaCantidad = producto.cantidad - cantidad;
        if (nuevaCantidad <= 0) {
          return null; // Para eliminar el producto si la cantidad llega a 0
        }
        return { ...producto, cantidad: nuevaCantidad }; // Devolver producto con nueva cantidad
      }
      return producto;
    }).filter(Boolean); // Filtrar productos nulos

    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    setAlert("Cantidad eliminada del carrito.");
  };

  // Calcular el total del carrito
  const calcularTotal = () => {
    return cart
      .reduce(
        (total, producto) =>
          total + (Number(producto.precio || 0) * (producto.cantidad || 1)),
        0
      )
      .toFixed(2);
  };

  // Calcular la cantidad total de productos
  const calcularCantidad = () => {
    return cart.reduce((total, producto) => total + (producto.cantidad || 1), 0);
  };

  // Guardar el total en localStorage para usarlo en el pago
  const guardarTotalParaPago = () => {
    const total = calcularTotal();
    localStorage.setItem("totalPago", total);
    navigate("/pago");
  };

  return (
    <Container className="my-5">
      <h1 className="text-center mb-4">Carrito de Compras</h1>

      {alert && (
        <Alert variant="info" onClose={() => setAlert("")} dismissible>
          {alert}
        </Alert>
      )}

      {cart.length === 0 ? (
        <h5 className="text-center">Tu carrito está vacío</h5>
      ) : (
        <>
          <ListGroup>
            {cart.map((producto) => (
              <ListGroup.Item
                key={producto.id}
                className="d-flex justify-content-between align-items-center"
              >
                <div className="d-flex align-items-center">
                  <img
                    src={producto.imagen || "https://via.placeholder.com/100"}
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
                    <span>{producto.descripcion}</span>
                    <br />
                    <span>
                      <strong>Precio:</strong> ${producto.precio}
                    </span>
                    <br />
                    <span>
                      <strong>Cantidad:</strong> {producto.cantidad || 1}
                    </span>
                    <br />
                    <span>
                      <strong>Subtotal:</strong> ${(producto.precio * (producto.cantidad || 1)).toFixed(2)}
                    </span>
                  </div>
                </div>
                <div>
                  <Form.Control
                    type="number"
                    min="1"
                    max={producto.cantidad}
                    defaultValue="1"
                    style={{ width: "70px", marginRight: "10px" }}
                    id={`cantidad-${producto.id}`}
                  />
                  <Button
                    variant="danger"
                    onClick={() => {
                      const cantidadAEliminar = parseInt(document.getElementById(`cantidad-${producto.id}`).value);
                      removeFromCart(producto.id, cantidadAEliminar);
                    }}
                  >
                    Eliminar
                  </Button>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>

          {/* Resumen del carrito */}
          <Row className="mt-4">
            <Col md={{ span: 4, offset: 8 }}>
              <div className="border p-3 bg-light rounded">
                <h5>Resumen del Pedido</h5>
                <hr />
                <div className="d-flex justify-content-between">
                  <span>Productos:</span>
                  <span>{calcularCantidad()}</span>
                </div>
                <div className="d-flex justify-content-between mt-2">
                  <strong>Total:</strong>
                  <strong>${calcularTotal()}</strong>
                </div>
              </div>
            </Col>
          </Row>
        </>
      )}

      {/* Botón para proceder al pago */}
      <div className="text-center mt-4">
        {cart.length > 0 && (
          <Button variant="success" onClick={guardarTotalParaPago}>
            Proceder al pago (Total: ${calcularTotal()})
          </Button>
        )}
      </div>

      {/* Enlace para continuar comprando */}
      <div className="text-center mt-4">
        <Link to="/" className="btn btn-secondary">
          Continuar comprando
        </Link>
      </div>
    </Container>
  );
};

export default VistaCarrito;
