import { useState, useEffect } from "react";
import axios from "axios";
import "../css/rutinas.css";

const defaultVideo = "https://res.cloudinary.com/ddps7gqvl/video/upload/v1710000000/default_video.mp4";

const Rutinas = ({ user }) => {
  const [rutinas, setRutinas] = useState([]);
  const [error, setError] = useState(null);
  const [showLanding, setShowLanding] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowLanding(false), 2500);
    fetchRutinas();
    return () => clearTimeout(timer);
  }, []);

  const fetchRutinas = async () => {
    try {
      const token = localStorage.getItem("token") || "";
      const response = await axios.get("http://localhost:3005/api/rutinas", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setRutinas(response.data);
    } catch (error) {
      console.error("Error al cargar rutinas:", error);
      setError("Error al cargar las rutinas. Intenta recargar la página.");
    }
  };

  if (showLanding) {
    return (
      <div className="landing-wrapper">
        <h1 className="landing-title">Rutinas de Ejercicio</h1>
        <p className="landing-subtitle">Explora los ejercicios por grupo muscular</p>
      </div>
    );
  }

  return (
    <div className="rutina-wrapper">
      <h2 className="rutina-heading">
        Rutinas de Ejercicio{user ? `, ${user.nombre}` : ""}
      </h2>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="rutina-container">
        {rutinas.map((tutorial, index) => {
          const isEven = index % 2 === 0;
          const isDynamic = isEven; // Videos en índices pares son dinámicos
          return (
            <div
              className={`rutina-item ${isEven ? "row-normal" : "row-reverse"}`}
              key={tutorial.id}
            >
              <div className="rutina-text">
                <h3>{tutorial.muscle}</h3>
                <p>{tutorial.description}</p>
              </div>
              <div className="rutina-video-container">
                <video
                  className="rutina-video"
                  controls={!isDynamic} // Solo controles para videos no dinámicos
                  playsInline
                  preload="metadata"
                  autoPlay={isDynamic}
                  muted={isDynamic}
                  loop={isDynamic}
                  onError={(e) => {
                    e.target.src = defaultVideo;
                    e.target.onerror = null;
                    e.target.autoPlay = false; // Desactivar autoPlay en video por defecto
                    e.target.muted = false;
                    e.target.loop = false;
                    setError(`Error al cargar el video de ${tutorial.muscle}. Usando video predeterminado.`);
                    console.error(`Error al cargar video de ${tutorial.muscle}. URL fallida:`, tutorial.video_url);
                  }}
                >
                  <source src={tutorial.video_url} type="video/mp4" />
                  Tu navegador no soporta el elemento de video.
                </video>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Rutinas;