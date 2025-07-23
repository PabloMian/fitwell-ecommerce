// header.jsx
import { Navbar, Container, Nav, Badge, Dropdown, NavLink } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShoppingCart,
  faSignOutAlt,
  faUserCircle,
  faMapMarkerAlt,
  faSignInAlt,
  faBox,
  faFileExcel,
  faDumbbell, // Agregado para el ícono de rutinas
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import axios from "axios";

// URL del logo desde Cloudinary
const logoUrl = "https://res.cloudinary.com/ddps7gqvl/image/upload/v1710000000/logo_otzb7p.webp";

const Header = ({ user, handleLogout, cartItemsCount = 0 }) => {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    handleLogout();
    toast.success("Sesión cerrada correctamente", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
    navigate("/");
  };

  const handleProfileClick = () => {
    if (user) {
      console.log("Navegando a /perfil");
      navigate("/perfil");
    }
  };

  const handleExportProductos = async () => {
    try {
      const response = await axios({
        url: "http://localhost:3005/api/exportar-productos",
        method: "GET",
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "productos.xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Archivo Excel descargado exitosamente", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      console.error("Error al exportar productos:", error);
      toast.error("Error al descargar el archivo Excel", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top" className="shadow-sm" style={{ minHeight: "80px" }}>
      <Container fluid className="px-3 px-md-4">
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center me-3">
          <img
            src={logoUrl}
            alt="FitWell Logo"
            style={{
              height: "50px",
              width: "auto",
              maxWidth: "180px",
              objectFit: "contain",
            }}
            className="me-2"
            onError={(e) => {
              e.target.src = "https://placehold.co/100x40?text=Logo+No+Disponible";
              e.target.onerror = null;
            }}
          />

          {user ? (
            <NavLink
              className="d-none d-md-flex align-items-start ms-3 text-white"
              onClick={handleProfileClick}
              style={{ cursor: "pointer", textDecoration: "none" }}
            >
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
            </NavLink>
          ) : (
            <div className="d-none d-md-flex align-items-center ms-3">
              <NavLink
                className="text-white"
                onClick={() => navigate("/login")}
                style={{ cursor: "pointer", textDecoration: "none", padding: "0.25rem 0.5rem" }}
              >
                <FontAwesomeIcon icon={faSignInAlt} className="me-2" />
                Iniciar sesión
              </NavLink>
            </div>
          )}
          {user?.rol === "admin" && (
            <NavLink
              className="d-none d-md-flex align-items-center ms-3 text-white"
              onClick={handleExportProductos}
              style={{ cursor: "pointer", textDecoration: "none", padding: "0.25rem 0.5rem" }}
            >
              <FontAwesomeIcon icon={faFileExcel} className="me-2" />
              Exportar a Excel
            </NavLink>
          )}
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="responsive-navbar-nav" className="border-0" />

        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="ms-auto align-items-center gap-2">
            <Nav.Link
              as={Link}
              to="/rutinas"
              className="text-white fw-bold px-3 py-2 rounded hover-primary"
            >
              <FontAwesomeIcon icon={faDumbbell} className="fs-5" title="Rutinas" />
              <span className="ms-2 d-lg-inline d-none">Rutinas</span>
            </Nav.Link>

            {user?.rol === "admin" && (
              <Dropdown className="me-2">
                <Dropdown.Toggle variant="outline-light" id="admin-dropdown">
                  Opciones de producto
                </Dropdown.Toggle>
                <Dropdown.Menu className="dropdown-menu-dark">
                  <Dropdown.Item onClick={() => navigate("/newproduct")}>
                    Nuevo producto
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => navigate("/updateproduct")}>
                    Actualizar producto
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => navigate("/deleteproduct")}>
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
                  <Dropdown.Item onClick={handleProfileClick}>
                    Ver perfil
                  </Dropdown.Item>
                  {user?.rol === "admin" && (
                    <Dropdown.Item onClick={handleExportProductos}>
                      <FontAwesomeIcon icon={faFileExcel} className="me-2" />
                      Exportar a Excel
                    </Dropdown.Item>
                  )}
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <Nav.Link
                onClick={() => navigate("/login")}
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