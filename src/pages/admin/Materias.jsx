import { useState, useEffect } from "react";
import {
  fetchMaterias,
  crearMateria,
  actualizarMateria,
  eliminarMateria,
  asignarMateriaProfesor,
} from "../../services/adminServices/materiasService";
import { fetchUsuarios } from "../../services/adminServices/usuariosService";

export default function Materias() {
  const [materias, setMaterias] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showAsignarModal, setShowAsignarModal] = useState(false);
  const [materiaSeleccionada, setMateriaSeleccionada] = useState(null);

  // Formulario para crear/editar materia
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    curso: "",
    profesorId: "",
    horario: "",
  });

  // Obtener todas las materias usando el servicio
  const loadMaterias = async () => {
    setLoading(true);
    setError("");
    setSuccess(""); // Limpiar mensaje de éxito
    console.log("=== CARGANDO MATERIAS EN COMPONENTE ===");
    try {
      const token = localStorage.getItem("token");
      console.log("Token disponible:", !!token);

      const materiasData = await fetchMaterias(token);

      console.log("📊 Materias recibidas en componente:", materiasData);
      console.log("📊 Tipo de datos:", typeof materiasData);
      console.log("📊 Es array?:", Array.isArray(materiasData));
      console.log("📊 Longitud:", materiasData?.length);

      // Mostrar detalles de cada materia
      if (Array.isArray(materiasData)) {
        materiasData.forEach((materia, index) => {
          console.log(
            `  ${index + 1}. ${materia.nombre} - ID: ${materia.id || materia._id} - Profesor: ${materia.profesor_id || materia.profesorId}`,
          );
        });
      }

      setMaterias(materiasData || []);
      console.log(
        "✅ Materias establecidas en el estado:",
        materiasData?.length || 0,
      );
    } catch (err) {
      console.error("❌ Error detallado al cargar materias:", err);
      setError(
        `Error: ${err.message || "No se pudieron cargar las materias."}`,
      );
    } finally {
      setLoading(false);
    }
  };

  // Obtener profesores para asignación
  const loadProfesores = async () => {
    try {
      console.log("=== CARGANDO PROFESORES ===");
      const usuarios = await fetchUsuarios(localStorage.getItem("token"));
      console.log("Usuarios recibidos:", usuarios);

      const soloProfesores = usuarios.filter(
        (usuario) => usuario.rol === "profesor",
      );

      console.log("Profesores filtrados:", soloProfesores);
      console.log("Cantidad de profesores:", soloProfesores.length);

      // Mostrar IDs de profesores para debugging
      soloProfesores.forEach((prof) => {
        console.log(
          `Profesor: ${prof.nombre} - ID: ${prof.id} - _id: ${prof._id} - Tipo ID: ${typeof prof.id}`,
        );
      });

      setProfesores(soloProfesores);
    } catch (err) {
      console.error("Error al cargar profesores:", err);
    }
  };

  useEffect(() => {
    loadMaterias();
    loadProfesores();
  }, []);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Crear o actualizar materia usando los servicios
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    console.log("=== ENVIANDO FORMULARIO MATERIA ===");
    console.log("FormData actual:", formData);
    console.log("Edit ID:", editId);

    try {
      if (editId) {
        // Actualizar materia existente
        console.log(" Actualizando materia...");
        await actualizarMateria(editId, formData);
        console.log(" Materia actualizada correctamente");
        setSuccess("✅ Materia actualizada correctamente");
      } else {
        // Crear nueva materia
        console.log(" Creando nueva materia...");
        await crearMateria(formData);
        console.log(" Materia creada correctamente");
        setSuccess("✅ Materia creada exitosamente");
      }

      // Resetear formulario y recargar lista
      console.log("🔄 Recargando materias después de crear/actualizar...");
      setFormData({
        nombre: "",
        descripcion: "",
        curso: "",
        profesorId: "",
        horario: "",
      });
      setEditId(null);
      setShowModal(false);

      // Forzar recarga de materias
      await loadMaterias();
      console.log("✅ Recarga completada");

      // Auto-ocultar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error(" Error en handleSubmit:", err);
      setError(err.message || "Error al guardar la materia.");
    } finally {
      setLoading(false);
    }
  };

  // Editar materia
  const handleEdit = (materia) => {
    setFormData({
      nombre: materia.nombre || "",
      descripcion: materia.descripcion || "",
      curso: materia.curso || "",
      profesorId: materia.profesorId || "",
      horario: materia.horario || "",
    });
    setEditId(materia._id);
    setShowModal(true);
  };

  // Eliminar materia usando el servicio
  const handleDelete = async (id) => {
    if (
      !window.confirm("¿Estás seguro de que quieres eliminar esta materia?")
    ) {
      return;
    }

    setLoading(true);
    setError("");
    try {
      await eliminarMateria(id);
      setSuccess("✅ Materia eliminada correctamente");
      await loadMaterias();

      // Auto-ocultar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      setError("Error al eliminar materia.");
      console.error("Error:", err);
    }
    setLoading(false);
  };

  // Cancelar edición
  const handleCancel = () => {
    setFormData({
      nombre: "",
      descripcion: "",
      curso: "",
      profesorId: "",
      horario: "",
    });
    setEditId(null);
    setShowModal(false);
  };

  // Abrir modal de asignación de profesor
  const handleAsignarProfesor = (materia) => {
    setMateriaSeleccionada(materia);
    setShowAsignarModal(true);
  };

  // Cancelar asignación
  const handleCancelarAsignacion = () => {
    setMateriaSeleccionada(null);
    setShowAsignarModal(false);
  };

  // Asignar profesor a materia
  const handleConfirmarAsignacion = async (profesorId) => {
    if (!materiaSeleccionada || !profesorId) {
      setError("Seleccione un profesor para asignar");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      console.log("🔗 Asignando profesor a materia:", {
        materia: materiaSeleccionada.nombre,
        materiaId: materiaSeleccionada.id || materiaSeleccionada._id,
        profesorId: profesorId,
      });

      // Llamar a la función de asignación
      await asignarMateriaProfesor(
        [parseInt(materiaSeleccionada.id || materiaSeleccionada._id)],
        parseInt(profesorId),
      );

      setSuccess("✅ Profesor asignado exitosamente a la materia");
      setShowAsignarModal(false);
      setMateriaSeleccionada(null);

      // Recargar materias para mostrar el cambio
      await loadMaterias();
    } catch (error) {
      console.error("❌ Error asignando profesor:", error);
      setError(`❌ Error al asignar profesor: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Obtener nombre del profesor asignado
  const getProfesorNombre = (profesorId) => {
    const profesor = profesores.find((p) => p.id === parseInt(profesorId));
    return profesor
      ? `${profesor.nombre} ${profesor.apellido || ""}`
      : "Sin asignar";
  };

  return (
    <div
      className="p-6 bg-white rounded-lg shadow-md"
      style={{
        backgroundColor: "#ffffff",
        padding: "24px",
        borderRadius: "8px",
        boxShadow:
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        minHeight: "400px",
      }}
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">📚 Gestión de Materias</h2>
          <p className="text-gray-600">
            Administra las materias y asigna profesores a cada curso.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Nueva Materia
        </button>
      </div>

      {/* Debug info */}
      <div className="mb-4 p-2 bg-gray-100 rounded text-sm">
        <div>Estado de carga: {loading ? "Cargando..." : "Completado"}</div>
        <div>Cantidad de materias: {materias?.length || 0}</div>
        <div>Cantidad de profesores: {profesores?.length || 0}</div>
        {error && <div className="text-red-600">Error: {error}</div>}
      </div>

      {error && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 border border-red-400 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 mb-4 text-green-700 bg-green-100 border border-green-400 rounded-lg animate-pulse">
          {success}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Cargando materias...</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Materia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Curso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profesor Asignado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Horario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {materias.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No hay materias registradas. Crea la primera materia.
                  </td>
                </tr>
              ) : (
                materias.map((materia) => (
                  <tr key={materia._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {materia.nombre}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">
                        {materia.descripcion || "Sin descripción"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {materia.curso || "Sin curso"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getProfesorNombre(materia.profesorId)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {materia.horario || "Sin horario"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(materia)}
                        className="mr-2 text-blue-600 hover:text-blue-900"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleAsignarProfesor(materia)}
                        className="mr-2 text-green-600 hover:text-green-900"
                      >
                        Asignar Profesor
                      </button>
                      <button
                        onClick={() => handleDelete(materia._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal para crear/editar materia */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editId ? "Editar Materia" : "Nueva Materia"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la Materia
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows="3"
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
                  value={formData.curso}
                  onChange={handleChange}
                  required
                  placeholder="Ej: 1° Año, 2° Año, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profesor Asignado <span className="text-red-500">*</span>
                </label>
                <select
                  name="profesorId"
                  value={formData.profesorId}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar profesor...</option>
                  {profesores.length === 0 ? (
                    <option value="" disabled>
                      No hay profesores disponibles
                    </option>
                  ) : (
                    profesores.map((profesor) => (
                      <option key={profesor.id} value={profesor.id}>
                        {profesor.nombre} {profesor.apellido || ""} - ID:{" "}
                        {profesor.id} ({profesor.email})
                      </option>
                    ))
                  )}
                </select>
                {profesores.length === 0 && (
                  <p className="mt-1 text-sm text-red-600">
                    ⚠️ No hay profesores disponibles. Primero cree profesores en
                    la sección de Usuarios.
                  </p>
                )}
                {formData.profesorId && (
                  <p className="mt-1 text-sm text-green-600">
                    ✅ Profesor seleccionado:{" "}
                    {profesores.find(
                      (p) => p.id === parseInt(formData.profesorId),
                    )?.nombre || "Desconocido"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Horario
                </label>
                <input
                  type="text"
                  name="horario"
                  value={formData.horario}
                  onChange={handleChange}
                  placeholder="Ej: Lunes 8:00-10:00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                >
                  {loading ? "Guardando..." : editId ? "Actualizar" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para asignar profesor a materia */}
      {showAsignarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md mx-4 bg-white rounded-lg shadow-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Asignar Profesor a Materia
            </h3>

            {materiaSeleccionada && (
              <div className="mb-4 p-3 bg-gray-50 rounded-md">
                <p className="text-sm font-medium text-gray-700">
                  Materia:{" "}
                  <span className="text-blue-600">
                    {materiaSeleccionada.nombre}
                  </span>
                </p>
                <p className="text-sm text-gray-500">
                  {materiaSeleccionada.descripcion || "Sin descripción"}
                </p>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar Profesor
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                onChange={(e) => {
                  if (e.target.value) {
                    handleConfirmarAsignacion(e.target.value);
                  }
                }}
                defaultValue=""
              >
                <option value="" disabled>
                  {profesores.length === 0
                    ? "No hay profesores disponibles"
                    : "Seleccionar profesor..."}
                </option>
                {profesores
                  .filter((p) => p.rol === "profesor") // Solo mostrar profesores
                  .map((profesor) => (
                    <option key={profesor.id} value={profesor.id}>
                      {profesor.nombre} {profesor.apellido || ""} - ID:{" "}
                      {profesor.id}
                    </option>
                  ))}
              </select>

              {profesores.filter((p) => p.rol === "profesor").length === 0 && (
                <p className="mt-2 text-sm text-red-600">
                  ⚠️ No hay profesores disponibles. Primero cree profesores en
                  la sección de Usuarios.
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelarAsignacion}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
