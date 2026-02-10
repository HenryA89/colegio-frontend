import { useState, useEffect } from "react";
import Button from "../../components/iu/Button";
import Input from "../../components/iu/Input";
import api from "../../services/api";

export default function ActividadesEstudiante() {
  const [actividad, setActividad] = useState(null);
  const [respuestaTexto, setRespuestaTexto] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchActividad = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/actividad-actual");
        if (res.data.actividad) {
          setActividad(res.data.actividad);
        }
      } catch (err) {
        setError("No hay actividad disponible en este momento.");
      }
      setLoading(false);
    };
    fetchActividad();
  }, []);

  const handleArchivo = (e) => {
    setArchivo(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!respuestaTexto.trim() && !archivo) {
      setError("Debes escribir una respuesta o subir un archivo PDF.");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("respuestaTexto", respuestaTexto);
      if (archivo) formData.append("archivo", archivo);
      await api.post("/responder-actividad", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setEnviado(true);
    } catch (err) {
      setError("No se pudo enviar tu respuesta. Intenta nuevamente.");
    }
    setLoading(false);
  };

  if (loading) return <div className="p-6 text-blue-600">Cargando...</div>;

  if (error)
    return <div className="p-6 text-red-700 bg-red-100 rounded">{error}</div>;

  if (!actividad)
    return (
      <div className="p-6 text-gray-500">No hay actividad disponible.</div>
    );

  if (enviado)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-teal-50 to-blue-50">
        <div className="game-card p-12 rounded-3xl shadow-2xl text-center bounce-in max-w-md">
          <div className="text-6xl mb-6 float">🎉</div>
          <h2 className="mb-4 text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-600">
            ¡Actividad Completada!
          </h2>
          <div className="text-xl text-gray-700 mb-6">
            Tu respuesta fue enviada correctamente.
          </div>
          <div className="flex justify-center space-x-3 mb-4">
            <div className="score-badge bg-gradient-to-r from-yellow-400 to-orange-500">
              +50 pts 🏆
            </div>
            <div className="level-badge bg-gradient-to-r from-purple-500 to-pink-500">
              ⭐ Nivel 2
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="btn-success mt-6"
          >
            🎯 Ver más actividades
          </button>
        </div>
      </div>
    );

  return (
    <div className="max-w-3xl p-6 mx-auto min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="game-card p-8 rounded-3xl shadow-2xl bounce-in">
        <div className="flex items-center space-x-4 mb-6">
          <div className="p-4 bg-gradient-to-br from-pink-400 to-purple-600 rounded-xl text-white text-4xl">
            🎯
          </div>
          <div>
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
              Actividad del Día
            </h2>
            <p className="text-sm text-gray-600">¡Completa y gana puntos!</p>
          </div>
        </div>

        <div className="p-6 mb-6 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-purple-200">
          <div className="flex items-center mb-4">
            <div className="score-badge bg-gradient-to-r from-yellow-400 to-orange-500 mr-3">
              ⭐ Nivel 1
            </div>
            <div className="level-badge bg-gradient-to-r from-purple-500 to-pink-500">
              🏆 0 pts
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center mb-2">
              <span className="text-lg font-bold text-purple-700">
                📋 Enunciado:
              </span>
            </div>
            <div className="text-gray-800 text-lg leading-relaxed">
              {actividad.enunciado}
            </div>
          </div>

          {actividad.preguntas && actividad.preguntas.length > 0 && (
            <ol className="pl-6 mt-4 space-y-3">
              {actividad.preguntas.map((preg, idx) => (
                <li
                  key={idx}
                  className="mb-2 p-4 bg-white rounded-xl border-2 border-purple-100 hover:border-purple-300 transition-all"
                >
                  <span className="font-semibold text-purple-600">
                    Pregunta {idx + 1}:
                  </span>
                  <p className="text-gray-800 mt-1">{preg.pregunta}</p>
                </li>
              ))}
            </ol>
          )}
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-3 text-lg font-bold text-gray-700">
              ✍️ Tu Respuesta
            </label>
            <textarea
              className="w-full p-4 border-2 border-purple-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-400 transition-all text-gray-800"
              rows={6}
              value={respuestaTexto}
              onChange={(e) => setRespuestaTexto(e.target.value)}
              placeholder="Escribe tu respuesta aquí y demuestra lo que sabes..."
            />
          </div>
          <div>
            <label className="block mb-3 text-lg font-bold text-gray-700">
              📎 O sube un archivo PDF
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleArchivo}
              className="block w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-4 focus:ring-purple-300 hover:border-purple-400 transition-all"
            />
          </div>
          <button
            type="submit"
            className="btn-game w-full flex items-center justify-center space-x-2"
            disabled={loading}
          >
            <span className="text-xl">🚀</span>
            <span>{loading ? "Enviando..." : "¡Enviar Respuesta!"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
