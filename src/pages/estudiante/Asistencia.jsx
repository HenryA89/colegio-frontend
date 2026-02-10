import { useState } from "react";
// Si necesitas efectos secundarios, descomenta la siguiente línea:
// import { useEffect } from "react";
import { apiFetch } from "../../utils/Api";
// Si tienes un componente Button reutilizable, puedes importarlo así:
// import Button from "../../components/iu/Button";

export default function AsistenciaEstudiante() {
  const [estado, setEstado] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  const registrarAsistencia = async (presente) => {
    setLoading(true);
    setMensaje("");
    try {
      // Suponiendo endpoint: /asistencias-estudiantes y método POST
      await apiFetch("asistencias-estudiantes", {
        method: "POST",
        body: JSON.stringify({ presente }),
      });
      setEstado(presente ? "Presente" : "Ausente");
      setMensaje("¡Tu asistencia ha sido registrada!");
    } catch (err) {
      setMensaje("Error al registrar la asistencia. Intenta nuevamente.");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 text-center bg-white shadow-md rounded-xl">
        <h2 className="mb-6 text-2xl font-bold text-blue-600">
          Registro de Asistencia
        </h2>
        <p className="mb-4 text-gray-600">
          Marca tu asistencia para el día de hoy.
        </p>
        <div className="flex justify-center gap-4 mb-6">
          <button
            className="px-6 py-2 text-white transition bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
            disabled={loading}
            onClick={() => registrarAsistencia(true)}
          >
            Estoy presente
          </button>
          <button
            className="px-6 py-2 text-white transition bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
            disabled={loading}
            onClick={() => registrarAsistencia(false)}
          >
            Ausente
          </button>
        </div>
        {estado && (
          <div
            className={`mb-2 text-lg font-semibold ${
              estado === "Presente" ? "text-green-700" : "text-red-700"
            }`}
          >
            Estado: {estado}
          </div>
        )}
        {mensaje && (
          <div className="p-2 mt-2 text-blue-700 bg-blue-100 rounded">
            {mensaje}
          </div>
        )}
      </div>
    </div>
  );
}
