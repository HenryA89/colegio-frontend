import { useEffect, useState } from "react";
import { apiFetch } from "../../utils/Api";
import { useParams } from "react-router-dom";

export default function Evaluaciones() {
  const { id } = useParams();
  const [evaluacion, setEvaluacion] = useState([]); // [{ pregunta, opciones, correcta, puntaje }]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [respuestas, setRespuestas] = useState([]);
  const [puntaje, setPuntaje] = useState(null);
  const [enviado, setEnviado] = useState(false);

  useEffect(() => {
    async function fetchEvaluacion() {
      setLoading(true);
      setError("");
      try {
        // Nuevo endpoint con id de clase
        const url = `http://localhost:3000/api/v1/clases/${id}/evaluaciones`;
        const response = await fetch(url, {
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) throw new Error("No se pudo cargar la evaluación");
        const data = await response.json();
        setEvaluacion(data.evaluacion || []);
        setRespuestas(Array((data.evaluacion || []).length).fill(null));
      } catch (err) {
        setError("No se pudo cargar la evaluación generada por IA.");
      }
      setLoading(false);
    }
    fetchEvaluacion();
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
      // Suponiendo endpoint: /resultados-evaluacion (POST)
      await apiFetch("resultados-evaluacion", {
        method: "POST",
        body: JSON.stringify({ respuestas, puntaje: total }),
      });
    } catch (err) {
      setError("No se pudo enviar el resultado. Intenta nuevamente.");
    }
  };

  return (
    <div className="p-6">
      <h2 className="mb-4 text-2xl font-bold">📝 Evaluación IA</h2>
      <p className="mb-6 text-gray-600">
        Responde la evaluación generada por IA. El resultado será enviado
        automáticamente al profesor.
      </p>
      {loading && <div className="text-blue-600">Cargando evaluación...</div>}
      {error && (
        <div className="p-2 mb-4 text-red-600 bg-red-100 rounded">{error}</div>
      )}
      {!loading && !error && evaluacion.length > 0 && !enviado && (
        <form className="space-y-8">
          {evaluacion.map((q, idx) => (
            <div key={idx} className="p-4 bg-white rounded-lg shadow">
              <div className="mb-2 font-semibold text-gray-800">
                {idx + 1}. {q.pregunta}
              </div>
              <div className="space-y-2">
                {q.opciones.map((op, opIdx) => (
                  <label
                    key={opIdx}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name={`pregunta-${idx}`}
                      checked={respuestas[idx] === opIdx}
                      onChange={() => responder(idx, opIdx)}
                      className="accent-blue-600"
                    />
                    <span className="text-gray-700">{op}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
          <button
            type="button"
            className="px-6 py-2 text-white transition bg-green-600 rounded-lg hover:bg-green-700"
            onClick={enviarEvaluacion}
            disabled={respuestas.some((r) => r === null)}
          >
            Enviar Evaluación
          </button>
        </form>
      )}
      {enviado && puntaje !== null && (
        <div className="p-4 mt-8 rounded-lg bg-blue-50">
          <h3 className="mb-2 text-lg font-bold text-blue-700">
            Tu puntaje: <span className="text-green-700">{puntaje}</span>
          </h3>
          <div className="text-gray-600">
            El resultado ha sido enviado al profesor.
          </div>
        </div>
      )}
    </div>
  );
}
