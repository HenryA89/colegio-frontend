import { useState, useEffect } from "react";
import {
  fetchReportes,
  generarReporteEstudiantes,
  generarReporteProfesores,
  generarReporteClases,
} from "../../services/adminServices/reportesService";

export default function Reportes() {
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // "estudiantes", "profesores", "clases"
  const [reporteData, setReporteData] = useState(null);

  // Filtros para generar reportes
  const [filtros, setFiltros] = useState({
    fechaInicio: "",
    fechaFin: "",
    curso: "",
    materia: "",
  });

  // Obtener reportes existentes
  const loadReportes = async () => {
    setLoading(true);
    setError("");
    try {
      const reportesData = await fetchReportes(localStorage.getItem("token"));
      setReportes(reportesData);
    } catch (err) {
      setError("No se pudieron cargar los reportes.");
      console.error("Error al cargar reportes:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadReportes();
  }, []);

  // Manejar cambios en los filtros
  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Generar reporte según el tipo
  const handleGenerarReporte = async (tipo) => {
    setLoading(true);
    setError("");

    try {
      let resultado;
      switch (tipo) {
        case "estudiantes":
          resultado = await generarReporteEstudiantes(filtros);
          break;
        case "profesores":
          resultado = await generarReporteProfesores(filtros);
          break;
        case "clases":
          resultado = await generarReporteClases(filtros);
          break;
        default:
          throw new Error("Tipo de reporte no válido");
      }

      setReporteData(resultado);
      setModalType(tipo);
      setShowModal(true);
    } catch (err) {
      setError(`Error al generar reporte de ${tipo}.`);
      console.error("Error:", err);
    }
    setLoading(false);
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setShowModal(false);
    setModalType("");
    setReporteData(null);
  };

  // Descargar reporte como JSON
  const handleDownloadJSON = () => {
    if (!reporteData) return;

    const dataStr = JSON.stringify(reporteData, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `reporte_${modalType}_${new Date().toISOString().split("T")[0]}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  // Descargar reporte como CSV
  const handleDownloadCSV = () => {
    if (!reporteData || !reporteData.datos) return;

    const datos = reporteData.datos;
    if (!Array.isArray(datos) || datos.length === 0) return;

    // Obtener encabezados
    const encabezados = Object.keys(datos[0]);

    // Crear CSV
    const csv = [
      encabezados.join(","),
      ...datos.map((fila) =>
        encabezados
          .map((header) => {
            const valor = fila[header];
            return typeof valor === "string" && valor.includes(",")
              ? `"${valor}"`
              : valor;
          })
          .join(","),
      ),
    ].join("\n");

    const dataUri = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    const exportFileDefaultName = `reporte_${modalType}_${new Date().toISOString().split("T")[0]}.csv`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  // Formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return "No especificada";
    return new Date(fecha).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">📑 Reportes y Estadísticas</h2>
        <p className="text-gray-600">
          Genera y consulta reportes generales del colegio.
        </p>
      </div>

      {error && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 border border-red-400 rounded-lg">
          {error}
        </div>
      )}

      {/* Sección de filtros */}
      <div className="p-4 mb-6 bg-white rounded-lg shadow">
        <h3 className="mb-4 text-lg font-semibold">Filtros para Reportes</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Inicio
            </label>
            <input
              type="date"
              name="fechaInicio"
              value={filtros.fechaInicio}
              onChange={handleFiltroChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Fin
            </label>
            <input
              type="date"
              name="fechaFin"
              value={filtros.fechaFin}
              onChange={handleFiltroChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Curso
            </label>
            <input
              type="text"
              name="curso"
              value={filtros.curso}
              onChange={handleFiltroChange}
              placeholder="Ej: 1° Año, 2° Año"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Materia
            </label>
            <input
              type="text"
              name="materia"
              value={filtros.materia}
              onChange={handleFiltroChange}
              placeholder="Nombre de la materia"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Botones para generar reportes */}
      <div className="p-4 mb-6 bg-white rounded-lg shadow">
        <h3 className="mb-4 text-lg font-semibold">Generar Reportes</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <button
            onClick={() => handleGenerarReporte("estudiantes")}
            disabled={loading}
            className="p-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
          >
            <div className="text-2xl mb-2">👥</div>
            <div className="font-semibold">Reporte de Estudiantes</div>
            <div className="text-sm opacity-90">
              Rendimiento académico y asistencia
            </div>
          </button>

          <button
            onClick={() => handleGenerarReporte("profesores")}
            disabled={loading}
            className="p-4 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-green-400 transition-colors"
          >
            <div className="text-2xl mb-2">👨‍🏫</div>
            <div className="font-semibold">Reporte de Profesores</div>
            <div className="text-sm opacity-90">Cargas y actividad docente</div>
          </button>

          <button
            onClick={() => handleGenerarReporte("clases")}
            disabled={loading}
            className="p-4 text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:bg-purple-400 transition-colors"
          >
            <div className="text-2xl mb-2">📚</div>
            <div className="font-semibold">Reporte de Clases</div>
            <div className="text-sm opacity-90">
              Asistencia y rendimiento por materia
            </div>
          </button>
        </div>
      </div>

      {/* Lista de reportes existentes */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Reportes Generados</h3>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Cargando reportes...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Generación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Filtros Aplicados
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registros
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportes.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No hay reportes generados. Crea tu primer reporte.
                    </td>
                  </tr>
                ) : (
                  reportes.map((reporte, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            reporte.tipo === "estudiantes"
                              ? "bg-blue-100 text-blue-800"
                              : reporte.tipo === "profesores"
                                ? "bg-green-100 text-green-800"
                                : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {reporte.tipo}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatearFecha(reporte.fechaGeneracion)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          {reporte.filtros
                            ? Object.keys(reporte.filtros)
                                .map((key) => `${key}: ${reporte.filtros[key]}`)
                                .join(", ")
                            : "Sin filtros"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {reporte.totalRegistros || 0} registros
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal para mostrar resultados del reporte */}
      {showModal && reporteData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-4xl p-6 bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Resultados del Reporte de {modalType}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Resumen del reporte */}
            <div className="p-4 mb-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">Resumen</h4>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                <div>
                  <span className="text-sm text-gray-600">
                    Total de Registros:
                  </span>
                  <span className="ml-2 font-semibold">
                    {reporteData.total || 0}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">
                    Fecha de Generación:
                  </span>
                  <span className="ml-2 font-semibold">
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Tipo:</span>
                  <span className="ml-2 font-semibold capitalize">
                    {modalType}
                  </span>
                </div>
              </div>
            </div>

            {/* Tabla de datos del reporte */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {reporteData.datos &&
                      reporteData.datos.length > 0 &&
                      Object.keys(reporteData.datos[0]).map((header, index) => (
                        <th
                          key={index}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reporteData.datos &&
                    reporteData.datos.map((fila, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        {Object.values(fila).map((valor, cellIndex) => (
                          <td
                            key={cellIndex}
                            className="px-6 py-4 whitespace-nowrap"
                          >
                            <div className="text-sm text-gray-900">
                              {valor !== null && valor !== undefined
                                ? valor
                                : "-"}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Botones de descarga */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleDownloadJSON}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Descargar JSON
              </button>
              <button
                onClick={handleDownloadCSV}
                className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                Descargar CSV
              </button>
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
