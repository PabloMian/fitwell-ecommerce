import { Navbar, Container, Nav, Badge, Dropdown, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import logo from "../components/images/logo.png";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShoppingCart,
  faSignOutAlt,
  faUserCircle,
  faMapMarkerAlt,
  faSignInAlt,
  faBox // Importa el ícono del paquete
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

const Header = ({ user, handleLogout, cartItemsCount = 0 }) => {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    handleLogout();
    toast.success('Sesión cerrada correctamente', {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
    navigate('/');
  };

  const handleAdminOption = (path) => {
    navigate(path);
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top" className="shadow-sm" style={{ minHeight: '80px' }}>
      <Container fluid className="px-3 px-md-4">
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center me-3">
          <img 
            src={logo} 
            alt="FitWell Logo" 
            style={{ 
              height: "50px", 
              width: "auto", 
              maxWidth: "180px",
              objectFit: "contain" 
            }}
            className="me-2"
          />
          
          {user ? (
            <div className="d-none d-md-flex align-items-start ms-3 text-white">
              <FontAwesomeIcon icon={faUserCircle} className="me-2 mt-1" />
              <div>
                <div className="fw-bold">{user.nombre}</div>
                {user.direccion && (
                  <div className="small d-flex align-items-center">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1" size="xs" />
                    <span>{user.direccion}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="d-none d-md-flex align-items-center ms-3">
              <Button 
                variant="outline-light" 
                size="sm" 
                onClick={() => navigate('/login')}
                className="d-flex align-items-center"
              >
                <FontAwesomeIcon icon={faSignInAlt} className="me-2" />
                Iniciar sesión
              </Button>
            </div>
          )}
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="responsive-navbar-nav" className="border-0" />

        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="ms-auto align-items-center gap-2">
            {/* Menú de administración solo para admin */}
            {user?.rol === 'admin' && (
              <Dropdown className="me-2">
                <Dropdown.Toggle variant="outline-light" id="admin-dropdown">
                  Opciones de producto
                </Dropdown.Toggle>
                <Dropdown.Menu className="dropdown-menu-dark">
                  <Dropdown.Item onClick={() => handleAdminOption('/newproduct')}>
                    Nuevo producto
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => handleAdminOption('/updateproduct')}>
                    Actualizar producto
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => handleAdminOption('/deleteproduct')}>
                    Eliminar producto
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}

            {user && (
              <Nav.Link as={Link} to="/pedidos" className="text-white fw-bold px-3 py-2 rounded hover-primary">
                <FontAwesomeIcon icon={faBox} className="fs-5" title="Mis Pedidos" />
              </Nav.Link>
            )}

            {user ? (
              <Dropdown className="d-md-none">
                <Dropdown.Toggle variant="dark" id="dropdown-user" className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faUserCircle} className="me-2" />
                  <span>{user.nombre}</span>
                </Dropdown.Toggle>
                <Dropdown.Menu className="dropdown-menu-dark">
                  <Dropdown.Header>
                    <div className="fw-bold">{user.nombre}</div>
                    {user.direccion && (
                      <div className="small text-muted">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1" size="xs" />
                        {user.direccion}
                      </div>
                    )}
                  </Dropdown.Header>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <Nav.Link 
                onClick={() => navigate('/login')}
                className="text-white fw-bold px-3 py-2 rounded d-md-none"
              >
                <FontAwesomeIcon icon={faSignInAlt} className="me-2" />
                Iniciar sesión
              </Nav.Link>
            )}

            <Nav.Link 
              as={Link} 
              to="/carrito" 
              className="text-white fw-bold px-3 py-2 rounded hover-primary position-relative"
            >
              <FontAwesomeIcon icon={faShoppingCart} className="fs-5" />
              {cartItemsCount > 0 && (
                <Badge pill bg="danger" className="position-absolute top-0 start-100 translate-middle">
                  {cartItemsCount}
                </Badge>
              )}
            </Nav.Link>

            {user && (
              <Nav.Link 
                onClick={handleLogoutClick}
                className="text-white fw-bold px-3 py-2 rounded hover-danger"
                title="Cerrar sesión"
              >
                <FontAwesomeIcon icon={faSignOutAlt} className="fs-5" />
              </Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
