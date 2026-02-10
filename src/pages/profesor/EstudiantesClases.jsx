import api from "../../services/api";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useEffect, useState } from "react";
import { apiFetch } from "../../utils/Api";
import { useParams } from "react-router-dom";
import Card from "../../components/iu/Card";
import Button from "../../components/iu/Button";
import Input from "../../components/iu/Input";
import { UserPlus } from "lucide-react";
import { useAuth } from "../../hooks/UseAuth";
import axios from "axios";

export default function EstudiantesClases() {
  const { id } = useParams(); // id de la clase
  const { token } = useAuth();
  const [estudiantes, setEstudiantes] = useState([]);
  const [resultados, setResultados] = useState([]); // [{ id, nombre, grado, evaluaciones: [], actividades: [], diarias: [] }]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtroId, setFiltroId] = useState("");
  const [filtroGrado, setFiltroGrado] = useState("");

  useEffect(() => {
    async function fetchResultados() {
      setLoading(true);
      setError("");
      try {
        // Suponiendo endpoint: /resultados-estudiantes
        const data = await apiFetch("resultados-estudiantes");
        setResultados(data.resultados || []);
      } catch (err) {
        setError("No se pudieron cargar los resultados de los estudiantes.");
      }
      setLoading(false);
    }
    fetchResultados();
  }, []);

  useEffect(() => {
    async function fetchEstudiantes() {
      try {
        const res = await api.get(`/clases/${id}/estudiantes`);
        setEstudiantes(res.data.estudiantes || []);
      } catch (error) {
        console.error("Error cargando estudiantes", error);
      }
    }
    fetchEstudiantes();
  }, [id]);

  // Filtrar por ID y grado
  const resultadosFiltrados = resultados.filter((est) => {
    const idMatch = filtroId ? est.id.toString().includes(filtroId) : true;
    const gradoMatch = filtroGrado
      ? est.grado.toLowerCase().includes(filtroGrado.toLowerCase())
      : true;
    return idMatch && gradoMatch;
  });

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.text("Resumen de Resultados de Estudiantes", 14, 16);
    const tableColumn = [
      "ID",
      "Nombre",
      "Grado",
      "Evaluaciones",
      "Actividades Diarias",
      "Otras Actividades",
    ];
    const tableRows = resultadosFiltrados.map((est) => [
      est.id,
      est.nombre,
      est.grado,
      est.evaluaciones?.map((ev) => `${ev.titulo}: ${ev.puntaje}`).join("; ") ||
        "-",
      est.diarias?.map((act) => `${act.titulo}: ${act.puntaje}`).join("; ") ||
        "-",
      est.actividades
        ?.map((act) => `${act.titulo}: ${act.puntaje}`)
        .join("; ") || "-",
    ]);
    doc.autoTable({ head: [tableColumn], body: tableRows, startY: 22 });
    doc.save("resultados_estudiantes.pdf");
  };

  return (
    <div className="p-6">
      <h2 className="mb-4 text-2xl font-bold text-blue-700">
        Resumen de Resultados de Estudiantes
      </h2>
      <button
        className="px-6 py-2 mb-4 text-white transition bg-green-600 rounded-lg hover:bg-green-700"
        onClick={exportarPDF}
      >
        Exportar PDF
      </button>
      <div className="flex gap-4 mb-6">
        <Input
          type="text"
          className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Filtrar por identificación..."
          value={filtroId}
          onChange={(e) => setFiltroId(e.target.value)}
        />
        <Input
          type="text"
          className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Filtrar por grado..."
          value={filtroGrado}
          onChange={(e) => setFiltroGrado(e.target.value)}
        />
      </div>
      {loading && <div className="text-blue-600">Cargando resultados...</div>}
      {error && (
        <div className="p-2 mb-4 text-red-600 bg-red-100 rounded">{error}</div>
      )}
      {!loading && !error && (
        <div className="overflow-x-auto">
          {resultadosFiltrados.length === 0 ? (
            <div className="text-gray-500">
              No hay resultados para los filtros seleccionados.
            </div>
          ) : (
            <table className="min-w-full text-sm bg-white rounded-lg shadow">
              <thead className="bg-blue-50">
                <tr>
                  <th className="px-4 py-2 font-semibold text-left text-blue-700">
                    ID
                  </th>
                  <th className="px-4 py-2 font-semibold text-left text-blue-700">
                    Nombre
                  </th>
                  <th className="px-4 py-2 font-semibold text-left text-blue-700">
                    Grado
                  </th>
                  <th className="px-4 py-2 font-semibold text-left text-blue-700">
                    Evaluaciones
                  </th>
                  <th className="px-4 py-2 font-semibold text-left text-blue-700">
                    Actividades Diarias
                  </th>
                  <th className="px-4 py-2 font-semibold text-left text-blue-700">
                    Otras Actividades
                  </th>
                </tr>
              </thead>
              <tbody>
                {resultadosFiltrados.map((est, idx) => (
                  <tr
                    key={est.id}
                    className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}
                  >
                    <td className="px-4 py-2 text-gray-800">{est.id}</td>
                    <td className="px-4 py-2 text-gray-800">{est.nombre}</td>
                    <td className="px-4 py-2 text-gray-800">{est.grado}</td>
                    <td className="px-4 py-2">
                      {est.evaluaciones?.length > 0 ? (
                        <ul className="pl-4 list-disc">
                          {est.evaluaciones.map((ev, i) => (
                            <li key={i} className="mb-1 text-blue-700">
                              {ev.titulo}:{" "}
                              <span className="font-bold text-green-700">
                                {ev.puntaje}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-gray-500">Sin evaluaciones</span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {est.diarias?.length > 0 ? (
                        <ul className="pl-4 list-disc">
                          {est.diarias.map((act, i) => (
                            <li key={i} className="mb-1 text-yellow-700">
                              {act.titulo}:{" "}
                              <span className="font-bold text-green-700">
                                {act.puntaje}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-gray-500">Sin actividades</span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {est.actividades?.length > 0 ? (
                        <ul className="pl-4 list-disc">
                          {est.actividades.map((act, i) => (
                            <li key={i} className="mb-1 text-purple-700">
                              {act.titulo}:{" "}
                              <span className="font-bold text-green-700">
                                {act.puntaje}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-gray-500">Sin actividades</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Sección de estudiantes de la clase */}
      <div className="mt-12">
        <h1 className="mb-4 text-2xl font-bold text-neutral-900">
          👥 Estudiantes de la Clase
        </h1>

        <div className="grid gap-4">
          {estudiantes.map((est) => (
            <Card key={est.id} className="shadow-md rounded-xl">
              {/* Si tienes CardContent, reemplaza el div por <CardContent> */}
              <div className="p-4">
                <p className="font-semibold text-neutral-800">{est.nombre}</p>
                <p className="text-sm text-neutral-600">Email: {est.email}</p>
              </div>
            </Card>
          ))}
        </div>

        {estudiantes.length === 0 && (
          <p className="text-center text-neutral-500">
            Esta clase no tiene estudiantes inscritos.
          </p>
        )}

        {/* 🔹 Botón futuro: inscribir estudiantes manualmente */}
        <div className="pt-4">
          <Button className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Inscribir Estudiante
          </Button>
        </div>
      </div>
    </div>
  );
}
