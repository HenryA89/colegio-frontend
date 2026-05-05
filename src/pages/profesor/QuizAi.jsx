import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Brain,
  FileText,
  PlusCircle,
  Edit,
  Trash2,
  Users,
  TrendingUp,
  Eye,
  Clock,
  Calendar,
  Zap,
  CheckCircle,
  AlertCircle,
  Download,
  Settings,
  Sparkles,
} from "lucide-react";
import {
  fetchMaterialReciente,
  generarQuizConIA,
  guardarQuizIA,
  fetchQuizzesIA,
  editarQuizIA,
  eliminarQuizIA,
  publicarQuizIA,
  fetchResultadosQuizIA,
  fetchEstadisticasQuizIA,
  extraerTemasPDF,
} from "../../services/profesorServices/quizAiService";
import { fetchClases } from "../../services/profesorServices/clasesService";
import {
  subirMaterial,
  obtenerQuiz,
  responderQuiz,
  obtenerResultado,
  obtenerTop,
} from "../../services/materialesService";

export default function QuizAi() {
  const { id } = useParams(); // id de la clase (opcional)
  const navigate = useNavigate();

  // Estados principales
  const [clase, setClase] = useState(null);
  const [materialReciente, setMaterialReciente] = useState(null);

  // Verificar si hay un ID de clase válido
  const claseId = id && id !== "undefined" ? id : null;
  console.log("🎯 QuizAi - ID de clase:", claseId);

  // Manejo de errores general
  const [componentError, setComponentError] = useState(null);

  if (componentError) {
    return (
      <div className="min-h-screen p-6 bg-red-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-red-200">
          <h2 className="text-xl font-bold text-red-800 mb-4">
            Error en Quiz AI
          </h2>
          <p className="text-red-600 mb-4">{componentError}</p>
          <button
            onClick={() => setComponentError(null)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }
  const [quizzes, setQuizzes] = useState([]);
  const [clases, setClases] = useState([]);
  const [editingQuiz, setEditingQuiz] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMaterial, setLoadingMaterial] = useState(false);
  const [generandoQuiz, setGenerandoQuiz] = useState(false);
  const [error, setError] = useState("");
  const [mostrarModalGeneracion, setMostrarModalGeneracion] = useState(false);
  const [mostrarModalQuiz, setMostrarModalQuiz] = useState(false);
  const [quizSeleccionado, setQuizSeleccionado] = useState(null);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [resultados, setResultados] = useState([]);
  const [estadisticas, setEstadisticas] = useState({});
  const [pdfDirecto, setPdfDirecto] = useState(null);
  const [subiendoPDF, setSubiendoPDF] = useState(false);

  // Formulario de generación
  const [opcionesGeneracion, setOpcionesGeneracion] = useState({
    numeroPreguntas: 5,
    dificultad: "media",
    tipoPreguntas: "mixto", // opcion, verdadero_falso, multiple, mixto
    temas: "",
    tiempoPorPregunta: 60,
    incluirRetroalimentacion: true,
    idioma: "es",
  });

  // Formulario de quiz
  const [quizForm, setQuizForm] = useState({
    titulo: "",
    descripcion: "",
    instrucciones: "",
    tiempoTotal: 30,
    intentosMaximos: 3,
    mostrarRetroalimentacion: true,
    aleatorioOrden: true,
  });

  // Función para extraer temas del PDF usando IA
  const extraerTemasDelPDF = async () => {
    if (!materialReciente) {
      setError("No hay material PDF disponible para extraer temas");
      return;
    }

    try {
      setLoading(true);
      console.log("🔍 Extrayendo temas del PDF:", materialReciente.nombre);

      // Llamar al servicio para extraer temas del PDF
      const resultado = await extraerTemasPDF(materialReciente.id);

      console.log("✅ Temas extraídos del PDF:", resultado.temas);

      // Actualizar el formulario con los temas extraídos
      setOpcionesGeneracion((prev) => ({
        ...prev,
        temas: resultado.temas.join(", "),
      }));

      setError("");
    } catch (error) {
      console.error("❌ Error extrayendo temas del PDF:", error);
      setError(`Error al extraer temas del PDF: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Cargar información inicial
  useEffect(() => {
    const cargarInformacion = async () => {
      try {
        setLoading(true);
        console.log("🚀 Iniciando carga de información en QuizAi");

        // Cargar las clases del profesor siempre para poder seleccionar una clase
        const clasesData = await fetchClases();
        setClases(clasesData);
        console.log("✅ Clases cargadas:", clasesData.length);

        if (!id) {
          console.log("ℹ️ No hay ID de clase, mostrando vista general");
          setClase(null);
          setMaterialReciente(null);
          setQuizzes([]);
          return;
        }

        const claseInfo = clasesData.find((c) => String(c.id) === String(id));
        setClase(claseInfo);
        console.log("✅ Clase seleccionada:", claseInfo);

        // Cargar material reciente
        await cargarMaterialReciente();

        // Cargar quizzes existentes
        await cargarQuizzes();
      } catch (error) {
        console.error("❌ Error en useEffect de QuizAi:", error);
        setComponentError(`Error cargando información: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    cargarInformacion();
  }, [id, cargarMaterialReciente, cargarQuizzes]);

  // Cargar material reciente
  const cargarMaterialReciente = useCallback(async () => {
    if (!id) return;
    setLoadingMaterial(true);
    try {
      console.log("🔍 Cargando material reciente para clase ID:", id);
      const materialData = await fetchMaterialReciente(id);
      console.log("📄 Material recibido:", materialData);
      setMaterialReciente(materialData);
      console.log("✅ Material establecido en estado");
    } catch (error) {
      console.error("❌ Error cargando material:", error);
      console.log("📝 Estableciendo materialReciente a null");
      setMaterialReciente(null);
    } finally {
      setLoadingMaterial(false);
    }
  }, [id]);

  // Cargar quizzes existentes
  const cargarQuizzes = useCallback(async () => {
    if (!id) return;
    try {
      const quizzesData = await fetchQuizzesIA(id);
      setQuizzes(quizzesData);
    } catch (error) {
      console.error("Error cargando quizzes:", error);
    }
  }, [id]);

  // Manejar cambios en formulario de generación
  const handleOpcionesChange = (e) => {
    setOpcionesGeneracion({
      ...opcionesGeneracion,
      [e.target.name]: e.target.value,
    });
  };

  // Manejar cambios en formulario de quiz
  const handleQuizFormChange = (e) => {
    setQuizForm({
      ...quizForm,
      [e.target.name]: e.target.value,
    });
  };

  // Subir PDF directo para generar quiz
  const subirPDFDirecto = async () => {
    if (!pdfDirecto) {
      setError("Por favor selecciona un archivo PDF");
      return;
    }

    setSubiendoPDF(true);
    setError("");
    try {
      console.log("📤 Subiendo PDF directo para generar quiz...");

      // Subir material usando el servicio optimizado
      const materialSubido = await subirMaterial({
        file: pdfDirecto,
        titulo: `Quiz IA - ${new Date().toLocaleDateString("es-ES")}`,
        claseId: claseId, // Usar claseId que puede ser null
      });

      console.log("✅ Material subido:", materialSubido);

      // Generar quiz usando el material subido
      const quizGenerado = await generarQuizConIA(materialSubido.id, {
        ...opcionesGeneracion,
        usarMaterialPDF: true,
        materialId: materialSubido.id,
      });

      console.log(
        "🎉 Quiz generado con éxito desde PDF directo:",
        quizGenerado,
      );

      // Pre-llenar formulario con datos generados
      setQuizForm({
        titulo:
          quizGenerado.titulo ||
          `Quiz IA - ${new Date().toLocaleDateString("es-ES")}`,
        descripcion:
          quizGenerado.descripcion ||
          "Quiz generado automáticamente con IA basado en PDF",
        instrucciones:
          quizGenerado.instrucciones ||
          "Responde cada pregunta cuidadosamente basándote en el material proporcionado",
        tiempoTotal:
          quizGenerado.tiempoTotal ||
          (opcionesGeneracion.numeroPreguntas *
            opcionesGeneracion.tiempoPorPregunta) /
            60,
        intentosMaximos: 3,
        mostrarRetroalimentacion: opcionesGeneracion.incluirRetroalimentacion,
        aleatorioOrden: true,
      });

      setQuizSeleccionado(quizGenerado);
      setMostrarModalGeneracion(false);
      setMostrarModalQuiz(true);
      setPdfDirecto(null);

      // Resetear formulario
      setOpcionesGeneracion({
        numeroPreguntas: 5,
        dificultad: "media",
        tipoPreguntas: "mixto",
        temas: "",
        tiempoPorPregunta: 60,
        incluirRetroalimentacion: true,
        idioma: "es",
      });
    } catch (error) {
      console.error("❌ Error subiendo PDF directo:", error);
      setError(`Error al subir PDF: ${error.message}`);
    } finally {
      setSubiendoPDF(false);
    }
  };

  // Generar quiz con IA
  const generarQuiz = async () => {
    if (!id) {
      setError("Selecciona primero una clase para generar un quiz.");
      return;
    }

    setGenerandoQuiz(true);
    setError("");
    try {
      console.log("🎯 Generando quiz con IA para clase:", clase?.nombre);
      console.log("📋 Opciones de generación:", opcionesGeneracion);

      // Si no hay temas específicos pero hay material PDF, usar el PDF
      if (!opcionesGeneracion.temas.trim() && materialReciente) {
        console.log("📄 No hay temas específicos, usando material PDF...");

        // Extraer temas automáticamente del PDF
        const resultado = await extraerTemasPDF(materialReciente.id);

        // Actualizar opciones con temas extraídos
        const opcionesConTemas = {
          ...opcionesGeneracion,
          temas: resultado.temas.join(", "),
          usarMaterialPDF: true,
          materialId: materialReciente.id,
        };

        console.log("✅ Temas extraídos automáticamente:", resultado.temas);

        // Generar quiz con temas extraídos
        const quizGenerado = await generarQuizConIA(id, opcionesConTemas);
        console.log("🎉 Quiz generado con éxito usando PDF:", quizGenerado);

        // Pre-llenar formulario con datos generados
        setQuizForm({
          titulo:
            quizGenerado.titulo ||
            `Quiz IA - ${new Date().toLocaleDateString("es-ES")}`,
          descripcion:
            quizGenerado.descripcion ||
            "Quiz generado automáticamente con IA basado en PDF",
          instrucciones:
            quizGenerado.instrucciones ||
            "Responde cada pregunta cuidadosamente basándote en el material proporcionado",
          tiempoTotal:
            quizGenerado.tiempoTotal ||
            (opcionesGeneracion.numeroPreguntas *
              opcionesGeneracion.tiempoPorPregunta) /
              60,
          intentosMaximos: 3,
          mostrarRetroalimentacion: opcionesGeneracion.incluirRetroalimentacion,
          aleatorioOrden: true,
        });

        setQuizSeleccionado(quizGenerado);
        setMostrarModalGeneracion(false);
        setMostrarModalQuiz(true);

        // Resetear formulario
        setOpcionesGeneracion({
          numeroPreguntas: 5,
          dificultad: "media",
          tipoPreguntas: "mixto",
          temas: "",
          tiempoPorPregunta: 60,
          incluirRetroalimentacion: true,
          idioma: "es",
        });
      } else {
        // Generar quiz con las opciones proporcionadas
        console.log("✏️ Generando quiz con opciones manuales");
        const quizGenerado = await generarQuizConIA(id, opcionesGeneracion);
        console.log("🎉 Quiz generado con éxito:", quizGenerado);

        // Pre-llenar formulario con datos generados
        setQuizForm({
          titulo:
            quizGenerado.titulo ||
            `Quiz IA - ${new Date().toLocaleDateString("es-ES")}`,
          descripcion:
            quizGenerado.descripcion || "Quiz generado automáticamente con IA",
          instrucciones:
            quizGenerado.instrucciones ||
            "Responde cada pregunta cuidadosamente",
          tiempoTotal:
            quizGenerado.tiempoTotal ||
            (opcionesGeneracion.numeroPreguntas *
              opcionesGeneracion.tiempoPorPregunta) /
              60,
          intentosMaximos: 3,
          mostrarRetroalimentacion: opcionesGeneracion.incluirRetroalimentacion,
          aleatorioOrden: true,
        });

        setQuizSeleccionado(quizGenerado);
        setMostrarModalGeneracion(false);
        setMostrarModalQuiz(true);

        // Resetear formulario
        setOpcionesGeneracion({
          numeroPreguntas: 5,
          dificultad: "media",
          tipoPreguntas: "mixto",
          temas: "",
          tiempoPorPregunta: 60,
          incluirRetroalimentacion: true,
          idioma: "es",
        });
      }
    } catch (error) {
      console.error("❌ Error generando quiz:", error);
      setError(`Error al generar el quiz: ${error.message}`);
    } finally {
      setGenerandoQuiz(false);
    }
  };

  const cerrarModalQuiz = () => {
    setMostrarModalQuiz(false);
    setEditingQuiz(false);
    setQuizSeleccionado(null);
  };

  // Guardar quiz
  const guardarQuiz = async () => {
    if (!id) {
      setError("No se puede guardar quiz sin seleccionar una clase.");
      return;
    }

    try {
      const quizData = {
        ...quizForm,
        claseId: id,
        preguntas: quizSeleccionado?.preguntas || [],
        opcionesGeneracion: opcionesGeneracion,
        materialBase: materialReciente,
      };

      if (editingQuiz && quizSeleccionado?.id) {
        await editarQuizIA(quizSeleccionado.id, quizData);
      } else {
        await guardarQuizIA(quizData);
      }

      setMostrarModalQuiz(false);
      setQuizSeleccionado(null);
      setEditingQuiz(false);

      // Recargar quizzes
      await cargarQuizzes();
    } catch (error) {
      setError("Error guardando quiz");
      console.error("Error:", error);
    }
  };

  // Editar quiz existente
  const editarQuiz = (quiz) => {
    setEditingQuiz(true);
    setQuizSeleccionado(quiz);
    setQuizForm({
      titulo: quiz.titulo,
      descripcion: quiz.descripcion,
      instrucciones: quiz.instrucciones,
      tiempoTotal: quiz.tiempoTotal,
      intentosMaximos: quiz.intentosMaximos,
      mostrarRetroalimentacion: quiz.mostrarRetroalimentacion,
      aleatorioOrden: quiz.aleatorioOrden,
    });
    setMostrarModalQuiz(true);
  };

  // Eliminar quiz
  const eliminarQuiz = async (quizId) => {
    if (window.confirm("¿Estás seguro de eliminar este quiz?")) {
      try {
        await eliminarQuizIA(quizId);
        await cargarQuizzes();
      } catch (error) {
        setError("Error eliminando quiz");
        console.error("Error:", error);
      }
    }
  };

  // Publicar quiz
  const publicarQuiz = async (quizId) => {
    try {
      await publicarQuizIA(quizId);
      await cargarQuizzes();
    } catch (error) {
      setError("Error publicando quiz");
      console.error("Error:", error);
    }
  };

  // Ver resultados de quiz
  const verResultados = async (quiz) => {
    try {
      setLoading(true);
      const [resultadosData, estadisticasData] = await Promise.all([
        fetchResultadosQuizIA(quiz.id),
        fetchEstadisticasQuizIA(quiz.id),
      ]);

      setResultados(resultadosData);
      setEstadisticas(estadisticasData);
      setQuizSeleccionado(quiz);
      setMostrarResultados(true);
    } catch (error) {
      setError("Error cargando resultados");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-linear-to-br from-purple-50 via-pink-50 to-rose-50">
      {console.log("🔍 Renderizando QuizAi, estado:", {
        id,
        clase,
        materialReciente,
        loadingMaterial,
      })}
      <div className="max-w-7xl mx-auto">
        {/* Encabezado */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-2 animate-bounce">🧠</div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-pink-600">
            Quiz Generado con IA
          </h1>
          <p className="text-gray-600">
            Crea quizzes automáticos basados en el material de tu clase
          </p>
        </div>

        {/* Información de la clase y material */}
        <div className="mb-8 p-6 bg-white rounded-2xl border-2 border-purple-200 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              📚 {clase?.materia || "Clase"} - Grupo {clase?.grupo || "N/A"}
            </h2>
            <button
              onClick={() => setMostrarModalGeneracion(true)}
              disabled={!id}
              className={`px-6 py-3 text-white bg-purple-600 rounded-xl transition-colors flex items-center space-x-2 ${
                !id
                  ? "opacity-50 cursor-not-allowed hover:bg-purple-600"
                  : "hover:bg-purple-700"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Generar Quiz con IA</span>
            </button>
          </div>

          {clases.length > 0 && (
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Selecciona una clase
              </label>
              <select
                value={clase?.id || ""}
                onChange={(event) => {
                  const selectedId = event.target.value;
                  if (selectedId) {
                    navigate(`/profesor/quiz-ai/${selectedId}`);
                  }
                }}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-400 transition-all"
              >
                <option value="">Selecciona una clase...</option>
                {clases.map((claseItem) => (
                  <option key={claseItem.id} value={claseItem.id}>
                    {claseItem.materia} - Grupo {claseItem.grupo}
                  </option>
                ))}
              </select>
            </div>
          )}

          {loadingMaterial ? (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
              <p className="mt-2 text-purple-600">
                Analizando material reciente...
              </p>
            </div>
          ) : materialReciente ? (
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 rounded-xl">
                <h3 className="font-semibold text-purple-700 mb-2">
                  📄 Material Reciente Disponible
                </h3>
                <div className="text-sm text-gray-700">
                  <p>
                    <strong>Archivo:</strong> {materialReciente.nombreArchivo}
                  </p>
                  <p>
                    <strong>Fecha:</strong>{" "}
                    {new Date(materialReciente.fechaSubida).toLocaleDateString(
                      "es-ES",
                    )}
                  </p>
                  <p>
                    <strong>Contenido:</strong>{" "}
                    {materialReciente.resumen ||
                      "Material procesado para generación de quiz"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📂</div>
              <p className="text-gray-600">
                No hay material reciente disponible para generar quiz
              </p>
              <p className="text-sm text-gray-500">
                Sube material a tu clase para habilitar esta función
              </p>
            </div>
          )}
        </div>

        {/* Lista de quizzes */}
        <div className="p-8 bg-white rounded-3xl shadow-2xl border-2 border-transparent bg-linear-to-br from-purple-50 to-pink-50 hover:border-purple-300 hover:shadow-xl hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-pink-600">
              📝 Quizzes Generados
            </h2>
            <div className="text-sm text-gray-600">
              Total: {quizzes.length} quizzes
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <p className="mt-2 text-purple-600">Cargando quizzes...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {quizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="p-6 bg-white rounded-2xl border-2 border-purple-100 hover:border-purple-300 hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-gray-800">
                        {quiz.titulo}
                      </h3>
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          quiz.publicado
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {quiz.publicado ? "Publicado" : "Borrador"}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Brain className="w-4 h-4" />
                        <span>{quiz.numeroPreguntas} preguntas</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{quiz.tiempoTotal} min</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(quiz.fechaCreacion).toLocaleDateString(
                            "es-ES",
                          )}
                        </span>
                      </div>
                    </div>
                    {quiz.descripcion && (
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {quiz.descripcion}
                      </p>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => verResultados(quiz)}
                      className="px-3 py-2 text-purple-600 border-2 border-purple-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-all flex items-center justify-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="text-xs">Resultados</span>
                    </button>
                    <button
                      onClick={() => editarQuiz(quiz)}
                      className="px-3 py-2 text-blue-600 border-2 border-blue-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all flex items-center justify-center gap-1"
                    >
                      <Edit className="w-4 h-4" />
                      <span className="text-xs">Editar</span>
                    </button>
                    {!quiz.publicado && (
                      <button
                        onClick={() => publicarQuiz(quiz.id)}
                        className="px-3 py-2 text-green-600 border-2 border-green-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-all flex items-center justify-center gap-1"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-xs">Publicar</span>
                      </button>
                    )}
                    <button
                      onClick={() => eliminarQuiz(quiz.id)}
                      className="px-3 py-2 text-red-600 border-2 border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-all flex items-center justify-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-xs">Eliminar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {quizzes.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 animate-bounce">🧠</div>
              <p className="text-xl text-gray-600">
                No hay quizzes generados aún
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Usa el botón "Generar Quiz con IA" para crear tu primer quiz
              </p>
            </div>
          )}
        </div>

        {/* Modal de generación */}
        {mostrarModalGeneracion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  ⚡ Generar Quiz con IA
                </h3>
                <button
                  onClick={() => setMostrarModalGeneracion(false)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  ❌
                </button>
              </div>

              <div className="space-y-6">
                {/* Información del material */}
                {console.log(
                  "🔍 Renderizando modal, materialReciente:",
                  materialReciente,
                )}
                {materialReciente ? (
                  <div className="p-4 bg-purple-50 rounded-xl">
                    <h4 className="font-semibold text-purple-700 mb-2">
                      📄 Material Base
                    </h4>
                    <p className="text-sm text-gray-700">
                      {materialReciente.nombreArchivo ||
                        materialReciente.nombre}
                    </p>
                    <p className="text-xs text-gray-600">
                      {materialReciente.resumen}
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h4 className="font-semibold text-gray-700 mb-2">
                      📄 Material Base
                    </h4>
                    <p className="text-sm text-gray-500 mb-3">
                      No hay material PDF disponible para esta clase
                    </p>

                    {/* Opción para subir PDF directo */}
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-4">
                      <div className="text-center">
                        <FileText className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600 mb-2">
                          Sube un PDF directamente para generar el quiz
                        </p>
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => setPdfDirecto(e.target.files[0])}
                          className="hidden"
                          id="pdf-directo"
                        />
                        <label
                          htmlFor="pdf-directo"
                          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer text-sm"
                        >
                          <PlusCircle className="w-4 h-4 inline mr-1" />
                          Seleccionar PDF
                        </label>
                        {pdfDirecto && (
                          <div className="mt-3 p-2 bg-green-50 rounded-lg">
                            <p className="text-xs text-green-700">
                              ✅ {pdfDirecto.name} (
                              {(pdfDirecto.size / 1024 / 1024).toFixed(2)} MB)
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Opciones de generación */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 font-medium text-gray-700">
                      Número de Preguntas
                    </label>
                    <input
                      type="number"
                      name="numeroPreguntas"
                      value={opcionesGeneracion.numeroPreguntas}
                      onChange={handleOpcionesChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-400 transition-all"
                      min="1"
                      max="20"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium text-gray-700">
                      Dificultad
                    </label>
                    <select
                      name="dificultad"
                      value={opcionesGeneracion.dificultad}
                      onChange={handleOpcionesChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-400 transition-all"
                    >
                      <option value="facil">Fácil</option>
                      <option value="media">Media</option>
                      <option value="dificil">Difícil</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2 font-medium text-gray-700">
                      Tipo de Preguntas
                    </label>
                    <select
                      name="tipoPreguntas"
                      value={opcionesGeneracion.tipoPreguntas}
                      onChange={handleOpcionesChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-400 transition-all"
                    >
                      <option value="opcion">Opción Múltiple</option>
                      <option value="verdadero_falso">Verdadero/Falso</option>
                      <option value="multiple">Selección Múltiple</option>
                      <option value="mixto">Mixto</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2 font-medium text-gray-700">
                      Tiempo por Pregunta (segundos)
                    </label>
                    <input
                      type="number"
                      name="tiempoPorPregunta"
                      value={opcionesGeneracion.tiempoPorPregunta}
                      onChange={handleOpcionesChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-400 transition-all"
                      min="10"
                      max="300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Temas del Material PDF
                  </label>
                  <div className="space-y-3">
                    <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-700">
                          Material disponible:
                        </span>
                        {materialReciente && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            PDF Disponible
                          </span>
                        )}
                      </div>
                      {materialReciente ? (
                        <div className="text-sm text-blue-600">
                          <p className="font-medium">
                            {materialReciente.nombre || "Material reciente"}
                          </p>
                          <p className="text-xs text-blue-500 mt-1">
                            Subido:{" "}
                            {new Date(
                              materialReciente.fecha_subida,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">
                          No hay material PDF disponible para esta clase
                        </div>
                      )}
                    </div>

                    <textarea
                      name="temas"
                      value={opcionesGeneracion.temas}
                      onChange={handleOpcionesChange}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-400 transition-all"
                      rows={3}
                      placeholder={
                        materialReciente
                          ? "Los temas se extraerán automáticamente del PDF. Puedes agregar temas específicos si lo deseas..."
                          : "Ej: fracciones, ecuaciones lineales, teorema de Pitágoras..."
                      }
                    />

                    {materialReciente && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => extraerTemasDelPDF()}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center gap-2"
                        >
                          <Sparkles className="w-4 h-4" />
                          Extraer temas del PDF
                        </button>
                        <span className="text-xs text-gray-500">
                          IA analizará el contenido del PDF
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="incluirRetroalimentacion"
                      checked={opcionesGeneracion.incluirRetroalimentacion}
                      onChange={(e) =>
                        setOpcionesGeneracion({
                          ...opcionesGeneracion,
                          incluirRetroalimentacion: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-purple-600"
                    />
                    <span className="text-sm text-gray-700">
                      Incluir retroalimentación automática
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setMostrarModalGeneracion(false)}
                  className="flex-1 px-4 py-3 text-gray-600 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                {!materialReciente && pdfDirecto ? (
                  <button
                    onClick={subirPDFDirecto}
                    disabled={subiendoPDF}
                    className="flex-1 px-4 py-3 text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center justify-center gap-2"
                  >
                    {subiendoPDF ? (
                      <>
                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Subiendo y Generando...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        <span>Generar Quiz desde PDF</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={materialReciente ? generarQuiz : undefined}
                    disabled={
                      generandoQuiz || (!materialReciente && !pdfDirecto)
                    }
                    className="flex-1 px-4 py-3 text-white bg-purple-600 rounded-xl hover:bg-purple-700 disabled:bg-purple-400 transition-colors flex items-center justify-center gap-2"
                  >
                    {generandoQuiz ? (
                      <>
                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Generando...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        <span>
                          {materialReciente
                            ? "Generar Quiz"
                            : "Selecciona un PDF o sube material"}
                        </span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal de quiz */}
        {mostrarModalQuiz && quizSeleccionado && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  {editingQuiz ? "✏️ Editar Quiz" : "📝 Configurar Quiz"}
                </h3>
                <button
                  onClick={cerrarModalQuiz}
                  className="text-gray-600 hover:text-gray-800"
                >
                  ❌
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Título del Quiz
                  </label>
                  <input
                    type="text"
                    name="titulo"
                    value={quizForm.titulo}
                    onChange={handleQuizFormChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-400 transition-all"
                    placeholder="Título del quiz"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Descripción
                  </label>
                  <textarea
                    name="descripcion"
                    value={quizForm.descripcion}
                    onChange={handleQuizFormChange}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-400 transition-all"
                    rows={3}
                    placeholder="Describe el contenido y objetivos del quiz"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Instrucciones
                  </label>
                  <textarea
                    name="instrucciones"
                    value={quizForm.instrucciones}
                    onChange={handleQuizFormChange}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-400 transition-all"
                    rows={2}
                    placeholder="Instrucciones para los estudiantes"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 font-medium text-gray-700">
                      Tiempo Total (minutos)
                    </label>
                    <input
                      type="number"
                      name="tiempoTotal"
                      value={quizForm.tiempoTotal}
                      onChange={handleQuizFormChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-400 transition-all"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium text-gray-700">
                      Intentos Máximos
                    </label>
                    <input
                      type="number"
                      name="intentosMaximos"
                      value={quizForm.intentosMaximos}
                      onChange={handleQuizFormChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-400 transition-all"
                      min="1"
                      max="5"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="mostrarRetroalimentacion"
                      checked={quizForm.mostrarRetroalimentacion}
                      onChange={(e) =>
                        setQuizForm({
                          ...quizForm,
                          mostrarRetroalimentacion: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-purple-600"
                    />
                    <span className="text-sm text-gray-700">
                      Mostrar retroalimentación
                    </span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="aleatorioOrden"
                      checked={quizForm.aleatorioOrden}
                      onChange={(e) =>
                        setQuizForm({
                          ...quizForm,
                          aleatorioOrden: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-purple-600"
                    />
                    <span className="text-sm text-gray-700">
                      Orden aleatorio de preguntas
                    </span>
                  </label>
                </div>

                {/* Vista previa de preguntas */}
                {quizSeleccionado?.preguntas && (
                  <div className="p-4 bg-purple-50 rounded-xl">
                    <h4 className="font-semibold text-purple-700 mb-3">
                      📋 Vista Previa de Preguntas (
                      {quizSeleccionado.preguntas.length})
                    </h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {quizSeleccionado.preguntas
                        .slice(0, 3)
                        .map((pregunta, idx) => (
                          <div key={idx} className="text-sm text-gray-700">
                            <span className="font-medium">{idx + 1}.</span>{" "}
                            {pregunta.pregunta}
                          </div>
                        ))}
                      {quizSeleccionado.preguntas.length > 3 && (
                        <p className="text-sm text-purple-600">
                          ... y {quizSeleccionado.preguntas.length - 3} más
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={cerrarModalQuiz}
                  className="flex-1 px-4 py-3 text-gray-600 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={guardarQuiz}
                  className="flex-1 px-4 py-3 text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors"
                >
                  {editingQuiz ? "Actualizar" : "Guardar"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de resultados */}
        {mostrarResultados && quizSeleccionado && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  📊 Resultados del Quiz
                </h3>
                <button
                  onClick={() => setMostrarResultados(false)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  ❌
                </button>
              </div>

              <div className="space-y-6">
                {/* Información del quiz */}
                <div className="p-6 bg-gray-50 rounded-xl">
                  <h4 className="text-lg font-bold text-gray-800 mb-4">
                    {quizSeleccionado.titulo}
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">
                        Preguntas:
                      </span>
                      <span className="ml-2">
                        {quizSeleccionado.numeroPreguntas}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Tiempo:</span>
                      <span className="ml-2">
                        {quizSeleccionado.tiempoTotal} min
                      </span>
                    </div>
                  </div>
                </div>

                {/* Estadísticas */}
                {Object.keys(estadisticas).length > 0 && (
                  <div className="p-6 bg-purple-50 rounded-xl">
                    <h4 className="text-lg font-bold text-gray-800 mb-4">
                      📈 Estadísticas
                    </h4>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {estadisticas.totalEstudiantes || 0}
                        </div>
                        <div className="text-sm text-gray-600">Estudiantes</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {estadisticas.completados || 0}
                        </div>
                        <div className="text-sm text-gray-600">Completados</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {estadisticas.promedio || "N/A"}
                        </div>
                        <div className="text-sm text-gray-600">Promedio</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {estadisticas.tasaAprobacion || "N/A"}%
                        </div>
                        <div className="text-sm text-gray-600">Aprobación</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Resultados de estudiantes */}
                {resultados.length > 0 && (
                  <div className="p-6 bg-green-50 rounded-xl">
                    <h4 className="text-lg font-bold text-gray-800 mb-4">
                      👥 Resultados de Estudiantes
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead className="bg-green-100">
                          <tr>
                            <th className="px-4 py-2 text-left text-green-700">
                              Estudiante
                            </th>
                            <th className="px-4 py-2 text-left text-green-700">
                              Puntaje
                            </th>
                            <th className="px-4 py-2 text-left text-green-700">
                              Correctas
                            </th>
                            <th className="px-4 py-2 text-left text-green-700">
                              Tiempo
                            </th>
                            <th className="px-4 py-2 text-left text-green-700">
                              Estado
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {resultados.map((resultado, idx) => (
                            <tr key={idx} className="border-b border-green-200">
                              <td className="px-4 py-2">
                                {resultado.estudiante}
                              </td>
                              <td className="px-4 py-2 font-bold">
                                {resultado.puntaje}%
                              </td>
                              <td className="px-4 py-2">
                                {resultado.correctas}/{resultado.total}
                              </td>
                              <td className="px-4 py-2">{resultado.tiempo}</td>
                              <td className="px-4 py-2">
                                <span
                                  className={`px-2 py-1 text-xs rounded-full ${
                                    resultado.estado === "aprobado"
                                      ? "bg-green-100 text-green-700"
                                      : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {resultado.estado}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Mensajes de estado */}
        {error && (
          <div className="p-4 mb-6 text-red-700 bg-red-100 border border-red-400 rounded-lg">
            ❌ {error}
          </div>
        )}
      </div>
    </div>
  );
}
