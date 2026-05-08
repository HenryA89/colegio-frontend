import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Brain,
  Trophy,
  BarChart3,
  Eye,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

import {
  getQuiz,
  getRanking,
  getResultados,
} from "../../services/profesorServices/quizAiService";

export default function QuizAi() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [ranking, setRanking] = useState([]);
  const [resultados, setResultados] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [quizStatus, setQuizStatus] = useState(null);

  const [mostrarRanking, setMostrarRanking] = useState(false);
  const [mostrarResultados, setMostrarResultados] = useState(false);

  // =========================
  // OBTENER QUIZ
  // =========================
  const handleGetQuiz = async () => {
    try {
      setLoading(true);
      setError(null);
      setQuizStatus("loading");

      console.log("🎯 ID recibido desde params:", id);
      console.log("🎯 Tipo:", typeof id);

      if (!id || isNaN(Number(id))) {
        throw new Error("ID inválido");
      }

      const response = await getQuiz(Number(id), "profesor");

      console.log("✅ RESPONSE QUIZ:", response);

      if (!response.success) {
        throw new Error(response.message || "Error obteniendo quiz");
      }

      const quizData = response.data.quiz;

      setQuiz(quizData);
      setQuizStatus("published");

      console.log("✅ Quiz cargado:", quizData);
    } catch (err) {
      console.error("❌ ERROR QUIZ:", err);

      setQuizStatus("error");

      setError(err.message || "No se pudo cargar el quiz correctamente.");

      if (err.message?.includes("autenticación")) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // OBTENER RANKING
  // =========================
  const handleGetRanking = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getRanking(Number(id));

      console.log("🏆 RANKING:", response);

      if (!response.success) {
        throw new Error(response.error || "Error obteniendo ranking");
      }

      setRanking(response.data.top_3 || []);
      setMostrarRanking(true);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // OBTENER RESULTADOS
  // =========================
  const handleGetResultados = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getResultados(Number(id));

      console.log("📊 RESULTADOS:", response);

      if (!response.success) {
        throw new Error(response.error || "Error obteniendo resultados");
      }

      setResultados(response.data.resultados || []);
      setMostrarResultados(true);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-slate-950 text-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-10">QUIZ CONTROL CENTER</h1>

        {/* BOTONES */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <button
            onClick={handleGetQuiz}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 p-6 rounded-xl"
          >
            <Brain className="w-10 h-10 mb-4" />
            <p className="font-bold">Generar Quiz</p>
          </button>

          <button
            onClick={handleGetRanking}
            disabled={loading}
            className="bg-yellow-600 hover:bg-yellow-700 p-6 rounded-xl"
          >
            <Trophy className="w-10 h-10 mb-4" />
            <p className="font-bold">Ranking</p>
          </button>

          <button
            onClick={handleGetResultados}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 p-6 rounded-xl"
          >
            <BarChart3 className="w-10 h-10 mb-4" />
            <p className="font-bold">Resultados</p>
          </button>
        </div>

        {/* STATUS */}
        {quizStatus && (
          <div className="mb-8 p-5 rounded-xl bg-slate-900 border border-slate-700">
            <div className="flex items-center gap-4">
              {quizStatus === "loading" && (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  <p>Cargando quiz...</p>
                </>
              )}

              {quizStatus === "published" && (
                <>
                  <CheckCircle className="text-green-500" />
                  <p>Quiz cargado correctamente</p>
                </>
              )}

              {quizStatus === "error" && (
                <>
                  <AlertCircle className="text-red-500" />
                  <p>Error cargando quiz</p>
                </>
              )}
            </div>
          </div>
        )}

        {/* ERROR */}
        {error && <div className="bg-red-600 p-4 rounded-xl mb-6">{error}</div>}

        {/* QUIZ */}
        {quiz && (
          <div className="bg-slate-900 p-8 rounded-2xl border border-slate-700">
            <div className="flex items-center gap-3 mb-6">
              <Eye className="w-8 h-8 text-cyan-400" />
              <h2 className="text-2xl font-bold">Información del Quiz</h2>
            </div>

            <h3 className="text-3xl font-bold mb-4">{quiz.titulo}</h3>

            <p className="text-slate-300 mb-6">{quiz.descripcion}</p>

            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-slate-800 p-4 rounded-xl">
                <p className="text-slate-400 text-sm">Materia</p>
                <p className="font-bold">{quiz.materia}</p>
              </div>

              <div className="bg-slate-800 p-4 rounded-xl">
                <p className="text-slate-400 text-sm">Preguntas</p>
                <p className="font-bold">{quiz.total_preguntas}</p>
              </div>

              <div className="bg-slate-800 p-4 rounded-xl">
                <p className="text-slate-400 text-sm">Duración</p>
                <p className="font-bold">{quiz.duracion} min</p>
              </div>

              <div className="bg-slate-800 p-4 rounded-xl">
                <p className="text-slate-400 text-sm">Nivel</p>
                <p className="font-bold">{quiz.nivel}</p>
              </div>
            </div>
          </div>
        )}

        {/* MODAL RANKING */}
        {mostrarRanking && (
          <div className="mt-10 bg-slate-900 p-8 rounded-2xl">
            <h2 className="text-2xl font-bold mb-6">Ranking</h2>

            <div className="space-y-4">
              {ranking.map((item, index) => (
                <div
                  key={index}
                  className="bg-slate-800 p-4 rounded-xl flex justify-between"
                >
                  <p>{item.estudiante_nombre}</p>
                  <p>{item.puntaje}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RESULTADOS */}
        {mostrarResultados && (
          <div className="mt-10 bg-slate-900 p-8 rounded-2xl">
            <h2 className="text-2xl font-bold mb-6">Resultados</h2>

            <div className="space-y-4">
              {resultados.map((item) => (
                <div
                  key={item.intento_id}
                  className="bg-slate-800 p-4 rounded-xl"
                >
                  <div className="flex justify-between mb-2">
                    <p className="font-bold">{item.estudiante_nombre}</p>

                    <p className="text-green-400">{item.puntaje} pts</p>
                  </div>

                  <div className="text-sm text-slate-300">
                    Correctas: {item.correctas} | Incorrectas:{" "}
                    {item.incorrectas}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
