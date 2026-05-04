import { useEffect, useState } from "react";
import {
  fetchUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  inscribirEstudianteMateria,
  inscribirEstudiantesMasivo,
  fetchMateriasDisponibles,
} from "../../services/adminServices/usuariosService";
import Button from "../../components/iu/Button";
import Input from "../../components/iu/Input";
import { useAuth } from "../../hooks/UseAuth";

export default function Usuarios() {
  const { usuario } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    rol: "estudiante",
    password: "",
  });
  const [editId, setEditId] = useState(null);
  const [materias, setMaterias] = useState([]);
  const [showInscribirModal, setShowInscribirModal] = useState(false);
  const [showMasivoModal, setShowMasivoModal] = useState(false);
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(null);
  const [materiaSeleccionada, setMateriaSeleccionada] = useState("");
  const [estudiantesSeleccionados, setEstudiantesSeleccionados] = useState([]);

  // Obtener todos los usuarios
  const cargarUsuarios = async () => {
    setLoading(true);
    setError("");
    console.log("=== INICIANDO CARGA DE USUARIOS ===");
    try {
      const token = localStorage.getItem("token");
      console.log("Token disponible:", !!token);
      console.log("Token length:", token?.length || 0);

      const usuariosData = await fetchUsuarios(token);
      console.log("Respuesta completa del backend:", usuariosData);
      console.log("Tipo de dato:", typeof usuariosData);
      console.log("Es array:", Array.isArray(usuariosData));

      // Manejar diferentes formatos de respuesta
      let usuariosProcesados = [];

      if (Array.isArray(usuariosData)) {
        usuariosProcesados = usuariosData;
      } else if (
        usuariosData &&
        usuariosData.usuarios &&
        Array.isArray(usuariosData.usuarios)
      ) {
        usuariosProcesados = usuariosData.usuarios;
      } else if (
        usuariosData &&
        usuariosData.data &&
        Array.isArray(usuariosData.data)
      ) {
        usuariosProcesados = usuariosData.data;
      } else if (usuariosData && typeof usuariosData === "object") {
        // Si es un objeto, intentar extraer el array
        const possibleArrays = Object.values(usuariosData).filter((val) =>
          Array.isArray(val),
        );
        if (possibleArrays.length > 0) {
          usuariosProcesados = possibleArrays[0];
        }
      }

      console.log("Usuarios procesados:", usuariosProcesados);
      console.log("Cantidad de usuarios:", usuariosProcesados.length);

      // Mostrar detalles de los usuarios encontrados
      if (usuariosProcesados.length > 0) {
        console.log("Primer usuario:", usuariosProcesados[0]);
        console.log("Roles encontrados:", [
          ...new Set(usuariosProcesados.map((u) => u.rol)),
        ]);
        console.log(
          "IDs:",
          usuariosProcesados.map((u) => u.id || u._id),
        );
      }

      setUsuarios(usuariosProcesados);
    } catch (err) {
      console.error("=== ERROR AL CARGAR USUARIOS ===");
      console.error("Error completo:", err);
      console.error("Mensaje:", err.message);
      console.error("Respuesta:", err.response?.data);
      console.error("Status:", err.response?.status);

      setError(
        `Error: ${err.message || "No se pudieron cargar los usuarios."} (${err.response?.status || "Sin status"})`,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
    cargarMaterias();
  }, []);

  // Crear o actualizar usuario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editId) {
        await actualizarUsuario(editId, form, localStorage.getItem("token"));
      } else {
        await crearUsuario(form, localStorage.getItem("token"));
      }
      setForm({ nombre: "", email: "", rol: "estudiante", password: "" });
      setEditId(null);
      cargarUsuarios();
    } catch (err) {
      setError("Error al guardar el usuario.");
    }
  };

  // Editar usuario
  const handleEdit = (usuario) => {
    setForm({
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      password: "",
    });
    setEditId(usuario.id);
  };

  // Eliminar usuario
  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este usuario?")) return;
    try {
      await eliminarUsuario(id, localStorage.getItem("token"));
      cargarUsuarios();
    } catch (err) {
      setError("Error al eliminar el usuario.");
    }
  };

  // Cargar materias disponibles
  const cargarMaterias = async () => {
    try {
      const token = localStorage.getItem("token");
      const materiasData = await fetchMateriasDisponibles(token);
      setMaterias(materiasData);
    } catch (err) {
      console.error("Error cargando materias:", err);
    }
  };

  // Abrir modal de inscripción individual
  const handleInscribirEstudiante = (estudiante) => {
    setEstudianteSeleccionado(estudiante);
    setMateriaSeleccionada("");
    setShowInscribirModal(true);
  };

  // Abrir modal de inscripción masiva
  const handleInscripcionMasiva = () => {
    setEstudiantesSeleccionados([]);
    setMateriaSeleccionada("");
    setShowMasivoModal(true);
  };

  // Confirmar inscripción individual
  const handleConfirmarInscripcion = async () => {
    if (!estudianteSeleccionado || !materiaSeleccionada) {
      setError("Debe seleccionar un estudiante y una materia");
      return;
    }

    try {
      setLoading(true);
      await inscribirEstudianteMateria(
        estudianteSeleccionado.id,
        materiaSeleccionada,
        localStorage.getItem("token"),
      );

      setSuccess("✅ Estudiante inscrito exitosamente");
      setShowInscribirModal(false);
      setEstudianteSeleccionado(null);
      setMateriaSeleccionada("");
      cargarUsuarios();
    } catch (err) {
      setError(err.message || "Error al inscribir estudiante");
    } finally {
      setLoading(false);
    }
  };

  // Confirmar inscripción masiva
  const handleConfirmarInscripcionMasiva = async () => {
    if (!materiaSeleccionada || estudiantesSeleccionados.length === 0) {
      setError("Debe seleccionar una materia y al menos un estudiante");
      return;
    }

    try {
      setLoading(true);
      await inscribirEstudiantesMasivo(
        estudiantesSeleccionados,
        materiaSeleccionada,
        localStorage.getItem("token"),
      );

      setSuccess(
        `✅ ${estudiantesSeleccionados.length} estudiantes inscritos exitosamente`,
      );
      setShowMasivoModal(false);
      setMateriaSeleccionada("");
      setEstudiantesSeleccionados([]);
      cargarUsuarios();
    } catch (err) {
      setError(err.message || "Error en inscripción masiva");
    } finally {
      setLoading(false);
    }
  };

  // Toggle selección de estudiante para inscripción masiva
  const toggleSeleccionEstudiante = (estudianteId) => {
    setEstudiantesSeleccionados((prev) => {
      if (prev.includes(estudianteId)) {
        return prev.filter((id) => id !== estudianteId);
      } else {
        return [...prev, estudianteId];
      }
    });
  };

  // Cancelar inscripciones
  const handleCancelarInscripcion = () => {
    setShowInscribirModal(false);
    setShowMasivoModal(false);
    setEstudianteSeleccionado(null);
    setMateriaSeleccionada("");
    setEstudiantesSeleccionados([]);
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
      <h2 className="mb-4 text-2xl font-bold text-blue-700">
        👥 Gestión de Usuarios
      </h2>

      {/* Debug info mejorado */}
      <div className="mb-4 p-3 bg-gray-100 rounded text-sm">
        <div className="font-bold mb-2">🔍 Información de Depuración:</div>
        <div>
          Estado de carga: {loading ? "⏳ Cargando..." : "✅ Completado"}
        </div>
        <div>Cantidad de usuarios: {usuarios?.length || 0}</div>
        {usuarios && usuarios.length > 0 && (
          <>
            <div>
              Roles encontrados:{" "}
              {[...new Set(usuarios.map((u) => u.rol))].join(", ")}
            </div>
            <div>
              Primer usuario: {usuarios[0]?.nombre || "Sin nombre"} (
              {usuarios[0]?.email})
            </div>
            <div>
              Tokens ID:{" "}
              {usuarios
                .slice(0, 3)
                .map((u) => u.id || u._id || "sin-id")
                .join(", ")}
            </div>
          </>
        )}
        {error && (
          <div className="text-red-600 mt-2 p-2 bg-red-50 rounded">
            <strong>❌ Error:</strong> {error}
          </div>
        )}
      </div>
      <form
        onSubmit={handleSubmit}
        className="p-4 mb-8 space-y-4 bg-white rounded shadow"
      >
        <div className="flex gap-4">
          <Input
            placeholder="Nombre"
            name="nombre"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            required
          />
          <Input
            placeholder="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <Input
            placeholder="Contraseña"
            name="password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required={!editId}
          />
          <select
            className="px-3 py-2 border rounded-lg"
            name="rol"
            value={form.rol}
            onChange={(e) => setForm({ ...form, rol: e.target.value })}
          >
            <option value="estudiante">Estudiante</option>
            <option value="profesor">Profesor</option>
            <option value="admin">Administrador</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            style={{
              backgroundColor: "#2563eb",
              color: "#ffffff",
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
            }}
          >
            {editId ? "Actualizar" : "Crear"}
          </button>
        </div>
        {error && (
          <div className="p-2 text-red-600 bg-red-100 rounded">{error}</div>
        )}
      </form>

      {/* Botón de inscripción masiva */}
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={handleInscripcionMasiva}
          className="px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
          style={{
            backgroundColor: "#7c3aed",
            color: "#ffffff",
            padding: "8px 16px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            fontWeight: "500",
          }}
        >
          📚 Inscripción Masiva de Estudiantes
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm bg-white rounded-lg shadow">
          <thead className="bg-blue-50">
            <tr>
              <th className="px-4 py-2 font-semibold text-left text-blue-700">
                Nombre
              </th>
              <th className="px-4 py-2 font-semibold text-left text-blue-700">
                Email
              </th>
              <th className="px-4 py-2 font-semibold text-left text-blue-700">
                Rol
              </th>
              <th className="px-4 py-2 font-semibold text-left text-blue-700">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.id}>
                <td className="px-4 py-2">{usuario.nombre}</td>
                <td className="px-4 py-2">{usuario.email}</td>
                <td className="px-4 py-2 capitalize">{usuario.rol}</td>
                <td className="flex gap-2 px-4 py-2">
                  {usuario.rol === "estudiante" && (
                    <button
                      type="button"
                      onClick={() => handleInscribirEstudiante(usuario)}
                      className="px-3 py-1 text-white bg-green-600 rounded hover:bg-green-700 transition-colors"
                      style={{
                        backgroundColor: "#16a34a",
                        color: "#ffffff",
                        padding: "4px 12px",
                        borderRadius: "4px",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Inscribir
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleEdit(usuario)}
                    className="px-3 py-1 text-white bg-yellow-400 rounded hover:bg-yellow-500 transition-colors"
                    style={{
                      backgroundColor: "#facc15",
                      color: "#ffffff",
                      padding: "4px 12px",
                      borderRadius: "4px",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(usuario.id)}
                    className="px-3 py-1 text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
                    style={{
                      backgroundColor: "#dc2626",
                      color: "#ffffff",
                      padding: "4px 12px",
                      borderRadius: "4px",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && (
          <div className="mt-4 text-blue-600">Cargando usuarios...</div>
        )}
        {!loading && usuarios.length === 0 && (
          <div className="mt-4 text-gray-500">No hay usuarios registrados.</div>
        )}
      </div>

      {/* Modal de inscripción individual */}
      {showInscribirModal && estudianteSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md mx-4 bg-white rounded-lg shadow-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Inscribir Estudiante en Materia
            </h3>

            <div className="mb-4 p-3 bg-gray-50 rounded-md">
              <p className="text-sm font-medium text-gray-700">
                Estudiante:{" "}
                <span className="text-blue-600">
                  {estudianteSeleccionado.nombre}
                </span>
              </p>
              <p className="text-sm text-gray-500">
                Email: {estudianteSeleccionado.email}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar Materia
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                value={materiaSeleccionada}
                onChange={(e) => setMateriaSeleccionada(e.target.value)}
              >
                <option value="">Seleccionar materia...</option>
                {materias.map((materia) => (
                  <option key={materia.id} value={materia.id}>
                    {materia.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelarInscripcion}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarInscripcion}
                disabled={loading || !materiaSeleccionada}
                className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-green-400 transition-colors"
              >
                {loading ? "Inscribiendo..." : "Incribir"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de inscripción masiva */}
      {showMasivoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-2xl mx-4 bg-white rounded-lg shadow-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              📚 Inscripción Masiva de Estudiantes
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar Materia
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={materiaSeleccionada}
                onChange={(e) => setMateriaSeleccionada(e.target.value)}
              >
                <option value="">Seleccionar materia...</option>
                {materias.map((materia) => (
                  <option key={materia.id} value={materia.id}>
                    {materia.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar Estudiantes
              </label>
              <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-md">
                <div className="p-2">
                  <div className="mb-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={
                          estudiantesSeleccionados.length ===
                          usuarios.filter((u) => u.rol === "estudiante").length
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            const estudiantesIds = usuarios
                              .filter((u) => u.rol === "estudiante")
                              .map((u) => u.id);
                            setEstudiantesSeleccionados(estudiantesIds);
                          } else {
                            setEstudiantesSeleccionados([]);
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">
                        Seleccionar todos los estudiantes
                      </span>
                    </label>
                  </div>
                  {usuarios
                    .filter((u) => u.rol === "estudiante")
                    .map((estudiante) => (
                      <label
                        key={estudiante.id}
                        className="flex items-center mb-1"
                      >
                        <input
                          type="checkbox"
                          checked={estudiantesSeleccionados.includes(
                            estudiante.id,
                          )}
                          onChange={() =>
                            toggleSeleccionEstudiante(estudiante.id)
                          }
                          className="mr-2"
                        />
                        <span className="text-sm">
                          {estudiante.nombre} ({estudiante.email})
                        </span>
                      </label>
                    ))}
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Estudiantes seleccionados: {estudiantesSeleccionados.length}
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelarInscripcion}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarInscripcionMasiva}
                disabled={
                  loading ||
                  !materiaSeleccionada ||
                  estudiantesSeleccionados.length === 0
                }
                className="px-4 py-2 text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:bg-purple-400 transition-colors"
              >
                {loading
                  ? "Incribiendo..."
                  : `Inscribir ${estudiantesSeleccionados.length} estudiante${estudiantesSeleccionados.length !== 1 ? "s" : ""}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
