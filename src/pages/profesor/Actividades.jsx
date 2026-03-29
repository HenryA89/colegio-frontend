import { useState, useEffect } from "react";
import { PlusCircle, Edit, Trash2, Users, FileText } from "lucide-react";
import { useAuth } from "../../hooks/UseAuth";
import {
  fetchActividadesProfesor,
  crearActividad,
  actualizarActividad,
  eliminarActividad,
  fetchRespuestasActividad,
} from "../../services/profesorServices/actividadesService";

export default function ActividadesProfesor() {
  const { usuario } = useAuth();
  const [actividades, setActividades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingActividades, setLoadingActividades] = useState(true);
  const [error, setError] = useState("");
  const [actividadGuardada, setActividadGuardada] = useState(false);
  const [editingActividad, setEditingActividad] = useState(null);
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    materia: "",
    fecha_entrega: "",
    tipo: "tarea",
  });

  // Cargar actividades usando el servicio
  const cargarActividades = async () => {
    try {
      const actividadesData = await fetchActividadesProfesor();
      setActividades(actividadesData);
    } catch (error) {
      setError("Error cargando actividades");
      console.error("Error:", error);
    } finally {
      setLoadingActividades(false);
    }
  };

  useEffect(() => {
    cargarActividades();
  }, []);

  const guardarActividad = async () => {
    setLoading(true);
    setError("");
    try {
      if (editingActividad) {
        // Actualizar actividad existente
        await actualizarActividad(editingActividad.id, formData);
        setEditingActividad(null);
        setActividadGuardada(true);
        setFormData({
          titulo: "",
          descripcion: "",
          materia: "",
          fecha_entrega: "",
          tipo: "tarea",
        });
      } else {
        // Crear nueva actividad
        await crearActividad(formData);
        setActividadGuardada(true);
        setFormData({
          titulo: "",
          descripcion: "",
          materia: "",
          fecha_entrega: "",
          tipo: "tarea",
        });
      }
      cargarActividades();
    } catch (err) {
      setError("No se pudo guardar la actividad. Intenta nuevamente.");
      console.error("Error:", err);
    }
    setLoading(false);
  };

  // Manejo del formulario
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const editarActividad = (actividad) => {
    setEditingActividad(actividad);
    setFormData({
      titulo: actividad.titulo || "",
      descripcion: actividad.descripcion || "",
      materia: actividad.materia || "",
      fecha_entrega: actividad.fecha_entrega || "",
      tipo: actividad.tipo || "tarea",
    });
  };

  const cancelarEdicion = () => {
    setEditingActividad(null);
    setFormData({
      titulo: "",
      descripcion: "",
      materia: "",
      fecha_entrega: "",
      tipo: "tarea",
    });
  };

  const eliminarActividadHandler = async (actividadId) => {
    if (window.confirm("¿Estás seguro de eliminar esta actividad?")) {
      try {
        await eliminarActividad(actividadId);
        cargarActividades();
        setActividadGuardada(true);
        setTimeout(() => setActividadGuardada(false), 3000);
      } catch (error) {
        setError("Error eliminando actividad");
        console.error("Error:", error);
      }
    }
  };

  return (
    <div className="min-h-screen p-6 bg-linear-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="max-w-6xl mx-auto">
        {/* Encabezado */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-pink-600">
            📝 Gestión de Actividades
          </h1>
          <button
            onClick={() => setEditingActividad({})}
            className="px-6 py-3 text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors flex items-center space-x-2"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Nueva Actividad</span>
          </button>
        </div>

        {/* Formulario de creación/edición */}
        <div className="mb-8 p-8 rounded-3xl shadow-2xl border-2 border-transparent bg-linear-to-br from-purple-50 to-pink-50 hover:border-purple-300 hover:shadow-xl hover:scale-105 transition-all duration-300">
          <h2 className="text-2xl font-bold text-center mb-6 text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-pink-600">
            {editingActividad
              ? "✏️ Editar Actividad"
              : "📝 Crear Nueva Actividad"}
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Título de la Actividad
              </label>
              <input
                type="text"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-400 transition-all"
                placeholder="Ej: Tarea de Matemáticas"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Materia
              </label>
              <input
                type="text"
                name="materia"
                value={formData.materia}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-400 transition-all"
                placeholder="Ej: Matemáticas"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Tipo de Actividad
              </label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-400 transition-all"
              >
                <option value="tarea">Tarea</option>
                <option value="proyecto">Proyecto</option>
                <option value="evaluacion">Evaluación</option>
                <option value="lectura">Lectura</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Fecha de Entrega
              </label>
              <input
                type="datetime-local"
                name="fecha_entrega"
                value={formData.fecha_entrega}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-400 transition-all"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block mb-2 font-medium text-gray-700">
              Descripción / Enunciado
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              className="w-full p-4 border-2 border-purple-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-400 transition-all"
              rows={6}
              placeholder="Describe el objetivo o contexto de la actividad..."
            />
          </div>

          <div className="flex gap-3 mt-6">
            {editingActividad && (
              <button
                onClick={cancelarEdicion}
                className="px-6 py-3 text-gray-600 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            )}
            <button
              onClick={guardarActividad}
              className="flex-1 px-6 py-3 text-white bg-purple-600 rounded-xl hover:bg-purple-700 disabled:bg-purple-400 transition-colors flex items-center justify-center space-x-2"
              disabled={
                loading ||
                !formData.titulo.trim() ||
                !formData.descripcion.trim()
              }
            >
              <span>
                {loading
                  ? "Guardando..."
                  : editingActividad
                    ? "Actualizar Actividad"
                    : "Crear Actividad"}
              </span>
            </button>
          </div>
        </div>

        {/* Mensajes de estado */}
        {actividadGuardada && (
          <div className="p-4 mb-6 text-green-700 bg-green-100 border border-green-400 rounded-lg">
            ✅{" "}
            {editingActividad
              ? "¡Actividad actualizada correctamente!"
              : "¡Actividad creada y enviada a los estudiantes!"}
          </div>
        )}
        {error && (
          <div className="p-4 mb-6 text-red-700 bg-red-100 border border-red-400 rounded-lg">
            ❌ {error}
          </div>
        )}

        {/* Listado de actividades */}
        {loadingActividades ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p className="mt-2 text-purple-600">Cargando actividades...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {actividades.map((actividad) => (
              <div
                key={actividad.id}
                className="p-6 bg-white rounded-2xl border-2 border-purple-100 hover:border-purple-300 hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-800">
                      {actividad.titulo}
                    </h3>
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        actividad.tipo === "tarea"
                          ? "bg-blue-100 text-blue-700"
                          : actividad.tipo === "proyecto"
                            ? "bg-green-100 text-green-700"
                            : actividad.tipo === "evaluacion"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {actividad.tipo}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Materia: {actividad.materia}
                  </p>
                  {actividad.fecha_entrega && (
                    <p className="text-sm text-gray-600">
                      Entrega:{" "}
                      {new Date(actividad.fecha_entrega).toLocaleDateString(
                        "es-ES",
                      )}
                    </p>
                  )}
                  <p className="text-sm text-gray-700 line-clamp-3">
                    {actividad.descripcion}
                  </p>
                </div>

                {/* Acciones */}
                <div className="flex gap-2">
                  <button
                    onClick={() => editarActividad(actividad)}
                    className="flex-1 px-3 py-2 text-blue-600 border-2 border-blue-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all flex items-center justify-center gap-1"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="text-xs">Editar</span>
                  </button>
                  <button
                    onClick={() => eliminarActividadHandler(actividad.id)}
                    className="flex-1 px-3 py-2 text-red-600 border-2 border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-all flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-xs">Eliminar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Si no hay actividades */}
        {!loadingActividades && actividades.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4 animate-bounce">📝</div>
            <p className="text-xl text-gray-600">
              No tienes actividades creadas todavía.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
