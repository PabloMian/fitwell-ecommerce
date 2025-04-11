import { useState } from "react";
import { Form, Button, Alert, FloatingLabel, Container, Row, Col } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";

const ProductForm = () => {
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

  // Categorías según tu BD
  const categorias = [
    { id: 1, nombre: "Equipos", descripcion: "Equipos de entrenamiento y máquinas" },
    { id: 2, nombre: "Prendas", descripcion: "Ropa deportiva y accesorios" },
    { id: 3, nombre: "Suplementos", descripcion: "Suplementos nutricionales y vitamínicos" }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProducto({
      ...producto,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagen(file);
      
      // Crear vista previa
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (!producto.nombre || !producto.precio || !producto.stock || !producto.categoria_id) {
      setError("Todos los campos marcados con * son obligatorios");
      setIsSubmitting(false);
      return;
    }

    try {
      // Crear FormData para enviar archivos
      const formData = new FormData();
      formData.append("nombre", producto.nombre);
      formData.append("descripcion", producto.descripcion);
      formData.append("precio", producto.precio);
      formData.append("stock", producto.stock);
      formData.append("categoria_id", producto.categoria_id);
      formData.append("destacado", producto.destacado ? "1" : "0");
      if (imagen) {
        formData.append("imagen", imagen);
      }

      const response = await axios.post("http://localhost:3005/api/productos", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      
      // Mostrar mensaje de éxito
      toast.success(`Producto "${response.data.producto.nombre}" creado exitosamente!`);
      
      // Resetear formulario
      setProducto({
        nombre: "",
        descripcion: "",
        precio: "",
        stock: "",
        categoria_id: "",
        destacado: false
      });
      setImagen(null);
      setPreview("");
    } catch (err) {
      console.error("Error al crear producto:", err);
      setError(err.response?.data?.error || "Error al crear el producto");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Crear Nuevo Producto</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={6}>
            <FloatingLabel controlId="nombre" label="Nombre del producto *" className="mb-3">
              <Form.Control
                type="text"
                name="nombre"
                value={producto.nombre}
                onChange={handleChange}
                required
              />
            </FloatingLabel>

            <FloatingLabel controlId="descripcion" label="Descripción" className="mb-3">
              <Form.Control
                as="textarea"
                name="descripcion"
                value={producto.descripcion}
                onChange={handleChange}
                style={{ height: '100px' }}
              />
            </FloatingLabel>

            {/* Campo para subir imagen */}
            <Form.Group controlId="imagen" className="mb-3">
              <Form.Label>Imagen del producto</Form.Label>
              <Form.Control 
                type="file" 
                accept="image/*"
                onChange={handleImageChange}
              />
              {preview && (
                <div className="mt-2">
                  <img 
                    src={preview} 
                    alt="Vista previa" 
                    style={{ maxWidth: "100%", maxHeight: "200px" }} 
                  />
                </div>
              )}
            </Form.Group>
          </Col>

          <Col md={6}>
            <FloatingLabel controlId="precio" label="Precio ($) *" className="mb-3">
              <Form.Control
                type="number"
                name="precio"
                value={producto.precio}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
              />
            </FloatingLabel>

            <FloatingLabel controlId="stock" label="Stock disponible *" className="mb-3">
              <Form.Control
                type="number"
                name="stock"
                value={producto.stock}
                onChange={handleChange}
                min="0"
                required
              />
            </FloatingLabel>

            <FloatingLabel controlId="categoria_id" label="Categoría *" className="mb-3">
              <Form.Select
                name="categoria_id"
                value={producto.categoria_id}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione una categoría</option>
                {categorias.map(categoria => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nombre} - {categoria.descripcion.substring(0, 30)}...
                  </option>
                ))}
              </Form.Select>
            </FloatingLabel>

            <Form.Check
              type="checkbox"
              id="destacado"
              label="Producto destacado"
              name="destacado"
              checked={producto.destacado}
              onChange={handleChange}
              className="mb-3"
            />
          </Col>
        </Row>

        <div className="d-grid gap-2 mt-3">
          <Button 
            variant="primary" 
            type="submit" 
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Guardando...' : 'Guardar Producto'}
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default ProductForm;
