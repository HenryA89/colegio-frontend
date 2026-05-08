import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Brain,
  Trophy,
  Target,
  Timer,
  ArrowRight,
  RotateCcw,
  Star,
  Zap,
  Rocket,
  Swords,
  Crown,
} from "lucide-react";

import {
  getQuiz,
  submitQuiz,
  getRanking,
} from "../../services/profesorServices/quizAiService";

export default function QuizEstudiante() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [respuestas, setRespuestas] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [resultado, setResultado] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [quizIniciado, setQuizIniciado] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState(null);
  const [autoEnviado, setAutoEnviado] = useState(false);

  // =========================
  // PROGRESO
  // =========================

  const respuestasContestadas = useMemo(() => {
    return respuestas.filter((r) => r && r.trim() !== "").length;
  }, [respuestas]);

  const porcentajeProgreso = useMemo(() => {
    if (!quiz?.preguntas?.length) return 0;

    return Math.round((respuestasContestadas / quiz.preguntas.length) * 100);
  }, [respuestasContestadas, quiz]);

  // =========================
  // FORMATEAR TIEMPO
  // =========================

  const formatearTiempo = (segundos) => {
    if (!segundos && segundos !== 0) return "00:00";

    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;

    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // =========================
  // CARGAR QUIZ
  // =========================

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getQuiz(quizId, "estudiante");

        if (!response?.success) {
          throw new Error("No fue posible cargar el quiz");
        }

        const quizData = response.data.quiz;

        if (!quizData?.preguntas?.length) {
          throw new Error("El quiz no tiene preguntas disponibles");
        }

        setQuiz(quizData);
        setRespuestas(Array(quizData.preguntas.length).fill(""));
        setTiempoRestante((quizData.duracion || 10) * 60);
      } catch (err) {
        console.error(err);

        if (err.message.includes("token")) {
          localStorage.removeItem("token");
          navigate("/login");
        }

        setError(
          err.message || "No fue posible cargar el quiz. Intenta nuevamente.",
        );
      } finally {
        setLoading(false);
      }
    };

    if (quizId) fetchQuiz();
  }, [quizId, navigate]);

  // =========================
  // TEMPORIZADOR
  // =========================

  useEffect(() => {
    if (
      !quizIniciado ||
      enviado ||
      tiempoRestante === null ||
      tiempoRestante <= 0
    ) {
      return;
    }

    const timer = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev <= 1) {
          clearInterval(timer);

          if (!autoEnviado) {
            setAutoEnviado(true);
            handleSubmit();
          }

          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizIniciado, tiempoRestante, enviado, autoEnviado]);

  // =========================
  // CAMBIAR RESPUESTA
  // =========================

  const handleChange = useCallback((index, value) => {
    setRespuestas((prev) => {
      const nuevas = [...prev];
      nuevas[index] = value;
      return nuevas;
    });
  }, []);

  // =========================
  // INICIAR QUIZ
  // =========================

  const iniciarQuiz = () => {
    setQuizIniciado(true);
  };

  // =========================
  // ENVIAR QUIZ
  // =========================

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();

    if (submitting || enviado) return;

    try {
      if (!quiz?.preguntas?.length) {
        throw new Error("No hay preguntas disponibles");
      }

      const incompletas = respuestas.filter((r) => !r || r.trim() === "");

      if (incompletas.length > 0 && !autoEnviado) {
        throw new Error(
          `Debes responder todas las preguntas. Faltan ${incompletas.length}`,
        );
      }

      setSubmitting(true);
      setError("");

      const payload = respuestas.map((respuesta, index) => ({
        pregunta_id: quiz.preguntas[index].id,
        respuesta: respuesta || "",
      }));

      const response = await submitQuiz(quizId, payload);

      if (!response?.success) {
        throw new Error("Error al enviar respuestas");
      }

      const resultadoQuiz = response.data;

      setResultado(resultadoQuiz);
      setEnviado(true);

      try {
        const rankingData = await getRanking(quizId);
        setRanking(rankingData || []);
      } catch (rankingError) {
        console.warn(rankingError);
      }
    } catch (err) {
      console.error(err);

      setError(err.message || "Ocurrió un error enviando el quiz.");
    } finally {
      setSubmitting(false);
    }
  };

  // =========================
  // REINICIAR
  // =========================

  const reiniciarQuiz = () => {
    setQuizIniciado(false);
    setEnviado(false);
    setResultado(null);
    setRanking([]);
    setRespuestas(Array(quiz?.preguntas?.length || 0).fill(""));
    setTiempoRestante((quiz?.duracion || 10) * 60);
    setAutoEnviado(false);
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-black flex items-center justify-center p-6">
        <div className="text-center max-w-xl">
          <div className="relative mb-10 flex justify-center">
            <div className="absolute w-40 h-40 rounded-full bg-purple-500/20 blur-3xl animate-pulse"></div>

            <div className="relative w-28 h-28 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center shadow-2xl">
              <Brain className="w-14 h-14 text-white animate-pulse" />
            </div>
          </div>

          <h1 className="text-5xl font-black text-white mb-4">QUIZ ARENA</h1>

          <p className="text-gray-300 text-lg mb-8">
            Preparando experiencia interactiva...
          </p>

          <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
            <div className="h-full w-2/3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error && !quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-950 to-black flex items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-lg border border-red-500/30 rounded-3xl p-10 max-w-lg text-center">
          <AlertCircle className="w-20 h-20 text-red-400 mx-auto mb-6" />

          <h2 className="text-3xl font-bold text-white mb-4">
            Ocurrió un problema
          </h2>

          <p className="text-red-200 mb-8">{error}</p>

          <button
            onClick={() => navigate(-1)}
            className="px-8 py-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-all"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  // =========================
  // PANTALLA INICIAL
  // =========================

  if (quiz && !quizIniciado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-black p-6 flex items-center justify-center">
        <div className="max-w-5xl w-full bg-white/10 backdrop-blur-lg border border-purple-500/30 rounded-3xl p-10 shadow-2xl">
          <div className="text-center mb-10">
            <div className="flex justify-center items-center gap-6 mb-8">
              <Rocket className="w-16 h-16 text-yellow-400 animate-bounce" />

              <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500">
                QUIZ ARENA
              </h1>

              <Swords className="w-16 h-16 text-yellow-400 animate-pulse" />
            </div>

            <h2 className="text-4xl font-bold text-white mb-4">
              {quiz.titulo}
            </h2>

            <p className="text-gray-300 text-lg max-w-3xl mx-auto">
              {quiz.descripcion}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <StatCard
              icon={<Target className="w-8 h-8" />}
              value={quiz.preguntas.length}
              label="Preguntas"
              gradient="from-blue-500 to-cyan-500"
            />

            <StatCard
              icon={<Timer className="w-8 h-8" />}
              value={`${quiz.duracion} min`}
              label="Duración"
              gradient="from-purple-500 to-pink-500"
            />

            <StatCard
              icon={<Trophy className="w-8 h-8" />}
              value={quiz.dificultad || "Media"}
              label="Dificultad"
              gradient="from-green-500 to-emerald-500"
            />
          </div>

          <div className="text-center">
            <button
              onClick={iniciarQuiz}
              className="px-12 py-5 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 hover:scale-105 transition-all text-white font-bold text-xl shadow-2xl"
            >
              ⚔️ INICIAR BATALLA
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================
  // QUIZ ACTIVO
  // =========================

  if (quiz && quizIniciado && !enviado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-black p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg border border-purple-500/30 rounded-3xl p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-6 justify-between items-center">
              <div>
                <h1 className="text-3xl font-black text-white mb-2">
                  ⚡ BATALLA EN CURSO
                </h1>

                <p className="text-gray-300">{quiz.titulo}</p>
              </div>

              <div className="flex gap-6 items-center">
                <div className="text-center">
                  <div
                    className={`w-24 h-24 rounded-full flex items-center justify-center shadow-2xl ${
                      tiempoRestante <= 60
                        ? "bg-red-500 animate-pulse"
                        : tiempoRestante <= 180
                          ? "bg-yellow-500"
                          : "bg-green-500"
                    }`}
                  >
                    <div>
                      <p className="font-black text-white text-lg">
                        {formatearTiempo(tiempoRestante)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-1">Progreso</p>

                  <p className="text-3xl font-black text-white">
                    {respuestasContestadas}/{quiz.preguntas.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                  style={{ width: `${porcentajeProgreso}%` }}
                ></div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {quiz.preguntas.map((pregunta, index) => (
              <div
                key={pregunta.id || index}
                className="bg-white/10 backdrop-blur-lg border border-purple-500/30 rounded-3xl p-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center font-black text-white ${
                        respuestas[index] ? "bg-green-500" : "bg-purple-500"
                      }`}
                    >
                      {index + 1}
                    </div>

                    <div>
                      <h3 className="text-2xl font-bold text-white">
                        Pregunta {index + 1}
                      </h3>
                    </div>
                  </div>

                  {respuestas[index] && (
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  )}
                </div>

                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 mb-8">
                  <p className="text-white text-xl leading-relaxed">
                    {pregunta.enunciado || pregunta.texto}
                  </p>
                </div>

                <div className="space-y-4">
                  {Object.entries(pregunta.opciones || {}).map(
                    ([key, value]) => (
                      <label
                        key={key}
                        className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                          respuestas[index] === value
                            ? "border-green-500 bg-green-500/10"
                            : "border-white/10 bg-white/5 hover:border-purple-400"
                        }`}
                      >
                        <input
                          type="radio"
                          className="hidden"
                          checked={respuestas[index] === value}
                          onChange={() => handleChange(index, value)}
                        />

                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            respuestas[index] === value
                              ? "border-green-500 bg-green-500"
                              : "border-gray-400"
                          }`}
                        >
                          {respuestas[index] === value && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>

                        <span
                          className={`text-lg ${
                            respuestas[index] === value
                              ? "text-green-300"
                              : "text-gray-200"
                          }`}
                        >
                          <strong>{key}.</strong> {value}
                        </span>
                      </label>
                    ),
                  )}
                </div>
              </div>
            ))}

            {error && (
              <div className="bg-red-500/20 border border-red-500/40 rounded-2xl p-5 text-red-200 flex items-center gap-3">
                <AlertCircle className="w-6 h-6" />
                {error}
              </div>
            )}

            <div className="text-center pb-10">
              <button
                type="submit"
                disabled={submitting}
                className="px-14 py-6 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 hover:scale-105 transition-all text-white font-black text-xl shadow-2xl disabled:opacity-50"
              >
                {submitting ? "ENVIANDO..." : "🚀 FINALIZAR QUIZ"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // =========================
  // RESULTADOS
  // =========================

  if (enviado && resultado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-black p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg border border-purple-500/30 rounded-3xl p-10 mb-8 text-center">
            <div className="flex justify-center items-center gap-6 mb-8">
              <Trophy className="w-20 h-20 text-yellow-400 animate-bounce" />

              <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500">
                QUIZ COMPLETADO
              </h1>

              <Crown className="w-20 h-20 text-yellow-400 animate-pulse" />
            </div>

            <p className="text-white text-2xl mb-10">Excelente trabajo ⚡</p>

            <div className="grid md:grid-cols-3 gap-6 mb-10">
              <StatCard
                icon={<Trophy className="w-8 h-8" />}
                value={resultado.puntaje || 0}
                label="Puntaje"
                gradient="from-yellow-500 to-orange-500"
              />

              <StatCard
                icon={<Target className="w-8 h-8" />}
                value={`${resultado.porcentaje || 0}%`}
                label="Precisión"
                gradient="from-green-500 to-emerald-500"
              />

              <StatCard
                icon={<Clock className="w-8 h-8" />}
                value={resultado.tiempo || "00:00"}
                label="Tiempo"
                gradient="from-blue-500 to-cyan-500"
              />
            </div>

            <div className="flex justify-center gap-2 mb-8">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-10 h-10 ${
                    i < Math.ceil((resultado.porcentaje || 0) / 20)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-600"
                  }`}
                />
              ))}
            </div>

            {ranking.length > 0 && (
              <div className="text-left mt-10">
                <h2 className="text-3xl font-bold text-white mb-6 text-center">
                  🏆 Ranking
                </h2>

                <div className="space-y-4">
                  {ranking.slice(0, 5).map((item, index) => (
                    <div
                      key={item.id || index}
                      className="flex justify-between items-center bg-white/5 border border-white/10 rounded-2xl p-5"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center font-black text-white">
                          {index + 1}
                        </div>

                        <div>
                          <p className="text-white font-semibold text-lg">
                            {item.nombre}
                          </p>

                          <p className="text-gray-400 text-sm">{item.tiempo}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-green-400 font-black text-xl">
                          {item.puntaje} pts
                        </p>

                        <p className="text-gray-400 text-sm">
                          {item.porcentaje}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap justify-center gap-5 mt-10">
              <button
                onClick={reiniciarQuiz}
                className="px-8 py-4 rounded-2xl border border-white/20 text-white hover:bg-white/10 transition-all flex items-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                Reiniciar
              </button>

              <button
                onClick={() => navigate(-1)}
                className="px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all flex items-center gap-2"
              >
                <ArrowRight className="w-5 h-5" />
                Continuar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// =========================
// COMPONENTE REUTILIZABLE
// =========================

function StatCard({ icon, value, label, gradient }) {
  return (
    <div className="relative group">
      <div
        className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-3xl blur-xl opacity-40 group-hover:opacity-70 transition-opacity`}
      ></div>

      <div
        className={`relative bg-gradient-to-r ${gradient} rounded-3xl p-6 text-white text-center`}
      >
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-white/20 rounded-2xl">{icon}</div>
        </div>

        <h3 className="text-3xl font-black mb-2">{value}</h3>

        <p className="text-white/80">{label}</p>
      </div>
    </div>
  );
}
