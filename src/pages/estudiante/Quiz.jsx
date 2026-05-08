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
      if (!usuario) {
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

  // Pantalla de carga
  if (loading && !quiz) {
    return (
      <div className="min-h-screen p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Cargando Quiz
          </h2>
          <p className="text-gray-600">Preparando tu actividad...</p>
        </div>
      </div>
    );
  }

  // Pantalla de error
  if (error && !quiz) {
    return (
      <div className="min-h-screen p-6 bg-red-50 flex items-center justify-center">
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

  // Pantalla de bienvenida antes de iniciar
  if (quiz && !quizIniciado) {
    return (
      <div className="min-h-screen p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full mx-4">
          {/* ✅ Estado del Quiz */}
          {renderEstadoQuiz()}

          <div className="text-center mb-6">
            <Brain className="w-20 h-20 mx-auto mb-4 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {quiz.titulo}
            </h1>
            <p className="text-gray-600">{quiz.descripcion}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg text-center">
              <Target className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <p className="text-sm font-semibold text-gray-700">Preguntas</p>
              <p className="text-2xl font-bold text-blue-600">
                {quiz.numeroPreguntas || quiz.preguntas?.length || 0}
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg text-center">
              <Timer className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <p className="text-sm font-semibold text-gray-700">Duración</p>
              <p className="text-2xl font-bold text-purple-600">
                {quiz.duracion} min
              </p>
            </div>
            <div className="p-4 bg-indigo-50 rounded-lg text-center">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-indigo-600" />
              <p className="text-sm font-semibold text-gray-700">Dificultad</p>
              <p className="text-2xl font-bold text-indigo-600 capitalize">
                {quiz.dificultad || "Media"}
              </p>
            </div>
          </div>

          {quiz.instrucciones && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">
                Instrucciones
              </h3>
              <p className="text-gray-700">{quiz.instrucciones}</p>
            </div>
          )}

          <button
            onClick={iniciarQuiz}
            className="w-full px-6 py-4 text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2 text-lg font-semibold"
          >
            <Play className="w-6 h-6" />
            <span>Iniciar Quiz</span>
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    );
  }

  // Pantalla del quiz
  if (quiz && quizIniciado && !enviado) {
    return (
      <div className="min-h-screen p-6 bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-4xl mx-auto">
          {/* Header con temporizador */}
          <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {quiz.titulo}
                </h1>
                <p className="text-gray-600">
                  Pregunta {respuestas.findIndex((r) => r) + 1} de{" "}
                  {quiz.preguntas?.length || 0}
                </p>
              </div>
              <div
                className={`text-center ${tiempoRestante < 60 ? "text-red-600" : "text-indigo-600"}`}
              >
                <Clock className="w-8 h-8 mx-auto mb-1" />
                <p className="text-2xl font-bold">
                  {formatearTiempo(tiempoRestante)}
                </p>
                <p className="text-sm">Tiempo restante</p>
              </div>
            </div>
          </div>

          {/* ✅ Estado del Quiz */}
          {renderEstadoQuiz()}

          {/* Formulario del quiz */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {quiz.preguntas?.map((pregunta, index) => (
              <div
                key={pregunta.id || index}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Pregunta {index + 1}
                  </h3>
                  <p className="text-gray-700">{pregunta.texto}</p>
                </div>

                <div className="space-y-3">
                  {pregunta.opciones?.map((opcion, opcionIndex) => (
                    <label
                      key={opcionIndex}
                      className="flex items-center p-3 border-2 border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer transition-all"
                    >
                      <input
                        type="radio"
                        name={`pregunta-${index}`}
                        value={opcion}
                        checked={respuestas[index] === opcion}
                        onChange={(e) => handleChange(index, e.target.value)}
                        className="mr-3 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-gray-700">{opcion}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            {/* Botón de envío */}
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-4 text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:bg-gray-400 transition-colors flex items-center space-x-2 text-lg font-semibold"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-6 h-6" />
                    <span>Enviar Respuestas</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Pantalla de resultados
  if (enviado) {
    const porcentaje = Math.round(
      (puntaje / (quiz.preguntas?.length || 1)) * 100,
    );
    const estrellas = Math.round(porcentaje / 20); // 0-5 estrellas

    return (
      <div className="min-h-screen p-6 bg-linear-to-br from-green-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl w-full mx-4">
          <div className="text-center mb-6">
            <Trophy className="w-20 h-20 mx-auto mb-4 text-yellow-500" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              ¡Quiz Completado!
            </h1>
            <p className="text-gray-600">Has completado el quiz exitosamente</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 mb-6">
            <div className="p-6 bg-green-50 rounded-lg text-center">
              <Target className="w-12 h-12 mx-auto mb-3 text-green-600" />
              <p className="text-sm font-semibold text-gray-700 mb-1">
                Tu Puntaje
              </p>
              <p className="text-4xl font-bold text-green-600">{puntaje}</p>
              <p className="text-gray-600">
                de {quiz.preguntas?.length || 0} puntos
              </p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                {porcentaje}%
              </p>
            </div>

            <div className="p-6 bg-indigo-50 rounded-lg text-center">
              <Star className="w-12 h-12 mx-auto mb-3 text-indigo-600" />
              <p className="text-sm font-semibold text-gray-700 mb-1">
                Calificación
              </p>
              <div className="flex justify-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-8 h-8 ${i < estrellas ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                  />
                ))}
              </div>
              <p className="text-lg font-semibold text-gray-700">
                {porcentaje >= 90
                  ? "Excelente"
                  : porcentaje >= 70
                    ? "Muy Bueno"
                    : porcentaje >= 50
                      ? "Bueno"
                      : porcentaje >= 30
                        ? "Regular"
                        : "Necesita Mejorar"}
              </p>
            </div>
          </div>

          {/* Ranking */}
          {ranking.length > 0 && (
            <div className="mb-6 p-6 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Ranking del Quiz
              </h3>
              <div className="space-y-2">
                {ranking.slice(0, 5).map((usuario, index) => (
                  <div
                    key={usuario.id || index}
                    className="flex items-center justify-between p-3 bg-white rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                          index === 0
                            ? "bg-yellow-500"
                            : index === 1
                              ? "bg-gray-400"
                              : index === 2
                                ? "bg-orange-600"
                                : "bg-indigo-600"
                        }`}
                      >
                        {index + 1}
                      </span>
                      <span className="font-semibold text-gray-800">
                        {usuario.nombre}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-indigo-600">
                        {usuario.puntaje} pts
                      </p>
                      <p className="text-sm text-gray-600">
                        {usuario.porcentaje}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-center gap-4">
            <button
              onClick={reiniciarQuiz}
              className="px-6 py-3 text-indigo-600 border-2 border-indigo-200 rounded-xl hover:bg-indigo-50 transition-colors flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reiniciar Quiz</span>
            </button>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors flex items-center space-x-2"
            >
              <ArrowRight className="w-4 h-4" />
              <span>Continuar</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
