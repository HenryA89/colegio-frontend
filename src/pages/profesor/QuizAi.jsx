import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  Brain,
  Trophy,
  BarChart3,
  Loader2,
  BookOpen,
  Users,
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

  // ==========================================
  // STATES
  // ==========================================
  const [quiz, setQuiz] = useState(null);

  const [ranking, setRanking] = useState([]);

  const [resultados, setResultados] = useState([]);

  const [loadingQuiz, setLoadingQuiz] = useState(false);

  const [loadingRanking, setLoadingRanking] = useState(false);

  const [loadingResultados, setLoadingResultados] = useState(false);

  const [error, setError] = useState(null);

  const [mostrarRanking, setMostrarRanking] = useState(false);

  const [mostrarResultados, setMostrarResultados] = useState(false);

  // ==========================================
  // VALIDACIÓN ID
  // ==========================================
  const materialClaseId = Number(id);

  const idValido =
    id &&
    !isNaN(materialClaseId) &&
    Number.isInteger(materialClaseId) &&
    materialClaseId > 0;

  // ==========================================
  // OBTENER QUIZ
  // ==========================================
  const handleGetQuiz = async () => {
    try {
      setLoadingQuiz(true);

      setError(null);

      if (!idValido) {
        throw new Error("ID de material inválido");
      }

      console.log("🎯 MaterialClase ID:", materialClaseId);

      const response = await getQuiz(materialClaseId, "profesor");

      console.log("✅ RESPONSE QUIZ:", response);

      if (!response?.success) {
        throw new Error(response?.message || "No se pudo cargar el quiz");
      }

      setQuiz(response.data);
    } catch (err) {
      console.error("❌ ERROR QUIZ:", err);

      setError(err.message || "No se pudo cargar el quiz");

      if (err.message?.includes("Sesión expirada")) {
        navigate("/login");
      }
    } finally {
      setLoadingQuiz(false);
    }
  };

  // ==========================================
  // RANKING
  // ==========================================
  const handleGetRanking = async () => {
    try {
      setLoadingRanking(true);

      setError(null);

      if (!quiz?.id) {
        throw new Error("Primero debes cargar el quiz");
      }

      const response = await getRanking(quiz.id);

      if (!response?.success) {
        throw new Error(response?.message || "Error obteniendo ranking");
      }

      setRanking(response.data || []);

      setMostrarRanking(true);
    } catch (err) {
      console.error("❌ ERROR RANKING:", err);

      setError(err.message);
    } finally {
      setLoadingRanking(false);
    }
  };

  // ==========================================
  // RESULTADOS
  // ==========================================
  const handleGetResultados = async () => {
    try {
      setLoadingResultados(true);

      setError(null);

      if (!quiz?.id) {
        throw new Error("Primero debes cargar el quiz");
      }

      const response = await getResultados(quiz.id);

      if (!response?.success) {
        throw new Error(response?.message || "Error obteniendo resultados");
      }

      setResultados(response.data || []);

      setMostrarResultados(true);
    } catch (err) {
      console.error("❌ ERROR RESULTADOS:", err);

      setError(err.message);
    } finally {
      setLoadingResultados(false);
    }
  };

  // ==========================================
  // AUTO LOAD
  // ==========================================
  useEffect(() => {
    if (idValido) {
      handleGetQuiz();
    }
  }, [id]);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-10">
          <div className="flex items-center gap-4">
            <div className="bg-cyan-500/10 p-4 rounded-2xl border border-cyan-500/20">
              <Brain className="w-10 h-10 text-cyan-400" />
            </div>

            <div>
              <h1 className="text-5xl font-black">QUIZ AI CONTROL CENTER</h1>

              <p className="text-slate-400 mt-2">
                Gestión inteligente de quizzes académicos
              </p>
            </div>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-8 bg-red-500/10 border border-red-500/20 text-red-300 p-5 rounded-2xl">
            {error}
          </div>
        )}

        {/* ACTIONS */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {/* QUIZ */}
          <button
            onClick={handleGetQuiz}
            disabled={loadingQuiz}
            className="bg-gradient-to-br from-cyan-600 to-blue-700 rounded-3xl p-8 text-left hover:scale-[1.02] transition-all"
          >
            <div className="flex justify-between items-start mb-6">
              <Brain className="w-12 h-12" />

              {loadingQuiz && <Loader2 className="w-6 h-6 animate-spin" />}
            </div>

            <h2 className="text-2xl font-black mb-2">Cargar Quiz</h2>

            <p className="text-cyan-100">Obtiene el quiz generado por IA</p>
          </button>

          {/* RANKING */}
          <button
            onClick={handleGetRanking}
            disabled={loadingRanking}
            className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-3xl p-8 text-left hover:scale-[1.02] transition-all"
          >
            <div className="flex justify-between items-start mb-6">
              <Trophy className="w-12 h-12" />

              {loadingRanking && <Loader2 className="w-6 h-6 animate-spin" />}
            </div>

            <h2 className="text-2xl font-black mb-2">Ranking</h2>

            <p className="text-yellow-100">Rendimiento de estudiantes</p>
          </button>

          {/* RESULTADOS */}
          <button
            onClick={handleGetResultados}
            disabled={loadingResultados}
            className="bg-gradient-to-br from-purple-600 to-fuchsia-700 rounded-3xl p-8 text-left hover:scale-[1.02] transition-all"
          >
            <div className="flex justify-between items-start mb-6">
              <BarChart3 className="w-12 h-12" />

              {loadingResultados && (
                <Loader2 className="w-6 h-6 animate-spin" />
              )}
            </div>

            <h2 className="text-2xl font-black mb-2">Resultados</h2>

            <p className="text-purple-100">Estadísticas detalladas</p>
          </button>
        </div>

        {/* QUIZ */}
        {quiz && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
            <div className="flex items-center gap-4 mb-8">
              <CheckCircle className="w-8 h-8 text-green-400" />

              <div>
                <h2 className="text-3xl font-black">{quiz.titulo}</h2>

                <p className="text-slate-400">Quiz cargado correctamente</p>
              </div>
            </div>

            {/* STATS */}
            <div className="grid md:grid-cols-4 gap-5 mb-10">
              <div className="bg-slate-800 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <BookOpen className="w-5 h-5 text-cyan-400" />

                  <p className="text-slate-400 text-sm">Materia</p>
                </div>

                <p className="font-black text-xl">{quiz.materia}</p>
              </div>

              <div className="bg-slate-800 rounded-2xl p-5">
                <p className="text-slate-400 text-sm mb-3">Preguntas</p>

                <p className="font-black text-xl">{quiz.total_preguntas}</p>
              </div>

              <div className="bg-slate-800 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="w-5 h-5 text-yellow-400" />

                  <p className="text-slate-400 text-sm">Participantes</p>
                </div>

                <p className="font-black text-xl">{quiz.total_participantes}</p>
              </div>

              <div className="bg-slate-800 rounded-2xl p-5">
                <p className="text-slate-400 text-sm mb-3">Nivel</p>

                <p className="font-black text-xl">{quiz.nivel}</p>
              </div>
            </div>

            {/* PREGUNTAS */}
            {quiz.preguntas?.length > 0 && (
              <div>
                <h2 className="text-2xl font-black mb-6">Preguntas del Quiz</h2>

                <div className="space-y-6">
                  {quiz.preguntas.map((pregunta, index) => (
                    <div
                      key={index}
                      className="bg-slate-800 border border-slate-700 rounded-2xl p-6"
                    >
                      <h3 className="text-xl font-bold mb-6">
                        {index + 1}. {pregunta.pregunta}
                      </h3>

                      <div className="grid gap-4">
                        {pregunta.opciones?.map((opcion, opcionIndex) => (
                          <div
                            key={opcionIndex}
                            className={`p-4 rounded-xl border ${
                              opcion === pregunta.respuesta_correcta
                                ? "bg-green-500/10 border-green-500 text-green-300"
                                : "bg-slate-900 border-slate-700"
                            }`}
                          >
                            {opcion}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
