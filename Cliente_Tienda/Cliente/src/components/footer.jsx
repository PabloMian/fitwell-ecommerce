import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFacebookF, 
  faInstagram, 
  faTwitter, 
  faLinkedinIn 
} from '@fortawesome/free-brands-svg-icons';

const Footer = () => {
  return (
    <footer 
      className="bg-dark text-white py-4"
      style={{ 
        marginTop: 'auto',
        width: '100%'
      }}
    >
      <Container>
        <Row className="g-4">
          {/* Información */}
          <Col lg={4} className="text-center text-lg-start">
            <h5 className="mb-3">FitWell</h5>
            <p className="mb-0">Tu tienda de productos fitness de confianza.</p>
          </Col>

          {/* Enlaces */}
          <Col lg={4} className="text-center">
            <h5 className="mb-3">Enlaces</h5>
            <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
              <Link to="/" className="text-white text-decoration-none">Inicio</Link>
              <Link to="/newproduct" className="text-white text-decoration-none">Nuevo Producto</Link>
              <Link to="/contacto" className="text-white text-decoration-none">Contacto</Link>
            </div>
          </Col>

          {/* Redes sociales */}
          <Col lg={4} className="text-center text-lg-end">
            <h5 className="mb-3">Síguenos</h5>
            <div className="d-flex justify-content-center justify-content-lg-end gap-3">
              <a 
                href="https://facebook.com" 
                className="text-white" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <FontAwesomeIcon icon={faFacebookF} size="lg" />
              </a>
              <a 
                href="https://instagram.com" 
                className="text-white" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <FontAwesomeIcon icon={faInstagram} size="lg" />
              </a>
              <a 
                href="https://twitter.com" 
                className="text-white" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <FontAwesomeIcon icon={faTwitter} size="lg" />
              </a>
              <a 
                href="https://linkedin.com" 
                className="text-white" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <FontAwesomeIcon icon={faLinkedinIn} size="lg" />
              </a>
            </div>
          </Col>
        </Row>

        {/* Derechos de autor */}
        <Row className="mt-4">
          <Col className="text-center">
            <p className="mb-0 small">
              &copy; {new Date().getFullYear()} FitWell - Todos los derechos reservados.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;