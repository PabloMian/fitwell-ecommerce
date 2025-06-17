import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Row, Col } from 'react-bootstrap';

const Login = ({ setUser }) => {
  const navigate = useNavigate();

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
        console.error('Respuesta inválida del servidor:', data);
        alert('Error al iniciar sesión. Intenta de nuevo.');
      }
    })
    .catch(error => {
      console.error('Error en la autenticación:', error);
      alert('Error al conectar con el servidor. Verifica que esté corriendo.');
    });
  };

  return (
    <div className="login-background d-flex justify-content-center align-items-center min-vh-100">
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={4}>
            <Card className="p-4 shadow-lg bg-white rounded-3">
              <h2 className="text-center mb-4 text-primary">Iniciar Sesión</h2>
              <div className="d-flex justify-content-center mb-3">
                <div id="googleSignInDiv"></div>
              </div>
              <p className="text-center">
                O <span className="text-info fw-bold">regístrate</span> si no tienes cuenta.
              </p>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;