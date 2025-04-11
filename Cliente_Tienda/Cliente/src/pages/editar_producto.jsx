import React, { useEffect, useState } from "react";
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
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const EditarProducto = () => {
  const [productos, setProductos] = useState([]); // Estado para los productos
  const [productoSeleccionado, setProductoSeleccionado] = useState(null); // Estado para el producto seleccionado
  const [error, setError] = useState(""); // Estado para errores
  const [isSubmitting, setIsSubmitting] = useState(false); // Estado para el estado de envío
  const [imagen, setImagen] = useState(null); // Estado para la imagen
  const [preview, setPreview] = useState(""); // Estado para la vista previa de la imagen
  const navigate = useNavigate();

  // Obtener todos los productos al montar el componente
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await axios.get("http://localhost:3005/api/productos");
        const productosConPrecioNumerico = response.data.map((producto) => ({
          ...producto,
          precio: parseFloat(producto.precio),
        }));
        setProductos(productosConPrecioNumerico);
      } catch (err) {
        setError("Error al cargar los productos");
        console.error(err);
      }
    };

    fetchProductos();
  }, []);

  const handleProductoSelect = (producto) => {
    setProductoSeleccionado(producto);
    setPreview(producto.imagen); // Muestra la imagen actual si está disponible
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductoSeleccionado({ ...productoSeleccionado, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagen(file);
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

    try {
      const formData = new FormData();
      formData.append("nombre", productoSeleccionado.nombre);
      formData.append("descripcion", productoSeleccionado.descripcion);
      formData.append("precio", productoSeleccionado.precio);
      formData.append("stock", productoSeleccionado.stock);
      formData.append("categoria_id", productoSeleccionado.categoria_id);
      formData.append("destacado", productoSeleccionado.destacado ? "1" : "0");
      if (imagen) {
        formData.append("imagen", imagen);
      }

      await axios.put(`http://localhost:3005/api/productos/${productoSeleccionado.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(`Producto "${productoSeleccionado.nombre}" actualizado exitosamente!`);
      navigate("/"); // Redirigir al home después de actualizar
    } catch (err) {
      setError("Error al actualizar el producto");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Agrupar productos por categoría con nombres
  const categorias = {
    1: "Equipos",
    2: "Prendas",
    3: "Suplementos"
  };

  const productosPorCategoria = productos.reduce((acc, producto) => {
    const categoria = producto.categoria_id;
    if (!acc[categoria]) {
      acc[categoria] = [];
    }
    acc[categoria].push(producto);
    return acc;
  }, {});

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Editar Producto</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        <Col md={6}>
          {/* Lista de productos por categorías en un Accordion */}
          <Accordion defaultActiveKey="0">
            {Object.entries(productosPorCategoria).map(([categoriaId, productosCategoria]) => (
              <Accordion.Item eventKey={categoriaId} key={categoriaId}>
                <Accordion.Header>{categorias[categoriaId]}</Accordion.Header>
                <Accordion.Body>
                  <ListGroup className="mb-4">
                    {productosCategoria.map((producto) => (
                      <ListGroup.Item
                        key={producto.id}
                        action
                        onClick={() => handleProductoSelect(producto)}
                        className={productoSeleccionado?.id === producto.id ? 'active' : ''}
                      >
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
                          <span>{producto.nombre} - ${(producto.precio).toFixed(2)}</span>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        </Col>

        <Col md={6}>
          {/* Formulario para editar producto seleccionado */}
          {productoSeleccionado && (
            <Card className="p-3">
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="nombre" className="mb-3">
                  <Form.Label>Nombre del producto *</Form.Label>
                  <Form.Control
                    type="text"
                    name="nombre"
                    value={productoSeleccionado.nombre}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="descripcion" className="mb-3">
                  <Form.Label>Descripción</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="descripcion"
                    value={productoSeleccionado.descripcion}
                    onChange={handleChange}
                    style={{ height: '100px' }}
                  />
                </Form.Group>

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

                <Form.Group controlId="precio" className="mb-3">
                  <Form.Label>Precio ($) *</Form.Label>
                  <Form.Control
                    type="number"
                    name="precio"
                    value={productoSeleccionado.precio}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    required
                  />
                </Form.Group>

                <Form.Group controlId="stock" className="mb-3">
                  <Form.Label>Stock disponible *</Form.Label>
                  <Form.Control
                    type="number"
                    name="stock"
                    value={productoSeleccionado.stock}
                    onChange={handleChange}
                    min="0"
                    required
                  />
                </Form.Group>

                <Form.Group controlId="categoria_id" className="mb-3">
                  <Form.Label>Categoría *</Form.Label>
                  <Form.Select
                    name="categoria_id"
                    value={productoSeleccionado.categoria_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccione una categoría</option>
                    <option value="1">Equipos</option>
                    <option value="2">Prendas</option>
                    <option value="3">Suplementos</option>
                  </Form.Select>
                </Form.Group>

                <Form.Check
                  type="checkbox"
                  id="destacado"
                  label="Producto destacado"
                  name="destacado"
                  checked={productoSeleccionado.destacado}
                  onChange={handleChange}
                  className="mb-3"
                />

                <Button 
                  variant="primary" 
                  type="submit" 
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Guardando...' : 'Actualizar Producto'}
                </Button>
              </Form>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default EditarProducto;
