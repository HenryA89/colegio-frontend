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
  Trophy,
  Target,
  Flame,
  Medal,
  Crown,
  Star,
  Award,
  Rocket,
  Swords,
  Shield,
  Lightning,
  Fire,
  Gem,
  Dragon,
  SwordsCrossed,
} from "lucide-react";
import { fetchClases } from "../../services/profesorServices/clasesService";
import { subirMaterial } from "../../services/profesorServices/clasesService";
import {
  getQuiz,
  submitQuiz,
  getRanking,
  generarQuizIA,
  getResultadosQuiz,
  getPodium,
  publicarQuiz,
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
  const [mostrarModalResultados, setMostrarModalResultados] = useState(false);
  const [mostrarModalPodium, setMostrarModalPodium] = useState(false);
  const [quizSeleccionado, setQuizSeleccionado] = useState(null);

  // Estados para datos
  const [resultados, setResultados] = useState([]);
  const [podium, setPodium] = useState([]);

  // Estados para formulario
  const [formularioQuiz, setFormularioQuiz] = useState({
    titulo: "",
    descripcion: "",
    instrucciones: "",
    duracion: 30,
    numeroPreguntas: 10,
    dificultad: "media",
    tema: "",
  });

  // Estados para subida de PDF
  const [archivoPDF, setArchivoPDF] = useState(null);
  const [subiendoPDF, setSubiendoPDF] = useState(false);
  const [generandoQuiz, setGenerandoQuiz] = useState(false);

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
          tema: "Aritmética",
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
          tema: "Historia",
        },
        {
          id: 3,
          titulo: "Quiz de Ciencias Naturales",
          descripcion: "Explorando el mundo natural",
          duracion: 25,
          numeroPreguntas: 8,
          dificultad: "fácil",
          creado: new Date().toISOString(),
          publicado: true,
          participantes: 12,
          promedio: 92,
          tema: "Biología",
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
      
      console.log("✅ PDF subido exitosamente");
    } catch (error) {
      console.error("❌ Error subiendo PDF:", error);
      setError("Error al subir el PDF. Por favor intenta nuevamente.");
    } finally {
      setSubiendoPDF(false);
    }
  };

  // Generar Quiz con IA
  const generarQuizConIA = async () => {
    if (!formularioQuiz.titulo || !formularioQuiz.descripcion || !formularioQuiz.tema) {
      setError("Por favor completa todos los campos requeridos");
      return;
    }

    setGenerandoQuiz(true);
    try {
      console.log("🤖 Generando quiz con IA:", formularioQuiz);
      
      // Llamar al servicio para generar quiz
      const quizGenerado = await generarQuizIA({
        ...formularioQuiz,
        claseId: claseId,
        archivoPDF: archivoPDF,
      });

      // Simulación de generación (mientras el backend no esté listo)
      const nuevoQuiz = {
        id: Date.now(),
        ...formularioQuiz,
        creado: new Date().toISOString(),
        publicado: false,
        participantes: 0,
        promedio: 0,
        preguntas: quizGenerado?.preguntas || [],
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
        tema: "",
      });
      setArchivoPDF(null);
      setError(null);
      
      console.log("✅ Quiz generado con IA exitosamente");
    } catch (error) {
      console.error("❌ Error generando quiz con IA:", error);
      setError("Error al generar el quiz con IA. Por favor intenta nuevamente.");
    } finally {
      setGenerandoQuiz(false);
    }
  };

  // Obtener resultados del quiz
  const obtenerResultadosQuiz = async (quiz) => {
    try {
      setLoading(true);
      setQuizSeleccionado(quiz);
      
      console.log("📊 Obteniendo resultados del quiz:", quiz.id);
      
      // Simulación de resultados (mientras el backend no esté listo)
      const resultadosSimulados = [
        {
          id: 1,
          nombre: "Ana García",
          puntaje: 95,
          porcentaje: 95,
          tiempo: "28:45",
          fecha: new Date().toISOString(),
          correctas: 19,
          incorrectas: 1,
        },
        {
          id: 2,
          nombre: "Carlos Rodríguez",
          puntaje: 88,
          porcentaje: 88,
          tiempo: "30:12",
          fecha: new Date().toISOString(),
          correctas: 17,
          incorrectas: 3,
        },
        {
          id: 3,
          nombre: "María López",
          puntaje: 92,
          porcentaje: 92,
          tiempo: "25:30",
          fecha: new Date().toISOString(),
          correctas: 18,
          incorrectas: 2,
        },
        {
          id: 4,
          nombre: "Juan Martínez",
          puntaje: 78,
          porcentaje: 78,
          tiempo: "32:15",
          fecha: new Date().toISOString(),
          correctas: 15,
          incorrectas: 5,
        },
        {
          id: 5,
          nombre: "Laura Sánchez",
          puntaje: 85,
          porcentaje: 85,
          tiempo: "29:20",
          fecha: new Date().toISOString(),
          correctas: 17,
          incorrectas: 3,
        },
      ];
      
      setResultados(resultadosSimulados);
      setMostrarModalResultados(true);
      
      // Cuando el backend esté listo, usar:
      // const resultadosData = await getResultadosQuiz(quiz.id);
      // setResultados(resultadosData);
      
    } catch (error) {
      console.error("❌ Error obteniendo resultados:", error);
      setError("Error al obtener los resultados del quiz");
    } finally {
      setLoading(false);
    }
  };

  // Obtener podium del quiz
  const obtenerPodiumQuiz = async (quiz) => {
    try {
      setLoading(true);
      setQuizSeleccionado(quiz);
      
      console.log("🏆 Obteniendo podium del quiz:", quiz.id);
      
      // Simulación de podium (mientras el backend no esté listo)
      const podiumSimulado = [
        {
          posicion: 1,
          nombre: "Ana García",
          puntaje: 95,
          porcentaje: 95,
          tiempo: "28:45",
          medalla: "🥇",
        },
        {
          posicion: 2,
          nombre: "María López",
          puntaje: 92,
          porcentaje: 92,
          tiempo: "25:30",
          medalla: "🥈",
        },
        {
          posicion: 3,
          nombre: "Carlos Rodríguez",
          puntaje: 88,
          porcentaje: 88,
          tiempo: "30:12",
          medalla: "🥉",
        },
      ];
      
      setPodium(podiumSimulado);
      setMostrarModalPodium(true);
      
      // Cuando el backend esté listo, usar:
      // const podiumData = await getPodium(quiz.id);
      // setPodium(podiumData);
      
    } catch (error) {
      console.error("❌ Error obteniendo podium:", error);
      setError("Error al obtener el podium del quiz");
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
      tema: quiz.tema || "",
    });
    setMostrarModalCrear(true);
  };

  // Eliminar quiz
  const eliminarQuiz = async (quizId) => {
    if (!window.confirm("¿Estás seguro de eliminar este quiz?")) {
      return;
    }

    try {
      setQuizzes(prev => prev.filter(q => q.id !== quizId));
      setError(null);
    } catch (error) {
      console.error("❌ Error eliminando quiz:", error);
      setError("Error al eliminar el quiz");
    }
  };

  // Publicar quiz
  const publicarQuizAction = async (quizId) => {
    try {
      await publicarQuiz(quizId);
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
    <div className="min-h-screen p-6 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Background animado */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/20 to-pink-900/20">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Encabezado con diseño competitivo */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center gap-4 mb-4">
            <div className="relative">
              <Dragon className="w-16 h-16 text-yellow-400 animate-bounce" />
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
            </div>
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 drop-shadow-lg">
              QUIZ COMPETITION
            </h1>
            <div className="relative">
              <Swords className="w-16 h-16 text-yellow-400 animate-pulse" />
              <div className="absolute -top-2 -left-2 w-4 h-4 bg-orange-500 rounded-full animate-ping"></div>
            </div>
          </div>
          <p className="text-xl text-gray-300 mb-2">
            {clase ? `Batalla de Quizzes - ${clase.materia} - ${clase.grupo}` : "Arena de Quizzes con IA"}
          </p>
          <div className="flex justify-center items-center gap-6 text-gray-400">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <span>Competencia Activa</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span>Campeonato en Curso</span>
            </div>
            <div className="flex items-center gap-2">
              <Lightning className="w-5 h-5 text-blue-500" />
              <span>Modo Batalla</span>
            </div>
          </div>
        </div>

        {/* Sección de generación de quiz */}
        <div className="mb-12 p-8 bg-gradient-to-r from-purple-800/50 to-indigo-800/50 backdrop-blur-lg rounded-3xl border-2 border-purple-500/50 shadow-2xl shadow-purple-500/25">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl">
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Generador de Quiz IA</h2>
                <p className="text-gray-300">Crea quizzes automáticos con inteligencia artificial</p>
              </div>
            </div>
            <button
              onClick={() => setMostrarModalCrear(true)}
              className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 flex items-center space-x-3 font-bold shadow-lg shadow-green-500/25"
            >
              <Brain className="w-6 h-6" />
              <span>Generar Quiz IA</span>
              <Zap className="w-6 h-6" />
            </button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Material PDF (opcional)
              </label>
              <input
                id="pdf-upload"
                type="file"
                accept=".pdf"
                onChange={handleArchivoPDF}
                className="w-full px-4 py-3 bg-white/10 border border-purple-500/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
              />
              {archivoPDF && (
                <div className="mt-2 p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
                  <p className="text-sm text-green-300 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Archivo listo: {archivoPDF.name}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-end">
              <button
                onClick={subirPDFDirecto}
                disabled={subiendoPDF || !archivoPDF}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 transition-all transform hover:scale-105 flex items-center justify-center space-x-2 font-semibold"
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

        {/* Arena de Quizzes */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl">
                <SwordsCrossed className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">Arena de Quizzes</h2>
                <p className="text-gray-300">Batallas en curso y resultados</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-white">
              <div className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg font-bold">
                <Flame className="w-4 h-4 inline mr-2" />
                {quizzes.length} Quizzes Activos
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-purple-500"></div>
              <p className="mt-4 text-purple-400 text-lg">Cargando arena de batalla...</p>
            </div>
          ) : quizzes.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="w-24 h-24 mx-auto mb-6 text-gray-600" />
              <h3 className="text-2xl font-bold text-gray-400 mb-4">No hay batallas activas</h3>
              <p className="text-gray-500 mb-6">Inicia la primera competencia generando un quiz</p>
              <button
                onClick={() => setMostrarModalCrear(true)}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 flex items-center space-x-3 font-bold mx-auto"
              >
                <PlusCircle className="w-6 h-6" />
                <span>Iniciar Primera Batalla</span>
                <Flame className="w-6 h-6" />
              </button>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {quizzes.map((quiz, index) => (
                <div
                  key={quiz.id}
                  className="group relative"
                >
                  {/* Card principal con diseño competitivo */}
                  <div className="relative p-6 bg-gradient-to-br from-purple-800/60 to-indigo-800/60 backdrop-blur-lg rounded-2xl border-2 border-purple-500/50 hover:border-purple-400 hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 transform hover:scale-105">
                    {/* Efecto de brillo */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Header del quiz */}
                    <div className="relative mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            quiz.publicado 
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                              : 'bg-gradient-to-r from-yellow-500 to-orange-500'
                          }`}>
                            {quiz.publicado ? (
                              <Play className="w-5 h-5 text-white" />
                            ) : (
                              <Clock className="w-5 h-5 text-white" />
                            )}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white">{quiz.titulo}</h3>
                            <p className="text-sm text-gray-300">{quiz.tema || quiz.descripcion}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(3)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${
                                i < (quiz.dificultad === 'fácil' ? 1 : quiz.dificultad === 'media' ? 2 : 3)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-600'
                              }`} 
                            />
                          ))}
                        </div>
                      </div>

                      {/* Stats del quiz */}
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="text-center p-2 bg-white/10 rounded-lg">
                          <Target className="w-4 h-4 mx-auto mb-1 text-blue-400" />
                          <p className="text-xs text-gray-300">Preguntas</p>
                          <p className="text-sm font-bold text-white">{quiz.numeroPreguntas}</p>
                        </div>
                        <div className="text-center p-2 bg-white/10 rounded-lg">
                          <Clock className="w-4 h-4 mx-auto mb-1 text-green-400" />
                          <p className="text-xs text-gray-300">Tiempo</p>
                          <p className="text-sm font-bold text-white">{quiz.duracion}m</p>
                        </div>
                        <div className="text-center p-2 bg-white/10 rounded-lg">
                          <Users className="w-4 h-4 mx-auto mb-1 text-purple-400" />
                          <p className="text-xs text-gray-300">Guerreros</p>
                          <p className="text-sm font-bold text-white">{quiz.participantes}</p>
                        </div>
                      </div>

                      {/* Barra de progreso */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>Progreso de la batalla</span>
                          <span>{quiz.promedio}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${quiz.promedio}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Botones de acción */}
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => obtenerResultadosQuiz(quiz)}
                          className="px-3 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all transform hover:scale-105 flex flex-col items-center gap-1 text-xs font-semibold"
                        >
                          <BarChart3 className="w-4 h-4" />
                          <span>Resultados</span>
                        </button>
                        <button
                          onClick={() => obtenerPodiumQuiz(quiz)}
                          className="px-3 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all transform hover:scale-105 flex flex-col items-center gap-1 text-xs font-semibold"
                        >
                          <Trophy className="w-4 h-4" />
                          <span>Podium</span>
                        </button>
                        <button
                          onClick={() => verDetallesQuiz(quiz)}
                          className="px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 flex flex-col items-center gap-1 text-xs font-semibold"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Ver</span>
                        </button>
                      </div>
                    </div>

                    {/* Efecto de fuego animado */}
                    {quiz.publicado && (
                      <div className="absolute -top-2 -right-2">
                        <div className="relative">
                          <Flame className="w-8 h-8 text-orange-500 animate-pulse" />
                          <div className="absolute inset-0 w-8 h-8 bg-orange-500 rounded-full animate-ping opacity-75"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal para generar quiz con IA */}
        {mostrarModalCrear && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-3xl p-8 max-w-4xl w-full mx-4 max-h-screen overflow-y-auto border-2 border-purple-500/50 shadow-2xl shadow-purple-500/25">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Generador de Quiz IA</h3>
                    <p className="text-gray-300">Crea un quiz automático con inteligencia artificial</p>
                  </div>
                </div>
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
                      tema: "",
                    });
                    setArchivoPDF(null);
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); generarQuizConIA(); }}>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="block mb-2 text-sm font-medium text-gray-300">
                      Título del Quiz *
                    </label>
                    <input
                      type="text"
                      name="titulo"
                      value={formularioQuiz.titulo}
                      onChange={handleFormularioChange}
                      className="w-full px-4 py-3 bg-white/10 border border-purple-500/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                      placeholder="Ej: Quiz de Matemáticas Básicas"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block mb-2 text-sm font-medium text-gray-300">
                      Tema del Quiz *
                    </label>
                    <input
                      type="text"
                      name="tema"
                      value={formularioQuiz.tema}
                      onChange={handleFormularioChange}
                      className="w-full px-4 py-3 bg-white/10 border border-purple-500/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                      placeholder="Ej: Aritmética, Álgebra, Geometría"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block mb-2 text-sm font-medium text-gray-300">
                      Descripción *
                    </label>
                    <textarea
                      name="descripcion"
                      value={formularioQuiz.descripcion}
                      onChange={handleFormularioChange}
                      rows={3}
                      className="w-full px-4 py-3 bg-white/10 border border-purple-500/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                      placeholder="Describe el contenido y objetivos del quiz"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block mb-2 text-sm font-medium text-gray-300">
                      Instrucciones para los estudiantes
                    </label>
                    <textarea
                      name="instrucciones"
                      value={formularioQuiz.instrucciones}
                      onChange={handleFormularioChange}
                      rows={2}
                      className="w-full px-4 py-3 bg-white/10 border border-purple-500/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                      placeholder="Instrucciones específicas para resolver el quiz"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-300">
                      Duración (minutos)
                    </label>
                    <input
                      type="number"
                      name="duracion"
                      value={formularioQuiz.duracion}
                      onChange={handleFormularioChange}
                      min="5"
                      max="120"
                      className="w-full px-4 py-3 bg-white/10 border border-purple-500/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-300">
                      Número de Preguntas
                    </label>
                    <input
                      type="number"
                      name="numeroPreguntas"
                      value={formularioQuiz.numeroPreguntas}
                      onChange={handleFormularioChange}
                      min="1"
                      max="50"
                      className="w-full px-4 py-3 bg-white/10 border border-purple-500/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block mb-2 text-sm font-medium text-gray-300">
                      Dificultad
                    </label>
                    <select
                      name="dificultad"
                      value={formularioQuiz.dificultad}
                      onChange={handleFormularioChange}
                      className="w-full px-4 py-3 bg-white/10 border border-purple-500/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                    >
                      <option value="fácil" className="bg-purple-900">Fácil</option>
                      <option value="media" className="bg-purple-900">Media</option>
                      <option value="difícil" className="bg-purple-900">Difícil</option>
                    </select>
                  </div>
                </div>

                <div className="mt-8 flex justify-end space-x-4">
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
                        tema: "",
                      });
                      setArchivoPDF(null);
                    }}
                    className="px-6 py-3 text-gray-300 border-2 border-gray-600 rounded-xl hover:bg-gray-800 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={generandoQuiz}
                    className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 transition-all transform hover:scale-105 flex items-center space-x-3 font-bold shadow-lg shadow-green-500/25"
                  >
                    {generandoQuiz ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Generando con IA...</span>
                      </>
                    ) : (
                      <>
                        <Brain className="w-5 h-5" />
                        <span>Generar Quiz con IA</span>
                        <Zap className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de resultados */}
        {mostrarModalResultados && quizSeleccionado && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-3xl p-8 max-w-6xl w-full mx-4 max-h-screen overflow-y-auto border-2 border-purple-500/50 shadow-2xl shadow-purple-500/25">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
                    <BarChart3 className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Resultados del Quiz</h3>
                    <p className="text-gray-300">{quizSeleccionado.titulo} - Estadísticas completas</p>
                  </div>
                </div>
                <button
                  onClick={() => setMostrarModalResultados(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {resultados.map((resultado, index) => (
                  <div key={resultado.id} className="p-4 bg-white/10 rounded-xl border border-purple-500/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-white">{resultado.nombre}</p>
                          <p className="text-sm text-gray-400">Tiempo: {resultado.tiempo}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-400">{resultado.puntaje} pts</p>
                        <p className="text-sm text-gray-400">{resultado.porcentaje}%</p>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-green-400">{resultado.correctas} correctas</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-400" />
                        <span className="text-red-400">{resultado.incorrectas} incorrectas</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setMostrarModalResultados(false)}
                  className="px-6 py-3 text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de podium */}
        {mostrarModalPodium && quizSeleccionado && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-3xl p-8 max-w-4xl w-full mx-4 border-2 border-purple-500/50 shadow-2xl shadow-purple-500/25">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl">
                    <Trophy className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                      PODIUM DE CAMPEONES
                    </h3>
                    <p className="text-gray-300">{quizSeleccionado.titulo} - Top 3 Guerreros</p>
                  </div>
                </div>
                <button
                  onClick={() => setMostrarModalPodium(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="relative">
                {/* Efecto de celebración */}
                <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
                  <div className="text-6xl animate-bounce">🎉</div>
                </div>

                {/* Podium */}
                <div className="flex items-end justify-center gap-8 mb-8">
                  {/* Segundo lugar */}
                  <div className="text-center">
                    <div className="relative">
                      <div className="w-32 h-40 bg-gradient-to-b from-gray-400 to-gray-600 rounded-t-lg flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-20 h-20 bg-gradient-to-r from-gray-300 to-gray-500 rounded-full flex items-center justify-center mb-2 mx-auto">
                            <span className="text-3xl">🥈</span>
                          </div>
                          <p className="text-white font-bold">{podium[1]?.nombre}</p>
                          <p className="text-gray-300 text-sm">{podium[1]?.puntaje} pts</p>
                        </div>
                      </div>
                      <div className="text-center mt-2">
                        <p className="text-2xl font-black text-gray-400">2°</p>
                      </div>
                    </div>
                  </div>

                  {/* Primer lugar */}
                  <div className="text-center transform scale-110">
                    <div className="relative">
                      <div className="w-32 h-48 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-t-lg flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-24 h-24 bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center mb-2 mx-auto animate-pulse">
                            <span className="text-4xl">🥇</span>
                          </div>
                          <p className="text-white font-bold text-lg">{podium[0]?.nombre}</p>
                          <p className="text-yellow-200 font-semibold">{podium[0]?.puntaje} pts</p>
                        </div>
                      </div>
                      <div className="text-center mt-2">
                        <p className="text-3xl font-black text-yellow-400">1°</p>
                      </div>
                    </div>
                  </div>

                  {/* Tercer lugar */}
                  <div className="text-center">
                    <div className="relative">
                      <div className="w-32 h-32 bg-gradient-to-b from-orange-600 to-orange-800 rounded-t-lg flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-orange-700 rounded-full flex items-center justify-center mb-2 mx-auto">
                            <span className="text-3xl">🥉</span>
                          </div>
                          <p className="text-white font-bold">{podium[2]?.nombre}</p>
                          <p className="text-gray-300 text-sm">{podium[2]?.puntaje} pts</p>
                        </div>
                      </div>
                      <div className="text-center mt-2">
                        <p className="text-2xl font-black text-orange-400">3°</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Estadísticas adicionales */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-white/10 rounded-xl">
                  {podium.map((participante, index) => (
                    <div key={participante.posicion} className="text-center">
                      <p className="text-sm text-gray-400 mb-1">Tiempo</p>
                      <p className="text-lg font-semibold text-white">{participante.tiempo}</p>
                      <p className="text-sm text-gray-400 mt-1">Porcentaje</p>
                      <p className="text-lg font-semibold text-green-400">{participante.porcentaje}%</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => setMostrarModalPodium(false)}
                  className="px-8 py-3 text-white bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all transform hover:scale-105 font-bold"
                >
                  Cerrar Podium
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de detalles */}
        {mostrarModalDetalles && quizSeleccionado && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-3xl p-8 max-w-4xl w-full mx-4 max-h-screen overflow-y-auto border-2 border-purple-500/50 shadow-2xl shadow-purple-500/25">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                    <Eye className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Detalles del Quiz</h3>
                    <p className="text-gray-300">{quizSeleccionado.titulo}</p>
                  </div>
                </div>
                <button
                  onClick={() => setMostrarModalDetalles(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="grid gap-6 md:grid-cols-2 mb-6">
                <div className="p-6 bg-white/10 rounded-xl">
                  <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Información General
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-400">Título</p>
                      <p className="text-white font-semibold">{quizSeleccionado.titulo}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Descripción</p>
                      <p className="text-white">{quizSeleccionado.descripcion}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Tema</p>
                      <p className="text-white">{quizSeleccionado.tema || "No especificado"}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-sm text-gray-400">Duración</p>
                        <p className="text-white font-semibold">{quizSeleccionado.duracion} min</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Preguntas</p>
                        <p className="text-white font-semibold">{quizSeleccionado.numeroPreguntas}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Dificultad</p>
                      <div className="flex items-center gap-1">
                        {[...Array(3)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${
                              i < (quizSeleccionado.dificultad === 'fácil' ? 1 : quizSeleccionado.dificultad === 'media' ? 2 : 3)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-600'
                            }`} 
                          />
                        ))}
                        <span className="ml-2 text-white capitalize">{quizSeleccionado.dificultad}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-white/10 rounded-xl">
                  <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Estadísticas de Batalla
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-400">Estado</p>
                      <p className={`font-semibold ${
                        quizSeleccionado.publicado ? 'text-green-400' : 'text-yellow-400'
                      }`}>
                        {quizSeleccionado.publicado ? '🔥 Activo' : '⚡ En preparación'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Participantes</p>
                      <p className="text-white font-semibold">{quizSeleccionado.participantes} guerreros</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Promedio</p>
                      <p className="text-white font-semibold">{quizSeleccionado.promedio}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Fecha de creación</p>
                      <p className="text-white">{new Date(quizSeleccionado.creado).toLocaleDateString("es-ES")}</p>
                    </div>
                    <div className="pt-3">
                      <button
                        onClick={() => publicarQuizAction(quizSeleccionado.id)}
                        disabled={quizSeleccionado.publicado}
                        className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 transition-all font-semibold"
                      >
                        {quizSeleccionado.publicado ? '✅ Ya publicado' : '🚀 Publicar Batalla'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  onClick={() => editarQuiz(quizSeleccionado)}
                  className="px-6 py-3 text-yellow-400 border-2 border-yellow-500/50 rounded-xl hover:bg-yellow-500/20 transition-all"
                >
                  <Edit className="w-4 h-4 inline mr-2" />
                  Editar
                </button>
                <button
                  onClick={() => eliminarQuiz(quizSeleccionado.id)}
                  className="px-6 py-3 text-red-400 border-2 border-red-500/50 rounded-xl hover:bg-red-500/20 transition-all"
                >
                  <Trash2 className="w-4 h-4 inline mr-2" />
                  Eliminar
                </button>
                <button
                  onClick={() => setMostrarModalDetalles(false)}
                  className="px-6 py-3 text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mensajes de estado */}
        {error && (
          <div className="fixed bottom-4 right-4 p-4 bg-red-500/90 backdrop-blur-sm border border-red-500/50 text-white rounded-lg shadow-xl z-50">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
