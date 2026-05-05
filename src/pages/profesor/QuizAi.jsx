import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  Brain,
  Trophy,
  BarChart3,
  Eye,
  AlertCircle,
} from "lucide-react";
import {
  getQuiz,
  getRanking,
  getResultados,
} from "../../services/profesorServices/quizAiService";

export default function QuizAi() {
  const { id } = useParams(); // id de la clase (opcional)

  // Estados principales
  const [quiz, setQuiz] = useState(null);
  const [ranking, setRanking] = useState([]);
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estados para modales
  const [mostrarRanking, setMostrarRanking] = useState(false);
  const [mostrarResultados, setMostrarResultados] = useState(false);

  // Obtener quiz
  const handleGetQuiz = async () => {
    if (!id) {
      setError("Por favor selecciona un quiz válido");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      console.log("📚 Obteniendo quiz:", id);
      const quizData = await getQuiz(id);
      setQuiz(quizData);
      console.log("✅ Quiz obtenido:", quizData);
    } catch (error) {
      console.error("❌ Error obteniendo quiz:", error);
      setError("Error al obtener el quiz. Por favor intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // Obtener ranking
  const handleGetRanking = async () => {
    if (!id) {
      setError("Por favor selecciona un quiz válido");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      console.log("🏆 Obteniendo ranking del quiz:", id);
      const rankingData = await getRanking(id);
      setRanking(rankingData);
      setMostrarRanking(true);
      console.log("✅ Ranking obtenido:", rankingData);
    } catch (error) {
      console.error("❌ Error obteniendo ranking:", error);
      setError("Error al obtener el ranking. Por favor intenta nuevamente.");
      
      // Datos simulados para demostración
      const rankingSimulado = [
        { id: 1, nombre: "Ana García", puntaje: 95, porcentaje: 95, tiempo: "28:45" },
        { id: 2, nombre: "María López", puntaje: 92, porcentaje: 92, tiempo: "25:30" },
        { id: 3, nombre: "Carlos Rodríguez", puntaje: 88, porcentaje: 88, tiempo: "30:12" },
        { id: 4, nombre: "Laura Sánchez", puntaje: 85, porcentaje: 85, tiempo: "29:20" },
        { id: 5, nombre: "Juan Martínez", puntaje: 78, porcentaje: 78, tiempo: "32:15" },
      ];
      setRanking(rankingSimulado);
      setMostrarRanking(true);
    } finally {
      setLoading(false);
    }
  };

  // Obtener resultados de todos los estudiantes
  const handleGetResultados = async () => {
    if (!id) {
      setError("Por favor selecciona un quiz válido");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      console.log("📊 Obteniendo resultados de todos los estudiantes:", id);
      const resultadosData = await getResultados(id);
      setResultados(resultadosData);
      setMostrarResultados(true);
      console.log("✅ Resultados obtenidos:", resultadosData);
    } catch (error) {
      console.error("❌ Error obteniendo resultados:", error);
      setError("Error al obtener los resultados. Por favor intenta nuevamente.");
      
      // Datos simulados para demostración
      const resultadosSimulados = [
        { 
          id: 1, 
          nombre: "Ana García", 
          puntaje: 95, 
          porcentaje: 95, 
          tiempo: "28:45",
          correctas: 19,
          incorrectas: 1,
          fecha: new Date().toISOString(),
        },
        { 
          id: 2, 
          nombre: "Carlos Rodríguez", 
          puntaje: 88, 
          porcentaje: 88, 
          tiempo: "30:12",
          correctas: 17,
          incorrectas: 3,
          fecha: new Date().toISOString(),
        },
        { 
          id: 3, 
          nombre: "María López", 
          puntaje: 92, 
          porcentaje: 92, 
          tiempo: "25:30",
          correctas: 18,
          incorrectas: 2,
          fecha: new Date().toISOString(),
        },
        { 
          id: 4, 
          nombre: "Juan Martínez", 
          puntaje: 78, 
          porcentaje: 78, 
          tiempo: "32:15",
          correctas: 15,
          incorrectas: 5,
          fecha: new Date().toISOString(),
        },
        { 
          id: 5, 
          nombre: "Laura Sánchez", 
          puntaje: 85, 
          porcentaje: 85, 
          tiempo: "29:20",
          correctas: 17,
          incorrectas: 3,
          fecha: new Date().toISOString(),
        },
      ];
      setResultados(resultadosSimulados);
      setMostrarResultados(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Background animado */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/20 to-pink-900/20">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Encabezado */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 drop-shadow-lg mb-4">
            QUIZ CONTROL CENTER
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            Sistema de Gestión de Quizzes
          </p>
          <div className="flex justify-center items-center gap-6 text-gray-400">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-500" />
              <span>Quiz ID: {id || "No seleccionado"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-500" />
              <span>Modo Control</span>
            </div>
          </div>
        </div>

        {/* Botones principales */}
        <div className="grid gap-6 md:grid-cols-3 mb-12">
          {/* Botón Generar Quiz */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
            <button
              onClick={handleGetQuiz}
              disabled={loading}
              className="relative w-full p-8 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-600 disabled:to-gray-700 transition-all transform hover:scale-105 shadow-xl shadow-blue-500/25"
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="p-4 bg-white/20 rounded-xl">
                  <Brain className="w-12 h-12 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Generar Quiz</h3>
                  <p className="text-sm text-blue-100">Obtener información del quiz</p>
                </div>
                {loading && (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                )}
              </div>
            </button>
          </div>

          {/* Botón Ranking */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
            <button
              onClick={handleGetRanking}
              disabled={loading}
              className="relative w-full p-8 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-2xl hover:from-yellow-600 hover:to-orange-600 disabled:from-gray-600 disabled:to-gray-700 transition-all transform hover:scale-105 shadow-xl shadow-yellow-500/25"
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="p-4 bg-white/20 rounded-xl">
                  <Trophy className="w-12 h-12 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Ver Ranking</h3>
                  <p className="text-sm text-yellow-100">Top de estudiantes</p>
                </div>
                {loading && (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                )}
              </div>
            </button>
          </div>

          {/* Botón Resultados */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
            <button
              onClick={handleGetResultados}
              disabled={loading}
              className="relative w-full p-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 transition-all transform hover:scale-105 shadow-xl shadow-purple-500/25"
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="p-4 bg-white/20 rounded-xl">
                  <BarChart3 className="w-12 h-12 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Resultados</h3>
                  <p className="text-sm text-purple-100">Todos los estudiantes</p>
                </div>
                {loading && (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Información del Quiz */}
        {quiz && (
          <div className="p-8 bg-gradient-to-r from-indigo-800/50 to-purple-800/50 backdrop-blur-lg rounded-3xl border-2 border-indigo-500/50 shadow-2xl shadow-indigo-500/25">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Información del Quiz</h2>
                <p className="text-gray-300">Detalles del quiz seleccionado</p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">{quiz.titulo || "Quiz sin título"}</h3>
                <p className="text-gray-300 mb-4">{quiz.descripcion || "Sin descripción"}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white/10 rounded-lg">
                    <p className="text-sm text-gray-400">Preguntas</p>
                    <p className="text-xl font-bold text-white">{quiz.numeroPreguntas || "N/A"}</p>
                  </div>
                  <div className="p-3 bg-white/10 rounded-lg">
                    <p className="text-sm text-gray-400">Duración</p>
                    <p className="text-xl font-bold text-white">{quiz.duracion || "N/A"} min</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
                    <Brain className="w-16 h-16 text-white" />
                  </div>
                  <p className="text-lg font-semibold text-white">Quiz Cargado</p>
                  <p className="text-sm text-gray-400">ID: {id}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Ranking */}
        {mostrarRanking && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-3xl p-8 max-w-4xl w-full mx-4 max-h-screen overflow-y-auto border-2 border-indigo-500/50 shadow-2xl shadow-indigo-500/25">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl">
                    <Trophy className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Ranking del Quiz</h3>
                    <p className="text-gray-300">Top de estudiantes</p>
                  </div>
                </div>
                <button
                  onClick={() => setMostrarRanking(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {ranking.map((estudiante, index) => (
                  <div key={estudiante.id} className="flex items-center justify-between p-4 bg-white/10 rounded-xl border border-indigo-500/30">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                        index === 0 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                        index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                        index === 2 ? 'bg-gradient-to-r from-orange-600 to-orange-700' :
                        'bg-gradient-to-r from-blue-500 to-blue-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-white">{estudiante.nombre}</p>
                        <p className="text-sm text-gray-400">Tiempo: {estudiante.tiempo}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-400">{estudiante.puntaje} pts</p>
                      <p className="text-sm text-gray-400">{estudiante.porcentaje}%</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setMostrarRanking(false)}
                  className="px-6 py-3 text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Resultados */}
        {mostrarResultados && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-3xl p-8 max-w-6xl w-full mx-4 max-h-screen overflow-y-auto border-2 border-indigo-500/50 shadow-2xl shadow-indigo-500/25">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                    <BarChart3 className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Resultados Completos</h3>
                    <p className="text-gray-300">Todos los estudiantes</p>
                  </div>
                </div>
                <button
                  onClick={() => setMostrarResultados(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {resultados.map((estudiante) => (
                  <div key={estudiante.id} className="p-4 bg-white/10 rounded-xl border border-purple-500/30">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                          {estudiante.nombre.charAt(0)}
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-white">{estudiante.nombre}</p>
                          <p className="text-sm text-gray-400">Fecha: {new Date(estudiante.fecha).toLocaleDateString("es-ES")}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-400">{estudiante.puntaje} pts</p>
                        <p className="text-sm text-gray-400">{estudiante.porcentaje}%</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-blue-400" />
                        <span className="text-blue-400">Tiempo: {estudiante.tiempo}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-400 rounded-full"></div>
                        <span className="text-green-400">{estudiante.correctas} correctas</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-400 rounded-full"></div>
                        <span className="text-red-400">{estudiante.incorrectas} incorrectas</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setMostrarResultados(false)}
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
