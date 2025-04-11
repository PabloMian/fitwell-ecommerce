import { useState } from "react";
import { Form, Button, Alert, FloatingLabel, Container, Row, Col, Spinner } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify"; // Importa toast

const NuevoProducto = () => {
  const [producto, setProducto] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    stock: "",
    categoria_id: "",
    destacado: false
  });
  
  const [imagen, setImagen] = useState(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const categorias = [
    { id: 1, nombre: "Equipos" },
    { id: 2, nombre: "Prendas" },
    { id: 3, nombre: "Suplementos" }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProducto(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setImagen(file);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result);
    } else {
      setError("Por favor selecciona un archivo de imagen válido");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    // Validaciones básicas
    if (!producto.nombre || !producto.precio || !producto.categoria_id) {
      setError("Los campos marcados con * son obligatorios");
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("No estás autenticado");

      const formData = new FormData();
      formData.append("nombre", producto.nombre);
      formData.append("descripcion", producto.descripcion);
      formData.append("precio", producto.precio);
      formData.append("stock", producto.stock || "0");
      formData.append("categoria_id", producto.categoria_id);
      formData.append("destacado", producto.destacado ? "1" : "0");
      if (imagen) formData.append("imagen", imagen);

      const response = await axios.post(
        "http://localhost:3005/api/productos",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "Authorization": `Bearer ${token}`
          }
        }
      );

      // Muestra el mensaje de éxito con toast
      toast.success("Producto creado exitosamente!");
      
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      console.error("Error:", err);
      setError(err.response?.data?.message || err.message || "Error al crear producto");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container className="py-4">
      <h1 className="mb-4 text-center">Crear Nuevo Producto</h1>
      
      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

      <Form onSubmit={handleSubmit} className="border p-4 rounded-3 shadow-sm">
        <Row>
          <Col md={6}>
            <FloatingLabel controlId="nombre" label="Nombre *" className="mb-3">
              <Form.Control
                type="text"
                name="nombre"
                value={producto.nombre}
                onChange={handleChange}
                required
                placeholder="Nombre del producto"
              />
            </FloatingLabel>

            <FloatingLabel controlId="descripcion" label="Descripción" className="mb-3">
              <Form.Control
                as="textarea"
                name="descripcion"
                value={producto.descripcion}
                onChange={handleChange}
                style={{ height: '120px' }}
                placeholder="Descripción detallada"
              />
            </FloatingLabel>

            <Form.Group className="mb-4">
              <Form.Label>Imagen del producto</Form.Label>
              <Form.Control 
                type="file" 
                accept="image/*"
                onChange={handleImageChange}
              />
              {preview && (
                <div className="mt-3 text-center">
                  <img 
                    src={preview} 
                    alt="Vista previa" 
                    className="img-thumbnail"
                    style={{ maxWidth: '300px', maxHeight: '300px' }}
                  />
                </div>
              )}
            </Form.Group>
          </Col>

          <Col md={6}>
            <FloatingLabel controlId="precio" label="Precio *" className="mb-3">
              <Form.Control
                type="number"
                name="precio"
                value={producto.precio}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
                placeholder="Precio en dólares"
              />
            </FloatingLabel>

            <FloatingLabel controlId="stock" label="Stock" className="mb-3">
              <Form.Control
                type="number"
                name="stock"
                value={producto.stock}
                onChange={handleChange}
                min="0"
                placeholder="Cantidad disponible"
              />
            </FloatingLabel>

            <FloatingLabel controlId="categoria_id" label="Categoría *" className="mb-3">
              <Form.Select
                name="categoria_id"
                value={producto.categoria_id}
                onChange={handleChange}
                required
              >
                <option value="">Selecciona una categoría</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                ))}
              </Form.Select>
            </FloatingLabel>

            <Form.Check 
              type="switch"
              id="destacado"
              label="Producto destacado"
              name="destacado"
              checked={producto.destacado}
              onChange={handleChange}
              className="mb-4"
            />
          </Col>
        </Row>

        <div className="d-flex justify-content-end gap-3 mt-4">
          <Button 
            variant="outline-secondary" 
            onClick={() => navigate(-1)}
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
            ) : 'Guardar Producto'}
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default NuevoProducto;
