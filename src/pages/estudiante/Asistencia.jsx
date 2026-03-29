import { useState, useEffect } from "react";
import {
  fetchAsistencia,
  fetchPorcentajeAsistencia,
} from "../../services/estudianteServices/asistenciaService";
import api from "../../services/api";

export default function AsistenciaEstudiante() {
  const [asistencia, setAsistencia] = useState([]);
  const [porcentaje, setPorcentaje] = useState(0);
  const [estado, setEstado] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAsistencia = async () => {
      try {
        const [asistenciaData, porcentajeData] = await Promise.all([
          fetchAsistencia(),
          fetchPorcentajeAsistencia(),
        ]);
        setAsistencia(asistenciaData);
        setPorcentaje(porcentajeData);
      } catch (err) {
        setError("No se pudo cargar la información de asistencia.");
        console.error("Error:", err);
      }
    };
    loadAsistencia();
  }, []);

  const registrarAsistencia = async (presente) => {
    setLoading(true);
    setMensaje("");
    try {
      await api.post("api/v1/estudiante/asistencia/registrar", { presente });
      setEstado(presente ? "Presente" : "Ausente");
      setMensaje("¡Tu asistencia ha sido registrada!");

      // Recargar datos
      const [asistenciaData, porcentajeData] = await Promise.all([
        fetchAsistencia(),
        fetchPorcentajeAsistencia(),
      ]);
      setAsistencia(asistenciaData);
      setPorcentaje(porcentajeData);
    } catch (err) {
      setMensaje("Error al registrar la asistencia. Intenta nuevamente.");
      console.error("Error:", err);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen p-6 bg-linear-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-green-600 to-blue-600">
            📋 Registro de Asistencia
          </h2>
          <p className="text-gray-600">
            Marca tu asistencia para el día de hoy.
          </p>
        </div>

        {error && (
          <div className="p-4 mb-6 text-red-700 bg-red-100 border border-red-400 rounded-lg">
            {error}
          </div>
        )}

        {/* Tarjeta de registro diario */}
        <div className="mb-8 p-6 bg-white rounded-lg shadow-lg">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">📅</div>
            <h3 className="text-xl font-semibold">Asistencia de Hoy</h3>
            <p className="text-gray-600">
              {new Date().toLocaleDateString("es-ES", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <div className="flex justify-center gap-4 mb-6">
            <button
              className="px-8 py-3 text-white transition bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
              disabled={loading}
              onClick={() => registrarAsistencia(true)}
            >
              <span>✅</span>
              <span>Estoy presente</span>
            </button>
            <button
              className="px-8 py-3 text-white transition bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center space-x-2"
              disabled={loading}
              onClick={() => registrarAsistencia(false)}
            >
              <span>❌</span>
              <span>Ausente</span>
            </button>
          </div>

          {estado && (
            <div
              className={`p-4 rounded-lg text-center ${
                estado === "Presente"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              <div className="text-lg font-semibold">Estado: {estado}</div>
            </div>
          )}

          {mensaje && (
            <div className="p-4 mt-4 text-blue-700 bg-blue-100 rounded-lg">
              {mensaje}
            </div>
          )}
        </div>

        {/* Estadísticas de asistencia */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="p-6 bg-white rounded-lg shadow-lg">
            <h3 className="mb-4 text-lg font-semibold">
              📊 Porcentaje General
            </h3>
            <div className="text-center">
              <div
                className={`text-4xl font-bold ${
                  porcentaje >= 90
                    ? "text-green-600"
                    : porcentaje >= 70
                      ? "text-yellow-600"
                      : "text-red-600"
                }`}
              >
                {porcentaje}%
              </div>
              <div className="text-gray-600">Asistencia total</div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    porcentaje >= 90
                      ? "bg-green-600"
                      : porcentaje >= 70
                        ? "bg-yellow-600"
                        : "bg-red-600"
                  }`}
                  style={{ width: `${porcentaje}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-lg">
            <h3 className="mb-4 text-lg font-semibold">
              📈 Historial Reciente
            </h3>
            {asistencia.length > 0 ? (
              <div className="space-y-2">
                {asistencia.slice(0, 5).map((registro, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-2 bg-gray-50 rounded"
                  >
                    <span className="text-sm">
                      {new Date(registro.fecha).toLocaleDateString("es-ES")}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        registro.presente
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {registro.presente ? "Presente" : "Ausente"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center">
                No hay registros disponibles
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
