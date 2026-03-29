import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  PlusCircle,
  Edit,
  Trash2,
  Calendar,
  Clock,
  Users,
  TrendingUp,
  Eye,
  FileText,
  CheckCircle,
  Brain,
  Sparkles,
  Zap,
} from "lucide-react";
import { useAuth } from "../../hooks/UseAuth";
import {
  fetchEvaluacionesClase,
  crearEvaluacionClase,
  actualizarEvaluacionClase,
  eliminarEvaluacionClase,
  fetchDetallesEvaluacion,
  fetchRespuestasEvaluacionClase,
  publicarEvaluacion,
  fetchEstadisticasEvaluacion,
} from "../../services/profesorServices/evaluacionesClaseService";
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
  generarEvaluacionConIA,
  guardarEvaluacionIA,
  fetchEvaluacionesIA,
} from "../../services/profesorServices/quizAiService";
import { fetchClases } from "../../services/profesorServices/clasesService";

export default function EvaluacionesClase() {
  const { id } = useParams(); // id de la clase
  const { usuario } = useAuth();
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [quizzesIA, setQuizzesIA] = useState([]);
  const [evaluacionesIA, setEvaluacionesIA] = useState([]);
  const [clases, setClases] = useState([]);
  const [clasesSeleccionadas, setClasesSeleccionadas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMaterial, setLoadingMaterial] = useState(false);
  const [generandoQuiz, setGenerandoQuiz] = useState(false);
  const [generandoEvaluacion, setGenerandoEvaluacion] = useState(false);
  const [error, setError] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalGeneracion, setMostrarModalGeneracion] = useState(false);
  const [mostrarModalQuiz, setMostrarModalQuiz] = useState(false);
  const [mostrarModalEvaluacion, setMostrarModalEvaluacion] = useState(false);
  const [editingEvaluacion, setEditingEvaluacion] = useState(null);
  const [evaluacionSeleccionada, setEvaluacionSeleccionada] = useState(null);
  const [quizSeleccionado, setQuizSeleccionado] = useState(null);
  const [evaluacionIASeleccionada, setEvaluacionIASeleccionada] =
    useState(null);
  const [mostrarDetalles, setMostrarDetalles] = useState(false);
  const [respuestas, setRespuestas] = useState([]);
  const [estadisticas, setEstadisticas] = useState({});
  const [resultados, setResultados] = useState([]);
  const [materialReciente, setMaterialReciente] = useState(null);
  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    fecha: "",
    hora: "",
    tipo: "examen",
    duracion: 60,
    publicado: false,
  });

  // Formulario de generación de quiz con IA
  const [opcionesGeneracion, setOpcionesGeneracion] = useState({
    numeroPreguntas: 5,
    dificultad: "media",
    tipoPreguntas: "mixto", // opcion, verdadero_falso, multiple, mixto
    temas: "",
    tiempoPorPregunta: 60,
    incluirRetroalimentacion: true,
    idioma: "es",
  });

  // Formulario de quiz IA
  const [quizForm, setQuizForm] = useState({
    titulo: "",
    descripcion: "",
    instrucciones: "",
    tiempoTotal: 30,
    intentosMaximos: 3,
    mostrarRetroalimentacion: true,
    aleatorioOrden: true,
  });

  // Formulario de evaluación con IA
  const [evaluacionIAForm, setEvaluacionIAForm] = useState({
    titulo: "",
    descripcion: "",
    instrucciones: "",
    tiempoTotal: 60,
    intentosMaximos: 2,
    mostrarRetroalimentacion: true,
    aleatorioOrden: true,
    pesoPreguntas: 100,
    ponderacion: "igual", // igual, por_dificultad, por_tema
  });

  // Cargar material reciente
  const cargarMaterialReciente = async () => {
    setLoadingMaterial(true);
    try {
      const materialData = await fetchMaterialReciente(id);
      setMaterialReciente(materialData);
    } catch (error) {
      console.error("Error cargando material:", error);
      setMaterialReciente(null);
    } finally {
      setLoadingMaterial(false);
    }
  };

  // Cargar clases del profesor
  const cargarClases = async () => {
    try {
      const clasesData = await fetchClases();
      setClases(clasesData);
    } catch (error) {
      console.error("Error cargando clases:", error);
    }
  };

  // Cargar quizzes IA
  const cargarQuizzesIA = async () => {
    try {
      const quizzesData = await fetchQuizzesIA(id);
      setQuizzesIA(quizzesData);
    } catch (error) {
      console.error("Error cargando quizzes:", error);
    }
  };

  // Cargar evaluaciones con IA
  const cargarEvaluacionesIA = async () => {
    try {
      const evaluacionesData = await fetchEvaluacionesIA();
      setEvaluacionesIA(evaluacionesData);
    } catch (error) {
      console.error("Error cargando evaluaciones IA:", error);
    }
  };

  // Cargar todo (evaluaciones + quizzes IA + evaluaciones IA + clases)
  useEffect(() => {
    const cargarTodo = async () => {
      setLoading(true);
      setError("");
      try {
        // Cargar evaluaciones manuales
        const evaluacionesData = await fetchEvaluacionesClase(id);
        setEvaluaciones(evaluacionesData);

        // Cargar clases del profesor
        await cargarClases();

        // Cargar material reciente
        await cargarMaterialReciente();

        // Cargar quizzes IA
        await cargarQuizzesIA();

        // Cargar evaluaciones con IA
        await cargarEvaluacionesIA();
      } catch (error) {
        setError("Error cargando información inicial");
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    cargarTodo();
  }, [
    id,
    fetchEvaluacionesClase,
    fetchClases,
    fetchMaterialReciente,
    fetchQuizzesIA,
    fetchEvaluacionesIA,
  ]);

  // Manejo del formulario de evaluación manual
  const handleInputChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Manejo del formulario de generación de quiz
  const handleOpcionesChange = (e) => {
    setOpcionesGeneracion({
      ...opcionesGeneracion,
      [e.target.name]: e.target.value,
    });
  };

  // Manejo del formulario de quiz
  const handleQuizFormChange = (e) => {
    setQuizForm({
      ...quizForm,
      [e.target.name]: e.target.value,
    });
  };

  // Manejo del formulario de evaluación IA
  const handleEvaluacionIAFormChange = (e) => {
    setEvaluacionIAForm({
      ...evaluacionIAForm,
      [e.target.name]: e.target.value,
    });
  };

  // Manejar selección de clases para evaluación IA
  const handleClaseSeleccionada = (claseId) => {
    setClasesSeleccionadas((prev) => {
      if (prev.includes(claseId)) {
        return prev.filter((id) => id !== claseId);
      } else {
        return [...prev, claseId];
      }
    });
  };

  // Generar quiz con IA
  const generarQuiz = async () => {
    setGenerandoQuiz(true);
    setError("");
    try {
      // Validar que haya material disponible
      if (!materialReciente) {
        setError("No hay material disponible para generar el quiz");
        return;
      }

      const quizGenerado = await generarQuizConIA(id, opcionesGeneracion);

      // Pre-llenar formulario con datos generados
      setQuizForm({
        titulo:
          quizGenerado.titulo ||
          `Quiz IA - ${new Date().toLocaleDateString("es-ES")}`,
        descripcion:
          quizGenerado.descripcion || "Quiz generado automáticamente con IA",
        instrucciones:
          quizGenerado.instrucciones || "Responde cada pregunta cuidadosamente",
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
    } catch (error) {
      setError("Error generando quiz con IA");
      console.error("Error:", error);
    } finally {
      setGenerandoQuiz(false);
    }
  };

  // Guardar quiz IA
  const guardarQuiz = async () => {
    try {
      const quizData = {
        ...quizForm,
        claseId: id,
        preguntas: quizSeleccionado?.preguntas || [],
        opcionesGeneracion: opcionesGeneracion,
        materialBase: materialReciente,
      };

      await guardarQuizIA(quizData);
      setMostrarModalQuiz(false);
      setQuizSeleccionado(null);

      // Recargar quizzes IA
      await cargarQuizzesIA();
    } catch (error) {
      setError("Error guardando quiz");
      console.error("Error:", error);
    }
  };

  // Generar evaluación con IA (múltiples clases)
  const generarEvaluacion = async () => {
    if (clasesSeleccionadas.length === 0) {
      setError("Debes seleccionar al menos una clase");
      return;
    }

    setGenerandoEvaluacion(true);
    setError("");
    try {
      const evaluacionGenerada = await generarEvaluacionConIA({
        clasesIds: clasesSeleccionadas,
        opciones: opcionesGeneracion,
      });

      // Pre-llenar formulario con datos generados
      setEvaluacionIAForm({
        titulo:
          evaluacionGenerada.titulo ||
          `Evaluación IA - ${new Date().toLocaleDateString("es-ES")}`,
        descripcion:
          evaluacionGenerada.descripcion ||
          "Evaluación generada automáticamente con IA",
        instrucciones:
          evaluacionGenerada.instrucciones ||
          "Responde cada pregunta cuidadosamente",
        tiempoTotal:
          evaluacionGenerada.tiempoTotal ||
          (opcionesGeneracion.numeroPreguntas *
            opcionesGeneracion.tiempoPorPregunta) /
            60,
        intentosMaximos: 2,
        mostrarRetroalimentacion: opcionesGeneracion.incluirRetroalimentacion,
        aleatorioOrden: true,
        pesoPreguntas: 100,
        ponderacion: "igual",
      });

      setEvaluacionIASeleccionada(evaluacionGenerada);
      setMostrarModalGeneracion(false);
      setMostrarModalEvaluacion(true);
    } catch (error) {
      setError("Error generando evaluación con IA");
      console.error("Error:", error);
    } finally {
      setGenerandoEvaluacion(false);
    }
  };

  // Guardar evaluación IA
  const guardarEvaluacion = async () => {
    try {
      const evaluacionData = {
        ...evaluacionIAForm,
        clasesIds: clasesSeleccionadas,
        preguntas: evaluacionIASeleccionada?.preguntas || [],
        opcionesGeneracion: opcionesGeneracion,
        materialBase: clasesSeleccionadas
          .map((claseId) => clases.find((c) => c.id === claseId))
          .filter(Boolean),
      };

      await guardarEvaluacionIA(evaluacionData);
      setMostrarModalEvaluacion(false);
      setEvaluacionIASeleccionada(null);
      setClasesSeleccionadas([]);

      // Recargar evaluaciones IA
      await cargarEvaluacionesIA();
    } catch (error) {
      setError("Error guardando evaluación");
      console.error("Error:", error);
    }
  };

  // Editar quiz IA
  const editarQuiz = (quiz) => {
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

  // Eliminar quiz IA
  const eliminarQuiz = async (quizId) => {
    if (window.confirm("¿Estás seguro de eliminar este quiz?")) {
      try {
        await eliminarQuizIA(quizId);
        await cargarQuizzesIA();
      } catch (error) {
        setError("Error eliminando quiz");
        console.error("Error:", error);
      }
    }
  };

  // Publicar quiz IA
  const publicarQuiz = async (quizId) => {
    try {
      await publicarQuizIA(quizId);
      await cargarQuizzesIA();
    } catch (error) {
      setError("Error publicando quiz");
      console.error("Error:", error);
    }
  };

  // Ver resultados de quiz IA
  const verResultadosQuiz = async (quiz) => {
    try {
      setLoading(true);
      const [resultadosData, estadisticasData] = await Promise.all([
        fetchResultadosQuizIA(quiz.id),
        fetchEstadisticasQuizIA(quiz.id),
      ]);

      setResultados(resultadosData);
      setEstadisticas(estadisticasData);
      setQuizSeleccionado(quiz);
      setMostrarDetalles(true);
    } catch (error) {
      setError("Error cargando resultados");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Crear o actualizar evaluación manual
  const handleGuardarEvaluacion = async () => {
    try {
      if (editingEvaluacion) {
        await actualizarEvaluacionClase(id, editingEvaluacion.id, form);
        setEditingEvaluacion(null);
      } else {
        // Si es tipo "ia", generar preguntas con IA
        if (form.tipo === "ia") {
          setGenerandoQuiz(true);
          setError("");
          try {
            const quizGenerado = await generarQuizConIA(id, {
              numeroPreguntas: 5,
              dificultad: "media",
              tipoPreguntas: "mixto",
              temas: "",
              tiempoPorPregunta: 60,
              incluirRetroalimentacion: true,
              idioma: "es",
            });

            // Pre-llenar formulario con datos generados
            setForm({
              titulo:
                quizGenerado.titulo ||
                `Quiz IA - ${new Date().toLocaleDateString("es-ES")}`,
              descripcion:
                quizGenerado.descripcion ||
                "Quiz generado automáticamente con IA",
              instrucciones:
                quizGenerado.instrucciones ||
                "Responde cada pregunta cuidadosamente",
              tiempoTotal: quizGenerado.tiempoTotal || (5 * 60) / 60,
              intentosMaximos: 3,
              mostrarRetroalimentacion: true,
              aleatorioOrden: true,
            });

            setQuizSeleccionado(quizGenerado);
            setMostrarModalGeneracion(false);
            setMostrarModalQuiz(true);
          } catch (error) {
            setError("Error generando quiz con IA");
            console.error("Error:", error);
          } finally {
            setGenerandoQuiz(false);
          }
        } else {
          await crearEvaluacionClase(id, form);
        }
      }

      setMostrarModal(false);
      setForm({
        titulo: "",
        descripcion: "",
        fecha: "",
        hora: "",
        tipo: "examen",
        duracion: 60,
        publicado: false,
      });

      // Recargar evaluaciones manuales
      const evaluacionesData = await fetchEvaluacionesClase(id);
      setEvaluaciones(evaluacionesData);
    } catch (error) {
      setError("Error al guardar la evaluación");
      console.error("Error:", error);
    }
  };

  // Editar evaluación
  const editarEvaluacion = (evaluacion) => {
    setEditingEvaluacion(evaluacion);
    setForm({
      titulo: evaluacion.titulo,
      descripcion: evaluacion.descripcion,
      fecha: evaluacion.fecha,
      hora: evaluacion.hora,
      tipo: evaluacion.tipo,
      duracion: evaluacion.duracion,
      publicado: evaluacion.publicado,
    });
    setMostrarModal(true);
  };

  // Eliminar evaluación
  const eliminarEvaluacionHandler = async (evaluacionId) => {
    if (window.confirm("¿Estás seguro de eliminar esta evaluación?")) {
      try {
        await eliminarEvaluacionClase(id, evaluacionId);
        // Recargar evaluaciones
        const evaluacionesData = await fetchEvaluacionesClase(id);
        setEvaluaciones(evaluacionesData);
      } catch (error) {
        setError("Error eliminando evaluación");
        console.error("Error:", error);
      }
    }
  };

  // Ver detalles de evaluación
  const verDetalles = async (evaluacion) => {
    try {
      setEvaluacionSeleccionada(evaluacion);
      setLoading(true);

      // Cargar detalles, respuestas y estadísticas
      const [detalles, respuestasData, estadisticasData] = await Promise.all([
        fetchDetallesEvaluacion(id, evaluacion.id),
        fetchRespuestasEvaluacionClase(id, evaluacion.id),
        fetchEstadisticasEvaluacion(id, evaluacion.id),
      ]);

      setRespuestas(respuestasData);
      setEstadisticas(estadisticasData);
      setMostrarDetalles(true);
    } catch (error) {
      setError("Error cargando detalles de evaluación");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Publicar evaluación
  const publicarEvaluacionHandler = async (evaluacionId) => {
    try {
      await publicarEvaluacion(id, evaluacionId);
      // Recargar evaluaciones
      const evaluacionesData = await fetchEvaluacionesClase(id);
      setEvaluaciones(evaluacionesData);
    } catch (error) {
      setError("Error publicando evaluación");
      console.error("Error:", error);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-linear-to-br from-purple-50 via-pink-50 to-rose-50">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-2 animate-bounce">Evaluaciones</div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-pink-600">
            Evaluaciones y Quiz con IA
          </h1>
          <p className="text-gray-600">
            Gestiona evaluaciones manuales, quizzes automáticos (1 clase) y
            evaluaciones IA (múltiples clases)
          </p>
        </div>

        {/* Información del material */}
        <div className="mb-8 p-6 bg-white rounded-2xl border-2 border-purple-200 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              Material Reciente
            </h2>
            <div className="flex gap-3">
              <button
                onClick={() => setMostrarModalGeneracion(true)}
                className="px-6 py-3 text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generar Quiz con IA</span>
              </button>
              <button
                onClick={() => setMostrarModalEvaluacion(true)}
                className="px-6 py-3 text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Brain className="w-4 h-4" />
                <span>Generar Evaluación IA</span>
              </button>
            </div>
          </div>

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
                  Material Disponible
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
              <div className="text-4xl mb-2">Carpetas</div>
              <p className="text-gray-600">
                No hay material reciente disponible para generar quiz
              </p>
              <p className="text-sm text-gray-500">
                Sube material a tu clase para habilitar esta función
              </p>
            </div>
          )}
        </div>

        {/* Tabs para navegación */}
        <div className="mb-8">
          <div className="flex space-x-4 border-b border-gray-200">
            <button
              onClick={() => {
                setMostrarModalGeneracion(false);
                setMostrarModal(false);
                setMostrarModalEvaluacion(false);
              }}
              className={`px-4 py-2 font-medium transition-colors ${
                !mostrarModalGeneracion &&
                !mostrarModal &&
                !mostrarModalEvaluacion
                  ? "text-purple-600 border-b-2 border-purple-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Evaluaciones Manuales
            </button>
            <button
              onClick={() => {
                setMostrarModal(false);
                setMostrarModalGeneracion(false);
                setMostrarModalEvaluacion(false);
              }}
              className={`px-4 py-2 font-medium transition-colors ${
                mostrarModalGeneracion
                  ? "text-purple-600 border-b-2 border-purple-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Quiz con IA (1 Clase)
            </button>
            <button
              onClick={() => {
                setMostrarModal(false);
                setMostrarModalGeneracion(false);
                setMostrarModalEvaluacion(false);
              }}
              className={`px-4 py-2 font-medium transition-colors ${
                mostrarModalEvaluacion
                  ? "text-purple-600 border-b-2 border-purple-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Evaluaciones IA (Múltiples Clases)
            </button>
          </div>
        </div>

        {/* Lista de Evaluaciones Manuales */}
        {!mostrarModalGeneracion && !mostrarModalEvaluacion && (
          <div className="p-8 bg-white rounded-3xl shadow-2xl border-2 border-transparent bg-linear-to-br from-purple-50 to-pink-50 hover:border-purple-300 hover:shadow-xl hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-pink-600">
                Evaluaciones
              </h2>
              <button
                onClick={() => setMostrarModal(true)}
                className="px-6 py-3 text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Crear Evaluación</span>
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <p className="mt-2 text-purple-600">Cargando evaluaciones...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {evaluaciones.map((evaluacion) => (
                  <div
                    key={evaluacion.id}
                    className="p-6 bg-white rounded-2xl border-2 border-purple-100 hover:border-purple-300 hover:shadow-xl hover:scale-105 transition-all duration-300"
                  >
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-gray-800">
                          {evaluacion.titulo}
                        </h3>
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            evaluacion.publicado
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {evaluacion.publicado ? "Publicado" : "Borrador"}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(evaluacion.fecha).toLocaleDateString(
                              "es-ES",
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{evaluacion.hora}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          <span>{evaluacion.tipo}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>{evaluacion.duracion} min</span>
                        </div>
                      </div>
                      {evaluacion.descripcion && (
                        <p className="text-sm text-gray-700 line-clamp-3">
                          {evaluacion.descripcion}
                        </p>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => verDetalles(evaluacion)}
                        className="px-3 py-2 text-purple-600 border-2 border-purple-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-all flex items-center justify-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="text-xs">Detalles</span>
                      </button>
                      <button
                        onClick={() => editarEvaluacion(evaluacion)}
                        className="px-3 py-2 text-blue-600 border-2 border-blue-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all flex items-center justify-center gap-1"
                      >
                        <Edit className="w-4 h-4" />
                        <span className="text-xs">Editar</span>
                      </button>
                      {!evaluacion.publicado && (
                        <button
                          onClick={() =>
                            publicarEvaluacionHandler(evaluacion.id)
                          }
                          className="px-3 py-2 text-green-600 border-2 border-green-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-all flex items-center justify-center gap-1"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-xs">Publicar</span>
                        </button>
                      )}
                      <button
                        onClick={() => eliminarEvaluacionHandler(evaluacion.id)}
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

            {evaluaciones.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4 animate-bounce">Evaluaciones</div>
                <p className="text-xl text-gray-600">
                  No hay evaluaciones manuales creadas
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Usa el botón "Crear Evaluación" para agregar una nueva
                  evaluación manual
                </p>
              </div>
            )}
          </div>
        )}

        {/* Lista de Quiz con IA */}
        {mostrarModalGeneracion && (
          <div className="p-8 bg-white rounded-3xl shadow-2xl border-2 border-transparent bg-linear-to-br from-purple-50 to-pink-50 hover:border-purple-300 hover:shadow-xl hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-pink-600">
                IA
              </h2>
              <div className="text-sm text-gray-600">
                Total: {quizzesIA.length} quizzes
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <p className="mt-2 text-purple-600">Cargando quizzes...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {quizzesIA.map((quiz) => (
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
                        onClick={() => verResultadosQuiz(quiz)}
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

            {quizzesIA.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4 animate-bounce">IA</div>
                <p className="text-xl text-gray-600">
                  No hay quizzes generados con IA
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Usa el botón "Generar Quiz con IA" para crear tu primer quiz
                  automático
                </p>
              </div>
            )}
          </div>
        )}

        {/* Lista de Evaluaciones IA (Múltiples Clases) */}
        {mostrarModalEvaluacion && (
          <div className="p-8 bg-white rounded-3xl shadow-2xl border-2 border-transparent bg-linear-to-br from-purple-50 to-pink-50 hover:border-purple-300 hover:shadow-xl hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-pink-600">
                Evaluaciones IA
              </h2>
              <div className="text-sm text-gray-600">
                Total: {evaluacionesIA.length} evaluaciones
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <p className="mt-2 text-purple-600">Cargando evaluaciones...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {evaluacionesIA.map((evaluacion) => (
                  <div
                    key={evaluacion.id}
                    className="p-6 bg-white rounded-2xl border-2 border-purple-100 hover:border-purple-300 hover:shadow-xl hover:scale-105 transition-all duration-300"
                  >
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-gray-800">
                          {evaluacion.titulo}
                        </h3>
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            evaluacion.publicado
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {evaluacion.publicado ? "Publicado" : "Borrador"}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Brain className="w-4 h-4" />
                          <span>{evaluacion.numeroPreguntas} preguntas</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{evaluacion.tiempoTotal} min</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>{evaluacion.clases?.length || 0} clases</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(
                              evaluacion.fechaCreacion,
                            ).toLocaleDateString("es-ES")}
                          </span>
                        </div>
                      </div>
                      {evaluacion.descripcion && (
                        <p className="text-sm text-gray-700 line-clamp-3">
                          {evaluacion.descripcion}
                        </p>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => verResultadosQuiz(evaluacion)}
                        className="px-3 py-2 text-purple-600 border-2 border-purple-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-all flex items-center justify-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="text-xs">Resultados</span>
                      </button>
                      <button
                        onClick={() => editarQuiz(evaluacion)}
                        className="px-3 py-2 text-blue-600 border-2 border-blue-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all flex items-center justify-center gap-1"
                      >
                        <Edit className="w-4 h-4" />
                        <span className="text-xs">Editar</span>
                      </button>
                      {!evaluacion.publicado && (
                        <button
                          onClick={() => publicarQuiz(evaluacion.id)}
                          className="px-3 py-2 text-green-600 border-2 border-green-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-all flex items-center justify-center gap-1"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-xs">Publicar</span>
                        </button>
                      )}
                      <button
                        onClick={() => eliminarQuiz(evaluacion.id)}
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

            {evaluacionesIA.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4 animate-bounce">
                  Evaluaciones IA
                </div>
                <p className="text-xl text-gray-600">
                  No hay evaluaciones IA creadas
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Usa el botón "Generar Evaluación IA" para crear evaluaciones
                  basadas en múltiples clases
                </p>
              </div>
            )}
          </div>
        )}

        {/* Modal de creación/edición de evaluación manual */}
        {mostrarModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div
              className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
            >
              <div className="flex items-center justify-between mb-6">
                <h3
                  id="modal-title"
                  className="text-2xl font-bold text-gray-800"
                >
                  {editingEvaluacion
                    ? "Editar Evaluación"
                    : form.tipo === "manual"
                      ? "Crear Evaluación Manual"
                      : "Crear Evaluación"}
                </h3>
                <button
                  onClick={() => setMostrarModal(false)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  X
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Título
                  </label>
                  <input
                    type="text"
                    name="titulo"
                    value={form.titulo}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-400 transition-all"
                    placeholder="Título de la evaluación"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Descripción
                  </label>
                  <textarea
                    name="descripcion"
                    value={form.descripcion}
                    onChange={handleInputChange}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-400 transition-all"
                    rows={3}
                    placeholder="Describe el contenido y objetivos de la evaluación"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Preguntas Manuales (separadas por coma)
                  </label>
                  <textarea
                    name="preguntasManuales"
                    value={form.preguntasManuales || ""}
                    onChange={handleInputChange}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-400 transition-all"
                    rows={4}
                    placeholder="Ej: 1. ¿Cuál es la capital de Francia?, 2. ¿Qué es la fórmula del agua?"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 font-medium text-gray-700">
                      Fecha
                    </label>
                    <input
                      type="date"
                      name="fecha"
                      value={form.fecha}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-400 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium text-gray-700">
                      Hora
                    </label>
                    <input
                      type="time"
                      name="hora"
                      value={form.hora}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-400 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 font-medium text-gray-700">
                      Tipo
                    </label>
                    <select
                      name="tipo"
                      value={form.tipo}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-400 transition-all"
                    >
                      <option value="examen">Examen</option>
                      <option value="quiz">Quiz</option>
                      <option value="trabajo">Trabajo</option>
                      <option value="proyecto">Proyecto</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2 font-medium text-gray-700">
                      Duración (minutos)
                    </label>
                    <input
                      type="number"
                      name="duracion"
                      value={form.duracion}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-400 transition-all"
                      min="1"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setMostrarModal(false)}
                    className="flex-1 px-4 py-3 text-gray-600 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleGuardarEvaluacion}
                    className="flex-1 px-4 py-3 text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors"
                  >
                    {editingEvaluacion ? "Actualizar" : "Crear"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de generación de quiz con IA */}
        {mostrarModalGeneracion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  Generar Quiz con IA
                </h3>
                <button
                  onClick={() => setMostrarModalGeneracion(false)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  X
                </button>
              </div>

              <div className="space-y-6">
                {/* Información del material */}
                {materialReciente && (
                  <div className="p-4 bg-purple-50 rounded-xl">
                    <h4 className="font-semibold text-purple-700 mb-2">Base</h4>
                    <p className="text-sm text-gray-700">
                      {materialReciente.nombreArchivo}
                    </p>
                    <p className="text-xs text-gray-600">
                      {materialReciente.resumen}
                    </p>
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
                      <option value="ia">Generado con IA</option>
                      <option value="manual">Manual</option>
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
                    Temas Específicos (opcional)
                  </label>
                  <textarea
                    name="temas"
                    value={opcionesGeneracion.temas}
                    onChange={handleOpcionesChange}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-400 transition-all"
                    rows={3}
                    placeholder="Ej: fracciones, ecuaciones lineales, teorema de Pitágoras..."
                  />
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
                <button
                  onClick={generarQuiz}
                  disabled={generandoQuiz || !materialReciente}
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
                      <span>Generar Quiz</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de generación de evaluación IA (múltiples clases) */}
        {mostrarModalEvaluacion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  Generar Evaluación IA (Múltiples Clases)
                </h3>
                <button
                  onClick={() => setMostrarModalEvaluacion(false)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  X
                </button>
              </div>

              <div className="space-y-6">
                {/* Selección de clases */}
                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Selecciona las clases para la evaluación
                  </label>
                  <div className="max-h-60 overflow-y-auto border-2 border-gray-200 rounded-xl p-4">
                    {clases.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">
                        No hay clases disponibles
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {clases.map((clase) => (
                          <label
                            key={clase.id}
                            className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={clasesSeleccionadas.includes(clase.id)}
                              onChange={() => handleClaseSeleccionada(clase.id)}
                              className="w-4 h-4 text-purple-600 mr-3"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-gray-800">
                                {clase.nombre}
                              </div>
                              <div className="text-sm text-gray-600">
                                {clase.materia}
                              </div>
                              <div className="text-xs text-gray-500">
                                {clase.descripcion}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  {clasesSeleccionadas.length > 0 && (
                    <p className="mt-2 text-sm text-purple-600">
                      {clasesSeleccionadas.length} clase(s) seleccionada(s)
                    </p>
                  )}
                </div>

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
                      max="30"
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
                    Temas Específicos (opcional)
                  </label>
                  <textarea
                    name="temas"
                    value={opcionesGeneracion.temas}
                    onChange={handleOpcionesChange}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-400 transition-all"
                    rows={3}
                    placeholder="Ej: fracciones, ecuaciones lineales, teorema de Pitágoras..."
                  />
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
                  onClick={() => setMostrarModalEvaluacion(false)}
                  className="flex-1 px-4 py-3 text-gray-600 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={generarEvaluacion}
                  disabled={
                    generandoEvaluacion || clasesSeleccionadas.length === 0
                  }
                  className="flex-1 px-4 py-3 text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center justify-center gap-2"
                >
                  {generandoEvaluacion ? (
                    <>
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Generando...</span>
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4" />
                      <span>Generar Evaluación</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de configuración de evaluación IA generada */}
        {mostrarModalEvaluacion && evaluacionIASeleccionada && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  Configurar Evaluación IA
                </h3>
                <button
                  onClick={() => setMostrarModalEvaluacion(false)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  X
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Título de la Evaluación
                  </label>
                  <input
                    type="text"
                    name="titulo"
                    value={evaluacionIAForm.titulo}
                    onChange={handleEvaluacionIAFormChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-400 transition-all"
                    placeholder="Título de la evaluación"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Descripción
                  </label>
                  <textarea
                    name="descripcion"
                    value={evaluacionIAForm.descripcion}
                    onChange={handleEvaluacionIAFormChange}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-400 transition-all"
                    rows={3}
                    placeholder="Describe el contenido y objetivos de la evaluación"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Instrucciones
                  </label>
                  <textarea
                    name="instrucciones"
                    value={evaluacionIAForm.instrucciones}
                    onChange={handleEvaluacionIAFormChange}
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
                      value={evaluacionIAForm.tiempoTotal}
                      onChange={handleEvaluacionIAFormChange}
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
                      value={evaluacionIAForm.intentosMaximos}
                      onChange={handleEvaluacionIAFormChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-400 transition-all"
                      min="1"
                      max="5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 font-medium text-gray-700">
                      Ponderación
                    </label>
                    <select
                      name="ponderacion"
                      value={evaluacionIAForm.ponderacion}
                      onChange={handleEvaluacionIAFormChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-400 transition-all"
                    >
                      <option value="igual">Ponderación Igual</option>
                      <option value="por_dificultad">Por Dificultad</option>
                      <option value="por_tema">Por Tema</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2 font-medium text-gray-700">
                      Peso Total
                    </label>
                    <input
                      type="number"
                      name="pesoPreguntas"
                      value={evaluacionIAForm.pesoPreguntas}
                      onChange={handleEvaluacionIAFormChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-400 transition-all"
                      min="1"
                      max="100"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="mostrarRetroalimentacion"
                      checked={evaluacionIAForm.mostrarRetroalimentacion}
                      onChange={(e) =>
                        setEvaluacionIAForm({
                          ...evaluacionIAForm,
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
                      checked={evaluacionIAForm.aleatorioOrden}
                      onChange={(e) =>
                        setEvaluacionIAForm({
                          ...evaluacionIAForm,
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
              </div>

              {/* Vista previa de preguntas */}
              {evaluacionIASeleccionada?.preguntas && (
                <div className="p-4 bg-purple-50 rounded-xl">
                  <h4 className="font-semibold text-purple-700 mb-3">
                    📋 Vista Previa de Preguntas (
                    {evaluacionIASeleccionada.preguntas.length})
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {evaluacionIASeleccionada.preguntas
                      .slice(0, 3)
                      .map((pregunta, idx) => (
                        <div key={idx} className="text-sm text-gray-700">
                          <span className="font-medium">{idx + 1}.</span>{" "}
                          {pregunta.pregunta}
                        </div>
                      ))}
                    {evaluacionIASeleccionada.preguntas.length > 3 && (
                      <p className="text-sm text-purple-600">
                        ... y {evaluacionIASeleccionada.preguntas.length - 3}{" "}
                        más
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Clases seleccionadas */}
              {clasesSeleccionadas.length > 0 && (
                <div className="p-4 bg-blue-50 rounded-xl">
                  <h4 className="font-semibold text-blue-700 mb-3">
                    📚 Clases Incluidas ({clasesSeleccionadas.length})
                  </h4>
                  <div className="space-y-1">
                    {clasesSeleccionadas.map((claseId) => {
                      const clase = clases.find((c) => c.id === claseId);
                      return clase ? (
                        <div key={claseId} className="text-sm text-gray-700">
                          • {clase.nombre} - {clase.materia}
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setMostrarModalEvaluacion(false)}
                  className="flex-1 px-4 py-3 text-gray-600 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={guardarEvaluacion}
                  className="flex-1 px-4 py-3 text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Guardar Evaluación
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de configuración de quiz IA */}
        {mostrarModalQuiz && quizSeleccionado && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  Configurar Quiz IA
                </h3>
                <button
                  onClick={() => setMostrarModalQuiz(false)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  X
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

              <div className="flex gap-3">
                <button
                  onClick={() => setMostrarModalQuiz(false)}
                  className="flex-1 px-4 py-3 text-gray-600 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={guardarQuiz}
                  className="flex-1 px-4 py-3 text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors"
                >
                  Guardar Quiz
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de detalles */}
        {mostrarDetalles && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  Detalles de{" "}
                  {evaluacionSeleccionada?.titulo || quizSeleccionado?.titulo}
                </h3>
                <button
                  onClick={() => setMostrarDetalles(false)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  X
                </button>
              </div>

              <div className="space-y-6">
                {/* Información del quiz/evaluación */}
                <div className="p-6 bg-gray-50 rounded-xl">
                  <h4 className="text-lg font-bold text-gray-800 mb-4">
                    {evaluacionSeleccionada?.titulo || quizSeleccionado?.titulo}
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">
                        Preguntas:
                      </span>
                      <span className="ml-2">
                        {evaluacionSeleccionada?.numeroPreguntas ||
                          quizSeleccionado?.numeroPreguntas ||
                          "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Tiempo:</span>
                      <span className="ml-2">
                        {evaluacionSeleccionada?.duracion ||
                          quizSeleccionado?.tiempoTotal ||
                          "N/A"}{" "}
                        min
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Fecha:</span>
                      <span className="ml-2">
                        {evaluacionSeleccionada?.fecha ||
                        quizSeleccionado?.fechaCreacion
                          ? new Date(
                              evaluacionSeleccionada.fecha ||
                                quizSeleccionado.fechaCreacion,
                            ).toLocaleDateString("es-ES")
                          : "N/A"}
                      </span>
                    </div>
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
                      <thead className="bg-linear-to-r from-green-50 to-blue-50">
                        <tr>
                          <th className="px-6 py-3 font-semibold text-left text-green-700">
                            Estudiante
                          </th>
                          <th className="px-6 py-3 font-semibold text-left text-green-700">
                            Puntaje
                          </th>
                          <th className="px-6 py-3 font-semibold text-left text-green-700">
                            Correctas
                          </th>
                          <th className="px-6 py-3 font-semibold text-left text-green-700">
                            Tiempo
                          </th>
                          <th className="px-6 py-3 font-semibold text-left text-green-700">
                            Estado
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {resultados.map((resultado, idx) => (
                          <tr key={idx} className="border-b border-green-200">
                            <td className="px-6 py-4 text-gray-800">
                              {resultado.estudiante}
                            </td>
                            <td className="px-6 py-4 font-bold text-gray-800">
                              {resultado.puntaje}%
                            </td>
                            <td className="px-6 py-4 text-gray-800">
                              {resultado.correctas}/{resultado.total}
                            </td>
                            <td className="px-6 py-4 text-gray-800">
                              {resultado.tiempo}
                            </td>
                            <td className="px-6 py-4">
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

            <div className="flex justify-end">
              <button
                onClick={() => setMostrarDetalles(false)}
                className="px-6 py-3 text-gray-600 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}

        {/* Mensajes de estado */}
        {error && (
          <div className="p-4 mb-6 text-red-700 bg-red-100 border border-red-400 rounded-lg">
            Error: {error}
          </div>
        )}
      </div>
    </div>
  );
}
