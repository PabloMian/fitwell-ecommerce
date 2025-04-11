import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Container, Spinner } from "react-bootstrap";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from "./components/header";
import Footer from "./components/footer";
import Home from "./pages/home";
import FormPage from "./pages/nuevo_producto";
import EditarProducto from "./pages/editar_producto";
import EliminarProducto from "./pages/eliminar_producto";
import Login from "./pages/login";
import Registro from "./pages/registro";
import Carrito from "./pages/vista_carrito";
import Equipos from "./pages/vista_equipos";
import Prendas from "./pages/vista_prendas";
import Suplementos from "./pages/vista_suplementos";
import Pago from "./pages/vista_pago";
import Pedidos from "./pages/pedidos";  // Importa el archivo correcto

import "bootstrap/dist/css/bootstrap.min.css";
import '@fortawesome/fontawesome-free/css/all.min.css';
import './App.css';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartItemsCount, setCartItemsCount] = useState(0);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (!token || !storedUser) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setLoading(false);
        return;
      }

      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <Router>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      
      <div className="d-flex flex-column min-vh-100">
        <Header user={user} handleLogout={handleLogout} cartItemsCount={cartItemsCount} />
        
        <main className="flex-grow-1 py-4">
          <Container>
            <Routes>
              {/* Rutas públicas */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login setUser={setUser} />} />
              <Route path="/registro" element={user ? <Navigate to="/" replace /> : <Registro setUser={setUser} />} />
              <Route path="/equipos" element={<Equipos />} />
              <Route path="/prendas" element={<Prendas />} />
              <Route path="/suplementos" element={<Suplementos />} />
              <Route path="/pedidos" element={<Pedidos />} />  {/* Ruta pública para pedidos */}

              {/* Rutas protegidas */}
              <Route path="/newproduct" element={
                user?.rol === 'admin' ? <FormPage /> : <Navigate to="/" replace />
              } />
              <Route path="/updateproduct" element={
                user?.rol === 'admin' ? <EditarProducto /> : <Navigate to="/" replace />
              } />
              <Route path="/deleteproduct" element={
                user?.rol === 'admin' ? <EliminarProducto /> : <Navigate to="/" replace />
              } />

              <Route path="/carrito" element={user ? <Carrito /> : <Navigate to="/login" replace />} />
              <Route path="/pago" element={user ? <Pago /> : <Navigate to="/login" replace />} />

              {/* Ruta por defecto */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Container>
        </main>

        <Footer />
      </div>
    </Router>
  );
};

export default App;
