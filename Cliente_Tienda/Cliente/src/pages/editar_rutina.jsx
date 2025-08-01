import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  ListGroup,
  Form,
  Accordion,
} from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const EditarRutina = ({ user }) => {
  const [rutinas, setRutinas] = useState([]);
  const [rutinaSeleccionada, setRutinaSeleccionada] = useState(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Verificar si el usuario es admin
  if (!user || user.rol !== "admin") {
    return (
      <Container className="py-4">
        <Alert variant="danger" className="text-center">
          Acceso denegado: Solo los administradores pueden editar rutinas.
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
        // Extraer el video_id de la URL completa
        const rutinasProcesadas = response.data.map((rutina) => ({
          ...rutina,
          video_id: rutina.video_url.split('/').pop().replace('.mp4', '')
        }));
        setRutinas(rutinasProcesadas);
      } catch (err) {
        setError("Error al cargar las rutinas");
        console.error(err);
      }
    };

    fetchRutinas();
  }, []);

  const handleRutinaSelect = (rutina) => {
    setRutinaSeleccionada(rutina);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRutinaSeleccionada({ ...rutinaSeleccionada, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    // Validaciones
    if (!rutinaSeleccionada.muscle || !rutinaSeleccionada.description || !rutinaSeleccionada.video_id) {
      setError("Los campos marcados con * son obligatorios");
      setIsSubmitting(false);
      return;
    }

    // Construir la URL completa de Cloudinary
    const video_url = `https://res.cloudinary.com/ddps7gqvl/video/upload/v1710000000/${rutinaSeleccionada.video_id}.mp4`;

    try {
      const token = localStorage.getItem("token") || "";
      if (!token) throw new Error("No estás autenticado");

      await axios.put(
        `http://localhost:3005/api/rutinas/${rutinaSeleccionada.id}`,
        { ...rutinaSeleccionada, video_url }, // Enviar la URL completa al backend
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        }
      );

      toast.success(`Rutina "${rutinaSeleccionada.muscle}" actualizada exitosamente!`);
      setTimeout(() => navigate("/rutinas"), 1500);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Error al actualizar la rutina");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Editar Rutina</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        <Col md={6}>
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
                      <div className="d-flex align-items-center">
                        <span>{rutina.muscle}</span>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </Col>

        <Col md={6}>
          {/* Formulario para editar rutina seleccionada */}
          {rutinaSeleccionada && (
            <Card className="p-3">
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="muscle" className="mb-3">
                  <Form.Label>Músculo *</Form.Label>
                  <Form.Control
                    type="text"
                    name="muscle"
                    value={rutinaSeleccionada.muscle}
                    onChange={handleChange}
                    required
                    maxLength="50"
                  />
                </Form.Group>

                <Form.Group controlId="description" className="mb-3">
                  <Form.Label>Descripción *</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="description"
                    value={rutinaSeleccionada.description}
                    onChange={handleChange}
                    style={{ height: '100px' }}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="video_id" className="mb-3">
                  <Form.Label>ID del Video (Cloudinary) *</Form.Label>
                  <Form.Control
                    type="text"
                    name="video_id"
                    value={rutinaSeleccionada.video_id}
                    onChange={handleChange}
                    required
                    placeholder="Ej: rutina_hombros_glwb3d"
                  />
                </Form.Group>

                <Button 
                  variant="primary" 
                  type="submit" 
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Guardando...' : 'Actualizar Rutina'}
                </Button>
              </Form>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default EditarRutina;