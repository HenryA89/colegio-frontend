import { useState, useEffect } from "react";
import api from "../../services/api";
import Button from "../../components/iu/Button";
export default function Asistencias() {
  const [asistencias, setAsistencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAsistencias() {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/asistencias-estudiantes");
        setAsistencias(res.data.asistencias || []);
      } catch (err) {
        setError("No se pudo cargar la información de asistencia.");
      }
      setLoading(false);
    }
    fetchAsistencias();
  }, []);

  return (
    <div className="p-6">
      <h2 className="mb-4 text-2xl font-bold">
        📋 Control de Asistencia de Estudiantes
      </h2>
      <p className="mb-6 text-gray-600">
        Aquí el profesor puede ver la asistencia registrada por los estudiantes.
      </p>
      {loading && <div className="text-blue-600">Cargando asistencias...</div>}
      {error && (
        <div className="p-2 mb-4 text-red-600 bg-red-100 rounded">{error}</div>
      )}
      {!loading && !error && (
        <div className="overflow-x-auto">
          {asistencias.length === 0 ? (
            <div className="text-gray-500">No hay registros de asistencia.</div>
          ) : (
            <table className="min-w-full text-sm bg-white rounded-lg shadow">
              <thead className="bg-blue-50">
                <tr>
                  <th className="px-4 py-2 font-semibold text-left text-blue-700">
                    Estudiante
                  </th>
                  <th className="px-4 py-2 font-semibold text-left text-blue-700">
                    Fecha
                  </th>
                  <th className="px-4 py-2 font-semibold text-left text-blue-700">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody>
                {asistencias.map((asistencia, idx) => (
                  <tr
                    key={idx}
                    className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}
                  >
                    <td className="px-4 py-2 text-gray-800">
                      {asistencia.estudiante}
                    </td>
                    <td className="px-4 py-2 text-gray-800">
                      {asistencia.fecha}
                    </td>
                    <td className="px-4 py-2">
                      {asistencia.presente ? (
                        <span className="px-2 py-1 text-green-700 bg-green-100 rounded">
                          Presente
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-red-700 bg-red-100 rounded">
                          Ausente
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
