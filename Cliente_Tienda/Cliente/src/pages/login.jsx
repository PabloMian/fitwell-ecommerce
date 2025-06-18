import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Card, Row, Col, Form, Button } from 'react-bootstrap';

const Login = ({ setUser }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (window.google) {
      google.accounts.id.initialize({
        client_id: '258397106207-5c4nr603ncg72hitq0vj89uqh34t62gm.apps.googleusercontent.com',
        callback: handleCredentialResponse
      });
      google.accounts.id.renderButton(
        document.getElementById('googleSignInDiv'),
        { theme: 'outline', size: 'large', text: 'signin_with' }
      );
    } else {
      console.error('Google SDK no está cargado');
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3005/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (data.user && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        navigate('/');
      } else {
        setError('Credenciales inválidas');
      }
    } catch (error) {
      console.error('Error en el login manual:', error);
      setError('Error al conectar con el servidor');
    }
  };

  const handleCredentialResponse = (response) => {
    const idToken = response.credential;
    fetch('http://localhost:3005/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken })
    })
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .then(data => {
      if (data.user && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        navigate('/');
      } else {
        setError('Error al iniciar sesión con Google');
      }
    })
    .catch(error => {
      console.error('Error en la autenticación con Google:', error);
      setError('Error al conectar con el servidor');
    });
  };

  return (
    <div className="login-background d-flex justify-content-center align-items-center min-vh-100">
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={4}>
            <Card className="p-4 shadow-lg bg-white rounded-3">
              <h2 className="text-center mb-4 text-primary">Iniciar Sesión</h2>
              {error && <p className="text-danger text-center">{error}</p>}
              <Form onSubmit={handleSubmit}>
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
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                <Button variant="primary" type="submit" className="w-100 py-2 mb-3">
                  Iniciar Sesión
                </Button>
              </Form>
              <div className="d-flex justify-content-center mb-3">
                <div id="googleSignInDiv"></div>
              </div>
              <p className="text-center">
                O <Link to="/registro" className="text-info fw-bold">regístrate</Link> si no tienes cuenta.
              </p>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;