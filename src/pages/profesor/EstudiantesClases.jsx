import jsPDF from "jspdf";
import "jspdf-autotable";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Users,
  Download,
  Search,
  UserPlus,
  TrendingUp,
  Award,
  FileText,
} from "lucide-react";
import { useAuth } from "../../hooks/UseAuth";
import {
  fetchEstudiantesPorClase,
  fetchResultadosEstudiantes,
  fetchResultadosPorClase,
  inscribirEstudiante,
  eliminarEstudianteDeClase,
  fetchEstadisticasClase,
} from "../../services/profesorServices/estudiantesClasesService";

export default function EstudiantesClases() {
  const { id } = useParams(); // id de la clase
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [estudiantes, setEstudiantes] = useState([]);
  const [resultados, setResultados] = useState([]);
  const [estadisticas, setEstadisticas] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingEstudiantes, setLoadingEstudiantes] = useState(true);
  const [error, setError] = useState("");
  const [filtroId, setFiltroId] = useState("");
  const [filtroGrado, setFiltroGrado] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevoEstudiante, setNuevoEstudiante] = useState({
    nombre: "",
    email: "",
    identificacion: "",
  });

  useEffect(() => {
    if (!id) {
      navigate("/profesor/clases", { replace: true });
    }
  }, [id, navigate]);

  // Cargar resultados académicos
  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const cargarResultados = async () => {
      setLoading(true);
      setError("");
      try {
        // Intentar cargar resultados específicos de la clase primero
        const resultadosClase = await fetchResultadosPorClase(id);
        setResultados(resultadosClase);

        // Si no hay resultados específicos, cargar generales
        if (resultadosClase.length === 0) {
          const resultadosGenerales = await fetchResultadosEstudiantes();
          setResultados(resultadosGenerales);
        }
      } catch (err) {
        setError("No se pudieron cargar los resultados de los estudiantes.");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };
    cargarResultados();
  }, [id]);

  // Cargar estudiantes de la clase
  useEffect(() => {
    if (!id) {
      setLoadingEstudiantes(false);
      return;
    }

    const cargarEstudiantes = async () => {
      setLoadingEstudiantes(true);
      try {
        const estudiantesData = await fetchEstudiantesPorClase(id);
        setEstudiantes(estudiantesData);

        // Cargar estadísticas de la clase
        const estadisticasData = await fetchEstadisticasClase(id);
        setEstadisticas(estadisticasData);
      } catch (error) {
        console.error("Error cargando estudiantes:", error);
      } finally {
        setLoadingEstudiantes(false);
      }
    };
    cargarEstudiantes();
  }, [id]);

  // Filtrar por ID y grado
  const resultadosFiltrados = resultados.filter((est) => {
    const idMatch = filtroId ? est.id.toString().includes(filtroId) : true;
    const gradoMatch = filtroGrado
      ? est.grado.toLowerCase().includes(filtroGrado.toLowerCase())
      : true;
    return idMatch && gradoMatch;
  });

  // Exportar a PDF mejorado
  const exportarPDF = () => {
    const doc = new jsPDF();

    // Encabezado
    doc.setFontSize(16);
    doc.text("Resumen de Resultados de Estudiantes", 14, 16);

    // Información de la clase
    doc.setFontSize(10);
    doc.text(`Clase ID: ${id}`, 14, 24);
    doc.text(`Fecha: ${new Date().toLocaleDateString("es-ES")}`, 14, 30);

    // Tabla de resultados
    const tableColumn = [
      "ID",
      "Nombre",
      "Grado",
      "Evaluaciones",
      "Actividades Diarias",
      "Otras Actividades",
    ];
    const tableRows = resultadosFiltrados.map((est) => [
      est.id,
      est.nombre,
      est.grado,
      est.evaluaciones?.map((ev) => `${ev.titulo}: ${ev.puntaje}`).join("; ") ||
        "-",
      est.diarias?.map((act) => `${act.titulo}: ${act.puntaje}`).join("; ") ||
        "-",
      est.actividades
        ?.map((act) => `${act.titulo}: ${act.puntaje}`)
        .join("; ") || "-",
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
    });

    // Estadísticas
    if (Object.keys(estadisticas).length > 0) {
      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      doc.text("Estadísticas de la Clase", 14, finalY);
      doc.setFontSize(10);
      doc.text(`Total Estudiantes: ${estudiantes.length}`, 14, finalY + 7);
      doc.text(
        `Promedio General: ${estadisticas.promedioGeneral || "N/A"}`,
        14,
        finalY + 14,
      );
      doc.text(
        `Asistencia General: ${estadisticas.asistenciaGeneral || "N/A"}%`,
        14,
        finalY + 21,
      );
    }

    doc.save(`resultados_estudiantes_clase_${id}.pdf`);
  };

  // Manejo de inscripción
  const handleInscripcion = async () => {
    try {
      await inscribirEstudiante(id, nuevoEstudiante);
      setMostrarModal(false);
      setNuevoEstudiante({ nombre: "", email: "", identificacion: "" });
      // Recargar estudiantes
      const estudiantesData = await fetchEstudiantesPorClase(id);
      setEstudiantes(estudiantesData);
    } catch (error) {
      setError("Error al inscribir estudiante");
      console.error("Error:", error);
    }
  };

  // Eliminar estudiante
  const handleEliminarEstudiante = async (estudianteId) => {
    if (
      window.confirm("¿Estás seguro de eliminar a este estudiante de la clase?")
    ) {
      try {
        await eliminarEstudianteDeClase(id, estudianteId);
        // Recargar estudiantes
        const estudiantesData = await fetchEstudiantesPorClase(id);
        setEstudiantes(estudiantesData);
      } catch (error) {
        setError("Error al eliminar estudiante");
        console.error("Error:", error);
      }
    }
  };

  // Manejo del formulario
  const handleInputChange = (e) => {
    setNuevoEstudiante({
      ...nuevoEstudiante,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen p-6 bg-linear-to-br from-indigo-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-2 animate-bounce">📊</div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-purple-600">
            Resultados Académicos y Gestión de Clase
          </h1>
          <p className="text-gray-600">
            Visualiza resultados académicos y gestiona los estudiantes de tu
            clase
          </p>
        </div>

        {/* Estadísticas de la clase */}
        {Object.keys(estadisticas).length > 0 && (
          <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-4">
            <div className="p-6 bg-white rounded-2xl border-2 border-indigo-100 hover:border-indigo-300 hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-8 h-8 text-indigo-600" />
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

            <div className="p-6 bg-white rounded-2xl border-2 border-green-100 hover:border-green-300 hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-8 h-8 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-gray-800">
                    {estadisticas.promedioGeneral || "N/A"}
                  </div>
                  <div className="text-sm text-gray-600">Promedio General</div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white rounded-2xl border-2 border-blue-100 hover:border-blue-300 hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-8 h-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-gray-800">
                    {estadisticas.asistenciaGeneral || "N/A"}%
                  </div>
                  <div className="text-sm text-gray-600">
                    Asistencia General
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white rounded-2xl border-2 border-purple-100 hover:border-purple-300 hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div className="flex items-center gap-3 mb-2">
                <Download className="w-8 h-8 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold text-gray-800">PDF</div>
                  <div className="text-sm text-gray-600">Exportar Reporte</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sección de Resultados Académicos */}
        <div className="mb-8 p-8 bg-white rounded-3xl shadow-2xl border-2 border-transparent bg-linear-to-br from-indigo-50 to-purple-50 hover:border-indigo-300 hover:shadow-xl hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-purple-600">
              📈 Resultados Académicos
            </h2>
            <button
              onClick={exportarPDF}
              className="px-6 py-3 text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Exportar PDF</span>
            </button>
            <button
              onClick={() => navigate(`/profesor/evaluaciones-clase/${id}`)}
              className="px-6 py-3 text-white bg-cyan-600 rounded-xl hover:bg-cyan-700 transition-colors flex items-center space-x-2"
            >
              <FileText className="w-4 h-4" />
              <span>Gestionar Evaluaciones</span>
            </button>
          </div>

          {/* Filtros */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filtrar por identificación..."
                  value={filtroId}
                  onChange={(e) => setFiltroId(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-indigo-200 rounded-xl focus:ring-4 focus:ring-indigo-300 focus:border-indigo-400 transition-all"
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filtrar por grado..."
                  value={filtroGrado}
                  onChange={(e) => setFiltroGrado(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-indigo-200 rounded-xl focus:ring-4 focus:ring-indigo-300 focus:border-indigo-400 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Mensajes de estado */}
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="mt-2 text-indigo-600">Cargando resultados...</p>
            </div>
          )}
          {error && (
            <div className="p-4 mb-6 text-red-700 bg-red-100 border border-red-400 rounded-lg">
              ❌ {error}
            </div>
          )}

          {/* Tabla de resultados */}
          {!loading && !error && (
            <div className="overflow-x-auto bg-white rounded-2xl border-2 border-gray-200 shadow-lg">
              {resultadosFiltrados.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4 animate-bounce">📋</div>
                  <p className="text-xl text-gray-600">
                    No hay resultados para los filtros seleccionados.
                  </p>
                </div>
              ) : (
                <table className="min-w-full">
                  <thead className="bg-linear-to-r from-indigo-50 to-purple-50">
                    <tr>
                      <th className="px-6 py-3 font-semibold text-left text-indigo-700">
                        ID
                      </th>
                      <th className="px-6 py-3 font-semibold text-left text-indigo-700">
                        Nombre
                      </th>
                      <th className="px-6 py-3 font-semibold text-left text-indigo-700">
                        Grado
                      </th>
                      <th className="px-6 py-3 font-semibold text-left text-indigo-700">
                        Evaluaciones
                      </th>
                      <th className="px-6 py-3 font-semibold text-left text-indigo-700">
                        Actividades Diarias
                      </th>
                      <th className="px-6 py-3 font-semibold text-left text-indigo-700">
                        Otras Actividades
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultadosFiltrados.map((est, idx) => (
                      <tr
                        key={est.id}
                        className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}
                      >
                        <td className="px-6 py-4 text-gray-800">{est.id}</td>
                        <td className="px-6 py-4 text-gray-800">
                          {est.nombre}
                        </td>
                        <td className="px-6 py-4 text-gray-800">{est.grado}</td>
                        <td className="px-6 py-4">
                          {est.evaluaciones?.length > 0 ? (
                            <ul className="pl-4 list-disc">
                              {est.evaluaciones.map((ev, i) => (
                                <li key={i} className="mb-1 text-blue-700">
                                  {ev.titulo}:{" "}
                                  <span className="font-bold text-green-700">
                                    {ev.puntaje}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-gray-500">
                              Sin evaluaciones
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {est.diarias?.length > 0 ? (
                            <ul className="pl-4 list-disc">
                              {est.diarias.map((act, i) => (
                                <li key={i} className="mb-1 text-yellow-700">
                                  {act.titulo}:{" "}
                                  <span className="font-bold text-green-700">
                                    {act.puntaje}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-gray-500">
                              Sin actividades
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {est.actividades?.length > 0 ? (
                            <ul className="pl-4 list-disc">
                              {est.actividades.map((act, i) => (
                                <li key={i} className="mb-1 text-purple-700">
                                  {act.titulo}:{" "}
                                  <span className="font-bold text-green-700">
                                    {act.puntaje}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-gray-500">
                              Sin actividades
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

        {/* Sección de Estudiantes de la Clase */}
        <div className="p-8 bg-white rounded-3xl shadow-2xl border-2 border-transparent bg-linear-to-br from-purple-50 to-pink-50 hover:border-purple-300 hover:shadow-xl hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-pink-600">
              👥 Estudiantes de la Clase
            </h2>
            <button
              onClick={() => setMostrarModal(true)}
              className="px-6 py-3 text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Inscribir Estudiante</span>
            </button>
          </div>

          {loadingEstudiantes ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <p className="mt-2 text-purple-600">Cargando estudiantes...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {estudiantes.map((est) => (
                <div
                  key={est.id}
                  className="p-6 bg-white rounded-2xl border-2 border-purple-100 hover:border-purple-300 hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-lg font-bold text-purple-700">
                      {est.nombre.split(" ")[0]}
                    </div>
                    <button
                      onClick={() => handleEliminarEstudiante(est.id)}
                      className="text-red-600 hover:text-red-700 transition-colors"
                    >
                      ❌
                    </button>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1">
                      {est.nombre}
                    </h3>
                    <p className="text-sm text-gray-600">📧 {est.email}</p>
                    {est.identificacion && (
                      <p className="text-sm text-gray-600">
                        🆔 {est.identificacion}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {estudiantes.length === 0 && !loadingEstudiantes && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 animate-bounce">👥</div>
              <p className="text-xl text-gray-600">
                Esta clase no tiene estudiantes inscritos.
              </p>
            </div>
          )}
        </div>

        {/* Modal para inscribir estudiante */}
        {mostrarModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                Inscribir Nuevo Estudiante
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={nuevoEstudiante.nombre}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-400 transition-all"
                    placeholder="Ej: Juan Pérez"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={nuevoEstudiante.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-400 transition-all"
                    placeholder="ejemplo@email.com"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Identificación
                  </label>
                  <input
                    type="text"
                    name="identificacion"
                    value={nuevoEstudiante.identificacion}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-400 transition-all"
                    placeholder="Ej: 123456789"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setMostrarModal(false)}
                  className="flex-1 px-4 py-3 text-gray-600 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleInscripcion}
                  className="flex-1 px-4 py-3 text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors"
                >
                  Inscribir
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
