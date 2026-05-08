import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  Brain,
  Trophy,
  BarChart3,
  Eye,
  AlertCircle,
  CheckCircle,
  Loader2,
  BookOpen,
  Users,
} from "lucide-react";

import {
  getQuiz,
  getRanking,
  getResultados,
} from "../../services/profesorServices/quizAiService";

export default function QuizAi() {
  const { id } = useParams();
  const navigate = useNavigate();

  // =========================
  // STATES
  // =========================
  const [quiz, setQuiz] = useState(null);

  const [ranking, setRanking] = useState([]);
  const [resultados, setResultados] = useState([]);

  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [loadingRanking, setLoadingRanking] = useState(false);
  const [loadingResultados, setLoadingResultados] = useState(false);

  const [error, setError] = useState(null);

  const [mostrarRanking, setMostrarRanking] = useState(false);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [inputId, setInputId] = useState("");

  // =========================
  // VALIDACIÓN ID
  // =========================
  const materialClaseId = Number(id);

  const idValido =
    id &&
    !isNaN(materialClaseId) &&
    Number.isInteger(materialClaseId) &&
    materialClaseId > 0;

  const inputIdValido =
    inputId &&
    !isNaN(Number(inputId)) &&
    Number.isInteger(Number(inputId)) &&
    Number(inputId) > 0;

  // =========================
  // OBTENER QUIZ
  // =========================
  const handleGetQuiz = async () => {
    try {
      setLoadingQuiz(true);
      setError(null);

      // Usar ID de la URL o del input
      const targetId = idValido ? materialClaseId : Number(inputId);

      if (!targetId) {
        setError(
          "Por favor, ingresa un ID de quiz válido o accede a una URL como: /profesor/materiales/123/quiz",
        );
        setLoadingQuiz(false);
        return;
      }

      console.log("🎯 MaterialClase ID a usar:", targetId);

      /**
       * IMPORTANTE:
       * El backend busca el quiz usando:
       * material_clase_id
       *
       * NO usando quiz_id
       */

      const response = await getQuiz(targetId, "profesor");

      console.log("✅ RESPONSE QUIZ:", response);

      if (!response?.success) {
        throw new Error(response?.message || "No se pudo obtener el quiz");
      }

      /**
       * Backend:
       *
       * data: {
       *   quiz_id,
       *   titulo,
       *   materia,
       *   quiz: {},
       *   ya_respondido,
       *   total_participantes
       * }
       */

      const quizData = response.data;

      setQuiz(quizData);

      console.log("✅ Quiz cargado:", quizData);
    } catch (err) {
      console.error("❌ ERROR QUIZ:", err);

      setError(err.message || "No se pudo cargar el quiz correctamente.");

      if (err.message?.includes("autenticación")) {
        navigate("/login");
      }
    } finally {
      setLoadingQuiz(false);
    }
  };

  // =========================
  // OBTENER RANKING
  // =========================
  const handleGetRanking = async () => {
    try {
      setLoadingRanking(true);
      setError(null);

      // Usar ID de la URL o del input
      const targetId = idValido ? materialClaseId : Number(inputId);

      if (!targetId) {
        setError("Por favor, ingresa un ID de quiz válido para ver el ranking");
        setLoadingRanking(false);
        return;
      }

      const response = await getRanking(targetId);

      console.log("🏆 RESPONSE RANKING:", response);

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

  // =========================
  // OBTENER RESULTADOS
  // =========================
  const handleGetResultados = async () => {
    try {
      setLoadingResultados(true);
      setError(null);

      // Usar ID de la URL o del input
      const targetId = idValido ? materialClaseId : Number(inputId);

      if (!targetId) {
        setError(
          "Por favor, ingresa un ID de quiz válido para ver los resultados",
        );
        setLoadingResultados(false);
        return;
      }

      const response = await getResultados(targetId);

      console.log("📊 RESPONSE RESULTADOS:", response);

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

  // =========================
  // AUTO LOAD
  // =========================
  useEffect(() => {
    if (idValido) {
      handleGetQuiz();
    }
  }, [id]);

  // =========================
  // SIEMPRE MOSTRAR TARJETAS
  // =========================
  // Eliminada la página de error para siempre mostrar las tres tarjetas

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-cyan-500/10 p-4 rounded-2xl border border-cyan-500/20">
              <Brain className="w-10 h-10 text-cyan-400" />
            </div>

            <div>
              <h1 className="text-5xl font-black">QUIZ AI CONTROL CENTER</h1>

              <p className="text-slate-400 mt-2">
                {idValido
                  ? "Gestión inteligente de quizzes académicos"
                  : "Selecciona una acción para gestionar quizzes"}
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

        {/* INPUT PARA ID - Solo mostrar si no hay ID en URL */}
        {!idValido && (
          <div className="mb-8 bg-slate-800 border border-slate-700 rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-blue-500/10 p-3 rounded-xl border border-blue-500/20">
                <Brain className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Ingresar ID de Quiz
                </h3>
                <p className="text-slate-400 text-sm">
                  Si no tienes una URL específica, ingresa el ID del quiz que
                  quieres consultar
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <input
                type="number"
                value={inputId}
                onChange={(e) => setInputId(e.target.value)}
                placeholder="Ej: 123"
                className="flex-1 px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:ring-4 focus:ring-blue-500 focus:border-blue-400 transition-all"
              />

              <button
                onClick={handleGetQuiz}
                disabled={loadingQuiz || !inputIdValido}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 rounded-xl text-white font-semibold transition-colors"
              >
                {loadingQuiz ? "Cargando..." : "Cargar Quiz"}
              </button>
            </div>

            <div className="mt-4 text-slate-400 text-sm">
              <p>O accede directamente con una URL como:</p>
              <p className="font-mono text-blue-400">
                /profesor/materiales/123/quiz
              </p>
            </div>
          </div>
        )}

        {/* ACTIONS */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {/* QUIZ */}
          <button
            onClick={handleGetQuiz}
            disabled={loadingQuiz}
            className="group bg-gradient-to-br from-cyan-600 to-blue-700 hover:scale-[1.02] transition-all duration-300 rounded-3xl p-8 text-left shadow-2xl"
          >
            <div className="flex justify-between items-start mb-6">
              <Brain className="w-12 h-12" />

              {loadingQuiz && <Loader2 className="w-6 h-6 animate-spin" />}
            </div>

            <h2 className="text-2xl font-black mb-2">Cargar Quiz</h2>

            <p className="text-cyan-100">
              Obtiene el quiz generado automáticamente por IA.
            </p>
          </button>

          {/* RANKING */}
          <button
            onClick={handleGetRanking}
            disabled={loadingRanking}
            className="group bg-gradient-to-br from-yellow-500 to-orange-600 hover:scale-[1.02] transition-all duration-300 rounded-3xl p-8 text-left shadow-2xl"
          >
            <div className="flex justify-between items-start mb-6">
              <Trophy className="w-12 h-12" />

              {loadingRanking && <Loader2 className="w-6 h-6 animate-spin" />}
            </div>

            <h2 className="text-2xl font-black mb-2">Ranking</h2>

            <p className="text-yellow-100">
              Visualiza el rendimiento de los estudiantes.
            </p>
          </button>

          {/* RESULTADOS */}
          <button
            onClick={handleGetResultados}
            disabled={loadingResultados}
            className="group bg-gradient-to-br from-purple-600 to-fuchsia-700 hover:scale-[1.02] transition-all duration-300 rounded-3xl p-8 text-left shadow-2xl"
          >
            <div className="flex justify-between items-start mb-6">
              <BarChart3 className="w-12 h-12" />

              {loadingResultados && (
                <Loader2 className="w-6 h-6 animate-spin" />
              )}
            </div>

            <h2 className="text-2xl font-black mb-2">Resultados</h2>

            <p className="text-purple-100">
              Consulta estadísticas detalladas del quiz.
            </p>
          </button>
        </div>

        {/* QUIZ CARD */}
        {quiz && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-green-500/10 p-4 rounded-2xl border border-green-500/20">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>

              <div>
                <h2 className="text-3xl font-black">
                  Quiz cargado correctamente
                </h2>

                <p className="text-slate-400">Información general del quiz</p>
              </div>
            </div>

            {/* TOP INFO */}
            <div className="mb-8">
              <h3 className="text-4xl font-black mb-4">{quiz.titulo}</h3>

              <p className="text-slate-300 text-lg">
                Quiz generado mediante inteligencia artificial usando el
                material académico cargado.
              </p>
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

                <p className="font-black text-xl">
                  {quiz.quiz?.total_preguntas || 0}
                </p>
              </div>

              <div className="bg-slate-800 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="w-5 h-5 text-yellow-400" />

                  <p className="text-slate-400 text-sm">Participantes</p>
                </div>

                <p className="font-black text-xl">
                  {quiz.total_participantes || 0}
                </p>
              </div>

              <div className="bg-slate-800 rounded-2xl p-5">
                <p className="text-slate-400 text-sm mb-3">Estado</p>

                <p className="font-black text-green-400">Publicado</p>
              </div>
            </div>

            {/* PREGUNTAS */}
            {quiz.quiz?.preguntas?.length > 0 && (
              <div>
                <h2 className="text-2xl font-black mb-6">Preguntas del Quiz</h2>

                <div className="space-y-6">
                  {quiz.quiz.preguntas.map((pregunta, index) => (
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

        {/* RANKING */}
        {mostrarRanking && (
          <div className="mt-10 bg-slate-900 border border-slate-800 rounded-3xl p-8">
            <h2 className="text-3xl font-black mb-8">Ranking Académico</h2>

            <div className="space-y-4">
              {ranking.map((item, index) => (
                <div
                  key={index}
                  className="bg-slate-800 rounded-2xl p-5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-xl bg-yellow-500 text-black flex items-center justify-center font-black">
                      #{index + 1}
                    </div>

                    <div>
                      <p className="font-bold text-lg">
                        {item.estudiante_nombre}
                      </p>
                    </div>
                  </div>

                  <div className="text-2xl font-black text-yellow-400">
                    {item.puntaje}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RESULTADOS */}
        {mostrarResultados && (
          <div className="mt-10 bg-slate-900 border border-slate-800 rounded-3xl p-8">
            <h2 className="text-3xl font-black mb-8">Resultados del Quiz</h2>

            <div className="space-y-5">
              {resultados.map((item) => (
                <div
                  key={item.intento_id}
                  className="bg-slate-800 rounded-2xl p-6"
                >
                  <div className="flex justify-between items-center mb-5">
                    <div>
                      <h3 className="text-xl font-bold">
                        {item.estudiante_nombre}
                      </h3>

                      <p className="text-slate-400">
                        Intento #{item.intento_id}
                      </p>
                    </div>

                    <div className="text-3xl font-black text-green-400">
                      {item.puntaje} pts
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                      <p className="text-green-300">
                        Correctas: {item.correctas}
                      </p>
                    </div>

                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                      <p className="text-red-300">
                        Incorrectas: {item.incorrectas}
                      </p>
                    </div>
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
