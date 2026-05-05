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
  Upload,
  Play,
  BarChart3,
} from "lucide-react";
import { fetchClases } from "../../services/profesorServices/clasesService";
import {
  subirMaterial,
} from "../../services/profesorServices/clasesService";
import {
  getQuiz,
  submitQuiz,
  getRanking,
} from "../../services/profesorServices/quizAiService";

export default function QuizAi() {
  const { id } = useParams(); // id de la clase (opcional)
  const navigate = useNavigate();

  // Estados principales
  const [clase, setClase] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [clases, setClases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [componentError, setComponentError] = useState(null);

  // Estados para modales
  const [mostrarModalCrear, setMostrarModalCrear] = useState(false);
  const [mostrarModalDetalles, setMostrarModalDetalles] = useState(false);
  const [quizSeleccionado, setQuizSeleccionado] = useState(null);

  // Estados para formulario
  const [formularioQuiz, setFormularioQuiz] = useState({
    titulo: "",
    descripcion: "",
    instrucciones: "",
    duracion: 30,
    numeroPreguntas: 10,
    dificultad: "media",
  });

  // Estados para subida de PDF
  const [archivoPDF, setArchivoPDF] = useState(null);
  const [subiendoPDF, setSubiendoPDF] = useState(false);

  // Verificar si hay un ID de clase válido
  const claseId = id && id !== "undefined" ? id : null;

  // Cargar información inicial
  const cargarInformacion = useCallback(async () => {
    try {
      setLoading(true);
      console.log("🚀 Iniciando carga de información en QuizAi");
      
      // Cargar clases del profesor
      const clasesData = await fetchClases();
      setClases(clasesData);
      console.log("✅ Clases cargadas:", clasesData.length);

      if (!claseId) {
        console.log("ℹ️ No hay ID de clase, mostrando vista general");
        setClase(null);
        return;
      }

      // Si hay ID, buscar la clase específica
      const claseEncontrada = clasesData.find(c => c.id === claseId);
      setClase(claseEncontrada || null);
      
      // Cargar quizzes de la clase
      await cargarQuizzes();
      
    } catch (error) {
      console.error("❌ Error en useEffect de QuizAi:", error);
      setComponentError(`Error cargando información: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [claseId]);

  // Cargar quizzes
  const cargarQuizzes = async () => {
    try {
      // Aquí iría la llamada para cargar quizzes cuando el backend esté listo
      // Por ahora, simulamos datos
      const quizzesSimulados = [
        {
          id: 1,
          titulo: "Quiz de Matemáticas Básicas",
          descripcion: "Evaluación sobre operaciones fundamentales",
          duracion: 30,
          numeroPreguntas: 10,
          dificultad: "media",
          creado: new Date().toISOString(),
          publicado: true,
          participantes: 15,
          promedio: 85,
        },
        {
          id: 2,
          titulo: "Quiz de Historia Universal",
          descripcion: "Repaso de eventos históricos importantes",
          duracion: 45,
          numeroPreguntas: 15,
          dificultad: "difícil",
          creado: new Date().toISOString(),
          publicado: false,
          participantes: 0,
          promedio: 0,
        },
      ];
      setQuizzes(quizzesSimulados);
    } catch (error) {
      console.error("❌ Error cargando quizzes:", error);
    }
  };

  // Manejo de cambios en el formulario
  const handleFormularioChange = (e) => {
    const { name, value } = e.target;
    setFormularioQuiz(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Manejo de archivo PDF
  const handleArchivoPDF = (e) => {
    const archivo = e.target.files[0];
    if (archivo) {
      // Validar que sea PDF
      if (archivo.type !== "application/pdf") {
        setError("El archivo debe ser un PDF");
        return;
      }
      // Validar tamaño (máximo 10MB)
      if (archivo.size > 10 * 1024 * 1024) {
        setError("El archivo no debe superar los 10MB");
        return;
      }
      setArchivoPDF(archivo);
      setError(null);
    }
  };

  // Subir PDF
  const subirPDFDirecto = async () => {
    if (!archivoPDF) {
      setError("Por favor selecciona un archivo PDF");
      return;
    }

    setSubiendoPDF(true);
    try {
      const formData = new FormData();
      formData.append("archivo", archivoPDF);
      formData.append("titulo", `Material PDF - ${new Date().toLocaleDateString("es-ES")}`);
      formData.append("descripcion", "Material subido desde Quiz IA");
      if (claseId) {
        formData.append("claseId", claseId);
      }

      await subirMaterial(formData);
      setArchivoPDF(null);
      document.getElementById("pdf-upload").value = "";
      setError(null);
      
      // Aquí podrías mostrar un mensaje de éxito
      console.log("✅ PDF subido exitosamente");
    } catch (error) {
      console.error("❌ Error subiendo PDF:", error);
      setError("Error al subir el PDF. Por favor intenta nuevamente.");
    } finally {
      setSubiendoPDF(false);
    }
  };

  // Crear quiz
  const crearQuiz = async () => {
    if (!formularioQuiz.titulo || !formularioQuiz.descripcion) {
      setError("Por favor completa todos los campos requeridos");
      return;
    }

    setLoading(true);
    try {
      // Aquí iría la llamada al backend para crear el quiz
      console.log("📝 Creando quiz:", formularioQuiz);
      
      // Simulación de creación
      const nuevoQuiz = {
        id: Date.now(),
        ...formularioQuiz,
        creado: new Date().toISOString(),
        publicado: false,
        participantes: 0,
        promedio: 0,
      };
      
      setQuizzes(prev => [...prev, nuevoQuiz]);
      setMostrarModalCrear(false);
      setFormularioQuiz({
        titulo: "",
        descripcion: "",
        instrucciones: "",
        duracion: 30,
        numeroPreguntas: 10,
        dificultad: "media",
      });
      setError(null);
    } catch (error) {
      console.error("❌ Error creando quiz:", error);
      setError("Error al crear el quiz. Por favor intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // Ver detalles del quiz
  const verDetallesQuiz = async (quiz) => {
    try {
      setLoading(true);
      setQuizSeleccionado(quiz);
      setMostrarModalDetalles(true);
    } catch (error) {
      console.error("❌ Error cargando detalles del quiz:", error);
      setError("Error al cargar los detalles del quiz");
    } finally {
      setLoading(false);
    }
  };

  // Editar quiz
  const editarQuiz = (quiz) => {
    setQuizSeleccionado(quiz);
    setFormularioQuiz({
      titulo: quiz.titulo,
      descripcion: quiz.descripcion,
      instrucciones: quiz.instrucciones || "",
      duracion: quiz.duracion,
      numeroPreguntas: quiz.numeroPreguntas,
      dificultad: quiz.dificultad,
    });
    setMostrarModalCrear(true);
  };

  // Eliminar quiz
  const eliminarQuiz = async (quizId) => {
    if (!window.confirm("¿Estás seguro de eliminar este quiz?")) {
      return;
    }

    try {
      // Aquí iría la llamada al backend para eliminar
      setQuizzes(prev => prev.filter(q => q.id !== quizId));
      setError(null);
    } catch (error) {
      console.error("❌ Error eliminando quiz:", error);
      setError("Error al eliminar el quiz");
    }
  };

  // Publicar quiz
  const publicarQuiz = async (quizId) => {
    try {
      // Aquí iría la llamada al backend para publicar
      setQuizzes(prev => prev.map(q => 
        q.id === quizId ? { ...q, publicado: true } : q
      ));
      setError(null);
    } catch (error) {
      console.error("❌ Error publicando quiz:", error);
      setError("Error al publicar el quiz");
    }
  };

  useEffect(() => {
    cargarInformacion();
  }, [cargarInformacion]);

  // Error boundary
  if (componentError) {
    return (
      <div className="min-h-screen p-6 bg-red-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-red-200 max-w-md">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-600" />
            <h2 className="text-xl font-bold text-red-800 mb-2">Error en Quiz AI</h2>
            <p className="text-red-600 mb-4">{componentError}</p>
            <button
              onClick={() => setComponentError(null)}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-linear-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-2 animate-bounce">🤖</div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-purple-600">
            Quiz con Inteligencia Artificial
          </h1>
          <p className="text-gray-600">
            {clase ? `Gestionando quizzes para ${clase.materia} - ${clase.grupo}` : "Gestiona quizzes automáticos con IA"}
          </p>
        </div>

        {/* Sección de subida de PDF */}
        <div className="mb-8 p-6 bg-white rounded-2xl border-2 border-indigo-200 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Subir Material para Quiz
            </h2>
            <button
              onClick={() => setMostrarModalCrear(true)}
              className="px-6 py-3 text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors flex items-center space-x-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Crear Quiz</span>
            </button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Archivo PDF (opcional)
              </label>
              <input
                id="pdf-upload"
                type="file"
                accept=".pdf"
                onChange={handleArchivoPDF}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              {archivoPDF && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700">
                    ✅ Archivo seleccionado: {archivoPDF.name}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-end">
              <button
                onClick={subirPDFDirecto}
                disabled={subiendoPDF || !archivoPDF}
                className="w-full px-6 py-3 text-white bg-purple-600 rounded-xl hover:bg-purple-700 disabled:bg-gray-400 transition-colors flex items-center justify-center space-x-2"
              >
                {subiendoPDF ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Subiendo...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Subir PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Listado de quizzes */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Brain className="w-6 h-6" />
              Quizzes Generados
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>{quizzes.length} quizzes</span>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="mt-2 text-indigo-600">Cargando quizzes...</p>
            </div>
          ) : quizzes.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No hay quizzes creados</h3>
              <p className="text-gray-500 mb-4">Comienza creando tu primer quiz con IA</p>
              <button
                onClick={() => setMostrarModalCrear(true)}
                className="px-6 py-3 text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors flex items-center space-x-2 mx-auto"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Crear Primer Quiz</span>
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {quizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="p-6 bg-white rounded-2xl border-2 border-indigo-100 hover:border-indigo-300 hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-gray-800">
                        {quiz.titulo}
                      </h3>
                      <span
                        className={`px-3 py-1 text-sm font-semibold rounded-full ${
                          quiz.publicado
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {quiz.publicado ? "Publicado" : "Borrador"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>{quiz.duracion} min</span>
                      <span className="text-gray-400">•</span>
                      <span>{quiz.numeroPreguntas} preguntas</span>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {quiz.descripcion}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">
                        {quiz.participantes} estudiantes
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm">
                        {quiz.promedio}% promedio
                      </span>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => verDetallesQuiz(quiz)}
                      className="flex-1 px-3 py-2 text-indigo-600 border-2 border-indigo-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-all flex items-center justify-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="text-xs">Ver</span>
                    </button>
                    <button
                      onClick={() => editarQuiz(quiz)}
                      className="flex-1 px-3 py-2 text-yellow-600 border-2 border-yellow-200 rounded-lg hover:bg-yellow-50 hover:border-yellow-300 transition-all flex items-center justify-center gap-1"
                    >
                      <Edit className="w-4 h-4" />
                      <span className="text-xs">Editar</span>
                    </button>
                    <button
                      onClick={() => eliminarQuiz(quiz.id)}
                      className="flex-1 px-3 py-2 text-red-600 border-2 border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-all flex items-center justify-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-xs">Eliminar</span>
                    </button>
                  </div>

                  {!quiz.publicado && (
                    <button
                      onClick={() => publicarQuiz(quiz.id)}
                      className="w-full mt-2 px-3 py-2 text-green-600 border-2 border-green-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-all flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      <span className="text-sm">Publicar Quiz</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal para crear/editar quiz */}
        {mostrarModalCrear && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  {quizSeleccionado ? "Editar Quiz" : "Crear Nuevo Quiz"}
                </h3>
                <button
                  onClick={() => {
                    setMostrarModalCrear(false);
                    setQuizSeleccionado(null);
                    setFormularioQuiz({
                      titulo: "",
                      descripcion: "",
                      instrucciones: "",
                      duracion: 30,
                      numeroPreguntas: 10,
                      dificultad: "media",
                    });
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); crearQuiz(); }}>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Título del Quiz *
                    </label>
                    <input
                      type="text"
                      name="titulo"
                      value={formularioQuiz.titulo}
                      onChange={handleFormularioChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Descripción *
                    </label>
                    <textarea
                      name="descripcion"
                      value={formularioQuiz.descripcion}
                      onChange={handleFormularioChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Instrucciones
                    </label>
                    <textarea
                      name="instrucciones"
                      value={formularioQuiz.instrucciones}
                      onChange={handleFormularioChange}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Instrucciones para los estudiantes..."
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Duración (minutos)
                    </label>
                    <input
                      type="number"
                      name="duracion"
                      value={formularioQuiz.duracion}
                      onChange={handleFormularioChange}
                      min="5"
                      max="120"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Número de Preguntas
                    </label>
                    <input
                      type="number"
                      name="numeroPreguntas"
                      value={formularioQuiz.numeroPreguntas}
                      onChange={handleFormularioChange}
                      min="1"
                      max="50"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Dificultad
                    </label>
                    <select
                      name="dificultad"
                      value={formularioQuiz.dificultad}
                      onChange={handleFormularioChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="fácil">Fácil</option>
                      <option value="media">Media</option>
                      <option value="difícil">Difícil</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setMostrarModalCrear(false);
                      setQuizSeleccionado(null);
                      setFormularioQuiz({
                        titulo: "",
                        descripcion: "",
                        instrucciones: "",
                        duracion: 30,
                        numeroPreguntas: 10,
                        dificultad: "media",
                      });
                    }}
                    className="px-6 py-3 text-gray-600 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors flex items-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>
                          {quizSeleccionado ? "Actualizar Quiz" : "Crear Quiz"}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de detalles */}
        {mostrarModalDetalles && quizSeleccionado && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  Detalles del Quiz
                </h3>
                <button
                  onClick={() => setMostrarModalDetalles(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="grid gap-6 md:grid-cols-2 mb-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Información General</h4>
                  <div className="space-y-2">
                    <p><strong>Título:</strong> {quizSeleccionado.titulo}</p>
                    <p><strong>Descripción:</strong> {quizSeleccionado.descripcion}</p>
                    <p><strong>Duración:</strong> {quizSeleccionado.duracion} minutos</p>
                    <p><strong>Preguntas:</strong> {quizSeleccionado.numeroPreguntas}</p>
                    <p><strong>Dificultad:</strong> {quizSeleccionado.dificultad}</p>
                    <p><strong>Creado:</strong> {new Date(quizSeleccionado.creado).toLocaleDateString("es-ES")}</p>
                  </div>
                </div>

                <div className="p-4 bg-indigo-50 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Estadísticas</h4>
                  <div className="space-y-2">
                    <p><strong>Estado:</strong> {quizSeleccionado.publicado ? "Publicado" : "Borrador"}</p>
                    <p><strong>Participantes:</strong> {quizSeleccionado.participantes}</p>
                    <p><strong>Promedio:</strong> {quizSeleccionado.promedio}%</p>
                    <div className="flex items-center gap-2 mt-4">
                      <BarChart3 className="w-4 h-4" />
                      <span className="text-sm text-gray-600">Ver análisis detallado</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setMostrarModalDetalles(false)}
                  className="px-6 py-3 text-gray-600 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mensajes de estado */}
        {error && (
          <div className="fixed bottom-4 right-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-lg z-50">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
