import { useAuth } from "../hooks/UseAuth";

export default function Profile() {
  const { usuario, logout } = useAuth();

  // Si no hay usuario autenticado
  if (!usuario) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-8 text-center bg-white shadow-md rounded-xl w-96">
          <h1 className="mb-4 text-xl font-bold text-red-600">
            No has iniciado sesión
          </h1>
          <a
            href="/login"
            className="px-4 py-2 text-white transition bg-green-600 rounded-lg hover:bg-green-700"
          >
            Ir a Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white shadow-md rounded-xl w-96">
        <h1 className="mb-6 text-2xl font-bold text-center text-green-600">
          Perfil de Usuario
        </h1>

        <div className="mb-4">
          <p className="text-gray-600">
            <span className="font-semibold">Nombre:</span> {usuario.nombre}
          </p>
          <p className="text-gray-600">
            <span className="font-semibold">Correo:</span> {usuario.email}
          </p>
          <p className="text-gray-600">
            <span className="font-semibold">Rol:</span>{" "}
            <span className="capitalize">{usuario.rol}</span>
          </p>
        </div>

        <button
          onClick={logout}
          className="w-full py-2 text-white transition bg-red-600 rounded-lg hover:bg-red-700"
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}
