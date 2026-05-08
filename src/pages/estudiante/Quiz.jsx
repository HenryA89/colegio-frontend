import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  Brain,
  Trophy,
  Target,
  Timer,
  ArrowRight,
  Play,
  RotateCcw,
  Star,
  Zap,
  Flame,
  Award,
  Medal,
  Rocket,
  Swords,
  Shield,
  Lightning,
  Fire,
  Gem,
  SwordsCrossed,
  Sparkles,
  Crown,
  Heart,
  Infinity,
  Gauge,
  TimerOff,
  Flag,
  ChevronRight,
  TrendingUp,
  Activity,
  ZapOff,
  Flame as Dragon,
} from "lucide-react";
import {
  getQuiz,
  submitQuiz,
  getRanking,
} from "../../services/profesorServices/quizAiService";

export default function QuizEstudiante() {
  const { quizId } = useParams(); // ID del quiz desde la URL
  const navigate = useNavigate();

  // Estados principales
  const [quiz, setQuiz] = useState(null);
  const [respuestas, setRespuestas] = useState([]);
  const [enviado, setEnviado] = useState(false);
  const [puntaje, setPuntaje] = useState(null);
  const [ranking, setRanking] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState(null);
  const [quizIniciado, setQuizIniciado] = useState(false);

  // Estados adicionales para robustez
  const [quizStatus, setQuizStatus] = useState(null);
  const [userPermissions, setUserPermissions] = useState(null);
  const [resultadoDetallado, setResultadoDetallado] = useState(null);

  // ✅ Verificar configuración previa del estudiante
  const verificarConfiguracionEstudiante = async () => {
    try {
      console.log("🔍 Verificando configuración del estudiante...");

      // 1. Validar token JWT
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error(
          "No hay token de autenticación. Por favor inicia sesión.",
        );
      }

      // 2. Validar que el ID sea numérico
      const quizIdNumerico = parseInt(quizId);
      if (isNaN(quizIdNumerico) || quizIdNumerico <= 0) {
        throw new Error(
          "ID de quiz inválido. Debe ser un número entero positivo.",
        );
      }

      // 3. Verificar que el usuario esté autenticado
      const usuario = localStorage.getItem("usuario");
      if (!usuario || usuario === "undefined" || usuario === "null") {
        throw new Error(
          "Usuario no autenticado. Por favor inicia sesión nuevamente.",
        );
      }

      const usuarioData = JSON.parse(usuario);
      console.log("👤 Estudiante autenticado:", usuarioData.nombre);

      // 4. Verificar permisos (solo estudiantes pueden responder quizzes)
      if (usuarioData.rol !== "estudiante") {
        throw new Error(
          "Solo los estudiantes pueden responder quizzes. Acceso denegado.",
        );
      }

      console.log("✅ Configuración del estudiante verificada exitosamente");
      return {
        token,
        quizId: quizIdNumerico,
        usuario: usuarioData,
      };
    } catch (error) {
      console.error("❌ Error en verificación del estudiante:", error.message);
      throw error;
    }
  };

  // ✅ Obtener el quiz con validación completa
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        // 1. Verificar configuración previa
        const config = await verificarConfiguracionEstudiante();

        // 2. Iniciar estado de carga
        setLoading(true);
        setError("");
        setQuizStatus("loading");

        console.log("🎯 Cargando quiz:", config.quizId);

        // 3. Realizar petición con configuración correcta
        const quizResponse = await getQuiz(config.quizId);

        // 4. ✅ Verificar respuesta exitosa
        if (!quizResponse || !quizResponse.success) {
          throw new Error("La respuesta del backend no indica éxito");
        }

        // 5. ✅ Validar estructura de data.quiz
        if (!quizResponse.data || !quizResponse.data.quiz) {
          throw new Error("Estructura de respuesta inválida: falta data.quiz");
        }

        const quizData = quizResponse.data.quiz;

        // 6. ✅ Validar datos mínimos del quiz
        const camposRequeridos = [
          "id",
          "titulo",
          "descripcion",
          "duracion",
          "preguntas",
        ];
        const camposFaltantes = camposRequeridos.filter(
          (campo) => !quizData[campo],
        );

        if (camposFaltantes.length > 0) {
          throw new Error(
            `Datos del quiz incompletos. Faltan: ${camposFaltantes.join(", ")}`,
          );
        }

        // 7. ✅ Verificar que el quiz esté publicado
        if (!quizData.publicado) {
          setQuizStatus("draft");
          throw new Error(
            "Este quiz no está disponible aún. Contacta a tu profesor.",
          );
        }

        // 8. ✅ Verificar que tenga preguntas
        if (!quizData.preguntas || quizData.preguntas.length === 0) {
          throw new Error("Este quiz no tiene preguntas disponibles.");
        }

        // 9. ✅ Guardar datos en estado
        setQuiz(quizData);
        setUserPermissions(config.usuario);
        setQuizStatus("published");
        setRespuestas(Array(quizData.preguntas.length).fill(""));
        setTiempoRestante(quizData.duracion * 60); // Convertir a segundos

        console.log("✅ Quiz cargado exitosamente:", {
          id: quizData.id,
          titulo: quizData.titulo,
          preguntas: quizData.preguntas.length,
          duracion: quizData.duracion,
          publicado: quizData.publicado,
        });
      } catch (err) {
        console.error("❌ Error cargando quiz:", err);

        // ✅ Manejar errores apropiadamente
        let mensajeError =
          "No hay actividad disponible en este momento o el quiz no existe.";

        if (err.message.includes("token")) {
          mensajeError =
            "Error de autenticación. Por favor inicia sesión nuevamente.";
          localStorage.removeItem("token");
          localStorage.removeItem("usuario");
          navigate("/login");
        } else if (err.message.includes("permisos")) {
          mensajeError = "No tienes permisos para acceder a esta función.";
        } else if (err.message.includes("inválido")) {
          mensajeError = "ID de quiz inválido. Verifica la URL.";
        } else if (err.message.includes("no está disponible")) {
          mensajeError =
            "Este quiz no está disponible aún. Contacta a tu profesor.";
        } else if (err.message.includes("preguntas")) {
          mensajeError = "Este quiz no tiene preguntas disponibles.";
        } else {
          mensajeError = err.message || mensajeError;
        }

        setError(mensajeError);
        setQuizStatus("error");
      } finally {
        setLoading(false);
      }
    };

    if (quizId) {
      fetchQuiz();
    }
  }, [quizId, navigate]);

  // Temporizador del quiz
  useEffect(() => {
    if (!quizIniciado || tiempoRestante === null || tiempoRestante <= 0) return;

    const timer = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev <= 1) {
          // Tiempo agotado, enviar automáticamente
          handleSubmit(new Event("submit"));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizIniciado, tiempoRestante]);

  // Formatear tiempo
  const formatearTiempo = (segundos) => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Manejar cambio de respuesta
  const handleChange = (index, value) => {
    const nuevasRespuestas = [...respuestas];
    nuevasRespuestas[index] = value;
    setRespuestas(nuevasRespuestas);
  };

  // Iniciar quiz
  const iniciarQuiz = () => {
    setQuizIniciado(true);
  };

  // ✅ Enviar respuestas con validación completa
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    try {
      // 1. Verificar configuración previa
      const config = await verificarConfiguracionEstudiante();

      // 2. Validar que haya quiz y preguntas
      if (!quiz || !quiz.preguntas) {
        throw new Error("No hay preguntas para responder");
      }

      // 3. Validar que todas las preguntas estén respondidas
      const preguntasSinResponder = respuestas.filter(
        (r) => !r || r.trim() === "",
      );
      if (preguntasSinResponder.length > 0) {
        throw new Error(
          `Por favor responde todas las preguntas antes de enviar. Faltan ${preguntasSinResponder.length} preguntas.`,
        );
      }

      // 4. Iniciar estado de carga
      setLoading(true);
      setError("");
      setQuizStatus("submitting");

      console.log("📤 Enviando respuestas del quiz:", {
        quizId: config.quizId,
        respuestasCount: respuestas.length,
        usuario: config.usuario.nombre,
      });

      // 5. Preparar respuestas en el formato esperado
      const respuestasFormateadas = respuestas.map((respuesta, index) => ({
        pregunta_id: quiz.preguntas[index].id,
        respuesta: respuesta.trim(),
      }));

      // 6. Validar formato de respuestas
      const respuestasValidas = respuestasFormateadas.every(
        (r) => r && r.pregunta_id && r.respuesta && r.respuesta.trim() !== "",
      );

      if (!respuestasValidas) {
        throw new Error(
          "Formato de respuestas inválido. Verifica tus respuestas.",
        );
      }

      // 7. ✅ Realizar petición con configuración correcta
      const resultado = await submitQuiz(config.quizId, respuestasFormateadas);

      // 8. ✅ Verificar respuesta exitosa
      if (!resultado || !resultado.success) {
        throw new Error("La respuesta del backend no indica éxito");
      }

      // 9. ✅ Validar estructura de data.resultado
      if (!resultado.data || !resultado.data.resultado) {
        throw new Error(
          "Estructura de respuesta inválida: falta data.resultado",
        );
      }

      // 10. ✅ Guardar resultados
      setPuntaje(resultado.data.puntaje || 0);
      setResultadoDetallado(resultado.data);
      setEnviado(true);
      setQuizStatus("completed");

      // 11. Cargar ranking
      try {
        console.log("🏆 Cargando ranking del quiz...");
        const rankingData = await getRanking(config.quizId);
        setRanking(rankingData || []);
        console.log(
          "✅ Ranking cargado:",
          rankingData?.length || 0,
          "posiciones",
        );
      } catch (rankingError) {
        console.warn("⚠️ No se pudo cargar el ranking:", rankingError);
        // No es crítico, continuamos sin ranking
      }

      console.log("🎉 Quiz enviado exitosamente:", {
        puntaje: resultado.data.puntaje,
        porcentaje: resultado.data.porcentaje,
        correctas: resultado.data.correctas,
        incorrectas: resultado.data.incorrectas,
        tiempo: resultado.data.tiempo,
      });
    } catch (err) {
      console.error("❌ Error enviando quiz:", err);

      // ✅ Manejar errores apropiadamente
      let mensajeError =
        "Error al enviar las respuestas. Por favor intenta nuevamente.";

      if (err.message.includes("token")) {
        mensajeError =
          "Error de autenticación. Por favor inicia sesión nuevamente.";
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        navigate("/login");
      } else if (err.message.includes("permisos")) {
        mensajeError = "No tienes permisos para responder este quiz.";
      } else if (err.message.includes("inválido")) {
        mensajeError = "ID de quiz inválido. Verifica la URL.";
      } else if (err.message.includes("no encontrado")) {
        mensajeError = "Quiz no encontrado. Verifica el ID.";
      } else if (err.message.includes("completadas")) {
        mensajeError = "Debes responder todas las preguntas antes de enviar.";
      } else if (err.message.includes("formato")) {
        mensajeError =
          "Formato de respuestas inválido. Verifica tus respuestas.";
      } else if (err.message.includes("estructura")) {
        mensajeError = "Error en la respuesta del servidor. Intente más tarde.";
      } else if (err.message.includes("ya respondido")) {
        mensajeError =
          "Ya has respondido este quiz. No puedes responderlo nuevamente.";
      } else {
        mensajeError = err.message || mensajeError;
      }

      setError(mensajeError);
      setQuizStatus("error");
    } finally {
      setLoading(false);
    }
  };

  // Reiniciar quiz
  const reiniciarQuiz = () => {
    setQuiz(null);
    setRespuestas([]);
    setEnviado(false);
    setPuntaje(null);
    setRanking([]);
    setTiempoRestante(null);
    setQuizIniciado(false);
    setError("");
  };

  // ✅ Estado del Quiz - Información al Estudiante
  const renderEstadoQuiz = () => {
    if (!quizStatus) return null;

    return (
      <div
        className={`mb-6 p-4 rounded-xl border-2 backdrop-blur-lg ${
          quizStatus === "loading"
            ? "bg-blue-100/50 border-blue-300/50"
            : quizStatus === "published"
              ? "bg-green-100/50 border-green-300/50"
              : quizStatus === "submitting"
                ? "bg-yellow-100/50 border-yellow-300/50"
                : quizStatus === "completed"
                  ? "bg-purple-100/50 border-purple-300/50"
                  : "bg-red-100/50 border-red-300/50"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${
              quizStatus === "loading"
                ? "bg-blue-500"
                : quizStatus === "published"
                  ? "bg-green-500"
                  : quizStatus === "submitting"
                    ? "bg-yellow-500"
                    : quizStatus === "completed"
                      ? "bg-purple-500"
                      : "bg-red-500"
            }`}
          >
            {quizStatus === "loading" && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {quizStatus === "published" && (
              <CheckCircle className="w-4 h-4 text-white" />
            )}
            {quizStatus === "submitting" && (
              <Clock className="w-4 h-4 text-white" />
            )}
            {quizStatus === "completed" && (
              <Trophy className="w-4 h-4 text-white" />
            )}
            {quizStatus === "error" && (
              <AlertCircle className="w-4 h-4 text-white" />
            )}
          </div>
          <div className="flex-1">
            <h3
              className={`text-sm font-bold ${
                quizStatus === "loading"
                  ? "text-blue-700"
                  : quizStatus === "published"
                    ? "text-green-700"
                    : quizStatus === "submitting"
                      ? "text-yellow-700"
                      : quizStatus === "completed"
                        ? "text-purple-700"
                        : "text-red-700"
              }`}
            >
              {quizStatus === "loading" && "🔄 Cargando Quiz"}
              {quizStatus === "published" && "✅ Quiz Disponible"}
              {quizStatus === "submitting" && "📤 Enviando Respuestas"}
              {quizStatus === "completed" && "🎉 Quiz Completado"}
              {quizStatus === "error" && "❌ Error en el Quiz"}
            </h3>
            <p className="text-gray-600 text-xs">
              {quizStatus === "loading" && "Obteniendo información del quiz..."}
              {quizStatus === "published" &&
                "El quiz está listo para que lo respondas."}
              {quizStatus === "submitting" &&
                "Enviando tus respuestas al servidor..."}
              {quizStatus === "completed" &&
                "¡Felicidades! Has completado el quiz."}
              {quizStatus === "error" &&
                "Ocurrió un error. Verifica los detalles."}
            </p>
          </div>
        </div>

        {/* ✅ Información adicional según estado */}
        {quizStatus === "published" && quiz && (
          <div className="mt-3 grid grid-cols-3 gap-3">
            <div className="text-center p-2 bg-white/50 rounded-lg">
              <p className="text-xs text-gray-600">Preguntas</p>
              <p className="text-sm font-bold text-gray-800">
                {quiz.preguntas?.length || 0}
              </p>
            </div>
            <div className="text-center p-2 bg-white/50 rounded-lg">
              <p className="text-xs text-gray-600">Duración</p>
              <p className="text-sm font-bold text-gray-800">
                {quiz.duracion} min
              </p>
            </div>
            <div className="text-center p-2 bg-white/50 rounded-lg">
              <p className="text-xs text-gray-600">Estado</p>
              <p className="text-sm font-bold text-green-600">Activo</p>
            </div>
          </div>
        )}

        {quizStatus === "completed" && resultadoDetallado && (
          <div className="mt-3 grid grid-cols-3 gap-3">
            <div className="text-center p-2 bg-white/50 rounded-lg">
              <p className="text-xs text-gray-600">Puntaje</p>
              <p className="text-sm font-bold text-gray-800">
                {resultadoDetallado.puntaje}
              </p>
            </div>
            <div className="text-center p-2 bg-white/50 rounded-lg">
              <p className="text-xs text-gray-600">Porcentaje</p>
              <p className="text-sm font-bold text-gray-800">
                {resultadoDetallado.porcentaje}%
              </p>
            </div>
            <div className="text-center p-2 bg-white/50 rounded-lg">
              <p className="text-xs text-gray-600">Tiempo</p>
              <p className="text-sm font-bold text-gray-800">
                {resultadoDetallado.tiempo}
              </p>
            </div>
          </div>
        )}

        {quizStatus === "error" && (
          <div className="mt-3">
            <p className="text-red-600 text-xs">
              🔍 Verifica: URL del quiz, conexión a internet, permisos de
              acceso.
            </p>
          </div>
        )}
      </div>
    );
  };

  // Pantalla de carga - Dinámica y Llamativa
  if (loading && !quiz) {
    return (
      <div className="min-h-screen p-6 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
        {/* Background animado */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/20 to-pink-900/20">
          <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        </div>

        <div className="relative z-10 flex items-center justify-center">
          <div className="text-center">
            {/* Logo animado */}
            <div className="relative mb-8">
              <div className="absolute inset-0 flex justify-center items-center">
                <div className="w-32 h-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-ping opacity-75"></div>
              </div>
              <div className="relative w-32 h-32 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/50">
                <Brain className="w-16 h-16 text-white animate-pulse" />
              </div>
            </div>

            {/* Título dinámico */}
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 drop-shadow-lg mb-4 animate-bounce">
              QUIZ BATTLE
            </h1>

            {/* Subtítulo */}
            <p className="text-xl text-gray-300 mb-8">
              Preparando tu arena de batalla...
            </p>

            {/* Indicadores de progreso */}
            <div className="flex justify-center items-center gap-8 mb-8">
              <div className="text-center">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mb-2">
                    <Rocket className="w-8 h-8 text-white animate-bounce" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full animate-ping"></div>
                </div>
                <p className="text-sm text-gray-400">Cargando</p>
              </div>

              <div className="text-center">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mb-2">
                    <Zap className="w-8 h-8 text-white animate-pulse" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-500 rounded-full animate-ping"></div>
                </div>
                <p className="text-sm text-gray-400">Energizando</p>
              </div>

              <div className="text-center">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-2">
                    <Flame className="w-8 h-8 text-white animate-pulse" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full animate-ping"></div>
                </div>
                <p className="text-sm text-gray-400">Listo</p>
              </div>
            </div>

            {/* Barra de progreso animada */}
            <div className="w-64 mx-auto mb-8">
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full animate-pulse"
                  style={{ width: "70%" }}
                ></div>
              </div>
            </div>

            {/* Mensaje dinámico */}
            <div className="relative">
              <div className="absolute inset-0 flex justify-center items-center">
                <div className="text-6xl animate-spin opacity-20">⚡</div>
              </div>
              <p className="text-lg text-gray-300 font-semibold">
                Sincronizando con el servidor...
              </p>
            </div>

            {/* Partículas decorativas */}
            <div className="absolute top-10 left-10 text-4xl animate-bounce animation-delay-1000">
              ✨
            </div>
            <div className="absolute top-20 right-20 text-3xl animate-pulse animation-delay-500">
              🌟
            </div>
            <div className="absolute bottom-20 left-20 text-3xl animate-bounce animation-delay-1500">
              💫
            </div>
            <div className="absolute bottom-10 right-10 text-4xl animate-pulse animation-delay-2000">
              ⚡
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pantalla de error
  if (error && !quiz) {
    return (
      <div className="min-h-screen p-6 bg-gradient-to-br from-red-900 to-orange-900 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-red-200 max-w-md">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-600" />
            <h2 className="text-xl font-bold text-red-800 mb-2">Error</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Pantalla de bienvenida - Dinámica y Llamativa
  if (quiz && !quizIniciado) {
    return (
      <div className="min-h-screen p-6 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
        {/* Background animado */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/20 to-pink-900/20">
          <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        </div>

        <div className="relative z-10 flex items-center justify-center">
          <div className="bg-gradient-to-br from-purple-800/80 to-indigo-800/80 backdrop-blur-lg rounded-3xl p-8 max-w-4xl w-full mx-4 border-2 border-purple-500/50 shadow-2xl shadow-purple-500/25">
            {/* ✅ Estado del Quiz */}
            {renderEstadoQuiz()}

            {/* Header dinámico */}
            <div className="text-center mb-8">
              <div className="flex justify-center items-center gap-4 mb-6">
                <div className="relative">
                  <Dragon className="w-16 h-16 text-yellow-400 animate-bounce" />
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
                </div>
                <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 drop-shadow-lg animate-pulse">
                  QUIZ ARENA
                </h1>
                <div className="relative">
                  <Swords className="w-16 h-16 text-yellow-400 animate-pulse" />
                  <div className="absolute -top-2 -left-2 w-4 h-4 bg-orange-500 rounded-full animate-ping"></div>
                </div>
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex justify-center items-center">
                  <div className="text-6xl animate-spin opacity-20">⚡</div>
                </div>
                <Brain className="w-24 h-24 mx-auto mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse" />
              </div>

              <h2 className="text-3xl font-bold text-white mb-3 animate-bounce">
                {quiz.titulo}
              </h2>

              <p className="text-xl text-gray-300 mb-8">{quiz.descripcion}</p>
            </div>

            {/* Stats del quiz */}
            <div className="grid gap-6 md:grid-cols-3 mb-8">
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative p-6 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl hover:from-blue-700 hover:to-cyan-700 transition-all transform hover:scale-105 shadow-xl shadow-blue-500/25">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="p-3 bg-white/20 rounded-xl">
                      <Target className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-2xl font-bold">
                        {quiz.numeroPreguntas || quiz.preguntas?.length || 0}
                      </h3>
                      <p className="text-sm text-blue-100">Preguntas</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative p-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-xl shadow-purple-500/25">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="p-3 bg-white/20 rounded-xl">
                      <Timer className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-2xl font-bold">{quiz.duracion}</h3>
                      <p className="text-sm text-purple-100">Minutos</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative p-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-xl shadow-green-500/25">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="p-3 bg-white/20 rounded-xl">
                      <Trophy className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-2xl font-bold capitalize">
                        {quiz.dificultad || "Media"}
                      </h3>
                      <p className="text-sm text-green-100">Dificultad</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Barra de poder */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>⚡ Poder del Quiz</span>
                <span>85%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-4">
                <div
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 h-4 rounded-full animate-pulse shadow-lg shadow-yellow-500/50"
                  style={{ width: "85%" }}
                ></div>
              </div>
            </div>

            {/* Botón de inicio dinámico */}
            <div className="text-center">
              <button
                onClick={iniciarQuiz}
                className="group relative px-12 py-6 text-xl font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 flex items-center space-x-4 mx-auto shadow-2xl shadow-green-500/25"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative flex items-center space-x-4">
                  <Rocket className="w-8 h-8 animate-bounce" />
                  <span>INICIAR BATALLA</span>
                  <Zap className="w-8 h-8 animate-pulse" />
                </div>
              </button>

              <p className="text-gray-400 mt-4 text-sm">
                ⚡ Prepárate para la batalla de conocimientos
              </p>
            </div>

            {/* Partículas decorativas */}
            <div className="absolute top-10 left-10 text-4xl animate-bounce animation-delay-1000">
              ✨
            </div>
            <div className="absolute top-20 right-20 text-3xl animate-pulse animation-delay-500">
              🌟
            </div>
            <div className="absolute bottom-20 left-20 text-3xl animate-bounce animation-delay-1500">
              💫
            </div>
            <div className="absolute bottom-10 right-10 text-4xl animate-pulse animation-delay-2000">
              ⚡
            </div>
            <div className="absolute top-1/2 left-20 text-2xl animate-spin animation-delay-3000">
              🔥
            </div>
            <div className="absolute top-1/3 right-20 text-2xl animate-bounce animation-delay-2500">
              💎
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pantalla del quiz activo - Dinámica y Llamativa
  if (quiz && quizIniciado && !enviado) {
    return (
      <div className="min-h-screen p-6 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
        {/* Background animado */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/20 to-pink-900/20">
          <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          {/* ✅ Estado del Quiz */}
          {renderEstadoQuiz()}

          {/* Header con temporizador dinámico */}
          <div className="bg-gradient-to-br from-purple-800/80 to-indigo-800/80 backdrop-blur-lg rounded-2xl p-6 mb-8 border-2 border-purple-500/50 shadow-2xl shadow-purple-500/25">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center animate-pulse">
                    <Clock className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    ⚡ BATALLA EN CURSO
                  </h2>
                  <p className="text-gray-300">{quiz.titulo}</p>
                </div>
              </div>

              <div className="text-center">
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center mb-2 ${
                    tiempoRestante <= 60
                      ? "bg-gradient-to-r from-red-500 to-orange-500 animate-pulse"
                      : tiempoRestante <= 180
                        ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                        : "bg-gradient-to-r from-green-500 to-emerald-500"
                  }`}
                >
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">
                      {formatearTiempo(tiempoRestante)}
                    </p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm">Tiempo restante</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-gray-400">Pregunta</p>
                  <p className="text-2xl font-bold text-white">
                    {respuestas.findIndex((r) => r !== "") + 1} /{" "}
                    {quiz.preguntas.length}
                  </p>
                </div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Brain className="w-8 h-8 text-white animate-pulse" />
                  </div>
                </div>
              </div>
            </div>

            {/* Barra de progreso */}
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>🎯 Progreso de la batalla</span>
                <span>
                  {Math.round(
                    ((respuestas.findIndex((r) => r !== "") + 1) /
                      quiz.preguntas.length) *
                      100,
                  )}
                  %
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500 shadow-lg shadow-purple-500/50"
                  style={{
                    width: `${((respuestas.findIndex((r) => r !== "") + 1) / quiz.preguntas.length) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Formulario del quiz */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {quiz.preguntas?.map((pregunta, index) => (
              <div
                key={pregunta.id || index}
                className={`group relative bg-gradient-to-br from-purple-800/60 to-indigo-800/60 backdrop-blur-lg rounded-2xl border-2 border-purple-500/50 hover:border-purple-400 hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 transform hover:scale-105 ${
                  respuestas[index] ? "ring-2 ring-green-500/50" : ""
                }`}
              >
                {/* Efecto de brillo */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative p-6">
                  {/* Header de la pregunta */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                          respuestas[index]
                            ? "bg-gradient-to-r from-green-500 to-emerald-500"
                            : "bg-gradient-to-r from-purple-500 to-pink-500"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          Pregunta {index + 1}
                        </h3>
                        <p className="text-sm text-gray-300">
                          Selecciona tu respuesta
                        </p>
                      </div>
                    </div>
                    {respuestas[index] && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-6 h-6 text-green-400" />
                        <span className="text-green-400 text-sm font-semibold">
                          Respondida
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Texto de la pregunta */}
                  <div className="mb-6 p-4 bg-white/10 rounded-xl border border-purple-500/30">
                    <p className="text-lg text-white font-medium">
                      {pregunta.texto}
                    </p>
                  </div>

                  {/* Opciones */}
                  <div className="space-y-3">
                    {pregunta.opciones?.map((opcion, opcionIndex) => (
                      <label
                        key={opcionIndex}
                        className={`group flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                          respuestas[index] === opcion
                            ? "border-green-500 bg-green-500/20 hover:bg-green-500/30"
                            : "border-purple-500/50 bg-purple-500/10 hover:border-purple-400 hover:bg-purple-500/20"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`pregunta-${index}`}
                          value={opcion}
                          checked={respuestas[index] === opcion}
                          onChange={(e) => handleChange(index, e.target.value)}
                          className="sr-only"
                        />
                        <div
                          className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition-all ${
                            respuestas[index] === opcion
                              ? "border-green-500 bg-green-500"
                              : "border-purple-400 bg-purple-400/50"
                          }`}
                        >
                          {respuestas[index] === opcion && (
                            <div className="w-3 h-3 bg-white rounded-full"></div>
                          )}
                        </div>
                        <span
                          className={`text-lg font-medium ${
                            respuestas[index] === opcion
                              ? "text-green-400"
                              : "text-gray-300"
                          }`}
                        >
                          {opcion}
                        </span>
                        {respuestas[index] === opcion && (
                          <CheckCircle className="w-5 h-5 text-green-400 ml-auto animate-bounce" />
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {/* Botón de envío dinámico */}
            <div className="text-center">
              <button
                type="submit"
                disabled={
                  loading || respuestas.some((r) => !r || r.trim() === "")
                }
                className="group relative px-12 py-6 text-xl font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl hover:from-green-600 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 transition-all transform hover:scale-105 flex items-center space-x-4 mx-auto shadow-2xl shadow-green-500/25"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative flex items-center space-x-4">
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      <span>ENVIANDO...</span>
                    </>
                  ) : (
                    <>
                      <Rocket className="w-8 h-8 animate-bounce" />
                      <span>ENVIAR RESPUESTAS</span>
                      <Zap className="w-8 h-8 animate-pulse" />
                    </>
                  )}
                </div>
              </button>

              {respuestas.some((r) => !r || r.trim() === "") && (
                <p className="text-yellow-400 mt-4 text-sm animate-pulse">
                  ⚡ Debes responder todas las preguntas antes de enviar
                </p>
              )}
            </div>
          </form>

          {/* Partículas decorativas */}
          <div className="absolute top-10 left-10 text-4xl animate-bounce animation-delay-1000">
            ✨
          </div>
          <div className="absolute top-20 right-20 text-3xl animate-pulse animation-delay-500">
            🌟
          </div>
          <div className="absolute bottom-20 left-20 text-3xl animate-bounce animation-delay-1500">
            💫
          </div>
          <div className="absolute bottom-10 right-10 text-4xl animate-pulse animation-delay-2000">
            ⚡
          </div>
        </div>
      </div>
    );
  }

  // Pantalla de resultados - Dinámica y Llamativa
  if (enviado) {
    return (
      <div className="min-h-screen p-6 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
        {/* Background animado */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/20 to-pink-900/20">
          <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          {/* ✅ Estado del Quiz */}
          {renderEstadoQuiz()}

          {/* Header de resultados */}
          <div className="bg-gradient-to-br from-purple-800/80 to-indigo-800/80 backdrop-blur-lg rounded-3xl p-8 mb-8 border-2 border-purple-500/50 shadow-2xl shadow-purple-500/25">
            <div className="text-center mb-8">
              <div className="flex justify-center items-center gap-4 mb-6">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
                    <Trophy className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-500 rounded-full animate-ping"></div>
                </div>
                <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 drop-shadow-lg animate-bounce">
                  BATALLA COMPLETADA
                </h1>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
                    <Crown className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -left-2 w-4 h-4 bg-orange-500 rounded-full animate-ping"></div>
                </div>
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex justify-center items-center">
                  <div className="text-6xl animate-spin opacity-20">🎉</div>
                </div>
                <p className="text-2xl text-white mb-4">
                  ¡Felicidades! Has completado la batalla
                </p>
                <p className="text-xl text-gray-300">{quiz.titulo}</p>
              </div>
            </div>

            {/* Resultados principales */}
            <div className="grid gap-6 md:grid-cols-3 mb-8">
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative p-6 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-2xl hover:from-yellow-600 hover:to-orange-600 transition-all transform hover:scale-105 shadow-xl shadow-yellow-500/25">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="p-3 bg-white/20 rounded-xl">
                      <Trophy className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-3xl font-bold">{puntaje}</h3>
                      <p className="text-sm text-yellow-100">Puntaje Final</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative p-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl hover:from-green-600 hover:to-emerald-600 transition-all transform hover:scale-105 shadow-xl shadow-green-500/25">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="p-3 bg-white/20 rounded-xl">
                      <Target className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-3xl font-bold">
                        {resultadoDetallado?.porcentaje || 0}%
                      </h3>
                      <p className="text-sm text-green-100">Porcentaje</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative p-6 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl hover:from-blue-600 hover:to-cyan-600 transition-all transform hover:scale-105 shadow-xl shadow-blue-500/25">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="p-3 bg-white/20 rounded-xl">
                      <Clock className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-3xl font-bold">
                        {resultadoDetallado?.tiempo || "00:00"}
                      </h3>
                      <p className="text-sm text-blue-100">Tiempo</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Estrellas de calificación */}
            <div className="text-center mb-8">
              <div className="flex justify-center items-center gap-2 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-12 h-12 ${
                      i <
                      (resultadoDetallado?.porcentaje >= 80
                        ? 5
                        : resultadoDetallado?.porcentaje >= 60
                          ? 4
                          : resultadoDetallado?.porcentaje >= 40
                            ? 3
                            : resultadoDetallado?.porcentaje >= 20
                              ? 2
                              : 1)
                        ? "text-yellow-400 fill-current animate-pulse"
                        : "text-gray-600"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xl text-white font-semibold">
                Calificación:{" "}
                {resultadoDetallado?.porcentaje >= 80
                  ? "Excelente"
                  : resultadoDetallado?.porcentaje >= 60
                    ? "Bueno"
                    : resultadoDetallado?.porcentaje >= 40
                      ? "Regular"
                      : "Necesita mejorar"}
              </p>
            </div>

            {/* Ranking */}
            {ranking.length > 0 && (
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-6 text-center">
                  🏆 Ranking de la Batalla
                </h3>
                <div className="space-y-3">
                  {ranking.slice(0, 5).map((participante, index) => (
                    <div
                      key={participante.id}
                      className="flex items-center justify-between p-4 bg-white/10 rounded-xl border border-purple-500/30"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                            index === 0
                              ? "bg-gradient-to-r from-yellow-500 to-yellow-600"
                              : index === 1
                                ? "bg-gradient-to-r from-gray-400 to-gray-500"
                                : index === 2
                                  ? "bg-gradient-to-r from-orange-600 to-orange-700"
                                  : "bg-gradient-to-r from-blue-500 to-blue-600"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-white">
                            {participante.nombre}
                          </p>
                          <p className="text-sm text-gray-400">
                            Tiempo: {participante.tiempo}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-400">
                          {participante.puntaje} pts
                        </p>
                        <p className="text-sm text-gray-400">
                          {participante.porcentaje}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex justify-center gap-6">
              <button
                onClick={reiniciarQuiz}
                className="px-8 py-4 text-indigo-600 border-2 border-indigo-200 rounded-xl hover:bg-indigo-50 transition-colors flex items-center space-x-2"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Reiniciar Quiz</span>
              </button>
              <button
                onClick={() => window.history.back()}
                className="px-8 py-4 text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors flex items-center space-x-2"
              >
                <ArrowRight className="w-5 h-5" />
                <span>Continuar</span>
              </button>
            </div>
          </div>

          {/* Partículas decorativas */}
          <div className="absolute top-10 left-10 text-4xl animate-bounce animation-delay-1000">
            🎉
          </div>
          <div className="absolute top-20 right-20 text-3xl animate-pulse animation-delay-500">
            🏆
          </div>
          <div className="absolute bottom-20 left-20 text-3xl animate-bounce animation-delay-1500">
            🌟
          </div>
          <div className="absolute bottom-10 right-10 text-4xl animate-pulse animation-delay-2000">
            ⚡
          </div>
        </div>
      </div>
    );
  }

  return null;
}
