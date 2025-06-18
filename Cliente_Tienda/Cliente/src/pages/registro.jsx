import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button, Alert, Container, Card, Spinner } from 'react-bootstrap';
import { Eye, EyeSlash } from 'react-bootstrap-icons';
import axios from 'axios';

const Registro = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    direccion: '',
    telefono: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (window.google) {
      google.accounts.id.initialize({
        client_id: '258397106207-5c4nr603ncg72hitq0vj89uqh34t62gm.apps.googleusercontent.com',
        callback: handleGoogleCredentialResponse
      });
      google.accounts.id.renderButton(
        document.getElementById('googleSignUpDiv'),
        { theme: 'outline', size: 'large', text: 'signup_with' }
      );
    } else {
      console.error('Google SDK no está cargado');
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const emailRegex = /@upqroo\.edu\.mx$/;
    if (!emailRegex.test(formData.email)) {
      setError('Solo se permiten correos con la extensión @upqroo.edu.mx');
      setLoading(false);
      return;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/;
    if (!passwordRegex.test(formData.password)) {
      setError('La contraseña debe tener al menos 8 caracteres, una mayúscula y un carácter especial (!@#$%^&*)');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:3005/api/auth/registro', formData);
      if (response.data.token && response.data.user) {
        setSuccess('¡Cuenta creada con éxito! Redirigiendo al login...');
        setTimeout(() => navigate('/login'), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error en el registro');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleCredentialResponse = (response) => {
    const idToken = response.credential;
    axios.post('http://localhost:3005/api/auth/google', { idToken })
      .then(res => {
        if (res.data.token && res.data.user) {
          setSuccess('¡Registro con Google exitoso! Redirigiendo al login...');
          setTimeout(() => navigate('/login'), 3000);
        }
      })
      .catch(error => {
        console.error('Error en registro con Google:', error);
        setError('Error al registrarse con Google. Intenta de nuevo.');
      });
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Card className="p-4 shadow-lg" style={{ width: '100%', maxWidth: '500px' }}>
        <Card.Body>
          <h2 className="text-center mb-4">Registro</h2>
          
          {error && <Alert variant="danger">{error}</Alert>}
          {success && (
            <Alert variant="success" className="d-flex align-items-center">
              <span>{success}</span>
              <Spinner animation="border" size="sm" className="ms-2" />
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nombre completo *</Form.Label>
              <Form.Control
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email *</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Contraseña *</Form.Label>
              <div className="position-relative">
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength="8"
                  className="pe-5"
                />
                <Button
                  variant="link"
                  className="position-absolute end-0 top-50 translate-middle-y p-0 me-2"
                  onClick={togglePasswordVisibility}
                  style={{ transform: 'translateY(-50%)' }}
                >
                  {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                </Button>
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Dirección</Form.Label>
              <Form.Control
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                placeholder="Calle, número, ciudad"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Teléfono</Form.Label>
              <Form.Control
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="Ej: +52 5512345678"
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100 py-2 mb-3" disabled={loading}>
              {loading ? (
                <>
                  <Spinner as="span" size="sm" animation="border" className="me-2" />
                  Creando cuenta...
                </>
              ) : 'Registrarse'}
            </Button>

            <div className="d-flex justify-content-center">
              <div id="googleSignUpDiv"></div>
            </div>
            <div className="text-center mt-3">
              <Link to="/login">¿Ya tienes cuenta? Inicia sesión</Link>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Registro;