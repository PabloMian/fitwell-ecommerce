import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  ListGroup,
  Badge,
  Spinner,
  Alert,
} from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";

const Pedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPedidos = async () => {
      const usuario_id = JSON.parse(localStorage.getItem("user")).id;

      try {
        const response = await axios.get(`http://localhost:3005/api/pedidos/${usuario_id}`);
        setPedidos(response.data);
      } catch (err) {
        setError("Error al cargar los pedidos");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPedidos();
  }, []);

  const renderEstadoBadge = (estado) => {
    switch (estado) {
      case "pendiente":
        return <Badge bg="warning">Pendiente</Badge>;
      case "procesando":
        return <Badge bg="info">Procesando</Badge>;
      case "enviado":
        return <Badge bg="primary">Enviado</Badge>;
      case "completado":
        return <Badge bg="success">Completado</Badge>;
      case "cancelado":
        return <Badge bg="danger">Cancelado</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Container className="mt-4">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Historial de Pedidos</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {pedidos.length === 0 ? (
        <Alert variant="info">No tienes pedidos realizados.</Alert>
      ) : (
        <Row>
          {pedidos.map((pedido) => (
            <Col md={6} key={pedido.id} className="mb-4">
              <Card>
                <Card.Body>
                  <Card.Title>Pedido #{pedido.id}</Card.Title>
                  <Card.Text>
                    <strong>Fecha:</strong> {new Date(pedido.fecha).toLocaleString()}
                    <br />
                    <strong>Total:</strong> ${pedido.total && !isNaN(pedido.total) ? pedido.total.toFixed(2) : "0.00"}
                    <br />
                    <strong>Estado:</strong> {renderEstadoBadge(pedido.estado)}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default Pedidos;
