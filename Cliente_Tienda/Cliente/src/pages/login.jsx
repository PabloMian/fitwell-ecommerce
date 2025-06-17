import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';

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
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json();
    })
    .then(data => {
      if (data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        navigate('/');
      } else {
        console.error('No user data in response:', data);
      }
    })
    .catch(error => console.error('Error:', error));
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div>
        <div id="googleSignInDiv"></div>
        <p className="text-center mt-3">O <a href="/registro">regístrate</a> si no tienes cuenta.</p>
      </div>
    </Container>
  );
};

export default Login;