import { useEffect, useState, useCallback } from "react";

import {
  Brain,
  Loader2,
  Trophy,
  Medal,
  CheckCircle2,
  Clock3,
  Target,
  Send,
} from "lucide-react";

import {
  getQuizEstudiante,
  submitQuiz,
  getRanking,
} from "../../services/estudianteServices/quizService";

export default function QuizEstudiante({ quizId }) {
  // ==========================================
  // STATES
  // ==========================================
  const [quiz, setQuiz] = useState(null);

  const [respuestas, setRespuestas] = useState([]);

  const [ranking, setRanking] = useState([]);

  const [resultado, setResultado] = useState(null);

  const [quizFinalizado, setQuizFinalizado] = useState(false);

  const [loadingQuiz, setLoadingQuiz] = useState(false);

  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const [loadingRanking, setLoadingRanking] = useState(false);

  const [error, setError] = useState(null);

  // ==========================================
  // VALIDAR ID
  // ==========================================
  const idValido = quizId && !isNaN(quizId) && Number(quizId) > 0;

  // ==========================================
  // OBTENER QUIZ
  // ==========================================
  const handleGetQuiz = useCallback(async () => {
    try {
      setLoadingQuiz(true);

      setError(null);

      console.log("🎓 QUIZ ID:", quizId);

      const response = await getQuizEstudiante(quizId);

      console.log("✅ QUIZ ESTUDIANTE:", response);

      if (!response?.success) {
        throw new Error(response?.message || "No se pudo cargar el quiz");
      }

      setQuiz(response.data);
    } catch (err) {
      console.error("❌ ERROR CARGANDO QUIZ:", err);

      setError(err.message || "Error cargando quiz");
    } finally {
      setLoadingQuiz(false);
    }
  }, [quizId]);

  // ==========================================
  // SELECCIONAR RESPUESTA
  // ==========================================
  const handleSeleccionarRespuesta = (preguntaId, opcion) => {
    setRespuestas((prev) => {
      const existe = prev.find((r) => r.pregunta_id === preguntaId);

      if (existe) {
        return prev.map((r) =>
          r.pregunta_id === preguntaId
            ? {
                ...r,
                opcion_seleccionada: opcion,
              }
            : r,
        );
      }

      return [
        ...prev,
        {
          pregunta_id: preguntaId,
          opcion_seleccionada: opcion,
        },
      ];
    });
  };

  // ==========================================
  // OBTENER TOP 3
  // ==========================================
  const handleGetRanking = async (currentQuizId) => {
    try {
      setLoadingRanking(true);

      const response = await getRanking(currentQuizId);

      console.log("🏆 RANKING:", response);

      if (!response?.success) {
        throw new Error("No se pudo obtener el ranking");
      }

      // TOP 3
      const top3 = response.data?.slice(0, 3) || [];

      setRanking(top3);
    } catch (err) {
      console.error("❌ ERROR RANKING:", err);
    } finally {
      setLoadingRanking(false);
    }
  };

  // ==========================================
  // ENVIAR QUIZ
  // ==========================================
  const handleSubmitQuiz = async () => {
    try {
      setLoadingSubmit(true);

      setError(null);

      if (!quiz?.id) {
        throw new Error("No existe quiz disponible");
      }

      if (respuestas.length !== quiz.preguntas.length) {
        throw new Error("Debes responder todas las preguntas");
      }

      const response = await submitQuiz(quiz.id, respuestas);

      console.log("✅ QUIZ RESPONDIDO:", response);

      if (!response?.success) {
        throw new Error(response?.message || "No se pudo enviar el quiz");
      }

      // ==========================
      // RESULTADO PERSONAL
      // ==========================
      setResultado({
        puntaje: response.data?.puntaje || 0,

        correctas: response.data?.correctas || 0,

        porcentaje: response.data?.porcentaje || 0,
      });

      // ==========================
      // FINALIZAR QUIZ
      // ==========================
      setQuizFinalizado(true);

      // ==========================
      // OBTENER TOP 3
      // ==========================
      await handleGetRanking(quiz.id);
    } catch (err) {
      console.error("❌ ERROR ENVIANDO QUIZ:", err);

      setError(err.message || "No se pudo responder el quiz");
    } finally {
      setLoadingSubmit(false);
    }
  };

  // ==========================================
  // AUTO LOAD
  // ==========================================
  useEffect(() => {
    if (idValido) {
      handleGetQuiz();
    }
  }, [idValido, handleGetQuiz]);

  // ==========================================
  // LOADING
  // ==========================================
  if (loadingQuiz) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-14 h-14 text-cyan-400 animate-spin" />
      </div>
    );
  }

  // ==========================================
  // NO QUIZ
  // ==========================================
  if (!quiz) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        No hay quiz disponible
      </div>
    );
  }

  // ==========================================
  // RESULTADOS FINALES
  // ==========================================
  if (quizFinalizado) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-6">
        <div className="max-w-7xl mx-auto">
          {/* HEADER */}
          <div className="mb-10">
            <div className="flex items-center gap-4">
              <div className="bg-green-500/10 p-4 rounded-2xl border border-green-500/20">
                <CheckCircle2 className="w-10 h-10 text-green-400" />
              </div>

              <div>
                <h1 className="text-5xl font-black">QUIZ FINALIZADO</h1>

                <p className="text-slate-400 mt-2">
                  Tus resultados han sido registrados
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

          <div className="grid lg:grid-cols-2 gap-8">
            {/* RESULTADO PERSONAL */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-8">
                <Target className="w-8 h-8 text-cyan-400" />

                <h2 className="text-3xl font-black">Tu Resultado</h2>
              </div>

              <div className="space-y-6">
                <div className="bg-slate-800 rounded-2xl p-6">
                  <p className="text-slate-400 mb-2">Puntaje</p>

                  <p className="text-5xl font-black text-cyan-400">
                    {resultado?.puntaje}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800 rounded-2xl p-5">
                    <p className="text-slate-400 mb-2">Correctas</p>

                    <p className="text-3xl font-black text-green-400">
                      {resultado?.correctas}
                    </p>
                  </div>

                  <div className="bg-slate-800 rounded-2xl p-5">
                    <p className="text-slate-400 mb-2">Porcentaje</p>

                    <p className="text-3xl font-black text-yellow-400">
                      {resultado?.porcentaje}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* TOP 3 */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-8">
                <Trophy className="w-8 h-8 text-yellow-400" />

                <h2 className="text-3xl font-black">Top 3 Ranking</h2>
              </div>

              {loadingRanking ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-10 h-10 animate-spin text-yellow-400" />
                </div>
              ) : (
                <div className="space-y-4">
                  {ranking.map((item, index) => (
                    <div
                      key={index}
                      className="bg-slate-800 rounded-2xl p-5 flex justify-between items-center"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-yellow-500/10 p-3 rounded-xl">
                          <Medal className="w-6 h-6 text-yellow-400" />
                        </div>

                        <div>
                          <p className="font-bold text-lg">
                            #{index + 1} {item.estudiante || item.nombre}
                          </p>
                        </div>
                      </div>

                      <p className="text-2xl font-black text-yellow-400">
                        {item.puntaje || item.score}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // QUIZ
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-5xl mx-auto">
        {/* HEADER */}
        <div className="mb-10">
          <div className="flex items-center gap-4">
            <div className="bg-cyan-500/10 p-4 rounded-2xl border border-cyan-500/20">
              <Brain className="w-10 h-10 text-cyan-400" />
            </div>

            <div>
              <h1 className="text-5xl font-black">{quiz.titulo}</h1>

              <p className="text-slate-400 mt-2">{quiz.materia}</p>
            </div>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-8 bg-red-500/10 border border-red-500/20 text-red-300 p-5 rounded-2xl">
            {error}
          </div>
        )}

        {/* INFO */}
        <div className="grid md:grid-cols-3 gap-5 mb-10">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <p className="text-slate-400 mb-2">Preguntas</p>

            <p className="text-3xl font-black">{quiz.total_preguntas}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <p className="text-slate-400 mb-2">Nivel</p>

            <p className="text-3xl font-black">{quiz.nivel}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Clock3 className="w-5 h-5 text-cyan-400" />

              <p className="text-slate-400">Tiempo límite</p>
            </div>

            <p className="text-3xl font-black">
              {quiz.tiempo_limite || "Libre"}
            </p>
          </div>
        </div>

        {/* PREGUNTAS */}
        <div className="space-y-8">
          {quiz.preguntas.map((pregunta, index) => (
            <div
              key={pregunta.id || index}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-8"
            >
              <h2 className="text-2xl font-bold mb-8">
                {index + 1}. {pregunta.pregunta}
              </h2>

              <div className="grid gap-4">
                {pregunta.opciones?.map((opcion, opcionIndex) => {
                  const seleccionada = respuestas.find(
                    (r) =>
                      r.pregunta_id === pregunta.id &&
                      r.opcion_seleccionada === opcion,
                  );

                  return (
                    <button
                      key={opcionIndex}
                      onClick={() =>
                        handleSeleccionarRespuesta(pregunta.id, opcion)
                      }
                      className={`p-5 rounded-2xl border text-left transition-all ${
                        seleccionada
                          ? "bg-cyan-500 border-cyan-400 text-white"
                          : "bg-slate-800 border-slate-700 hover:border-cyan-500"
                      }`}
                    >
                      {opcion}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* SUBMIT */}
        <div className="mt-10">
          <button
            onClick={handleSubmitQuiz}
            disabled={loadingSubmit}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 hover:scale-[1.01] transition-all disabled:opacity-50"
          >
            {loadingSubmit ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Enviando respuestas...
              </>
            ) : (
              <>
                <Send className="w-6 h-6" />
                Finalizar Quiz
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
