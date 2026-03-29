import { useEffect, useState } from "react";
import {
  fetchUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
} from "../../services/adminServices/usuariosService";
import Button from "../../components/iu/Button";
import Input from "../../components/iu/Input";

export default function Usuarios() {
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
    try {
      const usuariosData = await fetchUsuarios(localStorage.getItem("token"));
      setUsuarios(usuariosData);
    } catch (err) {
      setError("No se pudieron cargar los usuarios.");
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
    <div className="p-6">
      <h2 className="mb-4 text-2xl font-bold text-blue-700">
        👥 Gestión de Usuarios
      </h2>
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
          <Button type="submit">{editId ? "Actualizar" : "Crear"}</Button>
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
                  <Button
                    type="button"
                    onClick={() => handleEdit(usuario)}
                    className="px-3 py-1 text-white bg-yellow-400 rounded hover:bg-yellow-500"
                  >
                    Editar
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleDelete(usuario.id)}
                    className="px-3 py-1 text-white bg-red-600 rounded hover:bg-red-700"
                  >
                    Eliminar
                  </Button>
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
