import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/UseAuth";
import Input from "../components/iu/Input";
import Button from "../components/iu/Button";

export default function Register() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState("estudiante");
  const [error, setError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Usar el contexto de autenticación para registrar
      const user = await register(nombre, email, password, rol);

      if (!user || !user.token) {
        throw new Error("Error en el registro");
      }

      // Redirigir según rol
      if (rol === "admin") {
        navigate("/admin/Usuarios");
      } else if (rol === "profesor") {
        navigate("/profesor/Clases");
      } else {
        navigate("/estudiante/Calificaciones");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="p-8 w-96 bg-white rounded-xl shadow-md"
      >
        <h1 className="mb-6 text-2xl font-bold text-center text-green-600">
          Crear Cuenta
        </h1>

        {error && (
          <div className="p-2 mb-4 text-red-600 bg-red-100 rounded">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium">Nombre</label>
          <Input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium">Correo</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-6">
          <label className="block mb-1 text-sm font-medium">Password</label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="mb-6">
          <label className="block mb-1 text-sm font-medium">
            Confirm Password
          </label>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <div className="mb-6">
          <label className="block mb-1 text-sm font-medium">Rol</label>
          <select
            value={rol}
            onChange={(e) => setRol(e.target.value)}
            className="px-3 py-2 w-full rounded-lg border focus:ring-2 focus:ring-green-500"
          >
            <option value="admin">Administrador</option>
            <option value="profesor">Profesor</option>
            <option value="estudiante">Estudiante</option>
          </select>
        </div>

        <Button type="submit" className="py-2 w-full text-white bg-green-600">
          Registrarse
        </Button>
      </form>
    </div>
  );
}
