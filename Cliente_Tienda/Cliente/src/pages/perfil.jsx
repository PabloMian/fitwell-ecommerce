import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Image, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const Perfil = ({ user }) => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (user) {
      console.log('Usuario recibido como prop:', user); // Depuración
      setUserData(user);
    } else if (localStorage.getItem('user')) {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        console.log('Usuario desde localStorage:', storedUser); // Depuración
        setUserData(storedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, [user]);

  if (!userData) {
    return (
      <Container className="mt-4">
        <p>Cargando perfil...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h2 className="text-center mb-4">Mi Perfil</h2>
      <Card className="p-4 shadow-sm">
        <Row>
          <Col md={4} className="text-center">
            <Image
              src={userData.picture || "https://placehold.co/200x200?text=Sin+Foto"}
              roundedCircle
              style={{ width: "200px", height: "200px", objectFit: "cover" }}
              alt={`${userData.nombre}'s profile`}
              onError={(e) => {
                console.log('Error cargando la imagen:', e); // Depuración
                e.target.src = "https://placehold.co/200x200?text=Sin+Foto";
              }}
            />
          </Col>
          <Col md={8}>
            <h4>{userData.nombre}</h4>
            <p><strong>Email:</strong> {userData.email}</p>
            {userData.direccion && <p><strong>Dirección:</strong> {userData.direccion}</p>}
            {/* Eliminamos el campo rol */}
            <Button variant="primary" onClick={() => navigate('/')}>
              Volver al inicio
            </Button>
          </Col>
        </Row>
      </Card>
    </Container>
  );
};

export default Perfil;