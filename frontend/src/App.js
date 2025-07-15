import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [peliculas, setPeliculas] = useState([]);
  const [peliculasFiltradas, setPeliculasFiltradas] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [modoDescripcion, setModoDescripcion] = useState(false);
  const [recomendacion, setRecomendacion] = useState("");
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    fetch("https://recomendacions-backend.onrender.com/api/peliculas")
      .then((res) => res.json())
      .then((data) => {
        setPeliculas(data);
        setPeliculasFiltradas(data);
      })
      .catch(console.error);
  }, []);

  const handleBuscar = (e) => {
    e.preventDefault();
    const texto = busqueda.toLowerCase();

    const filtradas = peliculas.filter((peli) =>
      modoDescripcion
        ? peli.descripcion?.toLowerCase().includes(texto)
        : peli.titulo?.toLowerCase().includes(texto) ||
          peli.genero?.toLowerCase().includes(texto)
    );
    setPeliculasFiltradas(filtradas);
    setRecomendacion("");
  };

  const handleRecomendacionIA = async () => {
    setCargando(true);
    setRecomendacion("");
    try {
      const res = await fetch("https://recomendacions-backend.onrender.com/api/recomendaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: busqueda || "Recomiéndame una película popular",
        }),
      });
      const data = await res.json();
      setRecomendacion(data.recomendacion || "");
    } catch (error) {
      setRecomendacion("Error al obtener recomendación IA.");
      console.error(error);
    }
    setCargando(false);
  };

  return (
    <div className="App" style={{ padding: 20 }}>
      <h1 style={{ color: "red" }}>Cecyflix</h1>

      <form className="buscador" onSubmit={handleBuscar} style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder={modoDescripcion ? "Describe la peli que buscas..." : "Busca por título o género"}
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ padding: "0.5rem", width: 250 }}
        />

        {!modoDescripcion && (
          <button type="submit" style={{ marginLeft: 10 }}>
            🔍 Buscar
          </button>
        )}

        <button
          type="button"
          onClick={() => setModoDescripcion(!modoDescripcion)}
          style={{ marginLeft: 10 }}
        >
          {modoDescripcion ? "Modo: Descripción" : "Modo: Título/Género"}
        </button>

        {modoDescripcion && (
          <button
            type="button"
            onClick={handleRecomendacionIA}
            disabled={cargando}
            style={{ marginLeft: 10 }}
          >
            {cargando ? "Obteniendo..." : "✨ Recomendación IA"}
          </button>
        )}
      </form>

      {recomendacion && (
        <div className="bloque-recomendaciones" style={{ marginBottom: 20, backgroundColor: "#eef", padding: 15, borderRadius: 8 }}>
          <h2>IA sugiere:</h2>
          <p>{recomendacion}</p>
        </div>
      )}

      <div className="grid">
        {peliculasFiltradas.map((p, i) => (
          <div className="tarjeta" key={i} style={{ marginBottom: 20, border: "1px solid #ccc", borderRadius: 8, overflow: "hidden", maxWidth: 300 }}>
            <img src={p.poster} alt={p.titulo} style={{ width: "100%", height: "auto" }} />
            <div className="info" style={{ padding: 10 }}>
              <h3>{p.titulo}</h3>
              <p>{p.genero}</p>
              <span>{p.descripcion?.slice(0, 60)}...</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
