import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
} from "lucide-react";
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
import { fetchClases } from "../../services/profesorServices/clasesService";

export default function EvaluacionesClase() {
  const { id } = useParams(); // id de la clase
  const navigate = useNavigate(); // hook de navegación
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [clases, setClases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generandoEvaluacion, setGenerandoEvaluacion] = useState(false);
  const [error, setError] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalEvaluacion, setMostrarModalEvaluacion] = useState(false);
  const [editingEvaluacion, setEditingEvaluacion] = useState(null);
  const [evaluacionSeleccionada, setEvaluacionSeleccionada] = useState(null);
  const [mostrarDetalles, setMostrarDetalles] = useState(false);
  const [resultados, setResultados] = useState([]);
  const [estadisticas, setEstadisticas] = useState({});
  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    fecha: "",
    hora: "",
    tipo: "examen",
    duracion: 60,
    publicado: false,
  });

  // Cargar clases del profesor
  const cargarClases = async () => {
    try {
      const clasesData = await fetchClases();
      setClases(clasesData);
    } catch (error) {
      console.error("Error cargando clases:", error);
    }
  };

  // Cargar información inicial
  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const cargarInformacion = async () => {
      setLoading(true);
      try {
        // Cargar evaluaciones manuales
        const evaluacionesData = await fetchEvaluacionesClase(id);
        setEvaluaciones(evaluacionesData);

        // Cargar las clases del profesor
        await cargarClases();
      } catch (error) {
        setError("Error cargando información inicial");
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarInformacion();
  }, [id, fetchEvaluacionesClase, cargarClases]);

  // Manejo del formulario de evaluación manual
  const handleInputChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Crear nueva evaluación manual
  const handleCrearEvaluacion = async () => {
    setGenerandoEvaluacion(true);
    setError("");

    try {
      const evaluacionData = {
        ...form,
        claseId: id,
      };

      await crearEvaluacionClase(evaluacionData);
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

      // Recargar evaluaciones
      const evaluacionesData = await fetchEvaluacionesClase(id);
      setEvaluaciones(evaluacionesData);
    } catch (error) {
      setError("Error creando evaluación");
      console.error("Error:", error);
    } finally {
      setGenerandoEvaluacion(false);
    }
  };

  // Editar evaluación
  const handleEditarEvaluacion = (evaluacion) => {
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

  // Actualizar evaluación
  const handleActualizarEvaluacion = async () => {
    setGenerandoEvaluacion(true);
    setError("");

    try {
      const evaluacionData = {
        ...form,
        claseId: id,
      };

      await actualizarEvaluacionClase(editingEvaluacion.id, evaluacionData);
      setMostrarModal(false);
      setEditingEvaluacion(null);
      setForm({
        titulo: "",
        descripcion: "",
        fecha: "",
        hora: "",
        tipo: "examen",
        duracion: 60,
        publicado: false,
      });

      // Recargar evaluaciones
      const evaluacionesData = await fetchEvaluacionesClase(id);
      setEvaluaciones(evaluacionesData);
    } catch (error) {
      setError("Error actualizando evaluación");
      console.error("Error:", error);
    } finally {
      setGenerandoEvaluacion(false);
    }
  };

  // Eliminar evaluación
  const handleEliminarEvaluacion = async (evaluacionId) => {
    if (window.confirm("¿Estás seguro de eliminar esta evaluación?")) {
      try {
        await eliminarEvaluacionClase(evaluacionId);
        
        // Recargar evaluaciones
        const evaluacionesData = await fetchEvaluacionesClase(id);
        setEvaluaciones(evaluacionesData);
      } catch (error) {
        setError("Error eliminando evaluación");
        console.error("Error:", error);
      }
    }
  };

  // Publicar evaluación
  const handlePublicarEvaluacion = async (evaluacionId) => {
    try {
      await publicarEvaluacion(evaluacionId);
      
      // Recargar evaluaciones
      const evaluacionesData = await fetchEvaluacionesClase(id);
      setEvaluaciones(evaluacionesData);
    } catch (error) {
      setError("Error publicando evaluación");
      console.error("Error:", error);
    }
  };

  // Ver detalles de evaluación
  const handleVerDetalles = async (evaluacion) => {
    try {
      setLoading(true);
      const [detallesData, respuestasData] = await Promise.all([
        fetchDetallesEvaluacion(evaluacion.id),
        fetchRespuestasEvaluacionClase(evaluacion.id),
      ]);

      setEvaluacionSeleccionada({
        ...evaluacion,
        ...detallesData,
        respuestas: respuestasData,
      });

      // Cargar estadísticas
      const estadisticasData = await fetchEstadisticasEvaluacion(evaluacion.id);
      setEstadisticas(estadisticasData);

      setMostrarDetalles(true);
    } catch (error) {
      setError("Error cargando detalles de evaluación");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-linear-to-br from-purple-50 via-pink-50 to-rose-50">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-2 animate-bounce">📝</div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600">
            Evaluaciones Manuales
          </h1>
          <p className="text-gray-600">
            Crea y gestiona evaluaciones manuales para tus clases
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
                onClick={() => setMostrarModalEvaluacion(true)}
                className="px-6 py-3 text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Brain className="w-4 h-4" />
                <span>Generar Evaluación</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
              <p className="mt-2 text-purple-600">
                Analizando material reciente...
              </p>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No hay material reciente disponible</p>
            </div>
          )}
        </div>

        {/* Listado de evaluaciones */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              📋 Evaluaciones Manuales
            </h2>
            <button
              onClick={() => setMostrarModal(true)}
              className="px-6 py-3 text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Nueva Evaluación</span>
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-blue-600">Cargando evaluaciones...</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {evaluaciones.map((evaluacion) => (
                <div
                  key={evaluacion.id}
                  className="p-6 bg-white rounded-2xl border-2 border-blue-100 hover:border-blue-300 hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-gray-800">
                        {evaluacion.titulo}
                      </h3>
                      <span
                        className={`px-3 py-1 text-sm font-semibold rounded-full ${
                          evaluacion.publicado
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {evaluacion.publicado ? "Publicado" : "Borrador"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">
                        {new Date(evaluacion.fecha).toLocaleDateString("es-ES")}
                      </span>
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{evaluacion.hora}</span>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {evaluacion.descripcion}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">
                        {evaluacion.numeroEstudiantes || 0} estudiantes
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm">
                        {evaluacion.duracion} min
                      </span>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleVerDetalles(evaluacion)}
                      className="flex-1 px-3 py-2 text-blue-600 border-2 border-blue-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="text-sm">Detalles</span>
                    </button>
                    <button
                      onClick={() => handleEditarEvaluacion(evaluacion)}
                      className="flex-1 px-3 py-2 text-yellow-600 border-2 border-yellow-200 rounded-lg hover:bg-yellow-50 hover:border-yellow-300 transition-all flex items-center justify-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      <span className="text-sm">Editar</span>
                    </button>
                    <button
                      onClick={() => handleEliminarEvaluacion(evaluacion.id)}
                      className="flex-1 px-3 py-2 text-red-600 border-2 border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-all flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-sm">Eliminar</span>
                    </button>
                  </div>

                  {!evaluacion.publicado && (
                    <button
                      onClick={() => handlePublicarEvaluacion(evaluacion.id)}
                      className="w-full mt-3 px-3 py-2 text-green-600 border-2 border-green-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">Publicar</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal para crear/editar evaluación */}
        {mostrarModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  {editingEvaluacion
                    ? "Editar Evaluación"
                    : "Nueva Evaluación"}
                </h3>
                <button
                  onClick={() => {
                    setMostrarModal(false);
                    setEditingEvaluacion(null);
                    setForm({
                      titulo: "",
                      descripcion: "",
                      fecha: "",
                      hora: "",
                      tipo: "examen",
                      duracion: 60,
                      publicado: false,
                    });
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={editingEvaluacion ? handleActualizarEvaluacion : handleCrearEvaluacion}>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Título
                    </label>
                    <input
                      type="text"
                      name="titulo"
                      value={form.titulo}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Tipo
                    </label>
                    <select
                      name="tipo"
                      value={form.tipo}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="examen">Examen</option>
                      <option value="quiz">Quiz</option>
                      <option value="trabajo">Trabajo</option>
                      <option value="proyecto">Proyecto</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Descripción
                    </label>
                    <textarea
                      name="descripcion"
                      value={form.descripcion}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Fecha
                    </label>
                    <input
                      type="date"
                      name="fecha"
                      value={form.fecha}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Hora
                    </label>
                    <input
                      type="time"
                      name="hora"
                      value={form.hora}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Duración (minutos)
                    </label>
                    <input
                      type="number"
                      name="duracion"
                      value={form.duracion}
                      onChange={handleInputChange}
                      min="1"
                      max="300"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setMostrarModal(false);
                      setEditingEvaluacion(null);
                      setForm({
                        titulo: "",
                        descripcion: "",
                        fecha: "",
                        hora: "",
                        tipo: "examen",
                        duracion: 60,
                        publicado: false,
                      });
                    }}
                    className="px-6 py-3 text-gray-600 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={generandoEvaluacion}
                    className="px-6 py-3 text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center space-x-2"
                  >
                    {generandoEvaluacion ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>
                          {editingEvaluacion ? "Actualizando..." : "Creando..."}
                        </span>
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-4 h-4" />
                        <span>
                          {editingEvaluacion ? "Actualizar Evaluación" : "Crear Evaluación"}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal para generar evaluación */}
        {mostrarModalEvaluacion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  Generar Evaluación con IA
                </h3>
                <button
                  onClick={() => setMostrarModalEvaluacion(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="text-center py-8">
                <Brain className="w-16 h-16 mx-auto mb-4 text-blue-600" />
                <p className="text-gray-600 mb-4">
                  Esta función está en desarrollo. Próximamente podrás generar evaluaciones automáticas con inteligencia artificial.
                </p>
                <button
                  onClick={() => setMostrarModalEvaluacion(false)}
                  className="px-6 py-3 text-gray-600 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de detalles */}
        {mostrarDetalles && evaluacionSeleccionada && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  Detalles de Evaluación
                </h3>
                <button
                  onClick={() => setMostrarDetalles(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="grid gap-6 md:grid-cols-2 mb-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Información General</h4>
                  <div className="space-y-2">
                    <p><strong>Título:</strong> {evaluacionSeleccionada.titulo}</p>
                    <p><strong>Descripción:</strong> {evaluacionSeleccionada.descripcion}</p>
                    <p><strong>Tipo:</strong> {evaluacionSeleccionada.tipo}</p>
                    <p><strong>Fecha:</strong> {new Date(evaluacionSeleccionada.fecha).toLocaleDateString("es-ES")}</p>
                    <p><strong>Hora:</strong> {evaluacionSeleccionada.hora}</p>
                    <p><strong>Duración:</strong> {evaluacionSeleccionada.duracion} minutos</p>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Estadísticas</h4>
                  <div className="space-y-2">
                    <p><strong>Total Estudiantes:</strong> {estadisticas.totalEstudiantes || 0}</p>
                    <p><strong>Completaron:</strong> {estadisticas.completaron || 0}</p>
                    <p><strong>Promedio:</strong> {estadisticas.promedio || 0}%</p>
                    <p><strong>Tasa de Aprobación:</strong> {estadisticas.tasaAprobacion || 0}%</p>
                  </div>
                </div>
              </div>

              {/* Respuestas de estudiantes */}
              {evaluacionSeleccionada.respuestas && evaluacionSeleccionada.respuestas.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-4">Respuestas de Estudiantes</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Estudiante
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Puntaje
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Correctas
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tiempo
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Estado
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {resultados.map((resultado, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {resultado.estudiante}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {resultado.puntaje}%
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {resultado.correctas}/{resultado.total}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {resultado.tiempo}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  resultado.estado === "aprobado"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
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

              <div className="flex justify-end">
                <button
                  onClick={() => setMostrarDetalles(false)}
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
          <div className="p-4 mb-6 text-red-700 bg-red-100 border border-red-400 rounded-lg">
            Error: {error}
          </div>
        )}
      </div>
    </div>
  );
}
