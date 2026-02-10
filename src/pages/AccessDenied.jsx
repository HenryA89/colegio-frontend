export default function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-gray-800 bg-gray-100">
      <div className="max-w-md p-8 text-center bg-white shadow-lg rounded-2xl">
        <h1 className="mb-4 text-4xl font-bold text-red-600">
          🚫 Acceso Denegado
        </h1>
        <p className="mb-6 text-lg">
          No tienes permisos para acceder a esta página. Si crees que esto es un
          error, contacta al administrador.
        </p>
        <a
          href="/dashboard"
          className="px-6 py-3 text-white transition bg-blue-600 rounded-lg shadow hover:bg-blue-700"
        >
          Volver al Dashboard
        </a>
      </div>
    </div>
  );
}
