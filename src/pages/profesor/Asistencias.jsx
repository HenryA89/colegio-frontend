import { useState, useEffect } from "react";
import {
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "../../hooks/UseAuth";
import {
  fetchEstudiantesClase,
  registrarAsistencia,
  fetchHistorialAsistencia,
  fetchEstadisticasAsistencia,
} from "../../services/profesorServices/asistenciasService";

export default function Asistencias() {
  const { usuario } = useAuth();
  const [asistencias, setAsistencias] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [estadisticas, setEstadisticas] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingAsistencia, setLoadingAsistencia] = useState(false);
  const [error, setError] = useState("");
  const [selectedClase, setSelectedClase] = useState("");
  const [asistenciaData, setAsistenciaData] = useState({});
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  // Cargar estudiantes de una clase
  const cargarEstudiantes = async () => {
    if (!selectedClase) return;

    try {
      const estudiantesData = await fetchEstudiantesClase(selectedClase);
      setEstudiantes(estudiantesData);

      // Cargar estadísticas de la clase
      const estadisticasData = await fetchEstadisticasAsistencia(selectedClase);
      setEstadisticas(estadisticasData);
    } catch (error) {
      setError("Error cargando estudiantes de la clase");
      console.error("Error:", error);
    }
  };

  // Cargar historial de asistencia
  const cargarHistorial = async () => {
    if (!selectedClase) return;

    try {
      const historialData = await fetchHistorialAsistencia(selectedClase);
      setAsistencias(historialData);
    } catch (error) {
      setError("Error cargando historial de asistencia");
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    if (selectedClase) {
      setLoading(true);
      Promise.all([cargarEstudiantes(), cargarHistorial()]).finally(() =>
        setLoading(false),
      );
    }
  }, [selectedClase]);

  // Manejar registro de asistencia
  const handleAsistenciaChange = (estudianteId, presente) => {
    setAsistenciaData((prev) => ({
      ...prev,
      [estudianteId]: presente,
    }));
  };

  // Guardar asistencia
  const guardarAsistencia = async () => {
    if (!selectedClase || Object.keys(asistenciaData).length === 0) {
      setError(
        "Seleccione una clase y registre asistencia para al menos un estudiante",
      );
      return;
    }

    setLoadingAsistencia(true);
    try {
      const asistenciaArray = Object.entries(asistenciaData).map(
        ([estudianteId, presente]) => ({
          estudianteId,
          presente,
          fecha: new Date().toISOString().split("T")[0],
        }),
      );

      await registrarAsistencia(selectedClase, {
        asistencias: asistenciaArray,
      });
      setAsistenciaData({});
      setMostrarFormulario(false);
      cargarHistorial(); // Recargar historial
      setEstadisticas((prev) => ({
        ...prev,
        ultimaActualizacion: new Date().toLocaleString("es-ES"),
      }));
    } catch (error) {
      setError("Error registrando asistencia");
      console.error("Error:", error);
    } finally {
      setLoadingAsistencia(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-linear-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-2 animate-bounce">📋</div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-green-600 to-blue-600">
            Control de Asistencia
          </h1>
          <p className="text-gray-600">
            Gestiona la asistencia de tus estudiantes y visualiza estadísticas
            en tiempo real
          </p>
        </div>

        {/* Selector de clase */}
        <div className="mb-8 p-6 bg-white rounded-2xl border-2 border-green-200 shadow-lg">
          <label className="block mb-2 font-medium text-gray-700 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Seleccionar Clase
          </label>
          <select
            value={selectedClase}
            onChange={(e) => setSelectedClase(e.target.value)}
            className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:ring-4 focus:ring-green-300 focus:border-green-400 transition-all"
          >
            <option value="">Seleccione una clase...</option>
            <option value="clase1">Matemáticas - 3A</option>
            <option value="clase2">Ciencias - 2B</option>
            <option value="clase3">Historia - 1A</option>
          </select>
        </div>

        {/* Estadísticas */}
        {selectedClase && Object.keys(estadisticas).length > 0 && (
          <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
            {/* Card 1 */}
            <div className="p-6 bg-white rounded-2xl border-2 border-blue-100 hover:border-blue-300 hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-8 h-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-gray-800">
                    {estudiantes.length}
                  </div>
                  <div className="text-sm text-gray-600">
                    Estudiantes Totales
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-6 bg-white rounded-2xl border-2 border-green-100 hover:border-green-300 hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-gray-800">
                    {estadisticas.asistenciaGeneral || 0}%
                  </div>
                  <div className="text-sm text-gray-600">
                    Asistencia General
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="p-6 bg-white rounded-2xl border-2 border-purple-100 hover:border-purple-300 hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-8 h-8 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold text-gray-800">
                    {estadisticas.mejora || 0}%
                  </div>
                  <div className="text-sm text-gray-600">Mejora Semanal</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Formulario de registro rápido */}
        {selectedClase && estudiantes.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Registro Rápido de Asistencia
              </h2>
              <button
                onClick={() => setMostrarFormulario(!mostrarFormulario)}
                className="px-4 py-2 text-blue-600 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
              >
                {mostrarFormulario
                  ? "Ocultar Formulario"
                  : "Mostrar Formulario"}
              </button>
            </div>

            {mostrarFormulario && (
              <div className="p-6 bg-white rounded-2xl border-2 border-blue-200 shadow-lg">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                  {estudiantes.map((estudiante) => (
                    <div key={estudiante.id} className="text-center">
                      <div className="mb-2">
                        <div className="w-12 h-12 mx-auto rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-700">
                          {estudiante.nombre.split(" ")[0]}
                        </div>
                        <div className="text-xs text-gray-600">
                          {estudiante.nombre}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`asistencia-${estudiante.id}`}
                            checked={asistenciaData[estudiante.id] === true}
                            onChange={() =>
                              handleAsistenciaChange(estudiante.id, true)
                            }
                            className="w-4 h-4 text-green-600"
                          />
                          <span className="text-sm text-green-700">
                            Presente
                          </span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`asistencia-${estudiante.id}`}
                            checked={asistenciaData[estudiante.id] === false}
                            onChange={() =>
                              handleAsistenciaChange(estudiante.id, false)
                            }
                            className="w-4 h-4 text-red-600"
                          />
                          <span className="text-sm text-red-700">Ausente</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setAsistenciaData({})}
                    className="px-6 py-3 text-gray-600 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Limpiar Selección
                  </button>
                  <button
                    onClick={guardarAsistencia}
                    disabled={loadingAsistencia}
                    className="px-6 py-3 text-white bg-green-600 rounded-xl hover:bg-green-700 disabled:bg-green-400 transition-colors flex items-center space-x-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>
                      {loadingAsistencia
                        ? "Guardando..."
                        : "Guardar Asistencia"}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mensajes de estado */}
        {error && (
          <div className="p-4 mb-6 text-red-700 bg-red-100 border border-red-400 rounded-lg">
            ❌ {error}
          </div>
        )}

        {/* Historial de asistencia */}
        {selectedClase && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Historial de Asistencia
              </h2>
              <div className="text-sm text-gray-600">
                Última actualización:{" "}
                {estadisticas.ultimaActualizacion || "N/A"}
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-blue-600">Cargando historial...</p>
              </div>
            ) : (
              <div className="overflow-x-auto bg-white rounded-2xl border-2 border-gray-200 shadow-lg">
                {asistencias.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4 animate-bounce">📅</div>
                    <p className="text-xl text-gray-600">
                      No hay registros de asistencia para esta clase.
                    </p>
                  </div>
                ) : (
                  <table className="min-w-full">
                    <thead className="bg-linear-to-r from-blue-50 to-purple-50">
                      <tr>
                        <th className="px-6 py-3 font-semibold text-left text-blue-700">
                          Estudiante
                        </th>
                        <th className="px-6 py-3 font-semibold text-left text-blue-700">
                          Fecha
                        </th>
                        <th className="px-6 py-3 font-semibold text-left text-blue-700">
                          Estado
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {asistencias.map((asistencia, idx) => (
                        <tr
                          key={idx}
                          className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}
                        >
                          <td className="px-6 py-4 text-gray-800">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              {asistencia.estudiante}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-800">
                            {new Date(asistencia.fecha).toLocaleDateString(
                              "es-ES",
                              {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              },
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {asistencia.presente ? (
                              <span className="inline-flex items-center gap-2 px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-700">
                                <CheckCircle className="w-4 h-4" />
                                Presente
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-2 px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-700">
                                <XCircle className="w-4 h-4" />
                                Ausente
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
