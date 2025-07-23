import { useState, useEffect } from "react";
import "../css/rutinas.css";

const videoTutorials = [
  {
    muscle: "Pecho",
    videoUrl: "https://res.cloudinary.com/ddps7gqvl/video/upload/v1710000000/rutina_espalda_mbznr3.mp4",
    description: "Ejercita el pecho para mejorar fuerza en el tren superior y postura.",
  },
  {
    muscle: "Hombros",
    videoUrl: "https://res.cloudinary.com/ddps7gqvl/video/upload/v1710000000/rutina_hombros_glwb3d.mp4",
    description: "Trabaja los deltoides para ganar estabilidad y amplitud en tus movimientos.",
  },
  {
    muscle: "Tríceps",
    videoUrl: "https://res.cloudinary.com/ddps7gqvl/video/upload/v1710000000/rutina_triceps_gdhmhr.mp4",
    description: "Los tríceps son esenciales para la fuerza de empuje y definición del brazo.",
  },
  {
    muscle: "Espalda",
    videoUrl: "https://res.cloudinary.com/ddps7gqvl/video/upload/v1710000000/rutina_espalda_piqjlh.mp4",
    description: "Fortalecer la espalda mejora tu postura y reduce el riesgo de lesiones.",
  },
  {
    muscle: "Bíceps",
    videoUrl: "https://res.cloudinary.com/ddps7gqvl/video/upload/v1710000000/rutina_biceps_krb2fw.mp4",
    description: "Define tus brazos y mejora tu capacidad de tracción con esta rutina.",
  },
  {
    muscle: "Glúteos",
    videoUrl: "https://res.cloudinary.com/ddps7gqvl/video/upload/v1710000000/rutina_gluteos_bmr5wf.mp4",
    description: "Activa y tonifica los glúteos para estabilidad, postura y fuerza general.",
  },
];

const defaultVideo = "https://res.cloudinary.com/ddps7gqvl/video/upload/v1710000000/default_video.mp4";

const Rutinas = ({ user }) => {
  const [error, setError] = useState(null);
  const [showLanding, setShowLanding] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowLanding(false), 2500);
    return () => clearTimeout(timer);
  }, []);

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
        {videoTutorials.map((tutorial, index) => {
          const isEven = index % 2 === 0;
          return (
            <div
              className={`rutina-item ${isEven ? "row-normal" : "row-reverse"}`}
              key={index}
            >
              <div className="rutina-text">
                <h3>{tutorial.muscle}</h3>
                <p>{tutorial.description}</p>
              </div>
              <div className="rutina-video-container">
                <video
                  className="rutina-video"
                  controls
                  playsInline
                  preload="metadata"
                  onError={(e) => {
                    e.target.src = defaultVideo;
                    e.target.onerror = null;
                    setError(`Error al cargar el video de ${tutorial.muscle}. Usando video predeterminado.`);
                    console.error(`Error al cargar video de ${tutorial.muscle}. URL fallida:`, tutorial.videoUrl);
                  }}
                >
                  <source src={tutorial.videoUrl} type="video/mp4" />
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
