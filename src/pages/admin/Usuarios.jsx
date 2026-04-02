import { useEffect, useState } from "react";
import {
  fetchUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
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

  // Obtener todos los usuarios
  const cargarUsuarios = async () => {
    setLoading(true);
    setError("");
    console.log("Iniciando carga de usuarios...");
    try {
      const token = localStorage.getItem("token");
      console.log("Token disponible:", !!token);
      const usuariosData = await fetchUsuarios(token);
      console.log("Respuesta del backend:", usuariosData);
      setUsuarios(usuariosData || []);
    } catch (err) {
      console.error("Error detallado al cargar usuarios:", err);
      setError(
        `Error: ${err.message || "No se pudieron cargar los usuarios."}`,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
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

      {/* Debug info */}
      <div className="mb-4 p-2 bg-gray-100 rounded text-sm">
        <div>Estado de carga: {loading ? "Cargando..." : "Completado"}</div>
        <div>Cantidad de usuarios: {usuarios?.length || 0}</div>
        {error && <div className="text-red-600">Error: {error}</div>}
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
    </div>
  );
}
