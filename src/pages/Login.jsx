import { useState } from "react";
import { replace, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/UseAuth";
import Button from "../components/iu/Button";
import Input from "../components/iu/Input";

export default function Login() {
  // Variables con nombres consistentes con la API
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("estudiante");
  const [error, setError] = useState("");

  const { login } = useAuth(); // Hook de autenticación global
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    navigate("/Dashboard", { replace: true });

    try {
      // Envía credenciales al servicio de autenticación
      const user = await login(correo, password, rol);

      // Verifica que haya respuesta y token
      if (!user || !user.token) {
        throw new Error("Credenciales incorrectas o usuario no autorizado");
      }
    } catch (err) {
      console.error("Error al iniciar sesión:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Error al iniciar sesión, verifica tus credenciales"
      );
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-fuchsia-500 via-indigo-600 to-emerald-400 animate-gradient-x">
      <div className="w-full max-w-md px-8 py-10 rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.2)] border border-fuchsia-200/40 bg-white/30 backdrop-blur-lg">
        <h1 className="mb-2 text-4xl font-extrabold tracking-tight text-center text-white drop-shadow-xl md:text-5xl">
          ESTUD-IA
        </h1>
        <p className="mb-8 text-lg font-semibold tracking-wide text-center text-indigo-50">
          Aprende jugando con IA 🎓
        </p>

        {error && (
          <div className="py-2 mb-4 text-sm font-bold text-center text-white rounded-lg shadow-md bg-red-500/70">
            {error}
          </div>
        )}

        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <Input
            label="Correo"
            type="email"
            placeholder="Tu correo electrónico"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
          />

          <Input
            label="Contraseña"
            type="password"
            placeholder="Tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Rol</label>
            <select
              className="px-3 py-2 text-gray-700 border border-gray-300 rounded-lg outline-none bg-white/70 focus:ring-2 focus:ring-fuchsia-400"
              value={rol}
              onChange={(e) => setRol(e.target.value)}
            >
              <option value="estudiante">Estudiante</option>
              <option value="profesor">Profesor</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <Button
            variant="primary"
            type="submit"
            className="w-full py-2 text-lg font-bold shadow-lg bg-fuchsia-600 rounded-xl hover:bg-fuchsia-700 shadow-fuchsia-800/40"
          >
            Iniciar sesión
          </Button>
        </form>

        <p className="mt-6 text-sm text-center text-indigo-100">
          ¿No tienes cuenta?{" "}
          <a
            href="/register"
            className="underline text-fuchsia-300 underline-offset-2 hover:text-fuchsia-100"
          >
            Regístrate aquí
          </a>
        </p>
      </div>
    </div>
  );
}
