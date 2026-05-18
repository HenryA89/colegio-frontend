import React, { useState, useCallback } from "react";
import { Brain, BookOpen, Loader2, Trophy, CheckCircle } from "lucide-react";

import {
  getMateriasEstudiante,
  getMaterialesPorMateria,
  getQuizEstudiante,
  submitQuiz,
  getRanking,
} from "../../services/estudianteServices/quizService";

export default function QuizEstudiante() {
  // =========================
  // STATES
  // =========================
  const [materias, setMaterias] = useState([]);
  const [loadingMaterias, setLoadingMaterias] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [error, setError] = useState(null);
  const [pasoActual, setPasoActual] = useState(1); // Para seguimiento del flujo
  const [materialIdSeleccionado, setMaterialIdSeleccionado] = useState(null);
  const [materiaSeleccionada, setMateriaSeleccionada] = useState(null);
  const [resultados, setResultados] = useState(null);
  const [ranking, setRanking] = useState([]);
  const [respuestasActuales, setRespuestasActuales] = useState({});

  // ==========================================
  // PASO 1: OBTENER MATERIAS DEL ESTUDIANTE
  // ==========================================
  const handleObtenerMaterias = useCallback(async () => {
    try {
      setLoadingMaterias(true);
      setError(null);
      setPasoActual(1);

      console.log("🎓 PASO 1: OBTENIENDO MATERIAS DEL ESTUDIANTE...");

      const response = await getMateriasEstudiante();

      console.log("✅ RESPONSE MATERIAS:", response);

      if (!response?.success) {
        throw new Error(
          response?.message || "No se pudieron obtener las materias",
        );
      }

      setMaterias(response.data || []);
      console.log("✅ MATERIAS CARGADAS:", response.data?.length || 0);
    } catch (err) {
      console.error("❌ ERROR OBTENIENDO MATERIAS:", err);
      setError(err.message || "Error obteniendo materias del estudiante");
    } finally {
      setLoadingMaterias(false);
    }
  }, []);

  // ==========================================
  // PASO 2: SELECCIONAR MATERIA
  // ==========================================
  const handleSeleccionarMateria = useCallback(async (materia) => {
    try {
      setLoadingQuiz(true);
      setError(null);
      setPasoActual(2);

      console.log("📚 PASO 2: MATERIA SELECCIONADA:", materia);

      // PASO 3: Obtener material_id más reciente de la materia seleccionada
      console.log("🔍 PASO 3: OBTENIENDO MATERIAL_ID MÁS RECIENTE...");

      const materialesResponse = await getMaterialesPorMateria(
        materia.id || materia.materia_id,
      );

      if (!Array.isArray(materialesResponse?.data)) {
        throw new Error("No se encontraron materiales para esta materia");
      }

      const materiales = materialesResponse.data;
      console.log("📋 MATERIALES ENCONTRADOS:", materiales.length);

      // Encontrar el material más reciente
      const materialMasReciente = materiales.reduce((masReciente, material) => {
        if (!masReciente) return material;

        const fechaActual = new Date(
          material.created_at || material.fecha_creacion || 0,
        );
        const fechaMasReciente = new Date(
          masReciente.created_at || masReciente.fecha_creacion || 0,
        );

        return fechaActual > fechaMasReciente ? material : masReciente;
      }, null);

      if (!materialMasReciente || !materialMasReciente.id) {
        throw new Error("No hay materiales con ID válido en esta materia");
      }

      const materialId =
        materialMasReciente.id || materialMasReciente.material_id;
      console.log("🎯 MATERIAL_ID MÁS RECIENTE:", materialId);

      // Guardar material_id en estado
      setMaterialIdSeleccionado(materialId);
      setMateriaSeleccionada(materia);

      // PASO 4: Obtener quiz con el material_id guardado
      console.log("🎓 PASO 4: OBTENIENDO QUIZ...");

      const quizResponse = await getQuizEstudiante(materialId);

      if (quizResponse?.estado === "pendiente") {
        throw new Error(
          quizResponse.message || "El quiz aún se está generando",
        );
      }

      if (!quizResponse?.success) {
        throw new Error(quizResponse.message || "No se pudo obtener el quiz");
      }

      setQuiz(quizResponse.data);
      setPasoActual(4);

      console.log("✅ QUIZ CARGADO:", quizResponse.data);
    } catch (err) {
      console.error("❌ ERROR EN SELECCIÓN DE MATERIA:", err);
      setError(err.message || "Error seleccionando materia y obteniendo quiz");
    } finally {
      setLoadingQuiz(false);
    }
  }, []);

  // ==========================================
  // PASO 5: ENVIAR RESPUESTAS DEL QUIZ
  // ==========================================
  const handleEnviarRespuestas = useCallback(
    async (respuestas) => {
      try {
        setLoadingQuiz(true);
        setError(null);
        setPasoActual(5);

        console.log("📤 PASO 5: ENVIANDO RESPUESTAS DEL QUIZ...");

        const quizId = quiz?.id || materialIdSeleccionado;

        if (!quizId) {
          throw new Error(
            "No se encontró el ID del quiz para enviar respuestas",
          );
        }

        const response = await submitQuiz(quizId, respuestas);

        console.log("✅ RESPONSE ENVÍO:", response);

        if (!response?.success) {
          throw new Error(
            response?.message || "No se pudieron enviar las respuestas",
          );
        }

        setResultados(response.data);
        setPasoActual(6);

        // PASO 6: Obtener ranking top 3
        console.log("🏆 PASO 6: OBTENIENDO RANKING TOP 3...");

        const rankingResponse = await getRanking(quizId);

        if (rankingResponse?.success) {
          setRanking(rankingResponse.data?.slice(0, 3) || []); // Top 3
          console.log("✅ RANKING TOP 3:", rankingResponse.data?.slice(0, 3));
        }
      } catch (err) {
        console.error("❌ ERROR ENVIANDO RESPUESTAS:", err);
        setError(err.message || "Error enviando respuestas del quiz");
      } finally {
        setLoadingQuiz(false);
      }
    },
    [materialIdSeleccionado, quiz],
  );

  // ==========================================
  // MANEJAR RESPUESTA DE PREGUNTA
  // ==========================================
  const handleSeleccionarRespuesta = useCallback(
    (preguntaIndex, opcionIndex) => {
      setRespuestasActuales((prev) => ({
        ...prev,
        [preguntaIndex]: opcionIndex,
      }));
    },
    [],
  );

  // ==========================================
  // RENDERIZAR SEGÚN PASO ACTUAL
  // ==========================================
  if (pasoActual === 1 && materias.length === 0) {
    // PASO 1: Mostrar botón para obtener materias
    return (
      <div className="min-h-screen bg-slate-950 text-white p-6">
        <div className="max-w-6xl mx-auto">
          {/* HEADER */}
          <div className="mb-10">
            <div className="flex items-center gap-4">
              <div className="bg-cyan-500/10 p-4 rounded-2xl border border-cyan-500/20">
                <Brain className="w-10 h-10 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-5xl font-black">Quiz Estudiante</h1>
                <p className="text-slate-400 mt-2">
                  Sistema de evaluación inteligente
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

          {/* BOTÓN PRINCIPAL */}
          <div className="text-center py-20">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 max-w-2xl mx-auto">
              <Brain className="w-20 h-20 text-cyan-400 mx-auto mb-6" />
              <h2 className="text-3xl font-black mb-4">Comenzar Quiz</h2>
              <p className="text-slate-400 mb-8">
                Accede a tus materias y responde los quizzes disponibles
              </p>
              <button
                onClick={handleObtenerMaterias}
                disabled={loadingMaterias}
                className="bg-cyan-500 hover:bg-cyan-600 text-white px-8 py-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto font-semibold text-lg"
              >
                {loadingMaterias ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Cargando materias...
                  </>
                ) : (
                  <>
                    <BookOpen className="w-5 h-5" />
                    Ver Mis Materias
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (pasoActual === 1 && materias.length > 0) {
    // PASO 2: Mostrar listado de materias
    return (
      <div className="min-h-screen bg-slate-950 text-white p-6">
        <div className="max-w-6xl mx-auto">
          {/* HEADER */}
          <div className="mb-10">
            <div className="flex items-center gap-4">
              <div className="bg-cyan-500/10 p-4 rounded-2xl border border-cyan-500/20">
                <Brain className="w-10 h-10 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-5xl font-black">Mis Materias</h1>
                <p className="text-slate-400 mt-2">
                  Selecciona una materia para comenzar el quiz
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

          {/* LISTADO DE MATERIAS */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {materias.map((materia) => (
              <div
                key={materia.id || materia.materia_id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-cyan-500/50 hover:scale-[1.02] transition-all cursor-pointer"
                onClick={() => handleSeleccionarMateria(materia)}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-purple-500/10 p-3 rounded-xl border border-purple-500/20">
                    <BookOpen className="w-8 h-8 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">
                      {materia.nombre || materia.titulo || "Materia sin nombre"}
                    </h3>
                    <p className="text-slate-400 text-sm">
                      ID: {materia.id || materia.materia_id}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-slate-400">
                  {materia.descripcion && (
                    <p className="line-clamp-2">{materia.descripcion}</p>
                  )}
                  {materia.profesor && <p>Profesor: {materia.profesor}</p>}
                </div>

                <button className="w-full mt-4 bg-cyan-500 hover:bg-cyan-600 text-white py-2 rounded-xl transition-colors">
                  Seleccionar Materia
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (pasoActual === 4 && quiz) {
    // PASO 4-5: Mostrar quiz para responder
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
                <h1 className="text-5xl font-black">Quiz</h1>
                <p className="text-slate-400 mt-2">
                  {materiaSeleccionada?.nombre || materiaSeleccionada?.titulo}
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

          {/* QUIZ CONTENT */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
            <div className="mb-8">
              <h2 className="text-3xl font-black mb-4">{quiz.titulo}</h2>
              <div className="flex items-center gap-6 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>{quiz.materia.nombre}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>{quiz.preguntas?.length || 0} preguntas</span>
                </div>
              </div>
            </div>

            {/* PREGUNTAS */}
            <div className="space-y-8">
              {quiz.preguntas?.map((pregunta, index) => {
                const preguntaKey =
                  pregunta.id || pregunta.pregunta_id || index + 1;

                return (
                  <div
                    key={preguntaKey}
                    className="bg-slate-800 border border-slate-700 rounded-2xl p-6"
                  >
                    <h3 className="text-xl font-bold mb-6">
                      {index + 1}. {pregunta.pregunta}
                    </h3>

                    <div className="grid gap-4">
                      {pregunta.opciones?.map((opcion, opcionIndex) => (
                        <div
                          key={opcionIndex}
                          className={`p-4 rounded-xl border cursor-pointer transition-all ${
                            respuestasActuales[preguntaKey] === opcionIndex
                              ? "bg-cyan-500/10 border-cyan-500 text-cyan-300"
                              : "border-slate-600 hover:border-cyan-500/50 hover:bg-slate-700/50"
                          }`}
                          onClick={() =>
                            handleSeleccionarRespuesta(preguntaKey, opcionIndex)
                          }
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                respuestasActuales[preguntaKey] === opcionIndex
                                  ? "bg-cyan-500 text-white"
                                  : "bg-slate-700 border-2 border-slate-600"
                              }`}
                            >
                              {String.fromCharCode(65 + opcionIndex)}
                            </div>
                            <span>{opcion}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* BOTÓN ENVIAR */}
            <div className="mt-8 text-center">
              <button
                onClick={() => handleEnviarRespuestas(respuestasActuales)}
                disabled={
                  Object.keys(respuestasActuales).length !==
                    quiz.preguntas?.length || loadingQuiz
                }
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto font-semibold text-lg"
              >
                {loadingQuiz ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Enviando respuestas...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Enviar Respuestas
                  </>
                )}
              </button>
              {Object.keys(respuestasActuales).length !==
                quiz.preguntas?.length && (
                <p className="text-slate-400 mt-2">
                  Responde todas las preguntas para continuar
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (pasoActual === 6 && resultados) {
    // PASO 6: Mostrar resultados y ranking
    return (
      <div className="min-h-screen bg-slate-950 text-white p-6">
        <div className="max-w-6xl mx-auto">
          {/* HEADER */}
          <div className="mb-10">
            <div className="flex items-center gap-4">
              <div className="bg-green-500/10 p-4 rounded-2xl border border-green-500/20">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
              <div>
                <h1 className="text-5xl font-black">Resultados del Quiz</h1>
                <p className="text-slate-400 mt-2">
                  {materiaSeleccionada?.nombre || materiaSeleccionada?.titulo}
                </p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* TUS RESULTADOS */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-400" />
                Tu Resultado
              </h2>

              <div className="text-center py-8">
                <div className="text-6xl font-black text-green-400 mb-4">
                  {resultados.puntaje || 0}
                </div>
                <p className="text-xl text-slate-300 mb-6">Puntos obtenidos</p>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                    <p className="text-green-300">
                      Correctas: {resultados.correctas || 0}
                    </p>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                    <p className="text-red-300">
                      Incorrectas: {resultados.incorrectas || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* RANKING TOP 3 */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Trophy className="w-6 h-6 text-yellow-400" />
                Top 3 Estudiantes
              </h2>

              <div className="space-y-4">
                {ranking.length > 0 ? (
                  ranking.map((item, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-4 rounded-xl ${
                        index === 0
                          ? "bg-yellow-500/10 border border-yellow-500/20"
                          : index === 1
                            ? "bg-gray-500/10 border border-gray-500/20"
                            : "bg-orange-500/10 border border-orange-500/20"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                            index === 0
                              ? "bg-yellow-500 text-black"
                              : index === 1
                                ? "bg-gray-400 text-black"
                                : "bg-orange-500 text-white"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-bold">{item.estudiante_nombre}</p>
                          <p className="text-sm text-slate-400">
                            Puntaje: {item.puntaje}
                          </p>
                        </div>
                      </div>
                      <div className="text-2xl font-bold">{item.puntaje}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    <Trophy className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                    <p>No hay datos de ranking disponibles</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* BOTÓN VOLVER */}
          <div className="mt-8 text-center">
            <button
              onClick={() => {
                setPasoActual(1);
                setMaterias([]);
                setQuiz(null);
                setResultados(null);
                setRanking([]);
                setRespuestasActuales({});
                setMaterialIdSeleccionado(null);
                setMateriaSeleccionada(null);
              }}
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-8 py-4 rounded-xl transition-colors flex items-center gap-3 mx-auto font-semibold text-lg"
            >
              <BookOpen className="w-5 h-5" />
              Volver a Materias
            </button>
          </div>
        </div>
      </div>
    );
  }

  // LOADING STATE
  if (loadingMaterias || loadingQuiz) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-14 h-14 text-cyan-400 animate-spin" />
      </div>
    );
  }

  // DEFAULT STATE
  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-6xl mx-auto text-center py-20">
        <Brain className="w-20 h-20 text-cyan-400 mx-auto mb-6" />
        <h1 className="text-4xl font-black mb-4">Quiz Estudiante</h1>
        <p className="text-slate-400">Sistema de evaluación inteligente</p>
      </div>
    </div>
  );
}
