import { useState, useEffect } from "react";
import Button from "../../components/iu/Button";
import api from "../../services/api";

export default function QuizEstudiante() {
  const [quiz, setQuiz] = useState(null);
  const [respuestas, setRespuestas] = useState([]);
  const [enviado, setEnviado] = useState(false);
  const [puntaje, setPuntaje] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Obtener el quiz generado por el profesor
  useEffect(() => {
    const fetchQuiz = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/quiz-actual");
        if (res.data.quiz) {
          setQuiz(res.data.quiz);
          setRespuestas(Array(res.data.quiz.preguntas.length).fill(""));
        }
      } catch (err) {
        setError("No hay actividad disponible en este momento.");
      }
      setLoading(false);
    };
    fetchQuiz();
  }, []);

  const handleChange = (idx, value) => {
    const nuevas = [...respuestas];
    nuevas[idx] = value;
    setRespuestas(nuevas);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/responder-quiz", { respuestas });
      setPuntaje(res.data.puntaje);
      setEnviado(true);
    } catch (err) {
      setError("No se pudo enviar tus respuestas. Intenta nuevamente.");
    }
    setLoading(false);
  };

  if (loading) return <div className="p-6 text-blue-600">Cargando...</div>;

  if (error)
    return <div className="p-6 text-red-700 bg-red-100 rounded">{error}</div>;

  if (!quiz)
    return (
      <div className="p-6 text-gray-500">No hay actividad disponible.</div>
    );

  if (enviado)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-teal-50 to-blue-50">
        <div className="quiz-card p-12 rounded-3xl shadow-2xl text-center bounce-in max-w-md">
          <div className="text-6xl mb-6 float">🏆</div>
          <h2 className="mb-4 text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-600">
            ¡Quiz Completado!
          </h2>
          <div className="text-xl text-gray-700 mb-6">
            Tu puntaje:{" "}
            <span className="text-3xl font-bold text-green-600">
              {puntaje}/100
            </span>
          </div>
          <div className="flex justify-center space-x-3 mb-4">
            <div className="score-badge bg-gradient-to-r from-yellow-400 to-orange-500">
              +{puntaje} pts 🏆
            </div>
            {puntaje >= 80 && (
              <div className="level-badge bg-gradient-to-r from-purple-500 to-pink-500">
                ⭐ ¡Excelente!
              </div>
            )}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="btn-success mt-6"
          >
            🎯 Nuevo Quiz
          </button>
        </div>
      </div>
    );

  return (
    <div className="max-w-3xl p-6 mx-auto min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="quiz-card p-8 rounded-3xl shadow-2xl bounce-in">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-xl text-white text-4xl">
              🧠
            </div>
            <div>
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Quiz IA del Día
              </h2>
              <p className="text-sm text-gray-600">¡Demuestra lo que sabes!</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <div className="level-badge bg-gradient-to-r from-blue-500 to-indigo-500">
              🎯 {quiz.preguntas.length} preguntas
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {quiz.preguntas.map((preg, idx) => (
            <div
              key={idx}
              className="p-6 bg-white rounded-2xl border-2 border-blue-100 hover:border-blue-300 transition-all slide-up"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="mb-4 text-xl font-bold text-gray-800">
                <span className="text-blue-600">Pregunta {idx + 1}:</span>{" "}
                {preg.pregunta}
              </div>
              <div className="space-y-3">
                {preg.opciones.map((op, i) => (
                  <label
                    key={i}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      respuestas[idx] === op
                        ? "border-blue-400 bg-blue-50 shadow-lg transform scale-105"
                        : "border-gray-200 hover:border-blue-300 hover:shadow-md"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        respuestas[idx] === op
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-300"
                      }`}
                    >
                      {respuestas[idx] === op && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <input
                      type="radio"
                      name={`pregunta-${idx}`}
                      value={op}
                      checked={respuestas[idx] === op}
                      onChange={() => handleChange(idx, op)}
                      required
                      className="hidden"
                    />
                    <span className="font-medium text-gray-800">{op}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
          <button
            type="submit"
            className="btn-ai w-full flex items-center justify-center space-x-2"
          >
            <span className="text-xl">🚀</span>
            <span>Enviar Respuestas</span>
          </button>
        </form>
      </div>
    </div>
  );
}
