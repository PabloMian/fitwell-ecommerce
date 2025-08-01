import { useEffect, useState } from "react";
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

const EliminarRutina = ({ user }) => {
  const [rutinas, setRutinas] = useState([]);
  const [rutinaSeleccionada, setRutinaSeleccionada] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const navigate = useNavigate();

  // Verificar si el usuario es admin
  if (!user || user.rol !== "admin") {
    return (
      <Container className="py-4">
        <Alert variant="danger" className="text-center">
          Acceso denegado: Solo los administradores pueden eliminar rutinas.
        </Alert>
      </Container>
    );
  }

  // Obtener todas las rutinas al montar el componente
  useEffect(() => {
    const fetchRutinas = async () => {
      try {
        const token = localStorage.getItem("token") || "";
        const response = await axios.get("http://localhost:3005/api/rutinas", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRutinas(response.data);
      } catch (err) {
        setError("Error al cargar las rutinas");
        console.error(err);
      }
    };

    fetchRutinas();
  }, []);

  const handleRutinaSelect = (rutina) => {
    setRutinaSeleccionada(rutina);
    setShowConfirmation(false);
  };

  const handleDelete = async () => {
    if (!rutinaSeleccionada) return;

    try {
      const token = localStorage.getItem("token") || "";
      if (!token) throw new Error("No estás autenticado");

      await axios.delete(`http://localhost:3005/api/rutinas/${rutinaSeleccionada.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setRutinas(rutinas.filter((rutina) => rutina.id !== rutinaSeleccionada.id));
      setSuccess(`Rutina "${rutinaSeleccionada.muscle}" eliminada exitosamente!`);
      setRutinaSeleccionada(null);
      toast.success("Rutina eliminada exitosamente!");
      setTimeout(() => navigate("/rutinas"), 1500);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Error al eliminar la rutina");
      console.error(err);
    } finally {
      setShowConfirmation(false);
    }
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4 text-center">Eliminar Rutina</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Row className="justify-content-center">
        <Col md={8}>
          {/* Lista de rutinas en un Accordion */}
          <Accordion defaultActiveKey="0">
            <Accordion.Item eventKey="0">
              <Accordion.Header>Rutinas</Accordion.Header>
              <Accordion.Body>
                <ListGroup className="mb-4">
                  {rutinas.map((rutina) => (
                    <ListGroup.Item
                      key={rutina.id}
                      action
                      onClick={() => handleRutinaSelect(rutina)}
                      className={rutinaSeleccionada?.id === rutina.id ? 'active' : ''}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                          <span>{rutina.muscle}</span>
                        </div>
                        {rutinaSeleccionada?.id === rutina.id && (
                          <Button 
                            variant="danger" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
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
          </Accordion>
        </Col>
      </Row>

      {/* Confirmación de eliminación como modal */}
      <Modal show={showConfirmation} onHide={() => setShowConfirmation(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmación de Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro de que deseas eliminar la rutina <strong>{rutinaSeleccionada?.muscle}</strong>?
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

export default EliminarRutina;