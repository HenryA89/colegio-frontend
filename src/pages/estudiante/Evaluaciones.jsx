import { useEffect, useState } from "react";
import {
  fetchEvaluacionesPorClase,
  responderEvaluacion,
} from "../../services/estudianteServices/evaluacionesService";
import { useAuth } from "../../hooks/UseAuth";
import { useParams } from "react-router-dom";

export default function Evaluaciones() {
  const { usuario } = useAuth();
  const { id } = useParams();
  const [evaluacion, setEvaluacion] = useState([]); // [{ pregunta, opciones, correcta, puntaje }]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [respuestas, setRespuestas] = useState([]);
  const [puntaje, setPuntaje] = useState(null);
  const [enviado, setEnviado] = useState(false);

  useEffect(() => {
    const loadEvaluacion = async () => {
      setLoading(true);
      setError("");
      try {
        // Usar el servicio de evaluaciones por clase
        const evaluacionesData = await fetchEvaluacionesPorClase(id);
        setEvaluacion(evaluacionesData);
        setRespuestas(Array(evaluacionesData.length).fill(null));
      } catch (err) {
        setError("No se pudo cargar la evaluación generada por IA.");
        console.error("Error:", err);
      }
      setLoading(false);
    };
    loadEvaluacion();
  }, [id]);

  const responder = (pregIdx, opcionIdx) => {
    const nuevas = [...respuestas];
    nuevas[pregIdx] = opcionIdx;
    setRespuestas(nuevas);
  };

  const enviarEvaluacion = async () => {
    let total = 0;
    evaluacion.forEach((q, idx) => {
      if (respuestas[idx] === q.correcta) {
        total += q.puntaje || 1;
      }
    });
    setPuntaje(total);
    setEnviado(true);
    try {
      // Usar el servicio para responder evaluación
      const respuestasFormateadas = evaluacion.map((q, idx) => ({
        preguntaId: q._id,
        respuesta: respuestas[idx],
        opcionSeleccionada: respuestas[idx] !== null,
      }));

      await responderEvaluacion(id, {
        respuestas: respuestasFormateadas,
        puntaje: total,
      });
    } catch (err) {
      setError("No se pudo enviar el resultado. Intenta nuevamente.");
      console.error("Error:", err);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-linear-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="max-w-4xl mx-auto">
        <div className="p-8 rounded-3xl shadow-2xl border-2 border-transparent bg-linear-to-br from-purple-50 to-pink-50 hover:border-purple-300 hover:shadow-xl hover:scale-105 transition-all duration-300">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2 animate-bounce">📝</div>
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-pink-600">
              Evaluación IA
            </h2>
            <p className="text-gray-600">
              Responde la evaluación generada por IA. El resultado será enviado
              automáticamente al profesor.
            </p>
          </div>

          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <p className="mt-2 text-purple-600">Cargando evaluación...</p>
            </div>
          )}

          {error && (
            <div className="p-4 mb-6 text-red-700 bg-red-100 border border-red-400 rounded-lg">
              {error}
            </div>
          )}

          {!loading && !error && evaluacion.length > 0 && !enviado && (
            <form className="space-y-8">
              {evaluacion.map((q, idx) => (
                <div
                  key={idx}
                  className="p-6 bg-white rounded-2xl border-2 border-purple-100 hover:border-purple-300 hover:shadow-xl hover:scale-105 transition-all duration-300"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="px-3 py-1 text-sm font-semibold rounded-full bg-purple-100 text-purple-700">
                          Pregunta {idx + 1}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {q.puntaje || 1} pts
                      </div>
                    </div>
                    <div className="text-lg font-semibold text-gray-800">
                      {q.pregunta}
                    </div>
                  </div>
                  <div className="space-y-3">
                    {q.opciones.map((op, opIdx) => (
                      <label
                        key={opIdx}
                        className="flex items-center gap-3 p-3 rounded-lg border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 cursor-pointer transition-all"
                      >
                        <input
                          type="radio"
                          name={`pregunta-${idx}`}
                          checked={respuestas[idx] === opIdx}
                          onChange={() => responder(idx, opIdx)}
                          className="w-4 h-4 text-purple-600 accent-purple-600"
                        />
                        <span className="text-gray-700">{op}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <button
                type="button"
                className="w-full px-6 py-3 text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:bg-purple-400 transition-colors flex items-center justify-center space-x-2"
                onClick={enviarEvaluacion}
                disabled={respuestas.some((r) => r === null)}
              >
                <span>🚀</span>
                <span>{loading ? "Enviando..." : "Enviar Evaluación"}</span>
              </button>
            </form>
          )}

          {enviado && puntaje !== null && (
            <div className="p-8 mt-8 rounded-2xl bg-linear-to-br from-green-50 to-blue-50 border-2 border-green-200">
              <div className="text-center">
                <div className="text-6xl mb-4 animate-bounce">🎉</div>
                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-linear-to-r from-green-600 to-blue-600">
                  ¡Evaluación Completada!
                </h3>
                <div className="text-lg text-gray-700">
                  Tu puntaje:{" "}
                  <span className="text-green-700 font-bold">{puntaje}</span>
                </div>
                <div className="text-gray-600">
                  El resultado ha sido enviado al profesor.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
