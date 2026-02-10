import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center bg-gray-100">
      <h1 className="font-extrabold text-red-600 text-7xl">404</h1>
      <h2 className="mt-4 text-3xl font-semibold text-gray-800">
        Página no encontrada
      </h2>
      <p className="mt-2 text-gray-600">
        Lo sentimos, la página que buscas no existe.
      </p>

      <Link
        to="/"
        className="px-6 py-3 mt-6 text-white transition bg-blue-600 rounded-lg shadow hover:bg-blue-700"
      >
        🔙 Volver al inicio
      </Link>
    </div>
  );
}
