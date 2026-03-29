import { useState, useEffect } from "react";
import {
  fetchActividades,
  enviarRespuestaActividad,
} from "../../services/estudianteServices/actividadesService";

export default function ActividadesEstudiante() {
  const [actividades, setActividades] = useState([]);
  const [actividadActual, setActividadActual] = useState(null);
  const [respuestaTexto, setRespuestaTexto] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadActividades = async () => {
      setLoading(true);
      setError("");
      try {
        const actividadesData = await fetchActividades();
        setActividades(actividadesData);

        // Seleccionar la primera actividad o la más reciente
        if (actividadesData.length > 0) {
          setActividadActual(actividadesData[0]);
        }
      } catch (err) {
        setError("No hay actividades disponibles en este momento.");
      }
      setLoading(false);
    };
    loadActividades();
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

    if (!actividadActual) {
      setError("No hay una actividad seleccionada.");
      return;
    }

    setLoading(true);
    try {
      // Preparar respuesta para el servicio
      const respuesta = {
        texto: respuestaTexto,
        tieneArchivo: !!archivo,
      };

      // Enviar respuesta usando el servicio
      await enviarRespuestaActividad(actividadActual._id, respuesta);

      // Si hay archivo, enviarlo por separado (el servicio actual no maneja archivos)
      if (archivo) {
        const formData = new FormData();
        formData.append("archivo", archivo);
        // Esto podría ser una función adicional en el servicio
        await api.post(
          `/estudiante/actividades/${actividadActual._id}/archivo`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
      }

      setEnviado(true);
    } catch (err) {
      setError("No se pudo enviar tu respuesta. Intenta nuevamente.");
      console.error("Error al enviar respuesta:", err);
    }
    setLoading(false);
  };

  // Seleccionar una actividad específica
  const handleSeleccionarActividad = (actividad) => {
    setActividadActual(actividad);
    setRespuestaTexto("");
    setArchivo(null);
    setEnviado(false);
    setError("");
  };

  if (loading) return <div className="p-6 text-blue-600">Cargando...</div>;

  if (error)
    return <div className="p-6 text-red-700 bg-red-100 rounded">{error}</div>;

  if (!actividadActual)
    return (
      <div className="p-6 text-gray-500">No hay actividad disponible.</div>
    );

  if (enviado)
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-50 via-teal-50 to-blue-50">
        <div className="p-12 rounded-3xl shadow-2xl text-center border-2 border-pink-200 bg-linear-to-br from-pink-100 to-purple-100 hover:border-pink-400 hover:shadow-xl hover:scale-105 hover:rotate-1 transition-all duration-300 max-w-md">
          <div className="text-6xl mb-6 animate-bounce">🎉</div>
          <h2 className="mb-4 text-4xl font-bold text-transparent bg-clip-text bg-linear-to-r from-green-600 to-teal-600">
            ¡Actividad Completada!
          </h2>
          <div className="text-xl text-gray-700 mb-6">
            Tu respuesta fue enviada correctamente.
          </div>
          <div className="flex justify-center space-x-3 mb-4">
            <div className="px-3 py-1 text-sm font-semibold rounded-full bg-linear-to-r from-yellow-400 to-orange-500 text-white">
              +50 pts 🏆
            </div>
            <div className="px-3 py-1 text-sm font-semibold rounded-full bg-linear-to-r from-purple-500 to-pink-500 text-white">
              ⭐ Nivel 2
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-3 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
          >
            🎯 Ver más actividades
          </button>
        </div>
      </div>
    );

  return (
    <div className="max-w-3xl p-6 mx-auto min-h-screen bg-linear-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Selector de actividades si hay más de una */}
      {actividades.length > 1 && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow">
          <h3 className="mb-3 text-lg font-semibold">
            Selecciona una actividad:
          </h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {actividades.map((actividad) => (
              <button
                key={actividad._id}
                onClick={() => handleSeleccionarActividad(actividad)}
                className={`p-3 text-left rounded-lg border-2 transition-all ${
                  actividadActual._id === actividad._id
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200 hover:border-purple-300"
                }`}
              >
                <div className="font-semibold">
                  {actividad.titulo || "Actividad"}
                </div>
                <div className="text-sm text-gray-600">
                  {actividad.materia || "Sin materia"} -{" "}
                  {actividad.curso || "Sin curso"}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="p-8 rounded-3xl shadow-2xl border-2 border-pink-200 bg-linear-to-br from-pink-100 to-purple-100 hover:border-pink-400 hover:shadow-xl hover:scale-105 hover:rotate-1 transition-all duration-300">
        <div className="flex items-center space-x-4 mb-6">
          <div className="p-4 bg-linear-to-br from-pink-400 to-purple-600 rounded-xl text-white text-4xl">
            🎯
          </div>
          <div>
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-pink-600 to-purple-600">
              Actividad del Día
            </h2>
            <p className="text-sm text-gray-600">¡Completa y gana puntos!</p>
          </div>
        </div>

        <div className="p-6 mb-6 rounded-2xl bg-linear-to-br from-blue-50 to-purple-50 border-2 border-purple-200">
          <div className="flex items-center mb-4">
            <div className="px-3 py-1 text-sm font-semibold rounded-full bg-linear-to-r from-yellow-400 to-orange-500 text-white mr-3">
              ⭐ Nivel 1
            </div>
            <div className="px-3 py-1 text-sm font-semibold rounded-full bg-linear-to-r from-purple-500 to-pink-500 text-white">
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
              {actividadActual.enunciado || actividadActual.descripcion}
            </div>
          </div>

          {actividadActual.preguntas &&
            actividadActual.preguntas.length > 0 && (
              <ol className="pl-6 mt-4 space-y-3">
                {actividadActual.preguntas.map((preg, idx) => (
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
            className="w-full px-6 py-3 text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:bg-purple-400 transition-colors flex items-center justify-center space-x-2"
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
