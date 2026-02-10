import { useState, useEffect } from "react";
import api from "../../services/api";
import Input from "../../components/iu/Input";

export default function EvaluacionesProfesor() {
  const [clases, setClases] = useState([]);
  const [claseSeleccionada, setClaseSeleccionada] = useState("");
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Consultar las clases asignadas al profesor
  useEffect(() => {
    const fetchClases = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/clases-profesor");
        setClases(res.data.clases || []);
      } catch (err) {
        setError("No se pudieron cargar las clases asignadas.");
      }
      setLoading(false);
    };
    fetchClases();
  }, []);

  // Consultar resultados de la evaluación de la clase seleccionada
  const consultarResultados = async (idClase) => {
    setLoading(true);
    setError("");
    setResultados([]);
    try {
      const res = await api.get(`/resultados-evaluacion/${idClase}`);
      setResultados(res.data.resultados || []);
    } catch (err) {
      setError("No se pudieron cargar los resultados de la evaluación.");
    }
    setLoading(false);
  };

  const handleClaseChange = (e) => {
    const id = e.target.value;
    setClaseSeleccionada(id);
    if (id) consultarResultados(id);
    else setResultados([]);
  };

  return (
    <div className="max-w-3xl p-6 mx-auto">
      <h2 className="mb-4 text-2xl font-bold text-blue-700">
        📊 Resultados de Evaluaciones por Clase
      </h2>
      <div className="mb-6">
        <label className="block mb-2 font-medium">Selecciona una clase</label>
        <select
          className="w-full p-2 border rounded-lg"
          value={claseSeleccionada}
          onChange={handleClaseChange}
        >
          <option value="">-- Selecciona --</option>
          {clases.map((clase) => (
            <option key={clase.id} value={clase.id}>
              {clase.materia} - Grupo {clase.grupo}
            </option>
          ))}
        </select>
      </div>
      {loading && <div className="text-blue-600">Cargando...</div>}
      {error && (
        <div className="p-2 mb-4 text-red-700 bg-red-100 rounded">{error}</div>
      )}
      {resultados.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm bg-white rounded-lg shadow">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-4 py-2 font-semibold text-left text-blue-700">
                  Estudiante
                </th>
                <th className="px-4 py-2 font-semibold text-left text-blue-700">
                  Puntaje
                </th>
                <th className="px-4 py-2 font-semibold text-left text-blue-700">
                  Observaciones
                </th>
              </tr>
            </thead>
            <tbody>
              {resultados.map((res, idx) => (
                <tr
                  key={idx}
                  className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}
                >
                  <td className="px-4 py-2 text-gray-800">{res.estudiante}</td>
                  <td className="px-4 py-2 text-gray-800">{res.puntaje}</td>
                  <td className="px-4 py-2 text-gray-800">
                    {res.observaciones || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {claseSeleccionada && resultados.length === 0 && !loading && !error && (
        <div className="text-gray-500">
          No hay resultados registrados para esta clase.
        </div>
      )}
    </div>
  );
}
