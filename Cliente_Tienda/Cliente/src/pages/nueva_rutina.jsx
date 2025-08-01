import { useState } from "react";
import { Form, Button, Alert, FloatingLabel, Container, Row, Col, Spinner } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const NuevaRutina = ({ user }) => {
  const [rutina, setRutina] = useState({
    muscle: "",
    description: "",
    video_id: ""
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Verificar si el usuario es admin
  if (!user || user.rol !== "admin") {
    return (
      <Container className="py-4">
        <Alert variant="danger" className="text-center">
          Acceso denegado: Solo los administradores pueden crear rutinas.
        </Alert>
      </Container>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRutina(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    // Validaciones básicas
    if (!rutina.muscle || !rutina.description || !rutina.video_id) {
      setError("Los campos marcados con * son obligatorios");
      setIsSubmitting(false);
      return;
    }

    // Construir la URL completa de Cloudinary
    const video_url = `https://res.cloudinary.com/ddps7gqvl/video/upload/v1710000000/${rutina.video_id}.mp4`;

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("No estás autenticado");

      const response = await axios.post(
        "http://localhost:3005/api/rutinas",
        { ...rutina, video_url }, // Enviar la URL completa al backend
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        }
      );

      toast.success("Rutina creada exitosamente!");
      setTimeout(() => navigate("/rutinas"), 1500);
    } catch (err) {
      console.error("Error:", err);
      setError(err.response?.data?.error || err.message || "Error al crear rutina");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container className="py-4">
      <h1 className="mb-4 text-center">Crear Nueva Rutina</h1>
      
      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

      <Form onSubmit={handleSubmit} className="border p-4 rounded-3 shadow-sm">
        <Row>
          <Col md={6}>
            <FloatingLabel controlId="muscle" label="Músculo *" className="mb-3">
              <Form.Control
                type="text"
                name="muscle"
                value={rutina.muscle}
                onChange={handleChange}
                required
                placeholder="Nombre del músculo"
                maxLength="50"
              />
            </FloatingLabel>

            <FloatingLabel controlId="description" label="Descripción *" className="mb-3">
              <Form.Control
                as="textarea"
                name="description"
                value={rutina.description}
                onChange={handleChange}
                style={{ height: '120px' }}
                required
                placeholder="Descripción de la rutina"
              />
            </FloatingLabel>
          </Col>

          <Col md={6}>
            <FloatingLabel controlId="video_id" label="ID del Video (Cloudinary) *" className="mb-3">
              <Form.Control
                type="text"
                name="video_id"
                value={rutina.video_id}
                onChange={handleChange}
                required
                placeholder="Ej: rutina_hombros_glwb3d"
              />
            </FloatingLabel>
          </Col>
        </Row>

        <div className="d-flex justify-content-end gap-3 mt-4">
          <Button 
            variant="outline-secondary" 
            onClick={() => navigate("/rutinas")}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Spinner animation="border" size="sm" className="me-2" />
            ) : 'Guardar Rutina'}
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default NuevaRutina;